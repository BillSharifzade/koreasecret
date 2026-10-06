'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Art } from '@/components/Art';
import { abc, bucketFor, bucketStart, byBrand, byCategory, byOrderKey, byProduct, coverage, customers, delta, heatmap, inRange, inventory, kpis, paid, presetRange, prevRange, PRESETS, SEGMENTS, series, statusCounts, type Bucket, type Preset } from '../orders/analytics';
import { DELIVERY_NAMES, PAYMENT_NAMES, STATUS, useOrders } from '../orders/store';
import { useAdmin } from '../state/store';
import { BarList, ChartCard, ColumnChart, Heatmap, Kpi, Legend, MUTED, SERIES, StackBar, TrendChart } from '../ui/charts';
import { useSelected } from '../ui/collection';
import { Column, DataTable } from '../ui/DataTable';
import { Badge, Card, money, Note, PageHead, Seg, Switch, Tabs } from '../ui/kit';

type Tab = 'sales' | 'products' | 'customers' | 'geo';

export function Analytics() {
  const orders = useOrders();
  const draft = useAdmin((s) => s.draft);
  const [tab, setTab] = useSelected('tab');
  const t = (tab || 'sales') as Tab;
  const [preset, setPreset] = useState<Preset>('30d');
  const [compare, setCompare] = useState(true);
  const [bucket, setBucket] = useState<Bucket | 'auto'>('auto');
  const cur = draft.settings.currency;
  const m = (n: number) => money(n, cur);

  const r = useMemo(() => presetRange(preset), [preset]);
  const p = useMemo(() => prevRange(r), [r]);
  const b = bucket === 'auto' ? bucketFor(r) : bucket;
  const k = useMemo(() => kpis(orders, r), [orders, r]);
  const kp = useMemo(() => kpis(orders, p), [orders, p]);
  const s = useMemo(() => series(orders, r, b), [orders, r, b]);
  const sp = useMemo(() => series(orders, p, b), [orders, p, b]);
  const pts = (key: 'revenue' | 'orders' | 'aov') => s.map((x, i) => ({ label: x.label, long: x.long, values: compare ? [x[key], sp[i]?.[key] ?? 0] : [x[key]] }));
  const ser = (label: string) => compare ? [{ label, color: SERIES[0], area: true }, { label: 'Прошлый период', color: MUTED, muted: true }] : [{ label, color: SERIES[0], area: true }];

  return (
    <div className="adm-page">
      <PageHead title={<>Аналитика <em>продаж</em></>} sub="Выручка, товары, клиенты и география. Все графики отвечают на один период, выбранный ниже; у каждого есть табличный вид." />
      <div className="a-filters">
        <Seg value={preset} onChange={setPreset} options={PRESETS.map((x) => ({ value: x.value, label: x.label }))} />
        <Switch checked={compare} onChange={setCompare} label="Сравнить с прошлым периодом" />
        <span className="adm-grow" />
        <span className="adm-muted" style={{ fontSize: 13 }}>{r.from.toLocaleDateString('ru-RU')} — {new Date(r.to.getTime() - 1).toLocaleDateString('ru-RU')}</span>
      </div>
      <Tabs value={t} onChange={(v) => setTab(v === 'sales' ? null : v)} items={[{ value: 'sales', label: 'Продажи' }, { value: 'products', label: 'Товары и склад' }, { value: 'customers', label: 'Клиенты' }, { value: 'geo', label: 'География и время' }]} />

      {t === 'sales' && (
        <>
          <div className="a-kpis">
            <Kpi icon="cash" label="Выручка" value={m(k.revenue)} delta={compare ? delta(k.revenue, kp.revenue) : undefined} spark={s.map((x) => x.revenue)} />
            <Kpi icon="receipt" label="Заказы" value={k.orders.toLocaleString('ru-RU')} delta={compare ? delta(k.orders, kp.orders) : undefined} spark={s.map((x) => x.orders)} />
            <Kpi icon="bag" label="Средний чек" value={m(k.aov)} delta={compare ? delta(k.aov, kp.aov) : undefined} spark={s.map((x) => x.aov)} />
            <Kpi icon="box" label="Продано товаров" value={k.units.toLocaleString('ru-RU')} delta={compare ? delta(k.units, kp.units) : undefined} foot="штук" />
            <Kpi icon="users" label="Покупателей" value={k.customers.toLocaleString('ru-RU')} delta={compare ? delta(k.customers, kp.customers) : undefined} foot={`новых ${k.newCustomers}`} />
            <Kpi icon="percent" label="С промокодом" value={`${k.promoShare.toFixed(1)}%`} delta={compare ? delta(k.promoShare, kp.promoShare) : undefined} foot={`${k.promoOrders} заказов`} />
            <Kpi icon="tag" label="Скидки покупателям" value={m(k.discounts)} delta={compare ? delta(k.discounts, kp.discounts) : undefined} deltaGood="down" foot="акции + промокоды" />
            <Kpi icon="x-circle" label="Отмены" value={`${k.cancelRate.toFixed(1)}%`} delta={compare ? delta(k.cancelRate, kp.cancelRate) : undefined} deltaGood="down" foot={`${k.cancelled} заказов`} />
          </div>
          <ChartCard title="Выручка" sub={compare ? 'розовая — выбранный период, серая — предыдущий такой же' : undefined}
            actions={<Seg size="sm" value={bucket} onChange={setBucket} options={[{ value: 'auto', label: 'Авто' }, { value: 'day', label: 'Дни' }, { value: 'week', label: 'Недели' }, { value: 'month', label: 'Месяцы' }]} />}
            chart={<><TrendChart points={pts('revenue')} series={ser('Выручка')} fmt={m} height={300} partialLast />{compare && <div style={{ marginTop: 10 }}><Legend items={[{ label: 'Этот период', color: SERIES[0], line: true }, { label: 'Прошлый период', color: MUTED, line: true }]} /></div>}</>}
            table={{ columns: ['Период', 'Выручка', 'Заказы', 'Средний чек', ...(compare ? ['Прошлый период'] : [])], num: [1, 2, 3, 4], rows: s.map((x, i) => [x.long, m(x.revenue), x.orders, m(x.aov), ...(compare ? [m(sp[i]?.revenue ?? 0)] : [])]) }} />
          <div className="adm-grid adm-grid--2">
            <ChartCard title="Заказы" chart={<ColumnChart points={s.map((x) => ({ label: x.label, long: x.long, value: x.orders }))} unit="Заказов" />}
              table={{ columns: ['Период', 'Заказы', 'Товаров'], num: [1, 2], rows: s.map((x) => [x.long, x.orders, x.units]) }} />
            <ChartCard title="Средний чек" chart={<TrendChart points={pts('aov')} series={ser('Средний чек')} fmt={m} height={220} partialLast />}
              table={{ columns: ['Период', 'Средний чек'], num: [1], rows: s.map((x) => [x.long, m(x.aov)]) }} />
          </div>
          <div className="adm-grid adm-grid--3">
            <SplitCard title="Способ оплаты" parts={byOrderKey(orders, r, (o) => [o.payment, draft.texts.checkout.payment.find((x) => x.id === o.payment)?.title || PAYMENT_NAMES[o.payment] || o.payment])} m={m} />
            <SplitCard title="Способ получения" parts={byOrderKey(orders, r, (o) => [o.delivery, draft.texts.checkout.delivery.find((x) => x.id === o.delivery)?.title || DELIVERY_NAMES[o.delivery] || o.delivery])} m={m} />
            <StatusCard counts={statusCounts(orders, r)} />
          </div>
        </>
      )}

      {t === 'products' && <ProductsTab orders={orders} r={r} m={m} />}
      {t === 'customers' && <CustomersTab orders={orders} r={r} b={b} m={m} />}
      {t === 'geo' && (
        <div className="adm-grid adm-grid--2">
          <ChartCard title="Города" sub="выручка за период" chart={<BarList fmt={m} items={byOrderKey(orders, r, (o) => [o.city, o.city]).map((x) => ({ key: x.key, label: x.label, value: Math.round(x.revenue), note: `${x.share.toFixed(0)}%` }))} />}
            table={{ columns: ['Город', 'Заказы', 'Выручка', 'Доля'], num: [1, 2, 3], rows: byOrderKey(orders, r, (o) => [o.city, o.city]).map((x) => [x.label, x.orders, m(x.revenue), `${x.share.toFixed(1)}%`]) }} />
          <Card title="Когда покупают" sub="заказы по дням недели и часам">
            <Heatmap grid={heatmap(orders, r)} />
            <Note icon="info">Пики — хорошее время для рассылок, сторис и запуска акций.</Note>
          </Card>
        </div>
      )}
    </div>
  );
}

