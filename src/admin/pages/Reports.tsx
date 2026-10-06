'use client';
import { useMemo, useState } from 'react';
import { Mark } from '@/components/Brand';
import { discountOf, sku } from '@/lib/shop';
import type { SiteContent } from '@/lib/types';
import { download, localDate, stamp, toCsv, writeXlsx, type SheetCol } from '../lib/sheet';
import { abc, byBrand, byCategory, byOrderKey, byProduct, coverage, customers, inRange, kpis, paid, presetRange, PRESETS, SEGMENTS, series, type Bucket, type Preset, type Range } from '../orders/analytics';
import { DELIVERY_NAMES, PAYMENT_NAMES, useOrders, type OrderView } from '../orders/store';
import { useAdmin } from '../state/store';
import { useSelected } from '../ui/collection';
import { I } from '../ui/icons';
import { Badge, Btn, Card, cx, Field, Note, PageHead, Seg } from '../ui/kit';
import { toast } from '../ui/overlay';
import { CUSTOMER_COLS, customerRows } from './Customers';
import { ORDER_COLS, orderRows } from './Orders';

interface Ctx { orders: OrderView[]; r: Range; bucket: Bucket; c: SiteContent }
interface Built { columns: SheetCol[]; rows: Record<string, unknown>[]; totals?: Record<string, unknown>; note?: string }
interface ReportDef { id: string; group: string; title: string; desc: string; icon: string; period: boolean; bucket?: boolean; build: (x: Ctx) => Built }

const sum = (rows: Record<string, unknown>[], k: string) => rows.reduce((s, r) => s + (Number(r[k]) || 0), 0);
const payLabel = (c: SiteContent, k: string) => c.texts.checkout.payment.find((x) => x.id === k)?.title || PAYMENT_NAMES[k] || k;
const shipLabel = (c: SiteContent, k: string) => c.texts.checkout.delivery.find((x) => x.id === k)?.title || DELIVERY_NAMES[k] || k;
const typeCat = (c: SiteContent, t: string) => c.taxonomy.categories.find((x) => x.id === c.taxonomy.types[t]?.cat)?.name || '';

const SALES_COLS: SheetCol[] = [{ key: 'label', label: 'Название', width: 34 }, { key: 'units', label: 'Шт', type: 'int' }, { key: 'orders', label: 'Заказов', type: 'int' }, { key: 'revenue', label: 'Выручка', type: 'money' }, { key: 'share', label: 'Доля', type: 'pct' }];
const ranked = (list: { label: string; units: number; orders: number; revenue: number; share: number }[]) => {
  const rows = list.map((x) => ({ label: x.label, units: x.units, orders: x.orders, revenue: Math.round(x.revenue), share: Math.round(x.share * 10) / 10 }));
  return { columns: SALES_COLS, rows, totals: { label: 'Итого', units: sum(rows, 'units'), orders: undefined, revenue: sum(rows, 'revenue'), share: 100 } };
};

