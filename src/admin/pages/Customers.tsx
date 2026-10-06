'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Art } from '@/components/Art';
import { download, stamp, toCsv, writeXlsx, type SheetCol } from '../lib/sheet';
import { customers, SEGMENTS, type Customer, type Segment } from '../orders/analytics';
import { STATUS, useOrders } from '../orders/store';
import { useAdmin } from '../state/store';
import { Kpi, StackBar } from '../ui/charts';
import { useSelected } from '../ui/collection';
import { Column, DataTable } from '../ui/DataTable';
import { I } from '../ui/icons';
import { ago, Badge, Btn, Card, dt, Empty, Menu, money, PageHead, Seg } from '../ui/kit';
import { Sheet } from '../ui/overlay';

export const CUSTOMER_COLS: SheetCol[] = [
  { key: 'name', label: 'Клиент', width: 22 }, { key: 'phone', label: 'Телефон', width: 18 }, { key: 'email', label: 'E-mail', width: 22 }, { key: 'city', label: 'Город' },
  { key: 'orders', label: 'Заказов', type: 'int' }, { key: 'revenue', label: 'Сумма покупок', type: 'money' }, { key: 'aov', label: 'Средний чек', type: 'money' },
  { key: 'first', label: 'Первый заказ', type: 'date' }, { key: 'last', label: 'Последний заказ', type: 'date' }, { key: 'segment', label: 'Сегмент' }
];
export const customerRows = (list: Customer[]) => list.map((c) => ({ name: c.name, phone: c.phone, email: c.email || '', city: c.city, orders: c.orders, revenue: Math.round(c.revenue), aov: Math.round(c.aov), first: new Date(c.first), last: new Date(c.last), segment: SEGMENTS[c.segment].label }));

const SEG_COLORS: Record<Segment, string> = { vip: '#dd4487', regular: '#1baf7a', new: '#2a78d6', sleeping: '#eda100', lost: '#bdb6c1' };