function SplitCard({ title, parts, m }: { title: string; parts: { key: string; label: string; revenue: number; orders: number; share: number }[]; m: (n: number) => string }) {
  return (
    <ChartCard title={title} chart={<StackBar parts={parts.map((x, i) => ({ key: x.key, label: x.label, value: Math.round(x.revenue), color: SERIES[i] }))} fmt={m} />}
      table={{ columns: ['', 'Заказы', 'Выручка', 'Доля'], num: [1, 2, 3], rows: parts.map((x) => [x.label, x.orders, m(x.revenue), `${x.share.toFixed(1)}%`]) }} />
  );
}

function StatusCard({ counts }: { counts: Record<string, number> }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  return (
    <Card title="Статусы заказов" sub="за период">
      <div className="a-changes">
        {(Object.keys(STATUS) as (keyof typeof STATUS)[]).map((k) => (
          <Link key={k} className="a-change" href={`/admin/orders/?status=${k}`}>
            <Badge tone={STATUS[k].tone} dot>{STATUS[k].label}</Badge>
            <span className="adm-grow" />
            <b className="adm-num">{counts[k]}</b>
            <span className="adm-muted adm-num" style={{ width: 44, textAlign: 'right' }}>{Math.round((counts[k] / total) * 100)}%</span>
          </Link>
        ))}
      </div>
    </Card>
  );
}