export const REPORTS: ReportDef[] = [
  { id: 'periods', group: 'Продажи', title: 'Продажи по периодам', desc: 'Выручка, заказы, средний чек и скидки по дням, неделям или месяцам', icon: 'trend', period: true, bucket: true, build: ({ orders, r, bucket }) => {
    const pts = series(orders, r, bucket);
    const disc = new Map<string, number>();
    inRange(orders, r).filter(paid).forEach((o) => { const key = pts.findLast((p) => p.t.getTime() <= new Date(o.createdAt).getTime())?.long; if (key) disc.set(key, (disc.get(key) || 0) + o.totals.savings + o.totals.promo); });
    const rows = pts.map((p) => ({ period: p.long, orders: p.orders, units: p.units, revenue: Math.round(p.revenue), aov: Math.round(p.aov), discounts: Math.round(disc.get(p.long) || 0) }));
    const k = kpis(orders, r);
    return { columns: [{ key: 'period', label: 'Период', width: 26 }, { key: 'orders', label: 'Заказы', type: 'int' }, { key: 'units', label: 'Шт', type: 'int' }, { key: 'revenue', label: 'Выручка', type: 'money' }, { key: 'aov', label: 'Средний чек', type: 'money' }, { key: 'discounts', label: 'Скидки', type: 'money' }], rows, totals: { period: 'Итого', orders: k.orders, units: k.units, revenue: Math.round(k.revenue), aov: Math.round(k.aov), discounts: Math.round(k.discounts) } };
  } },
  { id: 'products', group: 'Продажи', title: 'Продажи по товарам', desc: 'Каждый товар: штуки, заказы, выручка, доля и ABC-класс', icon: 'box', period: true, build: ({ orders, r, c }) => {
    const list = abc(byProduct(orders, r));
    const rows = list.map((x) => { const p = c.products.find((y) => y.id === x.key); return { sku: p ? sku(p) : '', label: x.label, brand: x.sub, category: p ? typeCat(c, p.type) : '', units: x.units, orders: x.orders, revenue: Math.round(x.revenue), share: Math.round(x.share * 10) / 10, abc: x.cls }; });
    return { columns: [{ key: 'sku', label: 'Артикул', width: 12 }, { key: 'label', label: 'Товар', width: 44 }, { key: 'brand', label: 'Бренд', width: 16 }, { key: 'category', label: 'Категория', width: 18 }, { key: 'units', label: 'Шт', type: 'int' }, { key: 'orders', label: 'Заказов', type: 'int' }, { key: 'revenue', label: 'Выручка', type: 'money' }, { key: 'share', label: 'Доля', type: 'pct' }, { key: 'abc', label: 'ABC' }], rows, totals: { label: 'Итого', units: sum(rows, 'units'), revenue: sum(rows, 'revenue'), share: 100 } };
  } },
  { id: 'brands', group: 'Продажи', title: 'Продажи по брендам', desc: 'Какие бренды приносят выручку', icon: 'tag', period: true, build: ({ orders, r }) => ranked(byBrand(orders, r)) },
  { id: 'categories', group: 'Продажи', title: 'Продажи по категориям', desc: 'Уход, SPF, макияж, тело, волосы, подарки', icon: 'layers', period: true, build: ({ orders, r, c }) => ranked(byCategory(orders, r, c)) },
  { id: 'cities', group: 'Продажи', title: 'Продажи по городам', desc: 'География заказов и средний чек по городам', icon: 'pin', period: true, build: ({ orders, r }) => {
    const list = byOrderKey(orders, r, (o) => [o.city, o.city]);
    const rows = list.map((x) => ({ label: x.label, orders: x.orders, units: x.units, revenue: Math.round(x.revenue), aov: Math.round(x.revenue / Math.max(1, x.orders)), share: Math.round(x.share * 10) / 10 }));
    return { columns: [{ key: 'label', label: 'Город', width: 18 }, { key: 'orders', label: 'Заказы', type: 'int' }, { key: 'units', label: 'Шт', type: 'int' }, { key: 'revenue', label: 'Выручка', type: 'money' }, { key: 'aov', label: 'Средний чек', type: 'money' }, { key: 'share', label: 'Доля', type: 'pct' }], rows, totals: { label: 'Итого', orders: sum(rows, 'orders'), units: sum(rows, 'units'), revenue: sum(rows, 'revenue'), share: 100 } };
  } },
  { id: 'channels', group: 'Продажи', title: 'Оплата и получение', desc: 'Способы оплаты и доставки: заказы и выручка', icon: 'card', period: true, build: ({ orders, r, c }) => {
    const pays = byOrderKey(orders, r, (o) => [o.payment, payLabel(c, o.payment)]).map((x) => ({ kind: 'Оплата', label: x.label, orders: x.orders, revenue: Math.round(x.revenue), share: Math.round(x.share * 10) / 10 }));
    const ships = byOrderKey(orders, r, (o) => [o.delivery, shipLabel(c, o.delivery)]).map((x) => ({ kind: 'Получение', label: x.label, orders: x.orders, revenue: Math.round(x.revenue), share: Math.round(x.share * 10) / 10 }));
    return { columns: [{ key: 'kind', label: 'Разрез' }, { key: 'label', label: 'Способ', width: 22 }, { key: 'orders', label: 'Заказы', type: 'int' }, { key: 'revenue', label: 'Выручка', type: 'money' }, { key: 'share', label: 'Доля', type: 'pct' }], rows: [...pays, ...ships] };
  } },
  { id: 'promo', group: 'Продажи', title: 'Промокоды и скидки', desc: 'Эффект промокода по порогам суммы и скидки на товары', icon: 'percent', period: true, build: ({ orders, r, c }) => {
    const list = inRange(orders, r).filter(paid);
    const tiers = c.settings.promo.tiers.slice().sort((a, b) => b[0] - a[0]);
    const rows = [
      ...tiers.map(([min, pct]) => { const os = list.filter((o) => o.promo && (tiers.find(([m]) => o.totals.sub >= m)?.[0] === min)); return { label: `${c.settings.promo.code}: от ${min} ${c.settings.currency} (−${pct}%)`, orders: os.length, revenue: Math.round(os.reduce((s, o) => s + o.totals.total, 0)), discount: Math.round(os.reduce((s, o) => s + o.totals.promo, 0)), aov: Math.round(os.reduce((s, o) => s + o.totals.total, 0) / Math.max(1, os.length)) }; }),
      (() => { const os = list.filter((o) => !o.promo); return { label: 'Без промокода', orders: os.length, revenue: Math.round(os.reduce((s, o) => s + o.totals.total, 0)), discount: 0, aov: Math.round(os.reduce((s, o) => s + o.totals.total, 0) / Math.max(1, os.length)) }; })(),
      (() => { const os = list.filter((o) => o.totals.savings > 0); return { label: 'Со скидкой на товары (акции)', orders: os.length, revenue: Math.round(os.reduce((s, o) => s + o.totals.total, 0)), discount: Math.round(os.reduce((s, o) => s + o.totals.savings, 0)), aov: Math.round(os.reduce((s, o) => s + o.totals.total, 0) / Math.max(1, os.length)) }; })()
    ];
    return { columns: [{ key: 'label', label: 'Группа', width: 36 }, { key: 'orders', label: 'Заказы', type: 'int' }, { key: 'revenue', label: 'Выручка', type: 'money' }, { key: 'discount', label: 'Скидка', type: 'money' }, { key: 'aov', label: 'Средний чек', type: 'money' }], rows, note: 'Сравните средний чек с промокодом и без — так видно, окупает ли скидка рост корзины.' };
  } },
  { id: 'orders', group: 'Заказы и клиенты', title: 'Реестр заказов', desc: 'Все заказы периода со статусом, составом и суммами', icon: 'receipt', period: true, build: ({ orders, r, c }) => {
    const rows = orderRows(inRange(orders, r), Object.fromEntries(c.texts.checkout.payment.map((x) => [x.id, x.title])), Object.fromEntries(c.texts.checkout.delivery.map((x) => [x.id, x.title])));
    return { columns: ORDER_COLS, rows, totals: { id: 'Итого', count: sum(rows, 'count'), full: sum(rows, 'full'), discount: sum(rows, 'discount'), delivery: sum(rows, 'delivery'), total: sum(rows, 'total') } };
  } },
  { id: 'customers', group: 'Заказы и клиенты', title: 'Клиентская база', desc: 'Покупатели, сумма покупок, средний чек и сегмент', icon: 'users', period: false, build: ({ orders }) => {
    const rows = customerRows(customers(orders));
    return { columns: CUSTOMER_COLS, rows, totals: { name: 'Итого', orders: sum(rows, 'orders'), revenue: sum(rows, 'revenue') }, note: Object.entries(SEGMENTS).map(([, s]) => `${s.label} — ${s.hint}`).join('; ') };
  } },
  { id: 'stock', group: 'Склад и каталог', title: 'Остатки на складе', desc: 'Остатки, стоимость в ценах продажи и запас в днях', icon: 'box', period: false, build: ({ orders, c }) => {
    const cov = new Map(coverage(orders, c).map((x) => [x.p.id, x]));
    const rows = c.products.filter((p) => p.type !== 'giftcard').map((p) => { const x = cov.get(p.id); return { sku: sku(p), name: p.name, brand: c.brands.find((b) => b.id === p.brand)?.name || p.brand, category: typeCat(c, p.type), stock: p.stock, price: p.price, value: p.stock * p.price, perDay: x ? Math.round(x.perDay * 10) / 10 : 0, days: x && x.days !== Infinity ? Math.round(x.days) : '', status: p.hidden ? 'скрыт' : p.stock <= 0 ? 'нет в наличии' : p.stock <= 10 ? 'заканчивается' : 'в наличии' }; });
    return { columns: [{ key: 'sku', label: 'Артикул', width: 12 }, { key: 'name', label: 'Товар', width: 42 }, { key: 'brand', label: 'Бренд', width: 16 }, { key: 'category', label: 'Категория', width: 18 }, { key: 'stock', label: 'Остаток', type: 'int' }, { key: 'price', label: 'Цена', type: 'money' }, { key: 'value', label: 'Стоимость', type: 'money' }, { key: 'perDay', label: 'Продаж в день', type: 'num' }, { key: 'days', label: 'Хватит, дн.', type: 'int' }, { key: 'status', label: 'Статус', width: 15 }], rows, totals: { name: 'Итого', stock: sum(rows, 'stock'), value: sum(rows, 'value') } };
  } },
  { id: 'low', group: 'Склад и каталог', title: 'Заказать у поставщика', desc: 'Товары, которых хватит меньше чем на 3 недели, с рекомендацией', icon: 'alert', period: false, build: ({ orders, c }) => {
    const rows = coverage(orders, c).filter((x) => x.days < 21 || x.p.stock <= 5).map(({ p, perDay, days }) => ({ sku: sku(p), name: p.name, brand: c.brands.find((b) => b.id === p.brand)?.name || p.brand, stock: p.stock, perDay: Math.round(perDay * 10) / 10, days: days === Infinity ? '' : Math.round(days), order: Math.max(0, Math.ceil(perDay * 45 - p.stock)) }));
    return { columns: [{ key: 'sku', label: 'Артикул', width: 12 }, { key: 'name', label: 'Товар', width: 42 }, { key: 'brand', label: 'Бренд', width: 16 }, { key: 'stock', label: 'Остаток', type: 'int' }, { key: 'perDay', label: 'Продаж в день', type: 'num' }, { key: 'days', label: 'Хватит, дн.', type: 'int' }, { key: 'order', label: 'Заказать, шт', type: 'int' }], rows, note: 'Рекомендация «заказать» — запас на 45 дней при текущем темпе продаж минус остаток.' };
  } },
  { id: 'prices', group: 'Склад и каталог', title: 'Прайс-лист', desc: 'Все товары с ценами, скидками и объёмом — для партнёров и печати', icon: 'cash', period: false, build: ({ c }) => {
    const rows = c.products.filter((p) => !p.hidden).map((p) => ({ sku: sku(p), brand: c.brands.find((b) => b.id === p.brand)?.name || p.brand, name: p.name, type: c.taxonomy.types[p.type]?.name || p.type, volume: p.volume, price: p.price, old: p.old || '', discount: discountOf(p) || '' }));
    return { columns: [{ key: 'sku', label: 'Артикул', width: 12 }, { key: 'brand', label: 'Бренд', width: 16 }, { key: 'name', label: 'Товар', width: 44 }, { key: 'type', label: 'Тип', width: 22 }, { key: 'volume', label: 'Объём', width: 10 }, { key: 'price', label: 'Цена', type: 'money' }, { key: 'old', label: 'Старая цена', type: 'money' }, { key: 'discount', label: 'Скидка, %', type: 'int' }], rows };
  } }
];

