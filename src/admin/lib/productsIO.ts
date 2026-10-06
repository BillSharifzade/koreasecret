import type { Product, SiteContent, Tag } from '@/lib/types';
import { discountOf, sku } from '@/lib/shop';
import { ID_RE, slugify } from '../state/schema';
import type { SheetCol } from './sheet';

/* Products ⇄ spreadsheet. The export can be edited in Excel and imported back: rows are matched by ID, only
   the columns present in the file are applied, and new IDs become new (hidden) products. */

export const PRODUCT_COLS: (SheetCol & { readonly?: boolean })[] = [
  { key: 'id', label: 'ID', width: 30 },
  { key: 'sku', label: 'Артикул', width: 12 },
  { key: 'brand', label: 'Бренд (id)', width: 16 },
  { key: 'brandName', label: 'Бренд', width: 18, readonly: true },
  { key: 'name', label: 'Название', width: 44 },
  { key: 'type', label: 'Тип (id)', width: 16 },
  { key: 'typeName', label: 'Тип', width: 22, readonly: true },
  { key: 'price', label: 'Цена', type: 'int' },
  { key: 'old', label: 'Старая цена', type: 'int' },
  { key: 'discount', label: 'Скидка, %', type: 'int', readonly: true },
  { key: 'stock', label: 'Остаток', type: 'int' },
  { key: 'volume', label: 'Объём', width: 12 },
  { key: 'rating', label: 'Рейтинг', type: 'num' },
  { key: 'reviews', label: 'Отзывов', type: 'int' },
  { key: 'tags', label: 'Метки (hit,new,excl)', width: 16 },
  { key: 'skin', label: 'Тип кожи', width: 22 },
  { key: 'concerns', label: 'Задачи', width: 22 },
  { key: 'ingr', label: 'Ингредиенты', width: 26 },
  { key: 'hidden', label: 'Скрыт (1/0)', type: 'int' },
  { key: 'desc', label: 'Описание', width: 60 }
];

export function productRows(c: SiteContent, list: Product[]) {
  return list.map((p) => ({
    id: p.id, sku: sku(p), brand: p.brand, brandName: c.brands.find((b) => b.id === p.brand)?.name || p.brand, name: p.name, type: p.type,
    typeName: c.taxonomy.types[p.type]?.name || p.type, price: p.price, old: p.old ?? '', discount: discountOf(p) || '', stock: p.stock, volume: p.volume,
    rating: p.rating, reviews: p.reviews, tags: p.tags.join(','), skin: p.skin.join(','), concerns: p.concerns.join(','), ingr: p.ingr.join(','), hidden: p.hidden ? 1 : 0, desc: p.desc
  }));
}

const norm = (s: string) => s.toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();
const HEADERS = new Map<string, string>();
PRODUCT_COLS.forEach((c) => { HEADERS.set(norm(c.key), c.key); HEADERS.set(norm(c.label), c.key); HEADERS.set(norm(c.label.replace(/\s*\(.*\)$/, '')), c.key); });
['артикул', 'sku'].forEach((h) => HEADERS.set(h, 'sku'));

const num = (s: string) => { const t = s.replace(/\s| /g, '').replace(',', '.'); if (t === '') return undefined; const n = Number(t); return Number.isFinite(n) ? n : NaN; };
const list = (s: string) => s.split(/[,;|]/).map((x) => x.trim()).filter(Boolean);
const bool = (s: string) => /^(1|да|true|yes|скрыт|y)$/i.test(s.trim());

export interface ImportPlan {
  columns: string[];
  ignored: string[];
  creates: Product[];
  updates: { id: string; name: string; patch: Partial<Product>; fields: string[] }[];
  unchanged: number;
  errors: { row: number; message: string }[];
}

