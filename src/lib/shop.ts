import { BRANDS, CONCERNS, CONFIG, INGREDIENTS, onContent, PRODUCTS, REVIEW_POOL, TYPES } from './data';
import { count, fmt } from './format';
import type { Brand, CartItem, CatId, Product, Review } from './types';

/* lookup maps, rebuilt whenever the content is swapped (admin draft, storefront preview) */
let byId = new Map<string, Product>();
let order = new Map<string, number>();
const index = new Map<string, string>();
function rebuild() {
  byId = new Map(PRODUCTS.map((p) => [p.id, p]));
  order = new Map(PRODUCTS.map((p, i) => [p.id, i]));
  index.clear();
}
rebuild();
onContent(rebuild);

export const getProduct = (id: string | null | undefined): Product | undefined => (id ? byId.get(id) : undefined);
export const productOrder = (id: string) => order.get(id) ?? 0;
export const brandOf = (id: string): Brand => BRANDS.find((b) => b.id === id) || { id, name: id, style: 'caps' };
export const titleOf = (p: Product) => `${brandOf(p.brand).name} ${p.name}`;
export const typeLabel = (p: Product) => TYPES[p.type]?.name ?? p.type;
export const catOf = (p: Product): CatId => TYPES[p.type]?.cat ?? '';
/** the gift card product (opened by the «Подарочные карты» links) */
export const giftCard = () => PRODUCTS.find((p) => p.type === 'giftcard');
export const discountOf = (p: Product) => (p.old ? Math.round((1 - p.price / p.old) * 100) : 0);
export const priceOf = (p: Product, v = 0) => p.variants?.[v]?.price ?? p.price;
export const oldOf = (p: Product, v = 0) => (p.variants?.[v]?.price ? 0 : p.old ?? 0);
export const hasPriceVariants = (p: Product) => !!p.variants?.some((x) => x.price);
export const price = (n: number) => `${fmt(n)} ${CONFIG.currency}`;
export const score = (p: Product) => p.rating * Math.log(p.reviews + 2);
export const productPath = (p: Product | string) => `/product/${encodeURIComponent(typeof p === 'string' ? p : p.id)}`;

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
const norm = (s: string) => s.toLowerCase().replace(/ё/g, 'е');
const indexOf = (p: Product) => {
  let s = index.get(p.id);
  if (!s) {
    const ty = TYPES[p.type];
    s = norm([brandOf(p.brand).name, p.name, ty?.name, ty?.many, ty?.synonyms,
      ...p.ingr.map((k) => INGREDIENTS[k]?.name), ...p.concerns.map((k) => CONCERNS[k]), p.desc].join(' '));
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

/* ---------- product page carousels ---------- */
export function relatedFor(p: Product) {
  return PRODUCTS.filter((x) => x.id !== p.id && x.type !== p.type && x.type !== 'giftcard' && (catOf(x) === catOf(p) || x.type === 'sunscreen')).sort((a, b) => score(b) - score(a)).slice(0, 10).map((x) => x.id);
}
export function similarFor(p: Product) {
  return PRODUCTS.filter((x) => x.id !== p.id && catOf(x) === catOf(p)).sort((a, b) => Number(b.type === p.type) - Number(a.type === p.type) || score(b) - score(a)).slice(0, 10).map((x) => x.id);
}

/* ---------- misc ---------- */
export const sku = (p: Product) => p.sku || 'KS-' + String([...p.id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 900000, 7) + 100000);
export const stockLevel = (n: number) => (n > 30 ? 'many' : n > 10 ? 'some' : n > 0 ? 'few' : 'none') as 'many' | 'some' | 'few' | 'none';
export const firstSentence = (s: string) => { const m = s.match(/^.+?[.!?](\s|$)/); return m ? m[0].trim() : s; };
export const stripTags = (s: string) => s.replace(/<[^>]+>/g, '');
/** Tajik numbers: +992 XX XXX-XX-XX */
export const maskPhone = (v: string) => {
  let d = v.replace(/\D/g, '');
  if (d.startsWith('992')) d = d.slice(3);
  else if (d.startsWith('8') && d.length > 9) d = d.slice(1);
  const p = d.slice(0, 9);
  let out = '+992';
  if (p.length) out += ' ' + p.slice(0, 2);
  if (p.length > 2) out += ' ' + p.slice(2, 5);
  if (p.length > 5) out += '-' + p.slice(5, 7);
  if (p.length > 7) out += '-' + p.slice(7, 9);
  return out;
};
/** true when the masked value holds a full Tajik number */
export const phoneComplete = (v: string) => v.replace(/\D/g, '').length === 12;
export const variantsLabel = (p: Product) => (p.variants && p.variants.length > 1 && !hasPriceVariants(p) ? `Ещё ${count(p.variants.length - 1, 'вариант', 'варианта', 'вариантов')}` : '');
