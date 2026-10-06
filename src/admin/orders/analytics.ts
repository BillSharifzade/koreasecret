import type { OrderStatus } from '@/lib/orders';
import type { SiteContent } from '@/lib/types';
import type { OrderView } from './store';

/* Aggregations behind the dashboard, analytics and reports. All of them take a period [from, to) and skip
   cancelled orders for money figures (cancellations are counted separately). */

export type Preset = 'today' | '7d' | '30d' | '90d' | 'mtd' | 'ytd' | '12m';
export interface Range { from: Date; to: Date; preset?: Preset }
export type Bucket = 'day' | 'week' | 'month';

export const PRESETS: { value: Preset; label: string }[] = [
  { value: 'today', label: 'Сегодня' }, { value: '7d', label: '7 дней' }, { value: '30d', label: '30 дней' }, { value: '90d', label: '90 дней' },
  { value: 'mtd', label: 'Этот месяц' }, { value: 'ytd', label: 'С начала года' }, { value: '12m', label: '12 месяцев' }
];

const day0 = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export function presetRange(p: Preset, now = new Date()): Range {
  const end = new Date(day0(now).getTime() + 864e5);
  const back = (n: number) => new Date(end.getTime() - n * 864e5);
  const from = p === 'today' ? day0(now) : p === '7d' ? back(7) : p === '30d' ? back(30) : p === '90d' ? back(90)
    : p === 'mtd' ? new Date(now.getFullYear(), now.getMonth(), 1) : p === 'ytd' ? new Date(now.getFullYear(), 0, 1) : back(365);
  return { from, to: end, preset: p };
}
/** the period of the same length right before */
export const prevRange = (r: Range): Range => ({ from: new Date(r.from.getTime() - (r.to.getTime() - r.from.getTime())), to: r.from });
export const days = (r: Range) => Math.round((r.to.getTime() - r.from.getTime()) / 864e5);
export const bucketFor = (r: Range): Bucket => (days(r) <= 45 ? 'day' : days(r) <= 190 ? 'week' : 'month');

export const paid = (o: OrderView) => o.status !== 'cancelled';
export function inRange(orders: OrderView[], r: Range) {
  const a = r.from.toISOString(), b = r.to.toISOString();
  return orders.filter((o) => o.createdAt >= a && o.createdAt < b);
}

export interface Kpis { revenue: number; orders: number; aov: number; units: number; customers: number; newCustomers: number; cancelled: number; cancelRate: number; promoOrders: number; promoShare: number; discounts: number; repeatShare: number }
export function kpis(all: OrderView[], r: Range): Kpis {
  const list = inRange(all, r);
  const ok = list.filter(paid);
  const revenue = ok.reduce((s, o) => s + o.totals.total, 0);
  const units = ok.reduce((s, o) => s + o.totals.count, 0);
  const firstSeen = new Map<string, string>();
  for (const o of all) { const k = o.customer.phone; const f = firstSeen.get(k); if (!f || o.createdAt < f) firstSeen.set(k, o.createdAt); }
  const cust = new Set(ok.map((o) => o.customer.phone));
  const a = r.from.toISOString();
  const newCustomers = [...cust].filter((k) => (firstSeen.get(k) || '') >= a).length;
  const promoOrders = ok.filter((o) => o.promo).length;
  return {
    revenue, orders: ok.length, aov: ok.length ? revenue / ok.length : 0, units, customers: cust.size, newCustomers,
    cancelled: list.length - ok.length, cancelRate: list.length ? ((list.length - ok.length) / list.length) * 100 : 0,
    promoOrders, promoShare: ok.length ? (promoOrders / ok.length) * 100 : 0,
    discounts: ok.reduce((s, o) => s + o.totals.savings + o.totals.promo, 0),
    repeatShare: cust.size ? ((cust.size - newCustomers) / cust.size) * 100 : 0
  };
}
/** change in % against the previous value (null when there is nothing to compare with) */
export const delta = (cur: number, prev: number) => (prev ? ((cur - prev) / prev) * 100 : null);

const MONTHS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const MONTHS_N = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
export const dayLabel = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]}`;
export function bucketStart(d: Date, b: Bucket) {
  if (b === 'month') return new Date(d.getFullYear(), d.getMonth(), 1);
  const x = day0(d);
  if (b === 'week') x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}
export function bucketLabel(d: Date, b: Bucket, long = false) {
  if (b === 'month') return long ? `${MONTHS_N[d.getMonth()]} ${d.getFullYear()}` : `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
  if (b === 'week') { const e = new Date(d.getTime() + 6 * 864e5); return long ? `${dayLabel(d)} — ${dayLabel(e)}` : dayLabel(d); }
  return long ? `${dayLabel(d)} ${d.getFullYear()}` : dayLabel(d);
}