export function planImport(c: SiteContent, table: string[][]): ImportPlan {
  const plan: ImportPlan = { columns: [], ignored: [], creates: [], updates: [], unchanged: 0, errors: [] };
  // the header row: the first row that names an ID column
  const hi = table.findIndex((r) => r.some((h) => HEADERS.get(norm(h)) === 'id'));
  if (hi < 0) { plan.errors.push({ row: 1, message: 'Не нашли колонку «ID» — в первой строке должны быть заголовки' }); return plan; }
  const head = table[hi].map((h) => HEADERS.get(norm(h)) || '');
  table[hi].forEach((h, i) => { if (!head[i] && h.trim()) plan.ignored.push(h.trim()); });
  const ro = new Set(PRODUCT_COLS.filter((x) => x.readonly).map((x) => x.key));
  plan.columns = [...new Set(head.filter((k) => k && !ro.has(k)))];
  const byId = new Map(c.products.map((p) => [p.id, p]));
  const brands = new Set(c.brands.map((b) => b.id));
  const brandByName = new Map(c.brands.map((b) => [norm(b.name), b.id]));
  const seen = new Set<string>();

  table.slice(hi + 1).forEach((cells, k) => {
    const rowNo = hi + k + 2;
    const v: Record<string, string> = {};
    head.forEach((key, i) => { if (key && !ro.has(key)) v[key] = (cells[i] ?? '').trim(); });
    let id = v.id;
    if (!id && v.name) id = slugify(`${v.brand || ''} ${v.name}`);
    if (!id) return;
    if (!ID_RE.test(id)) { plan.errors.push({ row: rowNo, message: `ID «${id}» — только латиница, цифры и дефис` }); return; }
    if (seen.has(id)) { plan.errors.push({ row: rowNo, message: `ID «${id}» повторяется в файле` }); return; }
    seen.add(id);
    const patch: Partial<Product> = {};
    const err = (m: string) => plan.errors.push({ row: rowNo, message: `${id}: ${m}` });
    if ('name' in v && v.name) patch.name = v.name;
    if ('brand' in v && v.brand) {
      const b = brands.has(v.brand) ? v.brand : brandByName.get(norm(v.brand));
      if (!b) { err(`бренд «${v.brand}» не найден`); return; }
      patch.brand = b;
    }
    if ('type' in v && v.type) { if (!c.taxonomy.types[v.type]) { err(`тип «${v.type}» не найден`); return; } patch.type = v.type; }
    for (const key of ['price', 'old', 'stock', 'rating', 'reviews'] as const) {
      if (!(key in v)) continue;
      const n = num(v[key]);
      if (n === undefined) { if (key === 'old') patch.old = undefined; continue; }
      if (Number.isNaN(n) || n < 0) { err(`«${v[key]}» — не число в колонке ${key}`); return; }
      (patch as Record<string, number>)[key] = key === 'rating' ? Math.min(5, Math.round(n * 10) / 10) : Math.round(n);
    }
    if ('volume' in v) patch.volume = v.volume;
    if ('desc' in v && v.desc) patch.desc = v.desc;
    if ('sku' in v && v.sku) patch.sku = v.sku;
    if ('tags' in v) patch.tags = list(v.tags).filter((t): t is Tag => t === 'hit' || t === 'new' || t === 'excl');
    if ('skin' in v) patch.skin = list(v.skin).filter((x) => c.taxonomy.skins[x]);
    if ('concerns' in v) patch.concerns = list(v.concerns).filter((x) => c.taxonomy.concerns[x]);
    if ('ingr' in v) patch.ingr = list(v.ingr).filter((x) => c.ingredients[x]);
    if ('hidden' in v && v.hidden !== '') patch.hidden = bool(v.hidden);

    const cur = byId.get(id);
    if (cur) {
      // a generated SKU equal to the current one is not a change
      if (patch.sku === sku(cur) && !cur.sku) delete patch.sku;
      const fields = Object.keys(patch).filter((key) => JSON.stringify((cur as unknown as Record<string, unknown>)[key]) !== JSON.stringify((patch as Record<string, unknown>)[key]));
      if (!fields.length) { plan.unchanged++; return; }
      const real: Partial<Product> = {};
      fields.forEach((f) => { (real as Record<string, unknown>)[f] = (patch as Record<string, unknown>)[f]; });
      plan.updates.push({ id, name: cur.name, patch: real, fields });
    } else {
      if (!patch.name || !patch.brand || !patch.type || !patch.price) { err('для нового товара нужны название, бренд, тип и цена'); return; }
      plan.creates.push({
        id, brand: patch.brand, name: patch.name, type: patch.type, price: patch.price, old: patch.old, rating: patch.rating ?? 5, reviews: patch.reviews ?? 0,
        volume: patch.volume ?? '', tags: patch.tags ?? [], stock: patch.stock ?? 0, skin: patch.skin?.length ? patch.skin : ['all'], concerns: patch.concerns ?? [], ingr: patch.ingr ?? [],
        art: { shape: 'dropper', c: '#f3e6ee', cap: '#ffffff', ink: '#6a3f57', big: (patch.name || '').split(' ')[0].slice(0, 10), sub: (c.taxonomy.types[patch.type]?.name || '').toUpperCase().slice(0, 24) },
        desc: patch.desc ?? '', sku: patch.sku, hidden: patch.hidden ?? true
      });
    }
  });
  return plan;
}
