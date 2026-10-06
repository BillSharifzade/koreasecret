'use client';
import { useState, type CSSProperties } from 'react';
import { Icon } from '@/components/Icon';
import { ProductCard } from '@/components/ui/ProductCard';
import { luminance } from '@/lib/color';
import { brandScale, DEFAULT_BRAND, isHex } from '@/lib/theme';
import { edit, useAdmin } from '../state/store';
import { I } from '../ui/icons';
import { Badge, Btn, Card, ColorInput, cx, Field, Note, PageHead } from '../ui/kit';
import { SitePreview, type Device } from '../ui/preview';
import '../styles/system.css';

const PRESETS: { name: string; hex: string }[] = [
  { name: 'Фуксия', hex: DEFAULT_BRAND }, { name: 'Пион', hex: '#d6457a' }, { name: 'Малина', hex: '#c2185b' }, { name: 'Коралл', hex: '#e2604f' },
  { name: 'Ягода', hex: '#a3245c' }, { name: 'Слива', hex: '#8a3d8c' }, { name: 'Лаванда', hex: '#7b5cc4' }, { name: 'Сапфир', hex: '#3b5bdb' },
  { name: 'Изумруд', hex: '#23876a' }, { name: 'Графит', hex: '#3a3238' }
];
const STEPS = ['--brand-50', '--brand-100', '--brand-200', '--brand-300', '--brand', '--brand-600', '--brand-700'];

/** WCAG contrast of white text on the colour (same as the colour on white). */
const contrast = (hex: string) => 1.05 / (luminance(hex) + 0.05);

export function Appearance() {
  const brand = useAdmin((s) => s.draft.theme.brand);
  const base = useAdmin((s) => s.base.theme.brand);
  const sample = useAdmin((s) => s.draft.products.find((p) => p.old && !p.hidden)?.id || s.draft.products[0]?.id);
  const [device, setDevice] = useState<Device>('desktop');
  const ok = isHex(brand);
  const scale = brandScale(ok ? brand : DEFAULT_BRAND);
  const ratio = contrast(ok ? brand : DEFAULT_BRAND);
  const setBrand = (v: string, label = 'Оформление: цвет бренда') => edit((d) => { d.theme.brand = v.toLowerCase(); }, { label, key: 'theme:brand' });

  return (
    <div className="adm-page">
      <PageHead title={<>Оформление <em>сайта</em></>} sub="Фирменный цвет кнопок, ссылок, цен и акцентов. Оттенки — от нежного фона до тёмного наведения — рассчитываются автоматически."
        actions={brand.toLowerCase() !== DEFAULT_BRAND && <Btn icon="refresh" onClick={() => setBrand(DEFAULT_BRAND, 'Оформление: цвет по умолчанию')}>Сбросить к фирменному</Btn>} />
      <div className="adm-grid adm-grid--editor">
        <div className="adm-stack adm-stack--lg" style={{ minWidth: 0 }}>
          <Card title="Цвет бренда" sub={brand.toLowerCase() === base.toLowerCase() ? 'Как на сайте сейчас' : `На сайте сейчас ${base} — изменение ещё не опубликовано`}>
            <div className="a-stack">
              <div className="a-sys-swatches">
                {PRESETS.map((p) => (
                  <button key={p.hex} type="button" className={cx('a-sys-swatch', brand.toLowerCase() === p.hex && 'is-active')} onClick={() => setBrand(p.hex)}>
                    <i style={{ background: p.hex }} />
                    <span><b>{p.name}{p.hex === DEFAULT_BRAND ? ' · фирменный' : ''}</b><small>{p.hex}</small></span>
                  </button>
                ))}
              </div>
              <Field label="Свой цвет" hint="Любой HEX — например, из брендбука"><ColorInput value={brand} onChange={(v) => setBrand(v)} /></Field>
              <div className="a-stack a-stack--sm">
                <div className="a-field__label"><span>Шкала оттенков</span><small>фон · обводка · акцент · наведение</small></div>
                <div className="a-sys-scale">
                  {STEPS.map((k, i) => <div key={k} style={{ background: scale[k], color: i < 4 ? 'var(--ink-2)' : '#fff' }}>{k.replace('--brand', '') || 'base'}</div>)}
                </div>
              </div>
              <div className="a-sys-contrast">
                <span className="a-sys-contrast__sample" style={{ background: scale['--brand'] }}>Aa</span>
                <div className="adm-grow">
                  <div className="adm-row" style={{ gap: 10 }}><span className="a-sys-contrast__ratio">{ratio.toFixed(2)} : 1</span>
                    <Badge tone={ratio >= 4.5 ? 'green' : ratio >= 3 ? 'amber' : 'red'}>{ratio >= 4.5 ? 'AA — отлично' : ratio >= 3 ? 'AA для крупного текста' : 'мало'}</Badge></div>
                  <div className="adm-muted" style={{ fontSize: 13 }}>Контраст белого текста на кнопках и цвета на белом фоне (WCAG). Для кнопок и крупного текста нужно не меньше 3 : 1.</div>
                </div>
              </div>
              {ratio < 3 && <Note kind="warn">Цвет слишком светлый: белый текст на кнопках будет плохо читаться. Выберите оттенок темнее.</Note>}
            </div>
          </Card>
          <Card title="Весь сайт" sub="Главная с черновиком — цвет применяется сразу" actions={<span className="adm-muted" style={{ fontSize: 12.5 }}>можно кликать и листать</span>}>
            <SitePreview path="/" device={device} onDevice={setDevice} height={device === 'mobile' ? 640 : 520} />
          </Card>
        </div>
        <div className="adm-stack adm-sticky">
          <div className="a-sys-themed" style={{ ...(scale as CSSProperties), gridTemplateColumns: '1fr' }}>
            <span className="a-preview__label" style={{ position: 'static', justifySelf: 'start' }}><I name="eye" />Элементы сайта</span>
            <div className="a-sys-themed__demo">
              <div className="adm-row adm-row--wrap"><span className="btn btn--primary">В корзину</span><span className="btn btn--outline">Подробнее</span></div>
              <div className="adm-row adm-row--wrap" style={{ gap: 6 }}><span className="chip is-active">Сыворотки</span><span className="chip">Тонеры</span><span className="pill-link"><span>Все</span><Icon name="chev-right" /></span></div>
              <div className="adm-row adm-row--wrap" style={{ gap: 8 }}><span className="badge-sale">−20%</span><span className="tag tag--hit">Хит</span><label className="switch" style={{ fontSize: 15 }}><input type="checkbox" checked readOnly /><span className="switch__track" /><span>В наличии</span></label></div>
              <div className="free-ship"><span>До бесплатной доставки — <b>90 смн</b></span><div className="free-ship__bar"><div className="free-ship__fill" style={{ width: '70%' }} /></div></div>
            </div>
            {sample && <div style={{ maxWidth: 250 }}><ProductCard id={sample} /></div>}
          </div>
          <Note>Меняются логотип в шапке, кнопки, ссылки, цены, метки, фокус и подсветки. Нарисованные упаковки, баннеры и иконки категорий остаются в своих цветах.</Note>
        </div>
      </div>
    </div>
  );
}
