'use client';
import { useState } from 'react';
import type { Draft } from 'immer';
import { Icon } from '@/components/Icon';
import type { Settings as SettingsT, SiteContent } from '@/lib/types';
import { edit, useAdmin } from '../state/store';
import { I } from '../ui/icons';
import { Btn, Card, Field, IconBtn, Input, money, Note, NumInput, PageHead, TagsInput } from '../ui/kit';
import '../styles/system.css';

const set = (fn: (d: Draft<SiteContent>) => void, label: string, key: string) => edit(fn, { label, key });
const S = <K extends keyof SettingsT>(k: K, label: string) => (v: SettingsT[K]) => set((d) => { (d.settings as SettingsT)[k] = v; }, `Настройки: ${label}`, `set:${k}`);

const SOCIALS: { key: keyof SettingsT['socials']; label: string; icon: string; placeholder: string }[] = [
  { key: 'telegram', label: 'Telegram', icon: 'telegram', placeholder: 'https://t.me/koreasecret' },
  { key: 'whatsapp', label: 'WhatsApp', icon: 'whatsapp', placeholder: 'https://wa.me/992446006060' },
  { key: 'instagram', label: 'Instagram', icon: 'instagram', placeholder: 'https://instagram.com/koreasecret.tj' },
  { key: 'tiktok', label: 'TikTok', icon: 'tiktok', placeholder: 'https://tiktok.com/@koreasecret' }
];

/** What the cart drawer says for a sample basket (same rules as the storefront's CartDrawer and cartTotals). */
function CartExample({ st }: { st: SettingsT }) {
  const [sub, setSub] = useState(260);
  const cur = st.currency;
  const tiers = st.promo.tiers.slice().sort((a, b) => b[0] - a[0]);
  const pct = tiers.find(([min]) => sub >= min)?.[1] ?? 0;
  const promo = Math.round((sub * pct) / 100);
  const delivery = sub === 0 || sub >= st.freeShipping ? 0 : st.deliveryFee;
  let msg, fill;
  if (sub < st.freeShipping) { msg = <>До бесплатной доставки — <b>{money(st.freeShipping - sub, cur)}</b></>; fill = sub / st.freeShipping; }
  else if (sub < st.giftFrom) { msg = <>Доставка бесплатная. Ещё <b>{money(st.giftFrom - sub, cur)}</b> — и миниатюра в подарок</>; fill = sub / st.giftFrom; }
  else { msg = <>Бесплатная доставка и <b>миниатюра в подарок</b></>; fill = 1; }
  const max = Math.max(1500, st.giftFrom * 1.6, (tiers[0]?.[0] || 0) * 1.3);
  return (
    <div className="a-stack">
      <Field label={`Товаров в корзине на ${money(sub, cur)}`} hint="Подвигайте — так корзина подсказывает покупателю">
        <input type="range" className="a-range" min={0} max={Math.round(max)} step={10} value={sub} onChange={(e) => setSub(Number(e.target.value))} />
      </Field>
      <div className="a-sys-cart">
        <div className="free-ship"><span>{msg}</span><div className="free-ship__bar"><div className="free-ship__fill" style={{ width: `${Math.min(100, fill * 100).toFixed(1)}%` }} /></div></div>
        <div className="sum-row"><span>Товары</span><span>{money(sub, cur)}</span></div>
        {promo > 0 && <div className="sum-row"><span>Промокод {st.promo.code}: −{pct}%</span><span className="accent">−{money(promo, cur)}</span></div>}
        <div className="sum-row"><span>Доставка</span><span>{delivery ? money(delivery, cur) : 'бесплатно'}</span></div>
        <div className="sum-row sum-row--total"><span>Итого</span><span>{money(sub - promo + delivery, cur)}</span></div>
      </div>
      {!pct && sub > 0 && st.promo.tiers.length > 0 && <div className="a-field__hint">С промокодом {st.promo.code} скидка начнётся от {money(Math.min(...st.promo.tiers.map((t) => t[0])), cur)}.</div>}
    </div>
  );
}