function ProductsTab({ orders, r, m }: { orders: ReturnType<typeof useOrders>; r: ReturnType<typeof presetRange>; m: (n: number) => string }) {
  const draft = useAdmin((s) => s.draft);
  const list = useMemo(() => abc(byProduct(orders, r)), [orders, r]);
  const cats = useMemo(() => byCategory(orders, r, draft), [orders, r, draft]);
  const brands = useMemo(() => byBrand(orders, r), [orders, r]);
  const inv = useMemo(() => inventory(draft), [draft]);
  const cov = useMemo(() => coverage(orders, draft), [orders, draft]);
  const counts = { A: list.filter((x) => x.cls === 'A').length, B: list.filter((x) => x.cls === 'B').length, C: list.filter((x) => x.cls === 'C').length };
  const sold = new Set(list.map((x) => x.key));
  const unsold = draft.products.filter((p) => !p.hidden && !sold.has(p.id));
  type Row = (typeof list)[number];
  const cols: Column<Row>[] = [
    { key: 'name', label: 'Товар', sort: (x) => x.label, render: (x) => <Link className="a-cell" href={`/admin/products/edit/?id=${x.key}`}><span className="a-cell__art"><Art spec={{ kind: 'product', id: x.key }} /></span><span style={{ minWidth: 0 }}><span className="a-cell__title adm-clamp2" style={{ display: '-webkit-box' }}>{x.label}</span><span className="a-cell__sub" style={{ display: 'block' }}>{x.sub}</span></span></Link> },
    { key: 'units', label: 'Шт', num: true, sort: (x) => x.units, render: (x) => x.units },
    { key: 'orders', label: 'Заказов', num: true, wide: true, sort: (x) => x.orders, render: (x) => x.orders },
    { key: 'rev', label: 'Выручка', num: true, sort: (x) => x.revenue, render: (x) => <b>{m(x.revenue)}</b> },
    { key: 'share', label: 'Доля', num: true, wide: true, sort: (x) => x.share, render: (x) => `${x.share.toFixed(1)}%` },
    { key: 'cls', label: 'ABC', sort: (x) => x.cls, render: (x) => <Badge tone={x.cls === 'A' ? 'brand' : x.cls === 'B' ? 'blue' : undefined}>{x.cls}</Badge> }
  ];
  return (
    <>
      <div className="a-kpis">
        <Kpi icon="box" label="Товаров в продаже" value={String(inv.skus)} foot={`${inv.onSale} со скидкой`} />
        <Kpi icon="cash" label="Склад в ценах продажи" value={m(inv.value)} foot={`${inv.units.toLocaleString('ru-RU')} шт`} />
        <Kpi icon="alert" label="Заканчиваются" value={String(inv.low)} foot={`нет в наличии: ${inv.out}`} />
        <Kpi icon="star-o" label="Средний рейтинг" value={inv.avgRating.toFixed(2)} foot={`средняя цена ${m(inv.avgPrice)}`} />
      </div>
      <div className="adm-grid adm-grid--main">
        <Card flush title="Товары по выручке" sub={`ABC-анализ: A — ${counts.A} товаров дают 80% выручки, B — ${counts.B} ещё 15%, C — ${counts.C} остальное`}>
          <DataTable rows={list} columns={cols} getKey={(x) => x.key} pageSize={12} initialSort={{ key: 'rev', dir: -1 }} compact />
        </Card>
        <div className="adm-stack">
          <ChartCard title="Категории" chart={<StackBar parts={cats.map((c) => ({ key: c.key, label: c.label, value: Math.round(c.revenue) }))} fmt={m} />}
            table={{ columns: ['Категория', 'Выручка', 'Доля'], num: [1, 2], rows: cats.map((c) => [c.label, m(c.revenue), `${c.share.toFixed(1)}%`]) }} />
          <ChartCard title="Бренды" chart={<BarList fmt={m} max={8} items={brands.map((x) => ({ key: x.key, label: x.label, value: Math.round(x.revenue) }))} />}
            table={{ columns: ['Бренд', 'Шт', 'Выручка'], num: [1, 2], rows: brands.map((x) => [x.label, x.units, m(x.revenue)]) }} />
        </div>
      </div>
      <div className="adm-grid adm-grid--2">
        <Card title="Запас по темпу продаж" sub="на сколько дней хватит остатка (по продажам за 30 дней)">
          <div className="a-changes" style={{ maxHeight: 380, overflow: 'auto' }}>
            {cov.slice(0, 14).map(({ p, days, perDay }) => (
              <Link key={p.id} className="a-change" href={`/admin/products/edit/?id=${p.id}`}>
                <span className="a-cell__art" style={{ width: 36, height: 36 }}><Art spec={{ kind: 'product', id: p.id }} /></span>
                <span className="adm-grow adm-ellipsis">{p.name}<span className="a-change__fields" style={{ display: 'block' }}>остаток {p.stock} · продаётся {perDay.toFixed(1)} шт/день</span></span>
                <Badge tone={p.stock <= 0 || days < 7 ? 'red' : days < 21 ? 'amber' : 'green'}>{p.stock <= 0 ? 'нет' : days === Infinity ? '∞' : `${Math.round(days)} дн.`}</Badge>
              </Link>
            ))}
          </div>
        </Card>
        <Card title="Без продаж за период" sub={unsold.length ? `${unsold.length} товаров — кандидаты в акцию или подборку` : 'Каждый товар продавался'}>
          <div className="a-changes" style={{ maxHeight: 380, overflow: 'auto' }}>
            {unsold.slice(0, 14).map((p) => (
              <Link key={p.id} className="a-change" href={`/admin/products/edit/?id=${p.id}`}>
                <span className="a-cell__art" style={{ width: 36, height: 36 }}><Art spec={{ kind: 'product', id: p.id }} /></span>
                <span className="adm-grow adm-ellipsis">{p.name}<span className="a-change__fields" style={{ display: 'block' }}>{m(p.price)} · остаток {p.stock}</span></span>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

function CustomersTab({ orders, r, b, m }: { orders: ReturnType<typeof useOrders>; r: ReturnType<typeof presetRange>; b: Bucket; m: (n: number) => string }) {
  const all = useMemo(() => customers(orders), [orders]);
  // per period: customers whose very first order falls inside it are «new», everyone else «returning»
  const s = useMemo(() => {
    const first = new Map<string, number>();
    orders.forEach((o) => { if (!paid(o)) return; const t = new Date(o.createdAt).getTime(); const f = first.get(o.customer.phone); if (f === undefined || t < f) first.set(o.customer.phone, t); });
    const base = series(orders, r, b);
    const starts = base.map((x) => x.t.getTime());
    const idx = new Map(starts.map((t, i) => [t, i]));
    const out = base.map((x) => ({ label: x.label, long: x.long, values: [0, 0] }));
    const seen = new Set<string>();
    for (const o of inRange(orders, r)) {
      if (!paid(o)) continue;
      const i = idx.get(bucketStart(new Date(o.createdAt), b).getTime());
      if (i === undefined || seen.has(`${i}|${o.customer.phone}`)) continue;
      seen.add(`${i}|${o.customer.phone}`);
      const f = first.get(o.customer.phone) ?? 0;
      const end = i + 1 < starts.length ? starts[i + 1] : r.to.getTime();
      out[i].values[f >= starts[i] && f < end ? 0 : 1]++;
    }
    return out;
  }, [orders, r, b]);
  const segs = (Object.keys(SEGMENTS) as (keyof typeof SEGMENTS)[]).map((k, i) => ({ key: k, label: SEGMENTS[k].label, value: all.filter((c) => c.segment === k).length, color: [SERIES[0], SERIES[3], SERIES[1], SERIES[2], MUTED][i] }));
  return (
    <>
      <ChartCard title="Новые и вернувшиеся покупатели" sub="уникальные покупатели за каждый период"
        chart={<><TrendChart points={s} series={[{ label: 'Новые', color: SERIES[1] }, { label: 'Вернувшиеся', color: SERIES[0] }]} fmt={(n) => `${n} чел.`} height={260} partialLast /><div style={{ marginTop: 10 }}><Legend items={[{ label: 'Новые', color: SERIES[1], line: true }, { label: 'Вернувшиеся', color: SERIES[0], line: true }]} /></div></>}
        table={{ columns: ['Период', 'Новые', 'Вернувшиеся'], num: [1, 2], rows: s.map((x) => [x.long, x.values[0], x.values[1]]) }} />
      <div className="adm-grid adm-grid--2">
        <ChartCard title="Сегменты базы" chart={<StackBar parts={segs} fmt={(n) => `${n} чел.`} />} table={{ columns: ['Сегмент', 'Клиентов'], num: [1], rows: segs.map((x) => [x.label, x.value]) }} />
        <ChartCard title="Лучшие клиенты" sub="по сумме покупок за всё время" actions={<Link className="a-link" href="/admin/customers/" style={{ fontSize: 13 }}>Все клиенты</Link>}
          chart={<BarList fmt={m} max={8} items={all.map((c) => ({ key: c.phone, label: c.name, sub: c.city, value: Math.round(c.revenue), note: `${c.orders} зак.` }))} />}
          table={{ columns: ['Клиент', 'Заказов', 'Сумма'], num: [1, 2], rows: all.slice(0, 30).map((c) => [c.name, c.orders, m(c.revenue)]) }} />
      </div>
    </>
  );
}
