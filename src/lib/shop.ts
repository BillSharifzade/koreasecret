import { BRANDS, CONCERNS, CONFIG, EXPERT, INGREDIENTS, PRODUCTS, REVIEW_POOL, TYPES } from './data';
import { fmt, type Translator } from './i18n';
import type { Brand, CartItem, CatId, Lang, Product, Review } from './types';

const byId = new Map(PRODUCTS.map((p) => [p.id, p]));
const order = new Map(PRODUCTS.map((p, i) => [p.id, i]));

export const getProduct = (id: string | null | undefined): Product | undefined => (id ? byId.get(id) : undefined);
export const productOrder = (id: string) => order.get(id) ?? 0;
export const brandOf = (id: string): Brand => BRANDS.find((b) => b.id === id) || { id, name: id, style: 'caps' };
export const titleOf = (p: Product) => `${brandOf(p.brand).name} ${p.name}`;
export const typeLabel = (p: Product, lang: Lang) => TYPES[p.type][lang];
export const catOf = (p: Product): CatId => TYPES[p.type].cat;
export const discountOf = (p: Product) => (p.old ? Math.round((1 - p.price / p.old) * 100) : 0);
export const priceOf = (p: Product, v = 0) => p.variants?.[v]?.price ?? p.price;
export const oldOf = (p: Product, v = 0) => (p.variants?.[v]?.price ? 0 : p.old ?? 0);
export const hasPriceVariants = (p: Product) => !!p.variants?.some((x) => x.price);
export const price = (n: number) => `${fmt(n)} ${CONFIG.currency}`;
export const score = (p: Product) => p.rating * Math.log(p.reviews + 2);
export const productPath = (p: Product | string) => `/product/${encodeURIComponent(typeof p === 'string' ? p : p.id)}`;
export const expertIds = EXPERT.products;

/* ---------- cart ---------- */
export interface Totals { sub: number; full: number; savings: number; pct: number; promo: number; delivery: number; total: number; count: number }
export function cartTotals(cart: CartItem[], promoCode: string): Totals {
  let sub = 0, full = 0, count = 0;
  for (const it of cart) {
    const p = byId.get(it.id);
    if (!p) continue;
    const pr = priceOf(p, it.v);
    sub += pr * it.q;
    full += (oldOf(p, it.v) || pr) * it.q;
    count += it.q;
  }
  let pct = 0;
  if (promoCode) for (const [min, val] of CONFIG.promo.tiers) if (sub >= min) { pct = val; break; }
  const promo = Math.round((sub * pct) / 100);
  const delivery = sub === 0 || sub >= CONFIG.freeShipping ? 0 : CONFIG.deliveryFee;
  return { sub, full, savings: full - sub, pct, promo, delivery, total: sub - promo + delivery, count };
}

