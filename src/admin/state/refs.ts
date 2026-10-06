import type { Draft } from 'immer';
import { mdText } from '@/lib/md';
import type { SiteContent } from '@/lib/types';
import { SECTION_NAMES } from './diff';

/* Who points at what. Deleting or renaming a product, brand, type or category updates every reference to it —
   product lists in banners, stories, collections, bloggers, articles, home sections and catalogue links. */

export interface Usage { where: string; label: string; href: string }
type C = SiteContent | Draft<SiteContent>;

/** Every list of product ids in the content, with a label and a link to its editor. */
function productLists(c: C): { where: string; label: string; href: string; list: string[] }[] {
  const out: { where: string; label: string; href: string; list: string[] }[] = [];
  c.heroSlides.forEach((s) => out.push({ where: 'Баннер', label: mdText(s.title), href: `/admin/banners/?id=${s.id}`, list: s.products }));
  c.promos.forEach((p) => out.push({ where: 'Акция', label: p.title, href: `/admin/promos/?id=${p.id}`, list: p.products }));
  c.stories.forEach((s) => out.push({ where: 'История', label: s.title, href: `/admin/stories/?id=${s.id}`, list: s.products }));
  c.collections.forEach((s) => out.push({ where: 'Подборка', label: s.title, href: `/admin/collections/?id=${s.id}`, list: s.art }));
  c.bloggers.forEach((b) => out.push({ where: 'Блогер', label: b.name, href: `/admin/bloggers/?id=${b.id}`, list: b.products }));
  c.articles.forEach((a) => { out.push({ where: 'Статья (обложка)', label: a.title, href: `/admin/journal/?id=${a.id}`, list: a.art }); out.push({ where: 'Статья (товары)', label: a.title, href: `/admin/journal/?id=${a.id}`, list: a.products }); });
  c.nav.megaPromos.forEach((m) => out.push({ where: 'Промо в меню', label: m.title, href: '/admin/navigation/?tab=mega', list: m.products }));
  c.home.sections.forEach((s) => {
    const label = ('title' in s && s.title ? mdText(s.title) : SECTION_NAMES[s.type]) || s.type;
    if (s.type === 'products') out.push({ where: 'Главная', label, href: `/admin/home/?id=${s.id}`, list: s.pinned });
    if (s.type === 'strip') out.push({ where: 'Главная', label, href: `/admin/home/?id=${s.id}`, list: s.products });
    if (s.type === 'spotlight') out.push({ where: 'Главная', label: 'Бренд в фокусе', href: `/admin/home/?id=${s.id}`, list: s.art });
  });
  return out;
}

export function productUsages(c: SiteContent, id: string): Usage[] {
  return productLists(c).filter((x) => x.list.includes(id)).map(({ where, label, href }) => ({ where, label, href }));
}

export function removeProductRefs(d: Draft<SiteContent>, ids: string[]) {
  const drop = new Set(ids);
  for (const x of productLists(d)) {
    for (let i = x.list.length - 1; i >= 0; i--) if (drop.has(x.list[i])) x.list.splice(i, 1);
  }
}

export function renameProductRefs(d: Draft<SiteContent>, from: string, to: string) {
  for (const x of productLists(d)) x.list.forEach((v, i) => { if (v === from) x.list[i] = to; });
}

/* ---------- catalogue links ---------- */
/** Calls fn for every link and catalogue query in the content; fn returns the new value. */
export function mapLinks(d: Draft<SiteContent>, fn: (value: string) => string) {
  const m = <T extends Record<string, unknown>>(o: T, k: keyof T) => { const v = o[k]; if (typeof v === 'string') (o as Record<string, unknown>)[k as string] = fn(v); };
  d.nav.header.forEach((n) => m(n, 'href'));
  d.footer.columns.forEach((col) => col.links.forEach((l) => m(l, 'href')));
  d.footer.legal.forEach((l) => m(l, 'href'));
  d.homeCats.forEach((h) => m(h, 'href'));
  d.heroSlides.forEach((s) => m(s, 'link'));
  d.promos.forEach((p) => m(p, 'link'));
  d.collections.forEach((p) => m(p, 'href'));
  d.nav.megaPromos.forEach((p) => m(p, 'link'));
  d.articles.forEach((a) => m(a, 'query'));
  d.home.sections.forEach((s) => {
    if ('link' in s) m(s as unknown as Record<string, unknown>, 'link');
    if (s.type === 'products') m(s as unknown as Record<string, unknown>, 'query');
  });
  m(d.texts.cookie, 'href');
}