export interface Point { t: Date; label: string; long: string; revenue: number; orders: number; aov: number; units: number }
export function series(all: OrderView[], r: Range, b: Bucket = bucketFor(r)): Point[] {
  const map = new Map<number, Point>();
  for (let t = bucketStart(r.from, b); t < r.to; t = b === 'month' ? new Date(t.getFullYear(), t.getMonth() + 1, 1) : new Date(t.getTime() + (b === 'week' ? 7 : 1) * 864e5)) {
    map.set(t.getTime(), { t, label: bucketLabel(t, b), long: bucketLabel(t, b, true), revenue: 0, orders: 0, aov: 0, units: 0 });
  }
  for (const o of inRange(all, r)) {
    if (!paid(o)) continue;
    const p = map.get(bucketStart(new Date(o.createdAt), b).getTime());
    if (!p) continue;
    p.revenue += o.totals.total;
    p.orders++;
    p.units += o.totals.count;
  }
  const out = [...map.values()];
  out.forEach((p) => { p.aov = p.orders ? p.revenue / p.orders : 0; });
  return out;
}

export interface Ranked { key: string; label: string; sub?: string; revenue: number; orders: number; units: number; share: number }
function rank(map: Map<string, Ranked>): Ranked[] {
  const list = [...map.values()].sort((a, b) => b.revenue - a.revenue);
  const total = list.reduce((s, x) => s + x.revenue, 0) || 1;
  list.forEach((x) => { x.share = (x.revenue / total) * 100; });
  return list;
}

/** Revenue per product line (net of the order's promo discount, proportionally). */
export function byProduct(all: OrderView[], r: Range): Ranked[] {
  const map = new Map<string, Ranked>();
  for (const o of inRange(all, r)) {
    if (!paid(o)) continue;
    const k = o.totals.sub ? (o.totals.sub - o.totals.promo) / o.totals.sub : 1;
    for (const it of o.items) {
      const x = map.get(it.id) || { key: it.id, label: it.name, sub: it.brand, revenue: 0, orders: 0, units: 0, share: 0 };
      x.revenue += it.price * it.q * k; x.units += it.q; x.orders++;
      map.set(it.id, x);
    }
  }
  return rank(map);
}

export function byItemKey(all: OrderView[], r: Range, key: (it: OrderView['items'][number]) => [string, string]): Ranked[] {
  const map = new Map<string, Ranked>();
  for (const o of inRange(all, r)) {
    if (!paid(o)) continue;
    const k = o.totals.sub ? (o.totals.sub - o.totals.promo) / o.totals.sub : 1;
    const seen = new Set<string>();
    for (const it of o.items) {
      const [id, label] = key(it);
      const x = map.get(id) || { key: id, label, revenue: 0, orders: 0, units: 0, share: 0 };
      x.revenue += it.price * it.q * k; x.units += it.q;
      if (!seen.has(id)) { x.orders++; seen.add(id); }
      map.set(id, x);
    }
  }
  return rank(map);
}

export function byOrderKey(all: OrderView[], r: Range, key: (o: OrderView) => [string, string]): Ranked[] {
  const map = new Map<string, Ranked>();
  for (const o of inRange(all, r)) {
    if (!paid(o)) continue;
    const [id, label] = key(o);
    const x = map.get(id) || { key: id, label, revenue: 0, orders: 0, units: 0, share: 0 };
    x.revenue += o.totals.total; x.orders++; x.units += o.totals.count;
    map.set(id, x);
  }
  return rank(map);
}

export const byCategory = (all: OrderView[], r: Range, c: SiteContent) => byItemKey(all, r, (it) => {
  const cat = c.taxonomy.types[it.type]?.cat || 'other';
  return [cat, c.taxonomy.categories.find((x) => x.id === cat)?.name || 'Другое'];
});
export const byBrand = (all: OrderView[], r: Range) => byItemKey(all, r, (it) => [it.brand, it.brand]);

/** orders by weekday (Mon…Sun) × hour */
export function heatmap(all: OrderView[], r: Range): number[][] {
  const g = Array.from({ length: 7 }, () => new Array(24).fill(0));
  for (const o of inRange(all, r)) { if (!paid(o)) continue; const d = new Date(o.createdAt); g[(d.getDay() + 6) % 7][d.getHours()]++; }
  return g;
}

