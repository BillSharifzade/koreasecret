'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Art } from '@/components/Art';
import type { OrderStatus } from '@/lib/orders';
import { download, stamp, toCsv, writeXlsx, type SheetCol } from '../lib/sheet';
import { inRange, presetRange, PRESETS, type Preset } from '../orders/analytics';
import { DELIVERY_NAMES, demoEnabled, FLOW, PAYMENT_NAMES, setDemoEnabled, setNote, setStatus, STATUS, useOrders, type OrderView } from '../orders/store';
import { useAdmin } from '../state/store';
import { useSelected } from '../ui/collection';
import { Column, DataTable } from '../ui/DataTable';
import { I } from '../ui/icons';
import { ago, Badge, Btn, Card, Check, cx, dt, Empty, Menu, money, Note, PageHead, Seg, Select, Switch, TextArea } from '../ui/kit';
import { confirmDialog, Sheet, toast } from '../ui/overlay';

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
const NEXT: Partial<Record<OrderStatus, { to: OrderStatus; label: string; icon: string }>> = {
  new: { to: 'confirmed', label: 'Подтвердить', icon: 'check' },
  confirmed: { to: 'packed', label: 'Заказ собран', icon: 'box' },
  packed: { to: 'shipped', label: 'Передать в доставку', icon: 'truck' },
  shipped: { to: 'delivered', label: 'Доставлен', icon: 'check-circle' }
};
const payName = (k: string, labels: Record<string, string>) => labels[k] || PAYMENT_NAMES[k] || k;
const shipName = (k: string, labels: Record<string, string>) => labels[k] || DELIVERY_NAMES[k] || k;

export const ORDER_COLS: SheetCol[] = [
  { key: 'id', label: 'Заказ' }, { key: 'date', label: 'Дата', type: 'datetime', width: 17 }, { key: 'status', label: 'Статус' }, { key: 'name', label: 'Клиент', width: 20 },
  { key: 'phone', label: 'Телефон', width: 18 }, { key: 'city', label: 'Город' }, { key: 'address', label: 'Адрес', width: 24 }, { key: 'items', label: 'Товары', width: 50 },
  { key: 'count', label: 'Шт', type: 'int' }, { key: 'full', label: 'Без скидок', type: 'money' }, { key: 'discount', label: 'Скидки', type: 'money' }, { key: 'delivery', label: 'Доставка', type: 'money' },
  { key: 'total', label: 'Итого', type: 'money' }, { key: 'promo', label: 'Промокод' }, { key: 'payment', label: 'Оплата' }, { key: 'ship', label: 'Получение' }, { key: 'source', label: 'Источник' }
];
export function orderRows(list: OrderView[], pay: Record<string, string>, ship: Record<string, string>) {
  return list.map((o) => ({
    id: o.id, date: new Date(o.createdAt), status: STATUS[o.status].label, name: o.customer.name, phone: o.customer.phone, city: o.city, address: o.address || '',
    items: o.items.map((x) => `${x.name}${x.variant ? ` (${x.variant})` : ''} × ${x.q}`).join('; '), count: o.totals.count, full: o.totals.full, discount: o.totals.savings + o.totals.promo,
    delivery: o.totals.delivery, total: o.totals.total, promo: o.promo || '', payment: payName(o.payment, pay), ship: shipName(o.delivery, ship), source: o.source === 'site' ? 'сайт' : 'демо'
  }));
}