export function Settings() {
  const st = useAdmin((s) => s.draft.settings);
  const tiers = st.promo.tiers;
  const sortTiers = () => {
    const sorted = tiers.slice().sort((a, b) => b[0] - a[0]);
    if (sorted.some((t, i) => t !== tiers[i])) set((d) => { d.settings.promo.tiers.sort((a, b) => b[0] - a[0]); }, 'Промокод: порядок порогов', 'tiers:sort');
  };
  const setTier = (i: number, j: 0 | 1, v: number) => set((d) => { d.settings.promo.tiers[i][j] = v; }, 'Промокод: порог', `tier:${i}:${j}`);
  const minTier = tiers.length ? Math.min(...tiers.map((t) => t[0])) : 0;
  const cur = st.currency;

  return (
    <div className="adm-page">
      <PageHead title={<>Настройки <em>магазина</em></>} sub="Контакты, доставка, промокод и соцсети. Эти значения подставляются в тексты сайта (см. «Тексты и SEO» → подстановки)." />
      <div className="adm-grid adm-grid--editor">
        <div className="adm-stack adm-stack--lg" style={{ minWidth: 0 }}>
          <Card title="Магазин">
            <div className="a-form">
              <div className="a-form-row a-form-row--2">
                <Field label="Название" hint="В заголовках вкладок и логотипе шапки"><Input value={st.name} onValue={S('name', 'название')} /></Field>
                <Field label="Телефон" hint="В подвале, меню и чате — по нему можно позвонить"><Input value={st.phone} onValue={S('phone', 'телефон')} placeholder="+992 44 600-60-60" /></Field>
              </div>
              <div className="a-form-row a-form-row--2">
                <Field label="Часы работы"><Input value={st.hours} onValue={S('hours', 'часы')} placeholder="ежедневно с 9:00 до 21:00" /></Field>
                <Field label="Подпись к часам"><Input value={st.hoursNote} onValue={S('hoursNote', 'подпись к часам')} /></Field>
              </div>
              <Field label="Города доставки" hint="Список в выборе города (шапка); первый — город по умолчанию. Enter — добавить."><TagsInput value={st.cities} onChange={S('cities', 'города')} placeholder="Добавьте город" /></Field>
              <div className="a-form-row a-form-row--2">
                <Field label="Возврат" hint="Подставляется как {returnDays}"><NumInput value={st.returnDays} onValue={(v) => S('returnDays', 'возврат')(Math.max(0, Math.round(v ?? 0)))} suffix="дней" min={0} /></Field>
                <Field label="Товаров на странице каталога" hint="От 4 до 60"><NumInput value={st.pageSize} onValue={(v) => S('pageSize', 'каталог')(Math.min(60, Math.max(4, Math.round(v ?? 12))))} min={4} max={60} /></Field>
              </div>
            </div>
          </Card>

          <Card title="Доставка и подарок" sub="Покупатель видит это в корзине: полоску до бесплатной доставки и до подарка">
            <div className="a-form">
              <div className="a-form-row a-form-row--2">
                <Field label="Валюта" hint="Подпись к ценам: «219 смн»"><Input value={st.currency} onValue={S('currency', 'валюта')} /></Field>
                <Field label="Стоимость доставки"><NumInput value={st.deliveryFee} onValue={(v) => S('deliveryFee', 'доставка')(Math.max(0, Math.round(v ?? 0)))} suffix={cur} min={0} /></Field>
              </div>
              <div className="a-form-row a-form-row--2">
                <Field label="Бесплатная доставка от" hint="Подставляется как {freeShipping}"><NumInput value={st.freeShipping} onValue={(v) => S('freeShipping', 'бесплатная доставка')(Math.max(0, Math.round(v ?? 0)))} suffix={cur} min={0} /></Field>
                <Field label="Миниатюра в подарок от" hint="Подставляется как {giftFrom}"><NumInput value={st.giftFrom} onValue={(v) => S('giftFrom', 'подарок')(Math.max(0, Math.round(v ?? 0)))} suffix={cur} min={0} /></Field>
              </div>
              {st.giftFrom < st.freeShipping && <Note kind="warn">Подарок начинается раньше бесплатной доставки — корзина сначала говорит о доставке, поэтому подсказка про подарок не появится до {money(st.freeShipping, cur)}.</Note>}
            </div>
          </Card>

          <Card title="Промокод" sub="Одна скидка по коду, растущая с суммой заказа">
            <div className="a-form">
              <Field label="Код" hint="Регистр не важен: покупатель может ввести строчными. Баннер «Скопировать промокод» берёт его отсюда."><Input value={st.promo.code} onValue={(v) => set((d) => { d.settings.promo.code = v.toUpperCase().replace(/\s+/g, ''); }, 'Промокод: код', 'promo:code')} /></Field>
              <Field label="Пороги" hint="Корзина берёт первый порог, сумма которого не больше суммы заказа — список сам упорядочивается от большей суммы к меньшей.">
                <div className="a-stack a-stack--sm">
                  <div className="a-sys-tier adm-muted" style={{ fontSize: 12 }}><span style={{ textAlign: 'left' }}>Сумма заказа от</span><span /><span style={{ textAlign: 'left' }}>Скидка</span><span /></div>
                  {tiers.map(([min, pct], i) => (
                    <div key={i} className="a-sys-tier" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) sortTiers(); }}>
                      <NumInput value={min} onValue={(v) => setTier(i, 0, Math.max(1, Math.round(v ?? 1)))} suffix={cur} min={1} />
                      <span>→</span>
                      <NumInput value={pct} onValue={(v) => setTier(i, 1, Math.min(95, Math.max(1, Math.round(v ?? 1))))} suffix="%" min={1} max={95} />
                      <IconBtn icon="trash" label="Удалить порог" danger disabled={tiers.length < 2} onClick={() => set((d) => { d.settings.promo.tiers.splice(i, 1); }, 'Промокод: порог удалён', `tier-del:${i}`)} />
                    </div>
                  ))}
                  <Btn size="sm" icon="plus" onClick={() => set((d) => { const t = d.settings.promo.tiers; t.push([Math.max(100, Math.round((t.length ? Math.max(...t.map((x) => x[0])) : 0) * 1.5)), Math.min(95, (t.length ? Math.max(...t.map((x) => x[1])) : 5) + 5)]); t.sort((a, b) => b[0] - a[0]); }, 'Промокод: порог добавлен', 'tier-add')}>Добавить порог</Btn>
                </div>
              </Field>
              <div className="a-field__hint">Сейчас: {tiers.slice().sort((a, b) => a[0] - b[0]).map(([m, p]) => `от ${money(m, cur)} — ${p}%`).join(' · ')}. Ниже {money(minTier, cur)} код принимается, но скидки нет.</div>
            </div>
          </Card>

          <Card title="Соцсети и мессенджеры" sub="Пустое поле — кнопка показывает «скоро»">
            <div className="a-form">
              {SOCIALS.map((x) => {
                const v = st.socials[x.key];
                const bad = v && !/^(https?:\/\/|tg:|mailto:|tel:)/i.test(v);
                return (
                  <div key={x.key} className="a-sys-social">
                    <span className="a-sys-social__icon"><Icon name={x.icon} /></span>
                    <Field label={x.label} error={bad ? 'Ссылка должна начинаться с https://' : undefined}>
                      <Input value={v} placeholder={x.placeholder} onValue={(val) => set((d) => { d.settings.socials[x.key] = val.trim(); }, `Соцсети: ${x.label}`, `soc:${x.key}`)} />
                    </Field>
                  </div>
                );
              })}
              <div className="a-field__hint"><I name="info" className="i--xs" /> Telegram и WhatsApp используются в чате на сайте, все четыре — в подвале.</div>
            </div>
          </Card>
        </div>

        <div className="adm-stack adm-sticky">
          <Card title="Как это увидит покупатель" sub="Корзина с вашими настройками">
            <CartExample st={st} />
          </Card>
          <Card title="Контакты на сайте" className="a-sys-contacts">
            <div className="footer__contact" style={{ display: 'grid', gap: 6 }}>
              <span className="footer__phone" style={{ fontSize: 24 }}>{st.phone}</span>
              <div className="footer__hours">{st.hours}<span>{st.hoursNote}</span></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