export function statusCounts(all: OrderView[], r: Range) {
  const out: Record<OrderStatus, number> = { new: 0, confirmed: 0, packed: 0, shipped: 0, delivered: 0, cancelled: 0 };
  for (const o of inRange(all, r)) out[o.status]++;
  return out;
}

/* ---------- customers ---------- */
export type Segment = 'new' | 'regular' | 'vip' | 'sleeping' | 'lost';
export const SEGMENTS: Record<Segment, { label: string; hint: string; tone: 'blue' | 'green' | 'brand' | 'amber' | 'red' }> = {
  new: { label: 'Новый', hint: 'одна покупка за последние 60 дней', tone: 'blue' },
  regular: { label: 'Постоянный', hint: '2+ покупки, последняя — в последние 90 дней', tone: 'green' },
  vip: { label: 'VIP', hint: '5+ покупок или сумма в 5 раз выше среднего чека', tone: 'brand' },
  sleeping: { label: 'Спящий', hint: 'не покупал 90–180 дней', tone: 'amber' },
  lost: { label: 'Ушёл', hint: 'не покупал больше 180 дней', tone: 'red' }
};
export interface Customer { key: string; name: string; phone: string; email?: string; city: string; orders: number; revenue: number; aov: number; first: string; last: string; segment: Segment; ids: string[] }

export function customers(all: OrderView[], now = new Date()): Customer[] {
  const map = new Map<string, Customer>();
  for (const o of all) {
    if (!paid(o)) continue;
    const k = o.customer.phone;
    const c = map.get(k) || { key: k, name: o.customer.name, phone: k, email: o.customer.email, city: o.city, orders: 0, revenue: 0, aov: 0, first: o.createdAt, last: o.createdAt, segment: 'new' as Segment, ids: [] };
    c.orders++; c.revenue += o.totals.total; c.ids.push(o.id);
    if (o.createdAt < c.first) c.first = o.createdAt;
    if (o.createdAt > c.last) { c.last = o.createdAt; c.name = o.customer.name; c.city = o.city; c.email = o.customer.email || c.email; }
    map.set(k, c);
  }
  const list = [...map.values()];
  const avgAov = list.reduce((s, c) => s + c.revenue, 0) / Math.max(1, list.reduce((s, c) => s + c.orders, 0));
  for (const c of list) {
    c.aov = c.revenue / c.orders;
    const idle = (now.getTime() - new Date(c.last).getTime()) / 864e5;
    c.segment = idle > 180 ? 'lost' : idle > 90 ? 'sleeping' : c.orders >= 5 || c.revenue >= avgAov * 5 ? 'vip' : c.orders >= 2 ? 'regular' : 'new';
  }
  return list.sort((a, b) => b.revenue - a.revenue);
}

/* ---------- catalogue ---------- */
/** ABC: A = products bringing the first 80% of revenue, B = the next 15%, C = the rest. */
export function abc(list: Ranked[]) {
  let acc = 0;
  return list.map((x) => { acc += x.share; return { ...x, cls: (acc - x.share < 80 ? 'A' : acc - x.share < 95 ? 'B' : 'C') as 'A' | 'B' | 'C' }; });
}

export function inventory(c: SiteContent) {
  const live = c.products.filter((p) => !p.hidden && p.type !== 'giftcard');
  return {
    skus: live.length,
    units: live.reduce((s, p) => s + p.stock, 0),
    value: live.reduce((s, p) => s + p.stock * p.price, 0),
    out: live.filter((p) => p.stock <= 0).length,
    low: live.filter((p) => p.stock > 0 && p.stock <= 10).length,
    onSale: live.filter((p) => p.old).length,
    avgPrice: live.length ? live.reduce((s, p) => s + p.price, 0) / live.length : 0,
    avgRating: live.length ? live.reduce((s, p) => s + p.rating, 0) / live.length : 0
  };
}

/** days of stock left at the recent selling pace (last 30 days) */
export function coverage(all: OrderView[], c: SiteContent, now = new Date()) {
  const r: Range = { from: new Date(now.getTime() - 30 * 864e5), to: now };
  const sold = new Map<string, number>();
  for (const o of inRange(all, r)) if (paid(o)) for (const it of o.items) sold.set(it.id, (sold.get(it.id) || 0) + it.q);
  return c.products.filter((p) => !p.hidden && p.type !== 'giftcard').map((p) => {
    const perDay = (sold.get(p.id) || 0) / 30;
    return { p, perDay, days: perDay ? p.stock / perDay : Infinity };
  }).sort((a, b) => a.days - b.days);
}