function printInvoice(o: OrderView, shop: { name: string; phone: string; currency: string }, pay: Record<string, string>, ship: Record<string, string>) {
  const m = (n: number) => `${Math.round(n).toLocaleString('ru-RU')} ${shop.currency}`;
  const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>${esc(o.id)}</title><style>
  body{font-family:-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:#161215;margin:40px;font-size:13px}
  h1{font-family:Georgia,serif;font-weight:500;font-size:28px;margin:0 0 4px} .muted{color:#8f8891}
  .head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #dd4487;padding-bottom:16px;margin-bottom:20px}
  .brand{font-family:Georgia,serif;font-size:22px;color:#dd4487} table{width:100%;border-collapse:collapse;margin:16px 0}
  th,td{padding:8px 6px;border-bottom:1px solid #eee;text-align:left} th{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#8f8891}
  .r{text-align:right} .grid{display:grid;grid-template-columns:1fr 1fr;gap:20px} .tot td{border:0;padding:4px 6px} .big td{font-size:16px;font-weight:700}
  @page{margin:14mm}</style></head><body>
  <div class="head"><div><div class="brand">${esc(shop.name)}</div><div class="muted">${esc(shop.phone)}</div></div>
  <div style="text-align:right"><h1>Заказ ${esc(o.id)}</h1><div class="muted">${esc(new Date(o.createdAt).toLocaleString('ru-RU'))} · ${esc(STATUS[o.status].label)}</div></div></div>
  <div class="grid"><div><b>Покупатель</b><br>${esc(o.customer.name)}<br>${esc(o.customer.phone)}${o.customer.email ? `<br>${esc(o.customer.email)}` : ''}</div>
  <div><b>Получение</b><br>${esc(shipName(o.delivery, ship))}, ${esc(o.city)}${o.address ? `<br>${esc(o.address)}` : ''}<br><b>Оплата:</b> ${esc(payName(o.payment, pay))}</div></div>
  <table><thead><tr><th>#</th><th>Товар</th><th class="r">Цена</th><th class="r">Кол-во</th><th class="r">Сумма</th></tr></thead><tbody>
  ${o.items.map((x, i) => `<tr><td>${i + 1}</td><td>${esc(x.name)}${x.variant ? ` <span class="muted">· ${esc(x.variant)}</span>` : ''}</td><td class="r">${m(x.price)}</td><td class="r">${x.q}</td><td class="r">${m(x.price * x.q)}</td></tr>`).join('')}
  </tbody></table>
  <table class="tot" style="width:320px;margin-left:auto"><tr><td>Товары</td><td class="r">${m(o.totals.full)}</td></tr>
  ${o.totals.savings ? `<tr><td>Скидка на товары</td><td class="r">−${m(o.totals.savings)}</td></tr>` : ''}${o.totals.promo ? `<tr><td>Промокод ${esc(o.promo || '')}</td><td class="r">−${m(o.totals.promo)}</td></tr>` : ''}
  <tr><td>Доставка</td><td class="r">${o.totals.delivery ? m(o.totals.delivery) : 'бесплатно'}</td></tr><tr class="big"><td>Итого</td><td class="r">${m(o.totals.total)}</td></tr></table>
  ${o.comment ? `<p><b>Комментарий:</b> ${esc(o.comment)}</p>` : ''}
  <p class="muted" style="margin-top:40px">Спасибо за покупку! Подпись получателя: ____________________</p>
  <script>window.onload=function(){window.print()}</script></body></html>`;
  const w = window.open('', '_blank');
  if (!w) { toast({ title: 'Браузер заблокировал окно печати', kind: 'error' }); return; }
  w.document.write(html);
  w.document.close();
}

function OrderSheet({ o, onClose }: { o: OrderView | undefined; onClose: () => void }) {
  const settings = useAdmin((s) => s.draft.settings);
  const texts = useAdmin((s) => s.draft.texts.checkout);
  const pay = Object.fromEntries(texts.payment.map((x) => [x.id, x.title]));
  const ship = Object.fromEntries(texts.delivery.map((x) => [x.id, x.title]));
  const [note, setN] = useState('');
  useEffect(() => { setN(o?.note || ''); }, [o?.id, o?.note]);
  if (!o) return <Sheet open={false} onClose={onClose} title="">{null}</Sheet>;
  const m = (n: number) => money(n, settings.currency);
  const next = NEXT[o.status];
  const step = o.status === 'cancelled' ? -1 : FLOW.indexOf(o.status);
  const wa = `https://wa.me/${o.customer.phone.replace(/\D/g, '')}`;
  const move = (to: OrderStatus) => { setStatus([o.id], to); toast({ title: `${o.id}: ${STATUS[to].label.toLowerCase()}`, kind: 'ok' }); };
  return (
    <Sheet open onClose={onClose} wide title={<span className="adm-row" style={{ gap: 10, flexWrap: 'wrap' }}>Заказ {o.id}<Badge tone={STATUS[o.status].tone} icon={STATUS[o.status].icon}>{STATUS[o.status].label}</Badge>{o.source === 'site' && <Badge tone="blue">с сайта</Badge>}</span>}
      sub={`${dt(o.createdAt)} · ${ago(o.createdAt)}`}
      actions={<Menu items={[{ label: 'Печать накладной', icon: 'printer', onClick: () => printInvoice(o, { name: settings.name, phone: settings.phone, currency: settings.currency }, pay, ship) }, { label: 'Скопировать телефон', icon: 'copy', onClick: () => { navigator.clipboard?.writeText(o.customer.phone); toast({ title: 'Телефон скопирован' }); } }, { sep: true }, ...(o.status !== 'cancelled' ? [{ label: 'Отменить заказ', icon: 'x-circle', danger: true, onClick: async () => { if (await confirmDialog({ title: `Отменить ${o.id}?`, text: 'Заказ останется в истории со статусом «Отменён».', confirm: 'Отменить заказ', danger: true })) move('cancelled'); } }] : [{ label: 'Вернуть в работу', icon: 'undo', onClick: () => move('new') }])]} />}
      foot={<>
        <Btn icon="printer" onClick={() => printInvoice(o, { name: settings.name, phone: settings.phone, currency: settings.currency }, pay, ship)}>Накладная</Btn>
        <span className="adm-grow" />
        {next && <Btn variant="primary" icon={next.icon} onClick={() => move(next.to)}>{next.label}</Btn>}
      </>}>
      <div className="a-stack a-stack--lg">
        <div className="a-flow">
          {FLOW.map((s, i) => (
            <button key={s} type="button" className={cx('a-flow__step', i <= step && 'is-done', i === step && 'is-current')} onClick={() => move(s)} disabled={o.status === 'cancelled'}>
              <span className="a-flow__dot"><I name={i < step ? 'check' : STATUS[s].icon} /></span>{STATUS[s].label}
            </button>
          ))}
        </div>
        {o.status === 'cancelled' && <Note kind="error">Заказ отменён. Его можно вернуть в работу через меню «⋯».</Note>}
        {o.source === 'demo' && <Note icon="info">Демонстрационный заказ: показывает, как будет выглядеть работа с заказами. Реальные заказы с сайта помечены «с сайта».</Note>}
        <div className="adm-grid adm-grid--2">
          <Card soft title="Покупатель">
            <div className="a-stack a-stack--sm">
              <b style={{ fontSize: 16 }}>{o.customer.name}</b>
              <div className="adm-row adm-row--wrap" style={{ gap: 6 }}>
                <a className="a-btn a-btn--sm a-btn--white" href={`tel:${o.customer.phone.replace(/[^\d+]/g, '')}`}><I name="phone" />{o.customer.phone}</a>
                <a className="a-btn a-btn--sm a-btn--white" href={wa} target="_blank" rel="noopener noreferrer"><I name="whatsapp" />WhatsApp</a>
              </div>
              {o.customer.email && <a className="a-link" href={`mailto:${o.customer.email}`}>{o.customer.email}</a>}
              <Link className="a-link" href={`/admin/customers/?id=${encodeURIComponent(o.customer.phone)}`} style={{ fontSize: 13 }}>Все заказы клиента →</Link>
            </div>
          </Card>
          <Card soft title="Получение и оплата">
            <dl className="a-dl">
              <dt>Способ</dt><dd>{shipName(o.delivery, ship)}</dd>
              <dt>Город</dt><dd>{o.city}</dd>
              {o.address && <><dt>Адрес</dt><dd>{o.address}</dd></>}
              <dt>Оплата</dt><dd>{payName(o.payment, pay)}</dd>
              {o.promo && <><dt>Промокод</dt><dd><Badge tone="brand">{o.promo}</Badge></dd></>}
            </dl>
          </Card>
        </div>
        <Card title={`Состав · ${o.totals.count} шт`}>
          <div className="a-changes">
            {o.items.map((x, i) => (
              <Link key={i} className="a-change" href={`/admin/products/edit/?id=${encodeURIComponent(x.id)}`}>
                <span className="a-cell__art"><Art spec={{ kind: 'product', id: x.id, variant: x.variant ? undefined : undefined }} /></span>
                <span className="adm-grow" style={{ minWidth: 0 }}><span className="adm-ellipsis" style={{ display: 'block', fontWeight: 500 }}>{x.name}</span><span className="a-change__fields">{x.variant ? `${x.variant} · ` : ''}{m(x.price)} × {x.q}</span></span>
                <b className="adm-num">{m(x.price * x.q)}</b>
              </Link>
            ))}
          </div>
          <div className="a-totals">
            <div><span>Товары</span><span>{m(o.totals.full)}</span></div>
            {o.totals.savings > 0 && <div><span>Скидка на товары</span><span className="adm-accent">−{m(o.totals.savings)}</span></div>}
            {o.totals.promo > 0 && <div><span>Промокод {o.promo}</span><span className="adm-accent">−{m(o.totals.promo)}</span></div>}
            <div><span>Доставка</span><span>{o.totals.delivery ? m(o.totals.delivery) : 'бесплатно'}</span></div>
            <div className="is-total"><span>Итого</span><span>{m(o.totals.total)}</span></div>
          </div>
        </Card>
        {o.comment && <Note icon="chat"><b>Комментарий покупателя:</b> {o.comment}</Note>}
        <div className="adm-grid adm-grid--2">
          <Card title="Заметка менеджера">
            <TextArea value={note} onValue={setN} rows={3} placeholder="Видна только в панели" />
            <div className="adm-row adm-row--end" style={{ marginTop: 8 }}><Btn size="sm" variant="dark" disabled={note === (o.note || '')} onClick={() => { setNote(o.id, note); toast({ title: 'Заметка сохранена', kind: 'ok' }); }}>Сохранить</Btn></div>
          </Card>
          <Card title="История">
            <div className="a-steps">
              {o.history.slice().reverse().map((h, i) => <div key={i} className="a-step is-done"><span className="a-step__dot"><I name={STATUS[h.status].icon} /></span><span className="adm-grow">{STATUS[h.status].label}</span><span className="adm-muted" style={{ fontSize: 12 }}>{dt(h.at)}</span></div>)}
            </div>
          </Card>
        </div>
      </div>
    </Sheet>
  );
}

export function Orders() {
  const orders = useOrders();
  const sp = useSearchParams();
  const draft = useAdmin((s) => s.draft);
  const [sel, select] = useSelected();
  const [status, setSt] = useState<OrderStatus | 'all'>((sp.get('status') as OrderStatus) || 'all');
  const [q, setQ] = useState('');
  const [period, setPeriod] = useState<Preset | 'all'>('all');
  const [city, setCity] = useState('');
  const [source, setSource] = useState('');
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const pay = Object.fromEntries(draft.texts.checkout.payment.map((x) => [x.id, x.title]));
  const ship = Object.fromEntries(draft.texts.checkout.delivery.map((x) => [x.id, x.title]));
  const m = (n: number) => money(n, draft.settings.currency);

  const base = useMemo(() => {
    let list = period === 'all' ? orders : inRange(orders, presetRange(period));
    if (city) list = list.filter((o) => o.city === city);
    if (source) list = list.filter((o) => o.source === source);
    const ql = q.trim().toLowerCase().replace(/[\s()-]/g, '');
    if (ql) list = list.filter((o) => `${o.id} ${o.customer.name} ${o.customer.phone} ${o.customer.email || ''}`.toLowerCase().replace(/[\s()-]/g, '').includes(ql));
    return list;
  }, [orders, period, city, source, q]);
  const rows = status === 'all' ? base : base.filter((o) => o.status === status);
  const count = (s: OrderStatus) => base.filter((o) => o.status === s).length;
  const current = orders.find((o) => o.id === sel);
  const cities = [...new Set(orders.map((o) => o.city))].sort();
  const exportAs = (fmt: 'xlsx' | 'csv', list: OrderView[]) => {
    const data = orderRows(list, pay, ship);
    if (fmt === 'xlsx') download(writeXlsx([{ name: 'Заказы', columns: ORDER_COLS, rows: data, title: `Заказы ${draft.settings.name} · выгружено ${new Date().toLocaleString('ru-RU')}` }]), `zakazy-${stamp()}.xlsx`);
    else download(toCsv(ORDER_COLS, data), `zakazy-${stamp()}.csv`, 'text/csv;charset=utf-8');
  };

  const columns: Column<OrderView>[] = [
    { key: 'id', label: 'Заказ', sort: (o) => o.createdAt, render: (o) => <div><b className="adm-mono" style={{ fontSize: 13 }}>{o.id}</b>{o.source === 'site' && <> <Badge tone="blue">сайт</Badge></>}<div className="a-cell__sub">{dt(o.createdAt)}</div></div> },
    { key: 'cust', label: 'Клиент', sort: (o) => o.customer.name, render: (o) => <div><div className="a-cell__title">{o.customer.name}</div><div className="a-cell__sub adm-nowrap">{o.customer.phone}</div></div> },
    { key: 'city', label: 'Город', wide: true, sort: (o) => o.city, render: (o) => o.city },
    { key: 'items', label: 'Товары', wide: true, render: (o) => <span className="a-thumbs-row">{o.items.slice(0, 3).map((x, i) => <span key={i} className="a-cell__art" style={{ width: 34, height: 34 }} title={x.name}><Art spec={{ kind: 'product', id: x.id }} /></span>)}<span className="adm-muted">{o.totals.count} шт</span></span> },
    { key: 'total', label: 'Сумма', num: true, sort: (o) => o.totals.total, render: (o) => <b>{m(o.totals.total)}</b> },
    { key: 'pay', label: 'Оплата', wide: true, sort: (o) => o.payment, render: (o) => <span className="adm-ink2">{payName(o.payment, pay)}<div className="a-cell__sub">{shipName(o.delivery, ship)}</div></span> },
    { key: 'status', label: 'Статус', sort: (o) => FLOW.indexOf(o.status), render: (o) => <Badge tone={STATUS[o.status].tone} dot>{STATUS[o.status].label}</Badge> }
  ];

  return (
    <div className="adm-page">
      <PageHead title="Заказы" sub="Заказы из корзины сайта и их статусы. Нажмите на заказ, чтобы подтвердить, собрать и отправить его."
        actions={<>
          <Switch checked={demoEnabled()} onChange={(v) => { setDemoEnabled(v); toast({ title: v ? 'Демо-заказы показаны' : 'Показаны только заказы с сайта' }); }} label="Демо-данные" />
          <Menu trigger={(t) => <Btn icon="download" iconRight="chev-down" onClick={t}>Экспорт</Btn>} items={[{ label: `Excel (.xlsx) · ${rows.length}`, icon: 'table', onClick: () => exportAs('xlsx', rows) }, { label: 'CSV', icon: 'file', onClick: () => exportAs('csv', rows) }]} />
        </>} />
      <Note icon="info">Сайт пока работает без сервера: заказы, оформленные на витрине, сохраняются в этом браузере и сразу появляются здесь (метка «сайт»). {demoEnabled() ? 'Остальные — демонстрационная история для дашбордов; её можно выключить.' : ''}</Note>
      <Seg value={status} onChange={setSt} options={[{ value: 'all', label: 'Все', count: base.length }, ...(['new', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map((s) => ({ value: s, label: STATUS[s].label, count: count(s) }))]} />
      <Card flush>
        <div className="a-toolbar">
          <div className="a-affix a-affix--prefix a-search-input"><span className="a-affix__prefix"><I name="search" className="i--sm" /></span><input className="a-input" placeholder="Номер, имя или телефон" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <Select value={period} onValue={setPeriod} options={[['all', 'За всё время'] as const, ...PRESETS.map((p) => [p.value, p.label] as const)]} />
          <Select value={city} onValue={setCity} options={cities.map((c) => [c, c] as const)} placeholder="Все города" />
          <Select value={source} onValue={setSource} options={[['site', 'С сайта'], ['demo', 'Демо']] as const} placeholder="Все источники" />
          <span className="adm-grow" />
          <span className="adm-muted">{rows.length} заказов · {m(rows.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.totals.total, 0))}</span>
        </div>
        {picked.size > 0 && (
          <div className="a-bulk">
            <Check checked onChange={() => setPicked(new Set())} ariaLabel="Снять выделение" />
            <b>Выбрано: {picked.size}</b>
            <span className="adm-grow" />
            <Menu trigger={(t) => <Btn size="sm" icon="refresh" onClick={t}>Статус</Btn>} items={(Object.keys(STATUS) as OrderStatus[]).map((s) => ({ label: STATUS[s].label, icon: STATUS[s].icon, onClick: () => { setStatus([...picked], s); toast({ title: `Статус «${STATUS[s].label}» у ${picked.size} заказов`, kind: 'ok' }); setPicked(new Set()); } }))} />
            <Btn size="sm" icon="download" onClick={() => exportAs('xlsx', orders.filter((o) => picked.has(o.id)))}>Excel</Btn>
          </div>
        )}
        <DataTable rows={rows} columns={columns} getKey={(o) => o.id} selected={picked} onSelect={setPicked} onRowClick={(o) => select(o.id)} pageSize={25}
          initialSort={{ key: 'id', dir: -1 }} rowClass={(o) => (o.status === 'cancelled' ? 'is-muted' : undefined)}
          empty={<Empty title="Заказов нет" text={q || city || source || period !== 'all' ? 'Попробуйте изменить фильтры' : 'Как только покупатель оформит заказ на сайте, он появится здесь'} icon="receipt" />} />
      </Card>
      {current && <OrderSheet o={current} onClose={() => select(null)} />}
    </div>
  );
}
