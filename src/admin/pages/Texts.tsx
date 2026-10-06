'use client';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import type { Draft } from 'immer';
import { Butterfly } from '@/components/Brand';
import { Icon } from '@/components/Icon';
import { copyText } from '@/components/providers';
import { fill } from '@/lib/data';
import type { Option, Perk, SiteContent, Texts as TextsT } from '@/lib/types';
import { edit, useAdmin } from '../state/store';
import { useSelected } from '../ui/collection';
import { I } from '../ui/icons';
import { Btn, Card, cx, Field, IconBtn, Input, LazyInput, Note, PageHead, Tabs, TextArea } from '../ui/kit';
import { toast } from '../ui/overlay';
import { IconPicker, LinkField } from '../ui/pickers';
import { moveItem, SortableList, type HandleProps } from '../ui/Sortable';
import { useContentVersion } from '@/lib/useContent';
import '../styles/system.css';

type Tab = 'seo' | 'chat' | 'cookie' | 'perks' | 'checkout' | 'account' | 'giftcard' | 'catalog' | 'notfound';
const TABS: { value: Tab; label: string }[] = [
  { value: 'seo', label: 'SEO' }, { value: 'chat', label: 'Чат' }, { value: 'cookie', label: 'Cookie' }, { value: 'perks', label: 'Преимущества' },
  { value: 'checkout', label: 'Оформление заказа' }, { value: 'account', label: 'Вход' }, { value: 'giftcard', label: 'Подарочная карта' },
  { value: 'catalog', label: 'Каталог' }, { value: 'notfound', label: 'Страница 404' }
];
const VARS = ['freeShipping', 'giftFrom', 'deliveryFee', 'code', 'phone', 'returnDays', 'name'] as const;
const VAR_HINT: Record<(typeof VARS)[number], string> = { freeShipping: 'бесплатная доставка от', giftFrom: 'подарок от', deliveryFee: 'стоимость доставки', code: 'промокод', phone: 'телефон', returnDays: 'дней на возврат', name: 'название магазина' };

/** Edit one field of the texts / seo with a coalescing key. */
const setT = (fn: (d: Draft<SiteContent>) => void, label: string, key: string) => edit(fn, { label, key });

function Vars() {
  useContentVersion();
  return (
    <div className="a-stack a-stack--sm">
      <div className="a-field__label"><span>Подстановки</span><small>нажмите, чтобы скопировать</small></div>
      <div className="a-sys-vars">
        {VARS.map((v) => (
          <button key={v} type="button" className="a-sys-var" title={VAR_HINT[v]} onClick={() => { copyText(`{${v}}`); toast({ title: `Скопировано {${v}}`, icon: 'copy' }); }}>
            <code>{`{${v}}`}</code><span>→ {fill(`{${v}}`)}</span>
          </button>
        ))}
      </div>
      <div className="a-field__hint">Значения берутся из «Настроек магазина» — поменяете порог доставки, и тексты обновятся сами.</div>
    </div>
  );
}

/** Text with {placeholders}: shows how it reads on the site. */
function Filled({ text }: { text: string }) {
  useContentVersion();
  if (!/\{\w+\}/.test(text)) return null;
  return <div className="a-sys-filled"><b>На сайте</b>{fill(text)}</div>;
}

const counter = (n: number, max: number) => <small className={cx('a-counter', n > max && 'is-over')}>{n} / {max}</small>;

function Serp({ title, url, text }: { title: string; url: string; text: string }) {
  return (
    <div className="a-serp">
      <div className="a-serp__url">{url}</div>
      <div className="a-serp__title">{title.length > 62 ? title.slice(0, 60) + '…' : title}</div>
      <div className="a-serp__text">{text.length > 160 ? text.slice(0, 158) + '…' : text || 'Описание не задано'}</div>
    </div>
  );
}