/** Rewrites one catalogue filter value in a link or query: brand=a,b → brand=c,b; null removes it. */
export function rewriteParam(link: string, key: string, from: string, to: string | null) {
  const qi = link.indexOf('?');
  const isQuery = !link.startsWith('/') && !link.startsWith('#') && !/^https?:/i.test(link);
  if (qi < 0 && !isQuery) return link;
  const head = isQuery ? '' : link.slice(0, qi + 1);
  const qs = isQuery ? link : link.slice(qi + 1);
  const parts = qs.split('&').map((p) => {
    const [k, v = ''] = p.split('=');
    if (k !== key) return p;
    const vals = v.split(',').map((x) => (x === from ? to : x)).filter((x): x is string => !!x);
    return vals.length ? `${k}=${vals.join(',')}` : '';
  }).filter(Boolean);
  return head + parts.join('&');
}

export function linkUsages(c: SiteContent, key: string, value: string): number {
  let n = 0;
  const probe = JSON.parse(JSON.stringify(c)) as SiteContent;
  mapLinks(probe as Draft<SiteContent>, (v) => { if (rewriteParam(v, key, value, null) !== v) n++; return v; });
  return n;
}

export function brandUsages(c: SiteContent, id: string): Usage[] {
  const list: Usage[] = c.products.filter((p) => p.brand === id).map((p) => ({ where: 'Товар', label: p.name, href: `/admin/products/edit/?id=${p.id}` }));
  c.home.sections.forEach((s) => { if (s.type === 'spotlight' && s.brand === id) list.push({ where: 'Главная', label: 'Бренд в фокусе', href: `/admin/home/?id=${s.id}` }); });
  return list;
}
export function renameBrand(d: Draft<SiteContent>, from: string, to: string) {
  d.products.forEach((p) => { if (p.brand === from) p.brand = to; });
  d.home.sections.forEach((s) => { if (s.type === 'spotlight' && s.brand === from) s.brand = to; });
  mapLinks(d, (v) => rewriteParam(v, 'brand', from, to));
}

/** Renames a key of a dictionary in place, keeping its position (the order is the order of filters and lists). */
function renameKey<T>(obj: Record<string, T>, from: string, to: string) {
  if (!(from in obj) || from === to) return;
  const entries = Object.entries(obj).map(([k, v]) => [k === from ? to : k, v] as [string, T]);
  for (const k of Object.keys(obj)) delete obj[k];
  for (const [k, v] of entries) obj[k] = v;
}

export function renameType(d: Draft<SiteContent>, from: string, to: string) {
  d.products.forEach((p) => { if (p.type === from) p.type = to; });
  d.taxonomy.categories.forEach((c) => c.groups.forEach((g) => { g.types = g.types.map((t) => (t === from ? to : t)); }));
  renameKey(d.taxonomy.types, from, to);
  mapLinks(d, (v) => rewriteParam(v, 'type', from, to));
}

export function renameCategory(d: Draft<SiteContent>, from: string, to: string) {
  Object.values(d.taxonomy.types).forEach((t) => { if (t.cat === from) t.cat = to; });
  const cat = d.taxonomy.categories.find((c) => c.id === from);
  if (cat) cat.id = to;
  mapLinks(d, (v) => rewriteParam(v, 'cat', from, to));
}

export function renameDictKey(d: Draft<SiteContent>, dict: 'skins' | 'concerns', from: string, to: string) {
  const field = dict === 'skins' ? 'skin' : 'concerns';
  d.products.forEach((p) => { p[field] = p[field].map((x) => (x === from ? to : x)); });
  renameKey(d.taxonomy[dict], from, to);
  mapLinks(d, (l) => rewriteParam(l, dict === 'skins' ? 'skin' : 'concern', from, to));
}

export function renameIngredient(d: Draft<SiteContent>, from: string, to: string) {
  d.products.forEach((p) => { p.ingr = p.ingr.map((x) => (x === from ? to : x)); });
  renameKey(d.ingredients, from, to);
}
