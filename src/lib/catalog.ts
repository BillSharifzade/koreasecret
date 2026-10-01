import { BLOGGERS, BRANDS, CATS, CONCERNS, OFFERS, PRODUCTS, SKINS, TYPES } from './data';
import { brandOf, catOf, discountOf, matches, productOrder, score } from './shop';
import type { CatId, Concern, Offer, Product, ProductType, Skin } from './types';

export const SORTS = ['default', 'popular', 'priceAsc', 'priceDesc', 'rating', 'discount', 'new'] as const;
export type Sort = (typeof SORTS)[number];
export const LIST_KEYS = ['type', 'brand', 'skin', 'concern', 'offer'] as const;
export type ListKey = (typeof LIST_KEYS)[number];
export type FacetKey = ListKey | 'price';

export interface CatalogState {
  cat: CatId | '';
  q: string;
  edit: string;
  type: ProductType[];
  brand: string[];
  skin: Skin[];
  concern: Concern[];
  offer: Offer[];
  pmin: number;
  pmax: number;
  instock: boolean;
  sort: Sort;
  page: number;
  from: number;
}

type Params = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || '';

export function parseState(sp: Params): CatalogState {
  const list = <T extends string>(k: string, allowed: readonly string[]) => one(sp[k]).split(',').map((s) => s.trim()).filter((s) => allowed.includes(s)) as T[];
  const cat = one(sp.cat);
  const sort = one(sp.sort);
  const page = Math.max(1, parseInt(one(sp.page), 10) || 1);
  return {
    cat: CATS.some((c) => c.id === cat) ? (cat as CatId) : '',
    q: one(sp.q).trim().slice(0, 80),
    edit: BLOGGERS.some((b) => b.id === one(sp.edit)) ? one(sp.edit) : '',
    type: list<ProductType>('type', Object.keys(TYPES)),
    brand: list<string>('brand', BRANDS.map((b) => b.id)),
    skin: list<Skin>('skin', Object.keys(SKINS)),
    concern: list<Concern>('concern', Object.keys(CONCERNS)),
    offer: list<Offer>('offer', Object.keys(OFFERS)),
    pmin: Math.max(0, parseInt(one(sp.pmin), 10) || 0),
    pmax: Math.max(0, parseInt(one(sp.pmax), 10) || 0),
    instock: one(sp.instock) === '1',
    sort: (SORTS as readonly string[]).includes(sort) ? (sort as Sort) : 'default',
    page,
    from: page
  };
}

export function toQuery(st: CatalogState) {
  const q = new URLSearchParams();
  if (st.cat) q.set('cat', st.cat);
  for (const k of LIST_KEYS) if (st[k].length) q.set(k, st[k].join(','));
  if (st.q) q.set('q', st.q);
  if (st.edit) q.set('edit', st.edit);
  if (st.pmin) q.set('pmin', String(st.pmin));
  if (st.pmax) q.set('pmax', String(st.pmax));
  if (st.instock) q.set('instock', '1');
  if (st.sort !== 'default') q.set('sort', st.sort);
  if (st.page > 1) q.set('page', String(st.page));
  const s = q.toString().replace(/%2C/g, ',');
  return s ? `?${s}` : '';
}

export const bloggerOf = (id: string) => BLOGGERS.find((b) => b.id === id);

const offerMatch = (p: Product, o: Offer) => (o === 'sale' ? !!p.old : p.tags.includes(o));

export function passes(p: Product, st: CatalogState, skip?: FacetKey | 'cat' | 'instock') {
  if (st.edit && !bloggerOf(st.edit)?.products.includes(p.id)) return false;
  if (skip !== 'cat' && st.cat && catOf(p) !== st.cat) return false;
  if (skip !== 'type' && st.type.length && !st.type.includes(p.type)) return false;
  if (skip !== 'brand' && st.brand.length && !st.brand.includes(p.brand)) return false;
  if (skip !== 'skin' && st.skin.length && !st.skin.some((s) => p.skin.includes(s) || p.skin.includes('all'))) return false;
  if (skip !== 'concern' && st.concern.length && !st.concern.some((c) => p.concerns.includes(c))) return false;
  if (skip !== 'offer' && st.offer.length && !st.offer.some((o) => offerMatch(p, o))) return false;
  if (skip !== 'price' && st.pmin && p.price < st.pmin) return false;
  if (skip !== 'price' && st.pmax && p.price > st.pmax) return false;
  if (skip !== 'instock' && st.instock && p.stock <= 0) return false;
  if (st.q && !matches(p, st.q)) return false;
  return true;
}