const fmtCell = (v: unknown, t?: SheetCol['type']) => {
  if (v === undefined || v === null || v === '') return '';
  if (v instanceof Date) return t === 'date' ? v.toLocaleDateString('ru-RU') : v.toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' });
  if (typeof v === 'number') return t === 'pct' ? `${v.toLocaleString('ru-RU')}%` : t === 'num' ? v.toLocaleString('ru-RU', { maximumFractionDigits: 1 }) : Math.round(v).toLocaleString('ru-RU');
  return String(v);
};

export function Reports() {
  const orders = useOrders();
  const c = useAdmin((s) => s.draft);
  const [rid, setRid] = useSelected('r');
  const def = REPORTS.find((x) => x.id === rid) || REPORTS[0];
  const [preset, setPreset] = useState<Preset | 'custom'>('30d');
  const today = localDate();
  const [from, setFrom] = useState(localDate(new Date(Date.now() - 29 * 864e5)));
  const [to, setTo] = useState(today);
  const [bucket, setBucket] = useState<Bucket>('day');
  const r = useMemo<Range>(() => (preset === 'custom' ? { from: new Date(`${from}T00:00:00`), to: new Date(new Date(`${to}T00:00:00`).getTime() + 864e5) } : presetRange(preset)), [preset, from, to]);
  const built = useMemo(() => def.build({ orders, r, bucket, c }), [def, orders, r, bucket, c]);
  const periodText = def.period ? `${r.from.toLocaleDateString('ru-RU')} — ${new Date(r.to.getTime() - 1).toLocaleDateString('ru-RU')}` : `на ${new Date().toLocaleDateString('ru-RU')}`;
  const title = `${def.title}, ${periodText}`;
  const file = `${def.id}-${stamp()}`;
  const groups = [...new Set(REPORTS.map((x) => x.group))];
  const show = built.rows.slice(0, 300);

  const exportAs = (fmt: 'xlsx' | 'csv' | 'json' | 'pdf') => {
    if (fmt === 'xlsx') download(writeXlsx([{ name: def.title, title: `${c.settings.name} · ${title}`, columns: built.columns, rows: built.rows, totals: built.totals }]), `${file}.xlsx`);
    else if (fmt === 'csv') download(toCsv(built.columns, built.totals ? [...built.rows, built.totals] : built.rows), `${file}.csv`, 'text/csv;charset=utf-8');
    else if (fmt === 'json') download(JSON.stringify({ report: def.id, title, generatedAt: new Date().toISOString(), period: def.period ? { from: r.from.toISOString(), to: r.to.toISOString() } : null, columns: built.columns, rows: built.rows, totals: built.totals ?? null }, null, 2), `${file}.json`, 'application/json');
    else { document.body.classList.add('a-printing'); window.print(); window.setTimeout(() => document.body.classList.remove('a-printing'), 500); }
    if (fmt !== 'pdf') toast({ title: 'Отчёт выгружен', text: `${file}.${fmt}`, kind: 'ok' });
  };

  return (
    <div className="adm-page">
      <div className="a-noprint"><PageHead title="Отчёты" sub="Готовые отчёты по продажам, заказам, клиентам и складу. Выгрузка в Excel, CSV, JSON или PDF — с итогами и аккуратным форматированием." /></div>
      <div className="a-reports">
        <nav className="a-reports__list a-noprint" aria-label="Отчёты">
          {groups.map((g) => (
            <div key={g} className="a-stack a-stack--sm">
              <div className="a-section-title">{g}</div>
              {REPORTS.filter((x) => x.group === g).map((x) => (
                <button key={x.id} type="button" className={cx('a-report', x.id === def.id && 'is-active')} onClick={() => setRid(x.id)}>
                  <span className="a-report__icon"><I name={x.icon} /></span>
                  <span><b>{x.title}</b><small>{x.desc}</small></span>
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="a-stack" style={{ minWidth: 0 }}>
          <Card className="a-noprint" title={def.title} sub={def.desc}>
            <div className="a-stack">
              {def.period && (
                <div className="a-filters">
                  <Seg size="sm" value={preset} onChange={setPreset} options={[...PRESETS.map((p) => ({ value: p.value, label: p.label })), { value: 'custom', label: 'Свои даты', icon: 'calendar' }]} />
                  {preset === 'custom' && <>
                    <Field label="С"><input className="a-input a-input--sm" type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} /></Field>
                    <Field label="По"><input className="a-input a-input--sm" type="date" value={to} min={from} max={today} onChange={(e) => setTo(e.target.value)} /></Field>
                  </>}
                  {def.bucket && <Seg size="sm" value={bucket} onChange={setBucket} options={[{ value: 'day', label: 'По дням' }, { value: 'week', label: 'По неделям' }, { value: 'month', label: 'По месяцам' }]} />}
                </div>
              )}
              <div className="adm-row adm-row--wrap">
                <Btn variant="primary" icon="table" onClick={() => exportAs('xlsx')}>Excel</Btn>
                <Btn icon="file" onClick={() => exportAs('csv')}>CSV</Btn>
                <Btn icon="download" onClick={() => exportAs('json')}>JSON</Btn>
                <Btn icon="printer" onClick={() => exportAs('pdf')}>PDF / печать</Btn>
                <span className="adm-grow" />
                <Badge>{built.rows.length} строк</Badge>
              </div>
              {built.note && <Note>{built.note}</Note>}
            </div>
          </Card>
          <Card flush className="a-report-sheet">
            <div className="a-print-only a-print-head">
              <div className="adm-row" style={{ gap: 12 }}><Mark className="a-print-mark" /><b style={{ fontFamily: 'var(--serif)', fontSize: 22 }}>{c.settings.name}</b></div>
              <div><b>{def.title}</b><div className="adm-muted">{periodText} · сформирован {new Date().toLocaleString('ru-RU')}</div></div>
            </div>
            <div className="a-table-wrap" style={{ maxHeight: 640 }}>
              <table className="a-table a-table--compact">
                <thead><tr>{built.columns.map((col) => <th key={col.key} className={col.type && col.type !== 'text' && col.type !== 'date' && col.type !== 'datetime' ? 'is-num' : undefined}>{col.label}</th>)}</tr></thead>
                <tbody>{show.map((row, i) => <tr key={i}>{built.columns.map((col) => <td key={col.key} className={col.type && col.type !== 'text' && col.type !== 'date' && col.type !== 'datetime' ? 'is-num' : undefined}>{col.type === 'money' && typeof row[col.key] === 'number' ? `${fmtCell(row[col.key], col.type)} ${c.settings.currency}` : fmtCell(row[col.key], col.type)}</td>)}</tr>)}</tbody>
                {built.totals && <tfoot><tr>{built.columns.map((col) => <td key={col.key} className={col.type && col.type !== 'text' ? 'is-num' : undefined}>{col.type === 'money' && typeof built.totals![col.key] === 'number' ? `${fmtCell(built.totals![col.key], col.type)} ${c.settings.currency}` : fmtCell(built.totals![col.key], col.type)}</td>)}</tr></tfoot>}
              </table>
              {!built.rows.length && <div className="a-empty"><div className="a-empty__title">Нет данных за период</div></div>}
            </div>
            {built.rows.length > show.length && <div className="a-pager a-noprint"><span>Показаны первые {show.length} из {built.rows.length} — в файл попадут все строки</span></div>}
          </Card>
        </div>
      </div>
    </div>
  );
}