function SeoTab() {
  const seo = useAdmin((s) => s.draft.seo);
  useContentVersion();
  const name = useAdmin((s) => s.draft.settings.name);
  const host = name.toLowerCase().replace(/\s+/g, '');
  const desc = fill(seo.description);
  return (
    <div className="adm-grid adm-grid--editor">
      <div className="adm-stack adm-stack--lg" style={{ minWidth: 0 }}>
        <Card title="Главная страница" sub="Заголовок вкладки и сниппет в поисковиках">
          <div className="a-form">
            <Field label="Title" aside={counter(seo.title.length, 60)} hint="До 60 символов — дальше поисковик обрежет. Главное — в начале."><Input value={seo.title} onValue={(v) => setT((d) => { d.seo.title = v; }, 'SEO: заголовок', 'seo:title')} /></Field>
            <Field label="Description" aside={counter(desc.length, 160)} hint="До 160 символов: что продаёте, где и чем лучше. Можно использовать подстановки.">
              <TextArea value={seo.description} onValue={(v) => setT((d) => { d.seo.description = v; }, 'SEO: описание', 'seo:desc')} rows={3} />
            </Field>
            <Filled text={seo.description} />
            <Vars />
          </div>
        </Card>
        <Card title="Каталог">
          <div className="a-form">
            <Field label="Заголовок страницы" aside={counter(seo.catalogTitle.length, 40)} hint={`Во вкладке: «${seo.catalogTitle} — ${name}»`}><Input value={seo.catalogTitle} onValue={(v) => setT((d) => { d.seo.catalogTitle = v; }, 'SEO: каталог', 'seo:ctitle')} /></Field>
            <Field label="Описание" aside={counter(seo.catalogDescription.length, 160)}><TextArea value={seo.catalogDescription} onValue={(v) => setT((d) => { d.seo.catalogDescription = v; }, 'SEO: каталог', 'seo:cdesc')} rows={3} /></Field>
          </div>
        </Card>
        <Note>Большой SEO-текст внизу главной редактируется в <Link className="a-link" href="/admin/home/?id=seo">конструкторе главной</Link>, тексты товаров — в карточке товара (описание = description страницы).</Note>
      </div>
      <div className="adm-stack adm-sticky">
        <Card title="В поиске Google"><div className="a-stack"><Serp title={seo.title} url={`${host} ›`} text={desc} /><Serp title={`${seo.catalogTitle} — ${name}`} url={`${host} › catalog`} text={seo.catalogDescription} /></div></Card>
      </div>
    </div>
  );
}

function ChatTab() {
  const t = useAdmin((s) => s.draft.texts.chat);
  const socials = useAdmin((s) => s.draft.settings.socials);
  const set = (k: keyof TextsT['chat'], v: string) => setT((d) => { d.texts.chat[k] = v; }, 'Тексты: чат', `chat:${k}`);
  return (
    <div className="adm-grid adm-grid--editor">
      <Card title="Виджет «Напишите нам»">
        <div className="a-form">
          <div className="a-form-row a-form-row--2">
            <Field label="Название"><Input value={t.title} onValue={(v) => set('title', v)} /></Field>
            <Field label="Статус"><Input value={t.status} onValue={(v) => set('status', v)} /></Field>
          </div>
          <Field label="Приветствие"><TextArea value={t.greeting} onValue={(v) => set('greeting', v)} rows={3} /></Field>
          <Field label="Надпись на кнопке" hint="На телефоне кнопка круглая — текст становится подсказкой"><Input value={t.fab} onValue={(v) => set('fab', v)} /></Field>
          <Note>Кнопки Telegram и WhatsApp ведут на адреса из <Link className="a-link" href="/admin/settings/">настроек → соцсети</Link>{!socials.telegram || !socials.whatsapp ? ' — пока не все заданы, такие кнопки показывают «скоро».' : '.'}</Note>
        </div>
      </Card>
      <div className="a-sys-stage">
        <span className="a-preview__label"><I name="eye" />Предпросмотр</span>
        <div className="chat-panel is-open" style={{ marginTop: 26 }}>
          <div className="chat-panel__head"><div className="chat-panel__avatar"><Butterfly /></div><div><div className="chat-panel__name">{t.title}</div><div className="chat-panel__status">{t.status}</div></div></div>
          <div className="chat-panel__body">
            <div className="chat-panel__bubble">{t.greeting}</div>
            <span className="chat-panel__link"><Icon name="telegram" />Telegram</span>
            <span className="chat-panel__link"><Icon name="whatsapp" />WhatsApp</span>
          </div>
        </div>
        <span className="chat-fab"><Icon name="chat" /><span>{t.fab}</span><span className="chat-fab__dot" /></span>
      </div>
    </div>
  );
}