/* ---------- search ---------- */
const SYN: Partial<Record<Product['type'], string>> = {
  sunscreen: 'санскрин spf солнце загар sun sunscreen санскрины солнцезащита', toner: 'тоник тонер toner', essence: 'эссенция essence', serum: 'сыворотка serum',
  ampoule: 'ампула ampoule сыворотка serum', eye: 'глаза веки eye', cream: 'крем cream увлажнение moisturiser moisturizer', cleansing_oil: 'гидрофильное масло oil очищение cleansing',
  cleansing_balm: 'бальзам balm очищение cleansing', cleanser: 'пенка гель умывание foam cleanser очищение', pads: 'пэды pads диски', sheet_mask: 'маска тканевая mask sheet',
  sleeping_mask: 'маска ночная mask', lip_mask: 'губы lip маска', cushion: 'кушон тон cushion foundation', lip_tint: 'тинт губы помада tint lip', body_cream: 'тело body крем',
  body_gel: 'гель алоэ aloe gel тело', shampoo: 'шампунь волосы hair shampoo', hair_mask: 'волосы hair маска', set: 'набор подарок set gift', giftcard: 'подарочная карта сертификат gift card'
};
const norm = (s: string) => s.toLowerCase().replace(/ё/g, 'е');
const index = new Map<string, string>();
const indexOf = (p: Product) => {
  let s = index.get(p.id);
  if (!s) {
    const ty = TYPES[p.type];
    s = norm([brandOf(p.brand).name, p.name, ty.ru, ty.en, ty.many.ru, ty.many.en, SYN[p.type] || '',
      ...p.ingr.map((k) => `${INGREDIENTS[k].ru} ${INGREDIENTS[k].en}`),
      ...p.concerns.map((k) => `${CONCERNS[k].ru} ${CONCERNS[k].en}`), p.desc.ru, p.desc.en].join(' '));
    index.set(p.id, s);
  }
  return s;
};
export function matches(p: Product, q: string) {
  const tokens = norm(q).split(/\s+/).filter(Boolean);
  if (!tokens.length) return true;
  const s = indexOf(p);
  return tokens.every((tk) => s.includes(tk));
}
export function searchProducts(q: string) {
  const ql = norm(q.trim());
  const rank = (p: Product) => (norm(brandOf(p.brand).name).startsWith(ql) ? 2 : 0) + (norm(titleOf(p)).includes(ql) ? 1 : 0) + p.reviews / 10000;
  return PRODUCTS.filter((p) => matches(p, q)).sort((a, b) => rank(b) - rank(a));
}

/* ---------- reviews (deterministic sample per product) ---------- */
const seeded = (seed: string) => { let s = 0; for (const ch of seed) s = (s * 33 + ch.charCodeAt(0)) >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
export interface DatedReview extends Review { date: Date }
export function reviewsFor(p: Product, n = 6): DatedReview[] {
  const rnd = seeded(p.id);
  const keyed = REVIEW_POOL.map((r) => ({ r, k: rnd() })).sort((a, b) => a.k - b.k).map((x) => x.r).filter((r) => (p.rating >= 4.7 ? r.rating >= 4 : true));
  const base = Date.UTC(2026, 8, 28);
  return keyed.slice(0, n).map((r, i) => ({ ...r, date: new Date(base - (i * 9 + Math.floor(rnd() * 8)) * 864e5) }));
}
export function ratingDist(p: Product) {
  const five = Math.round(Math.min(92, Math.max(40, (p.rating - 3.6) * 60)));
  const four = Math.round((100 - five) * 0.62);
  const three = Math.round((100 - five - four) * 0.55);
  const two = Math.round((100 - five - four - three) * 0.6);
  return [five, four, three, two, Math.max(0, 100 - five - four - three - two)];
}

/* ---------- misc ---------- */
export const sku = (p: Product) => 'KS-' + String([...p.id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 900000, 7) + 100000);
export const stockLevel = (n: number) => (n > 30 ? 'many' : n > 10 ? 'some' : n > 0 ? 'few' : 'none') as 'many' | 'some' | 'few' | 'none';
export const firstSentence = (s: string) => { const m = s.match(/^.+?[.!?](\s|$)/); return m ? m[0].trim() : s; };
export const stripTags = (s: string) => s.replace(/<[^>]+>/g, '');
export const maskPhone = (v: string) => {
  let d = v.replace(/\D/g, '');
  if (d.startsWith('8')) d = '7' + d.slice(1);
  if (!d.startsWith('7')) d = '7' + d;
  const p = d.slice(1, 11);
  let out = '+7';
  if (p.length) out += ' (' + p.slice(0, 3);
  if (p.length >= 3) out += ')';
  if (p.length > 3) out += ' ' + p.slice(3, 6);
  if (p.length > 6) out += '-' + p.slice(6, 8);
  if (p.length > 8) out += '-' + p.slice(8, 10);
  return out;
};
export const variantsLabel = (p: Product, tr: Translator) => (p.variants && p.variants.length > 1 && !hasPriceVariants(p) ? tr.pl('pl.variants', p.variants.length - 1) : '');