const SORTERS: Record<Sort, (a: Product, b: Product) => number> = {
  default: (a, b) => Number(b.tags.includes('hit')) - Number(a.tags.includes('hit')) || score(b) - score(a),
  popular: (a, b) => b.reviews - a.reviews,
  priceAsc: (a, b) => a.price - b.price,
  priceDesc: (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
  discount: (a, b) => discountOf(b) - discountOf(a) || score(b) - score(a),
  new: (a, b) => Number(b.tags.includes('new')) - Number(a.tags.includes('new')) || productOrder(b.id) - productOrder(a.id)
};

export const results = (st: CatalogState) => PRODUCTS.filter((p) => passes(p, st)).sort(SORTERS[st.sort]);

export interface FacetOption { v: string; label: string; n: number }
export function facet(key: ListKey, st: CatalogState): FacetOption[] {
  const base = PRODUCTS.filter((p) => passes(p, st, key));
  const count = (fn: (p: Product) => boolean) => base.filter(fn).length;
  switch (key) {
    case 'offer': return (Object.keys(OFFERS) as Offer[]).map((o) => ({ v: o, label: OFFERS[o], n: count((p) => offerMatch(p, o)) }));
    case 'brand': return BRANDS.map((b) => ({ v: b.id, label: b.name, n: count((p) => p.brand === b.id) })).filter((o) => o.n || st.brand.includes(o.v)).sort((a, b) => a.label.localeCompare(b.label));
    case 'type': return (Object.keys(TYPES) as ProductType[]).map((ty) => ({ v: ty, label: TYPES[ty].many, n: count((p) => p.type === ty) })).filter((o) => o.n || st.type.includes(o.v as ProductType));
    case 'skin': return (Object.keys(SKINS) as Skin[]).filter((s) => s !== 'all').map((s) => ({ v: s, label: SKINS[s], n: count((p) => p.skin.includes(s) || p.skin.includes('all')) }));
    case 'concern': return (Object.keys(CONCERNS) as Concern[]).map((c) => ({ v: c, label: CONCERNS[c], n: count((p) => p.concerns.includes(c)) })).filter((o) => o.n || st.concern.includes(o.v as Concern));
  }
}

export function priceBounds(st: CatalogState): [number, number] {
  const ps = PRODUCTS.filter((p) => passes(p, st, 'price')).map((p) => p.price);
  return ps.length ? [Math.min(...ps), Math.max(...ps)] : [0, 0];
}

export const activeCount = (key: FacetKey, st: CatalogState) => (key === 'price' ? (st.pmin || st.pmax ? 1 : 0) : st[key].length);

export interface Crumb { label: string; href?: string }
export function context(st: CatalogState): { title: string; crumbs: Crumb[] } {
  const crumbs: Crumb[] = [{ label: 'Главная', href: '/' }, { label: 'Каталог', href: '/catalog' }];
  const cat = CATS.find((c) => c.id === st.cat);
  let title = 'Каталог';
  if (st.q) { title = `Поиск: «${st.q}»`; crumbs.push({ label: 'Поиск' }); }
  else if (st.edit) { const b = bloggerOf(st.edit)!; title = `Фавориты в уходе ${b.nameGen}`; crumbs.push({ label: 'Выбор блогеров' }, { label: b.name }); }
  else if (st.type.length === 1) {
    const ty = TYPES[st.type[0]];
    const c2 = CATS.find((c) => c.id === ty.cat)!;
    crumbs.push({ label: c2.name, href: `/catalog?cat=${c2.id}` }, { label: ty.many });
    title = ty.many;
  } else if (cat) { title = cat.name; crumbs.push({ label: title }); }
  else if (st.brand.length === 1) { title = brandOf(st.brand[0]).name; crumbs.push({ label: 'Бренды' }, { label: title }); }
  else if (st.offer.length === 1) { title = OFFERS[st.offer[0]]; crumbs.push({ label: title }); }
  return { title, crumbs };
}

export const emptyState = (): CatalogState => parseState({});