function CookieTab() {
  const t = useAdmin((s) => s.draft.texts.cookie);
  const set = (k: keyof TextsT['cookie'], v: string) => setT((d) => { d.texts.cookie[k] = v; }, 'Тексты: cookie', `cookie:${k}`);
  return (
    <div className="adm-stack adm-stack--lg">
      <Card title="Плашка о cookie" sub="Показывается при первом визите, пока покупатель не нажмёт «Хорошо»">
        <div className="a-form">
          <Field label="Текст"><TextArea value={t.text} onValue={(v) => set('text', v)} rows={3} /></Field>
          <div className="a-form-row a-form-row--2">
            <Field label="Текст ссылки" hint="Пусто — без ссылки"><Input value={t.linkLabel} onValue={(v) => set('linkLabel', v)} /></Field>
            <Field label="Ссылка на правила"><LinkField value={t.href} onChange={(v) => set('href', v)} /></Field>
          </div>
        </div>
      </Card>
      <div className="a-sys-stage">
        <span className="a-preview__label"><I name="eye" />Предпросмотр</span>
        <div className="cookie" style={{ marginTop: 26 }}>
          <Butterfly className="cookie__icon" />
          <p>{t.text} {t.linkLabel && <a href="#" onClick={(e) => e.preventDefault()}>{t.linkLabel}</a>}{t.linkLabel ? '.' : ''}</p>
          <span className="btn btn--gray">Хорошо</span>
        </div>
      </div>
    </div>
  );
}

function PerkRow({ p, i, handle }: { p: Perk; i: number; handle: HandleProps }) {
  const [open, setOpen] = useState(false);
  const set = (k: keyof Perk, v: string) => setT((d) => { d.texts.perks[i][k] = v; }, 'Преимущества', `perk:${i}:${k}`);
  return (
    <div className="a-item" style={{ display: 'grid', gap: 10, padding: 12 }}>
      <div className="a-sys-perk">
        <span className="a-item__handle" {...handle}><I name="drag" /></span>
        <button type="button" className={cx('a-sys-iconbtn', open && 'is-open')} onClick={() => setOpen((o) => !o)} aria-label="Иконка" title="Сменить иконку"><I name={p.icon} /></button>
        <Input value={p.title} onValue={(v) => set('title', v)} placeholder="Заголовок" />
        <Input value={p.text} onValue={(v) => set('text', v)} placeholder="Пояснение" />
        <IconBtn icon="trash" label="Удалить" danger onClick={() => setT((d) => { d.texts.perks.splice(i, 1); }, 'Преимущество удалено', `perk-del:${i}`)} />
      </div>
      {open && <IconPicker kind="sprite" value={p.icon} onChange={(v) => { set('icon', v); setOpen(false); }} />}
      {/\{\w+\}/.test(p.title + p.text) && <Filled text={`${p.title} — ${p.text}`} />}
    </div>
  );
}

function PerksTab() {
  const perks = useAdmin((s) => s.draft.texts.perks);
  useContentVersion();
  return (
    <div className="adm-stack adm-stack--lg">
      <Card title="Преимущества на странице товара" sub="Три плашки под кнопкой «В корзину»" actions={<Btn size="sm" icon="plus" onClick={() => setT((d) => { d.texts.perks.push({ icon: 'sparkle', title: 'Новое преимущество', text: 'Пояснение' }); }, 'Преимущество добавлено', 'perk-add')}>Добавить</Btn>}>
        <SortableList items={perks} getKey={(_, i) => String(i)} onMove={(a, b) => edit((d) => moveItem(d.texts.perks, a, b), { label: 'Преимущества: порядок' })} render={(p, i, handle) => <PerkRow p={p} i={i} handle={handle} />} />
        <div style={{ marginTop: 14 }}><Vars /></div>
      </Card>
      <div className="a-sys-stage">
        <span className="a-preview__label"><I name="eye" />Предпросмотр</span>
        <div className="perks" style={{ marginTop: 26 }}>{perks.map((k, i) => <div key={i} className="perk"><Icon name={k.icon} /><b>{fill(k.title)}</b><span>{fill(k.text)}</span></div>)}</div>
      </div>
    </div>
  );
}

