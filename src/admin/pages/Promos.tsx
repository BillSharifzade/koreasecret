'use client';
import { useState } from 'react';
import { Art } from '@/components/Art';
import type { Decor, Promo } from '@/lib/types';
import { uid } from '../state/schema';
import { edit, useAdmin } from '../state/store';
import { CollectionEditor, useSelected } from '../ui/collection';
import { ThemePicker, THEME_NAMES } from '../ui/fields';
import { I } from '../ui/icons';
import { Badge, Btn, Card, Field, IconBtn, Input, Note, PageHead, Seg, Switch } from '../ui/kit';
import { ImageField, LinkField, ProductsField } from '../ui/pickers';
import { Scaled } from '../ui/preview';
import { moveItem, SortableList } from '../ui/Sortable';
import '../styles/content.css';

const DECORS: { value: Decor; label: string }[] = [
  { value: 'orbs', label: 'Сферы' }, { value: 'sun', label: 'Солнце' }, { value: 'petals', label: 'Лепестки' }, { value: 'butterflies', label: 'Бабочки' }, { value: 'bubbles', label: 'Пузырьки' }
];

type Tab = 'cards' | 'bar';
function PromoTabs({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  const cards = useAdmin((s) => s.draft.promos.length);
  const bar = useAdmin((s) => s.draft.promoBar.enabled);
  return (
    <div className="c-tabs">
      <Seg value={tab} onChange={onTab} options={[{ value: 'cards', label: 'Карточки акций', icon: 'percent', count: cards }, { value: 'bar', label: 'Промо-полоса', icon: 'nav' }]} />
      {tab === 'bar' && <Badge tone={bar ? 'green' : undefined} dot>{bar ? 'включена' : 'выключена'}</Badge>}
    </div>
  );
}

/** The storefront promo card (src/components/home/sections.tsx → Promos), rendered at its real 1020px width. */
export function PromoCardPreview({ p }: { p: Promo }) {
  return (
    <Scaled width={1020} label="Карточка на сайте">
      <div className={`promo-card${p.dark ? ' is-dark' : ''}`}>
        <Art className="promo-card__bg" as="div" spec={{ kind: 'promo', id: p.id }} />
        <div className="promo-card__content"><div className="promo-card__title">{p.title}</div><div className="promo-card__date">{p.date}</div></div>
        <div className="promo-card__hline" /><div className="promo-card__vline" /><div className="promo-card__vline promo-card__vline--sm" />
        <div className="promo-card__btn"><span className="btn btn--primary">Подробнее</span></div>
      </div>
    </Scaled>
  );
}

function newPromo(): Promo {
  return { id: uid('p-'), theme: 'pink', title: 'Новая акция', date: 'до 31 октября', link: '/catalog?offer=sale', decor: 'orbs', products: [] };
}

function PromoCards({ onTab }: { onTab: (t: Tab) => void }) {
  return (
    <CollectionEditor<Promo>
      area="Акции"
      list={(d) => d.promos}
      title={<>Акции и <em>промо</em></>}
      sub="Бесконечная лента больших карточек в блоке «Акции» на главной. Порядок карточек — как в списке; скрытые остаются в черновике."
      noun={{ one: 'акцию', add: 'Новая акция', gen: 'акции' }}
      before={<PromoTabs tab="cards" onTab={onTab} />}
      label={(p) => p.title}
      caption={(p) => `${p.date} · ${THEME_NAMES[p.theme]} · ${p.link || 'без ссылки'}`}
      media={(p) => <Art spec={{ kind: 'promo', id: p.id }} />}
      create={newPromo}
      wide
      extra={(p) => (p.dark ? <Badge>тёмный текст</Badge> : null)}
      editor={(p, ed) => (
        <div className="a-stack a-stack--lg">
          <PromoCardPreview p={p} />
          <Card title="Текст и ссылка">
            <div className="a-form">
              <Field label="Заголовок" aside={<small>{p.title.length} симв.</small>} hint="Две-три строки на карточке — лучше коротко"><Input size="title" value={p.title} onValue={(v) => ed.set('title', v)} /></Field>
              <Field label="Сроки" hint="Свободный текст: «до 31 октября», «весь октябрь», «пока есть в наличии»"><Input value={p.date} onValue={(v) => ed.set('date', v)} /></Field>
              <Field label="Куда ведёт карточка"><LinkField value={p.link} onChange={(v) => ed.set('link', v)} /></Field>
            </div>
          </Card>
          <Card title="Оформление">
            <div className="a-form">
              <Field label="Цветовая тема"><ThemePicker value={p.theme} onChange={(v) => ed.set('theme', v)} /></Field>
              <Switch checked={!!p.dark} onChange={(v) => ed.set('dark', v || undefined)} label="Тёмный текст" hint="Для светлых тем (мята, лаванда, сливки, небо) — тёмные буквы читаются лучше" />
              <Field label="Декор вокруг товаров"><Seg value={p.decor} onChange={(v) => ed.set('decor', v)} options={DECORS} /></Field>
              {!p.image && <Field label="Товары на карточке" hint="До трёх — рисуются справа от текста"><ProductsField value={p.products} onChange={(v) => ed.set('products', v)} max={3} /></Field>}
              <Field label="Своя картинка вместо рисунка" hint="Заполнит всю карточку (1020×540). Оставьте пустым — карточка нарисуется из темы, декора и товаров.">
                <ImageField value={p.image} onChange={(v) => ed.set('image', v)} folder="promos" opts={{ max: 2040 }} aspect="1020 / 540" />
              </Field>
            </div>
          </Card>
        </div>
      )}
    />
  );
}

function PromoBarTab({ onTab }: { onTab: (t: Tab) => void }) {
  const bar = useAdmin((s) => s.draft.promoBar);
  const code = useAdmin((s) => s.draft.settings.promo.code);
  const [pv, setPv] = useState(0);
  const msgs = bar.messages;
  const cur = msgs[Math.min(pv, msgs.length - 1)];
  const setMsg = (i: number, k: 'text' | 'code', v: string) => edit((d) => { const m = d.promoBar.messages[i]; if (!m) return; if (k === 'code') m.code = v.trim() || undefined; else m.text = v; }, { label: 'Промо-полоса: сообщение', key: `bar:${i}:${k}` });
  const [a, b] = (cur?.text || '').split('{code}');
  return (
    <div className="adm-page">
      <PageHead title={<>Акции и <em>промо</em></>} sub="Тонкая полоса с бегущими сообщениями над шапкой сайта. Сообщения сменяются каждые 4 секунды." />
      <PromoTabs tab="bar" onTab={onTab} />
      <Card title="Промо-полоса" actions={<Switch checked={bar.enabled} onChange={(v) => edit((d) => { d.promoBar.enabled = v; }, { label: v ? 'Промо-полоса включена' : 'Промо-полоса выключена' })} label={bar.enabled ? 'Показывается' : 'Выключена'} />}>
        <div className="a-stack">
          <div className="c-bar-preview">
            {cur ? (
              <div className="promo-bar">
                <div className="promo-bar__track">
                  <div className="promo-bar__msg is-active">{a}{cur.code && <button className="promo-bar__code" type="button" tabIndex={-1}>{cur.code}</button>}{b}</div>
                </div>
              </div>
            ) : <Note>Добавьте хотя бы одно сообщение.</Note>}
          </div>
          {!bar.enabled && <Note kind="warn" icon="eye-off">Полоса выключена — на сайте её не видно. Включите переключатель справа, когда сообщения будут готовы.</Note>}
          {msgs.length > 0 && (
            <SortableList items={msgs} getKey={(_, i) => String(i)} gap={8} className="a-stack a-stack--sm" onMove={(x, y) => { edit((d) => moveItem(d.promoBar.messages, x, y), { label: 'Промо-полоса: порядок' }); setPv(y); }}
              render={(m, i, handle) => (
                <div className="c-bar-msg">
                  <span className="a-item__handle" {...handle}><I name="drag" /></span>
                  <Input value={m.text} onValue={(v) => setMsg(i, 'text', v)} placeholder="Текст сообщения — {code} станет кнопкой с промокодом" />
                  <Input value={m.code || ''} onValue={(v) => setMsg(i, 'code', v)} placeholder={`Код, напр. ${code}`} />
                  <span style={pv === i ? { color: 'var(--brand)' } : undefined}><IconBtn icon="eye" label={pv === i ? 'Показано в превью' : 'Показать в превью'} active={pv === i} onClick={() => setPv(i)} /></span>
                  <IconBtn icon="trash" label="Удалить сообщение" danger onClick={() => { edit((d) => { d.promoBar.messages.splice(i, 1); }, { label: 'Промо-полоса: сообщение удалено' }); setPv(0); }} />
                </div>
              )} />
          )}
          {msgs.some((m) => m.text.includes('{code}') && !m.code) && <Note kind="warn">В сообщении есть {'{code}'}, но код не указан — на сайте на этом месте будет пусто.</Note>}
          <div className="adm-row adm-row--wrap">
            <Btn icon="plus" onClick={() => { edit((d) => { d.promoBar.messages.push({ text: 'Новое сообщение' }); }, { label: 'Промо-полоса: сообщение' }); setPv(msgs.length); }}>Добавить сообщение</Btn>
            <Btn variant="ghost" icon="copy" onClick={() => { edit((d) => { d.promoBar.messages.push({ text: 'Секретный промокод {code} — до −20% на заказ', code }); }, { label: 'Промо-полоса: сообщение' }); setPv(msgs.length); }}>Сообщение с промокодом</Btn>
          </div>
          <div className="a-field__hint">Подсказка: <span className="adm-mono">{'{code}'}</span> превращается в кнопку — по клику код копируется и сразу применяется к корзине. Плейсхолдеры вроде {'{freeShipping}'} здесь не работают — пишите сумму текстом.</div>
        </div>
      </Card>
    </div>
  );
}

export function Promos() {
  const [tab, setTab] = useSelected('tab');
  const onTab = (t: Tab) => setTab(t === 'cards' ? null : t);
  return tab === 'bar' ? <PromoBarTab onTab={onTab} /> : <PromoCards onTab={onTab} />;
}
