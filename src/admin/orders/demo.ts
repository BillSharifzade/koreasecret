import type { Order, OrderItem, OrderStatus } from '@/lib/orders';
import type { SiteContent } from '@/lib/types';

/*
 * A year of plausible orders for the dashboards while the shop has no order back end: deterministic (same seed →
 * same history), anchored to today, built from the published catalogue. Growth over the year, busier weekends,
 * lunch and evening peaks, and the cosmetics calendar of Tajikistan: 8 March, Navruz, Black Friday, New Year.
 */

const FIRST = ['Малика', 'Нигора', 'Шахноза', 'Фарзона', 'Тахмина', 'Мехрона', 'Сабрина', 'Мадина', 'Нигина', 'Зарина', 'Фарангис', 'Дилноза', 'Гулнора', 'Парвина', 'Ситора', 'Мунира', 'Шабнам', 'Зулфия', 'Манижа', 'Рухшона', 'Анна', 'Дарья', 'Светлана', 'Юлия', 'Ирина', 'Алёна', 'Наталья', 'Екатерина', 'Ольга', 'Виктория', 'Камила', 'Лола', 'Нилуфар', 'Хуршеда', 'Барно', 'Гулчехра', 'Мавзуна', 'Сарвиноз', 'Фируза', 'Шахло', 'Дильбар', 'Азиза', 'Мохира', 'Наргиз', 'Юлдуз', 'Рустам', 'Фаррух', 'Шерзод'];
const LAST = ['К.', 'Р.', 'М.', 'Х.', 'Г.', 'Т.', 'С.', 'Н.', 'А.', 'Ш.', 'Д.', 'Б.', 'Ю.', 'Л.', 'Ф.', 'З.'];
const STREETS = ['пр. Рудаки', 'ул. Айни', 'пр. Исмоили Сомони', 'ул. Шота Руставели', 'ул. Бохтар', 'ул. Пушкина', 'ул. Негмата Карабаева', 'ул. Мирзо Турсунзаде', 'пр. Саади Шерози', 'ул. Лохути'];
const CITY_W: [string, number][] = [['Душанбе', 72], ['Худжанд', 10], ['Бохтар', 5], ['Куляб', 4], ['Истаравшан', 3], ['Турсунзаде', 2.5], ['Вахдат', 2], ['Гиссар', 1.5]];
const DELIVERY_W: [string, number][] = [['courier', 55], ['store', 30], ['pickup', 15]];
const PAYMENT_W: [string, number][] = [['card', 45], ['qr', 31], ['cash', 24]];
const HOUR_W = [1, .5, .3, .2, .2, .3, .6, 1.4, 2.4, 3.4, 4.2, 5, 6.2, 6.4, 5.4, 4.8, 4.6, 5, 5.8, 7, 7.6, 7, 5, 2.6];