function OptionList({ kind, title, sub }: { kind: 'delivery' | 'payment'; title: string; sub: string }) {
  const list = useAdmin((s) => s.draft.texts.checkout[kind]);
  const set = (i: number, k: keyof Option, v: string) => setT((d) => { d.texts.checkout[kind][i][k] = v; }, `Оформление: ${title}`, `co:${kind}:${i}:${k}`);
  return (
    <Card title={title} sub={sub} actions={<Btn size="sm" icon="plus" onClick={() => setT((d) => { d.texts.checkout[kind].push({ id: `${kind === 'delivery' ? 'ship' : 'pay'}${d.texts.checkout[kind].length + 1}`, title: 'Новый способ', note: 'пояснение' }); }, `Оформление: ${title}`, `co-add:${kind}`)}>Добавить</Btn>}>
      <div className="a-sys-row adm-muted" style={{ fontSize: 12, marginBottom: 6 }}><span /><span>Код</span><span>Название</span><span>Пояснение</span><span /></div>
      <SortableList items={list} getKey={(o, i) => o.id + i} gap={6} className="a-stack a-stack--sm" onMove={(a, b) => edit((d) => moveItem(d.texts.checkout[kind], a, b), { label: `Оформление: ${title}` })}
        render={(o, i, handle) => (
          <div className="a-sys-row">
            <span className="a-item__handle" {...handle}><I name="drag" className="i--sm" /></span>
            <LazyInput value={o.id} onCommit={(v) => set(i, 'id', v.trim())} validate={(v) => (!/^[a-z0-9_-]+$/i.test(v.trim()) ? 'латиница и цифры' : list.some((x, k) => k !== i && x.id === v.trim()) ? 'уже есть' : null)} />
            <Input value={o.title} onValue={(v) => set(i, 'title', v)} />
            <Input value={o.note} onValue={(v) => set(i, 'note', v)} />
            <IconBtn icon="trash" label="Удалить" danger disabled={list.length < 2} onClick={() => setT((d) => { d.texts.checkout[kind].splice(i, 1); }, `Оформление: удалён способ`, `co-del:${kind}:${i}`)} />
          </div>
        )} />
      <div className="radio-cards a-sys-radio" style={{ marginTop: 16 }}>
        {list.map((o, i) => <label key={o.id + i} className="radio-card"><input type="radio" name={`pv-${kind}`} defaultChecked={i === 0} /><b>{o.title}</b><span>{o.note}</span></label>)}
      </div>
    </Card>
  );
}

function CheckoutTab() {
  const success = useAdmin((s) => s.draft.texts.checkout.success);
  return (
    <div className="adm-stack adm-stack--lg">
      <Note>Код способа сохраняется в заказе (раздел «Заказы» и отчёты группируют по нему): courier, pickup, store, card, qr, cash уже знакомы аналитике. Первый способ в списке выбран по умолчанию.</Note>
      <OptionList kind="delivery" title="Способы получения" sub="Курьер, пункт выдачи, самовывоз…" />
      <OptionList kind="payment" title="Способы оплаты" sub="Карта, QR-код мобильного банка, при получении…" />
      <Card title="После оформления">
        <Field label="Текст под номером заказа" hint="«Номер заказа KS-123456. …»"><TextArea value={success} onValue={(v) => setT((d) => { d.texts.checkout.success = v; }, 'Оформление: текст', 'co:success')} rows={2} /></Field>
      </Card>
    </div>
  );
}

function SimpleTab({ title, sub, fields, preview }: { title: string; sub?: string; fields: { label: string; value: string; set: (v: string) => void; area?: boolean; hint?: string }[]; preview?: ReactNode }) {
  return (
    <div className="adm-grid adm-grid--editor">
      <Card title={title} sub={sub}>
        <div className="a-form">
          {fields.map((f) => (
            <Field key={f.label} label={f.label} hint={f.hint}>{f.area ? <TextArea value={f.value} onValue={f.set} rows={3} /> : <Input value={f.value} onValue={f.set} />}</Field>
          ))}
          {fields.some((f) => /\{\w+\}/.test(f.value)) && <Filled text={fields.map((f) => f.value).join(' · ')} />}
        </div>
      </Card>
      {preview && <div className="a-sys-stage"><span className="a-preview__label"><I name="eye" />Предпросмотр</span><div style={{ marginTop: 26, width: '100%' }}>{preview}</div></div>}
    </div>
  );
}