export function Customers() {
  const orders = useOrders();
  const cur = useAdmin((s) => s.draft.settings.currency);
  const m = (n: number) => money(n, cur);
  const list = useMemo(() => customers(orders), [orders]);
  const [seg, setSeg] = useState<Segment | 'all'>('all');
  const [q, setQ] = useState('');
  const [sel, select] = useSelected();
  const rows = useMemo(() => {
    const ql = q.trim().toLowerCase().replace(/[\s()-]/g, '');
    return list.filter((c) => (seg === 'all' || c.segment === seg) && (!ql || `${c.name} ${c.phone} ${c.email || ''}`.toLowerCase().replace(/[\s()-]/g, '').includes(ql)));
  }, [list, seg, q]);
  const total = list.reduce((s, c) => s + c.revenue, 0);
  const repeat = list.filter((c) => c.orders > 1).length;
  const fresh = list.filter((c) => Date.now() - new Date(c.first).getTime() < 30 * 864e5).length;
  const current = list.find((c) => c.phone === sel);
  const custOrders = current ? orders.filter((o) => o.customer.phone === current.phone) : [];
  const favs = useMemo(() => {
    const map = new Map<string, { id: string; name: string; q: number }>();
    custOrders.forEach((o) => o.items.forEach((x) => { const f = map.get(x.id) || { id: x.id, name: x.name, q: 0 }; f.q += x.q; map.set(x.id, f); }));
    return [...map.values()].sort((a, b) => b.q - a.q).slice(0, 4);
  }, [custOrders]);
  const exportAs = (fmt: 'xlsx' | 'csv') => {
    if (fmt === 'xlsx') download(writeXlsx([{ name: 'Клиенты', columns: CUSTOMER_COLS, rows: customerRows(rows) }]), `klienty-${stamp()}.xlsx`);
    else download(toCsv(CUSTOMER_COLS, customerRows(rows)), `klienty-${stamp()}.csv`, 'text/csv;charset=utf-8');
  };

  const columns: Column<Customer>[] = [
    { key: 'name', label: 'Клиент', sort: (c) => c.name, render: (c) => <div className="a-cell"><span className="a-avatar" style={{ background: SEG_COLORS[c.segment] }}>{c.name.slice(0, 1)}</span><div style={{ minWidth: 0 }}><div className="a-cell__title">{c.name}</div><div className="a-cell__sub">{c.phone}</div></div></div> },
    { key: 'city', label: 'Город', wide: true, sort: (c) => c.city, render: (c) => c.city },
    { key: 'orders', label: 'Заказов', num: true, sort: (c) => c.orders, render: (c) => c.orders },
    { key: 'revenue', label: 'Сумма', num: true, sort: (c) => c.revenue, render: (c) => <b>{m(c.revenue)}</b> },
    { key: 'aov', label: 'Ср. чек', num: true, wide: true, sort: (c) => c.aov, render: (c) => m(c.aov) },
    { key: 'last', label: 'Последний заказ', wide: true, sort: (c) => c.last, render: (c) => <span className="adm-ink2">{ago(c.last)}</span> },
    { key: 'seg', label: 'Сегмент', sort: (c) => c.segment, render: (c) => <Badge tone={SEGMENTS[c.segment].tone}>{SEGMENTS[c.segment].label}</Badge> }
  ];

  return (
    <div className="adm-page">
      <PageHead title="Клиенты" sub="Собираются из заказов по номеру телефона. Сегменты помогают понять, кого вернуть, а кого поблагодарить."
        actions={<Menu trigger={(t) => <Btn icon="download" iconRight="chev-down" onClick={t}>Экспорт</Btn>} items={[{ label: 'Excel (.xlsx)', icon: 'table', onClick: () => exportAs('xlsx') }, { label: 'CSV', icon: 'file', onClick: () => exportAs('csv') }]} />} />
      <div className="a-kpis">
        <Kpi icon="users" label="Клиентов" value={list.length.toLocaleString('ru-RU')} foot={`новых за 30 дней: ${fresh}`} />
        <Kpi icon="refresh" label="Покупали повторно" value={`${Math.round((repeat / Math.max(1, list.length)) * 100)}%`} foot={`${repeat} человек`} />
        <Kpi icon="cash" label="Средняя сумма покупок" value={m(total / Math.max(1, list.length))} foot="за всё время" />
        <Kpi icon="star-o" label="VIP" value={String(list.filter((c) => c.segment === 'vip').length)} foot={`${Math.round((list.filter((c) => c.segment === 'vip').reduce((s, c) => s + c.revenue, 0) / Math.max(1, total)) * 100)}% выручки`} />
      </div>
      <Card title="Сегменты" sub="Наведите, чтобы увидеть долю">
        <StackBar parts={(Object.keys(SEGMENTS) as Segment[]).map((k) => ({ key: k, label: `${SEGMENTS[k].label} — ${SEGMENTS[k].hint}`, value: list.filter((c) => c.segment === k).length, color: SEG_COLORS[k] }))} fmt={(n) => `${n} чел.`} />
      </Card>
      <Seg value={seg} onChange={setSeg} options={[{ value: 'all', label: 'Все', count: list.length }, ...(Object.keys(SEGMENTS) as Segment[]).map((k) => ({ value: k, label: SEGMENTS[k].label, count: list.filter((c) => c.segment === k).length }))]} />
      <Card flush>
        <div className="a-toolbar">
          <div className="a-affix a-affix--prefix a-search-input"><span className="a-affix__prefix"><I name="search" className="i--sm" /></span><input className="a-input" placeholder="Имя, телефон или e-mail" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <span className="adm-grow" />
          <span className="adm-muted">{rows.length} клиентов</span>
        </div>
        <DataTable rows={rows} columns={columns} getKey={(c) => c.phone} onRowClick={(c) => select(c.phone)} pageSize={25} initialSort={{ key: 'revenue', dir: -1 }}
          empty={<Empty title="Клиентов нет" text="Они появятся после первых заказов" icon="users" />} />
      </Card>
      {current && (
        <Sheet open onClose={() => select(null)} title={current.name} sub={`${current.phone} · ${current.city}`} wide>
          <div className="a-stack a-stack--lg">
            <div className="adm-row adm-row--wrap" style={{ gap: 8 }}>
              <Badge tone={SEGMENTS[current.segment].tone}>{SEGMENTS[current.segment].label}</Badge>
              <span className="adm-muted">{SEGMENTS[current.segment].hint}</span>
            </div>
            <div className="adm-grid adm-grid--4">
              <div className="a-mini"><span><b>{current.orders}</b><small>заказов</small></span></div>
              <div className="a-mini"><span><b>{m(current.revenue)}</b><small>всего</small></span></div>
              <div className="a-mini"><span><b>{m(current.aov)}</b><small>средний чек</small></span></div>
              <div className="a-mini"><span><b>{ago(current.last)}</b><small>последний заказ</small></span></div>
            </div>
            <div className="adm-row adm-row--wrap" style={{ gap: 6 }}>
              <a className="a-btn" href={`tel:${current.phone.replace(/[^\d+]/g, '')}`}><I name="phone" />Позвонить</a>
              <a className="a-btn" href={`https://wa.me/${current.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"><I name="whatsapp" />WhatsApp</a>
              {current.email && <a className="a-btn" href={`mailto:${current.email}`}><I name="mail" />{current.email}</a>}
            </div>
            {favs.length > 0 && (
              <Card title="Любимые товары">
                <div className="adm-grid adm-grid--4">{favs.map((f) => <Link key={f.id} href={`/admin/products/edit/?id=${f.id}`} className="a-pgrid__item"><span className="a-pgrid__art"><Art spec={{ kind: 'product', id: f.id }} /></span><span className="a-pgrid__name">{f.name}</span><span className="adm-muted" style={{ fontSize: 12 }}>{f.q} шт</span></Link>)}</div>
              </Card>
            )}
            <Card title={`Заказы · ${custOrders.length}`}>
              <div className="a-changes">
                {custOrders.map((o) => (
                  <Link key={o.id} className="a-change" href={`/admin/orders/?id=${o.id}`}>
                    <span className="adm-grow"><b className="adm-mono" style={{ fontSize: 13 }}>{o.id}</b><span className="a-change__fields" style={{ display: 'block' }}>{dt(o.createdAt)} · {o.totals.count} шт</span></span>
                    <Badge tone={STATUS[o.status].tone}>{STATUS[o.status].label}</Badge>
                    <b className="adm-num" style={{ minWidth: 90, textAlign: 'right' }}>{m(o.totals.total)}</b>
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </Sheet>
      )}
    </div>
  );
}