function rng(seed: string) {
  let s = 0;
  for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function pickW<T>(r: number, list: [T, number][]) {
  const total = list.reduce((s, [, w]) => s + w, 0);
  let x = r * total;
  for (const [v, w] of list) { x -= w; if (x <= 0) return v; }
  return list[list.length - 1][0];
}

/** demand multiplier of a calendar day */
function season(d: Date) {
  const m = d.getMonth() + 1, day = d.getDate(), wd = d.getDay();
  let k = wd === 0 || wd === 6 ? 1.22 : wd === 5 ? 1.1 : 1;
  if (m === 3 && day >= 1 && day <= 8) k *= 2.1 + (day >= 5 ? 0.9 : 0);     // 8 Марта
  if (m === 3 && day >= 19 && day <= 23) k *= 1.5;                           // Навруз
  if (m === 2 && day >= 10 && day <= 14) k *= 1.45;                          // 14 февраля
  if (m === 11 && day >= 24) k *= 1.9;                                       // «чёрная пятница»
  if (m === 12 && day >= 18) k *= 1.7 + (day >= 26 ? 0.5 : 0);               // Новый год
  if (m === 1 && day <= 7) k *= 0.6;
  if (m >= 6 && m <= 8) k *= 1.08;                                           // SPF-сезон
  return k;
}

export function generateDemoOrders(c: SiteContent, now = new Date()): Order[] {
  const r = rng('korea-secret-demo-v1');
  const products = c.products.filter((p) => !p.hidden && p.price > 0);
  if (!products.length) return [];
  const popW: [typeof products[number], number][] = products.map((p) => [p, Math.pow(p.reviews + 20, 0.72) * (p.type === 'giftcard' ? 0.35 : 1)]);
  const st = c.settings;
  const tiers = st.promo.tiers.slice().sort((a, b) => b[0] - a[0]);

  // customers: a growing pool, earlier customers come back more often
  const customers: { name: string; phone: string; email?: string; city: string; street: string }[] = [];
  const newCustomer = () => {
    const name = `${FIRST[Math.floor(r() * FIRST.length)]} ${LAST[Math.floor(r() * LAST.length)]}`;
    const ops = ['90', '91', '92', '93', '98', '00', '50', '55', '88', '11'];
    const digits = String(Math.floor(r() * 9_000_000) + 1_000_000);
    const phone = `+992 ${ops[Math.floor(r() * ops.length)]} ${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 7)}`;
    const cust = { name, phone, email: r() < 0.35 ? `client${customers.length + 101}@mail.tj` : undefined, city: pickW(r(), CITY_W), street: STREETS[Math.floor(r() * STREETS.length)] };
    customers.push(cust);
    return cust;
  };

  const out: Order[] = [];
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let seq = 0;
  for (let back = 364; back >= 0; back--) {
    const day = new Date(today.getTime() - back * 864e5);
    const growth = 5.5 + (364 - back) / 364 * 8.5;
    let n = Math.round(growth * season(day) * (0.8 + r() * 0.4));
    if (back === 0) n = Math.round(n * Math.min(1, (now.getHours() + now.getMinutes() / 60) / 24) + 0.4);
    for (let k = 0; k < n; k++) {
      const hour = pickW(r(), HOUR_W.map((w, h) => [h, w] as [number, number]));
      const at = new Date(day.getTime() + hour * 3600e3 + Math.floor(r() * 3600e3));
      if (at > now) continue;
      const cust = customers.length > 40 && r() < 0.36 ? customers[Math.floor(Math.pow(r(), 1.7) * customers.length)] : newCustomer();
      const lines = 1 + (r() < 0.45 ? 1 : 0) + (r() < 0.2 ? 1 : 0) + (r() < 0.08 ? 1 : 0);
      const items: OrderItem[] = [];
      for (let i = 0; i < lines; i++) {
        const p = pickW(r(), popW);
        if (items.some((x) => x.id === p.id)) continue;
        const v = p.variants?.length ? Math.floor(r() * p.variants.length) : 0;
        const va = p.variants?.[v];
        const pr = va?.price ?? p.price;
        items.push({ id: p.id, v, q: r() < 0.12 ? 2 : 1, name: `${c.brands.find((b) => b.id === p.brand)?.name || p.brand} ${p.name}`, variant: va?.name, price: pr, old: va?.price ? undefined : p.old, brand: c.brands.find((b) => b.id === p.brand)?.name || p.brand, type: p.type });
      }
      const sub = items.reduce((s, x) => s + x.price * x.q, 0);
      const full = items.reduce((s, x) => s + (x.old || x.price) * x.q, 0);
      const promo = sub >= (tiers[tiers.length - 1]?.[0] ?? Infinity) && r() < 0.2 ? st.promo.code : undefined;
      const pct = promo ? (tiers.find(([min]) => sub >= min)?.[1] ?? 0) : 0;
      const promoSum = Math.round((sub * pct) / 100);
      const delivery = pickW(r(), DELIVERY_W);
      const fee = delivery === 'courier' && sub < st.freeShipping ? st.deliveryFee : 0;
      const age = (now.getTime() - at.getTime()) / 864e5;
      const status: OrderStatus = age > 6 ? (r() < 0.065 ? 'cancelled' : 'delivered')
        : age > 3 ? (r() < 0.05 ? 'cancelled' : r() < 0.75 ? 'delivered' : 'shipped')
        : age > 1.2 ? pickW(r(), [['shipped', 4], ['packed', 3], ['delivered', 2], ['cancelled', 0.4]] as [OrderStatus, number][])
        : age > 0.25 ? pickW(r(), [['confirmed', 4], ['packed', 3], ['new', 2]] as [OrderStatus, number][])
        : 'new';
      seq++;
      out.push({
        id: `KS-${String(240000 + seq * 7 + Math.floor(r() * 7)).padStart(6, '0')}`,
        createdAt: at.toISOString(),
        source: 'demo',
        status,
        customer: { name: cust.name, phone: cust.phone, email: cust.email },
        city: cust.city,
        address: delivery === 'courier' ? `${cust.street}, ${1 + Math.floor(r() * 120)}` : undefined,
        delivery,
        payment: pickW(r(), PAYMENT_W),
        promo,
        items,
        totals: { sub, full, savings: full - sub, promo: promoSum, delivery: fee, total: sub - promoSum + fee, count: items.reduce((s, x) => s + x.q, 0) }
      });
    }
  }
  return out.reverse();
}