export function Texts() {
  const [tabRaw, setTab] = useSelected('tab');
  const tab = (TABS.some((t) => t.value === tabRaw) ? tabRaw : 'seo') as Tab;
  const t = useAdmin((s) => s.draft.texts);
  const count = useAdmin((s) => s.draft.products.filter((p) => !p.hidden).length);
  const up = <K extends 'account' | 'giftcard' | 'catalog' | 'notFound'>(sec: K, k: keyof TextsT[K] & string, label: string) => (v: string) =>
    setT((d) => { (d.texts[sec] as unknown as Record<string, string>)[k] = v; }, `Тексты: ${label}`, `t:${sec}:${k}`);

  return (
    <div className="adm-page">
      <PageHead title={<>Тексты <em>и SEO</em></>} sub="Всё, что покупатель читает вне товаров и баннеров: заголовки для поисковиков, чат, cookie, оформление заказа, служебные страницы." />
      <Tabs value={tab} onChange={(v) => setTab(v === 'seo' ? null : v)} items={TABS} />
      {tab === 'seo' && <SeoTab />}
      {tab === 'chat' && <ChatTab />}
      {tab === 'cookie' && <CookieTab />}
      {tab === 'perks' && <PerksTab />}
      {tab === 'checkout' && <CheckoutTab />}
      {tab === 'account' && (
        <SimpleTab title="Окно входа" sub="Открывается по иконке профиля" fields={[{ label: 'Заголовок', value: t.account.title, set: up('account', 'title', 'вход') }, { label: 'Текст', value: t.account.text, set: up('account', 'text', 'вход'), area: true }]}
          preview={<div className="modal__dialog a-sys-modal" style={{ position: 'relative', opacity: 1, transform: 'none', width: '100%', boxShadow: 'var(--a-shadow)' }}><h2 className="modal__title">{t.account.title}</h2><p className="modal__text">{t.account.text}</p><div className="field"><span className="field__label">Номер телефона</span><span className="input" style={{ display: 'flex', alignItems: 'center', color: 'var(--muted)' }}>+992 __ ___-__-__</span></div><span className="btn btn--primary btn--block" style={{ marginTop: 14 }}>Получить код</span></div>} />
      )}
      {tab === 'giftcard' && (
        <SimpleTab title="Окно подарочной карты" sub="Открывается из меню, баннеров и блока «Подарочные карты»" fields={[{ label: 'Заголовок', value: t.giftcard.title, set: up('giftcard', 'title', 'подарочная карта') }, { label: 'Текст', value: t.giftcard.text, set: up('giftcard', 'text', 'подарочная карта'), area: true }]}
          preview={<div className="modal__dialog" style={{ position: 'relative', opacity: 1, transform: 'none', width: '100%', boxShadow: 'var(--a-shadow)' }}><h2 className="modal__title">{t.giftcard.title}</h2><p className="modal__text">{t.giftcard.text}</p><Note>Номиналы карты — это варианты товара с типом «Подарочная карта» в каталоге.</Note></div>} />
      )}
      {tab === 'catalog' && (
        <SimpleTab title="Каталог" fields={[{ label: 'Подзаголовок', value: t.catalog.subtitle, set: up('catalog', 'subtitle', 'каталог'), hint: 'Идёт после числа товаров: «55 продуктов …»' }, { label: 'Когда ничего не нашлось', value: t.catalog.empty, set: up('catalog', 'empty', 'каталог'), area: true }]}
          preview={<div className="a-stack"><div><div className="page-hero__title h1" style={{ fontSize: 40 }}>Каталог</div><p className="page-hero__sub" style={{ marginTop: 8 }}>{count} продуктов {t.catalog.subtitle}</p></div><div className="no-results" style={{ padding: 20, borderRadius: 18, background: '#fff' }}><h3>Ничего не нашлось</h3><p>{t.catalog.empty}</p></div></div>} />
      )}
      {tab === 'notfound' && (
        <SimpleTab title="Страница 404" sub="Когда ссылка ведёт в никуда" fields={[{ label: 'Заголовок', value: t.notFound.title, set: up('notFound', 'title', '404') }, { label: 'Текст', value: t.notFound.text, set: up('notFound', 'text', '404'), area: true }]}
          preview={<div className="a-sys-nf" style={{ background: '#fff', borderRadius: 20 }}><div className="nf__art" style={{ width: 70, height: 70 }}><Butterfly /></div><div className="nf__code">404</div><h1>{t.notFound.title}</h1><p>{t.notFound.text}</p></div>} />
      )}
    </div>
  );
}
