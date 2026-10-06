import { publishedContent } from '@/lib/data';
import type { SiteContent } from '@/lib/types';

const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);

/* Missing keys are filled from the built-in content, recursively for plain objects (settings, texts, taxonomy…);
   arrays are kept as they are. A partial or older document can be loaded without crashing the panel. */
function fillDefaults(value: unknown, def: unknown): unknown {
  if (value === undefined || value === null) return def;
  if (isObj(def) && isObj(value)) {
    const out: Record<string, unknown> = { ...value };
    // dictionaries keyed by user ids (types, skins…) are taken as they are
    for (const k of Object.keys(def)) out[k] = fillDefaults(value[k], def[k]);
    return out;
  }
  return value;
}
const DICTS = ['types', 'skins', 'concerns', 'offers'];

export function normalizeContent(raw: unknown): SiteContent {
  if (!isObj(raw)) throw new Error('Это не файл контента сайта');
  if (!Array.isArray(raw.products) || !isObj(raw.settings)) throw new Error('В файле нет товаров или настроек — это не content/site.json');
  const def = publishedContent() as unknown as Record<string, unknown>;
  const out = fillDefaults(raw, def) as SiteContent;
  // keyed dictionaries: never merge the defaults' keys into the user's set
  const tax = (raw.taxonomy || {}) as Record<string, unknown>;
  for (const k of DICTS) if (isObj(tax[k])) (out.taxonomy as unknown as Record<string, unknown>)[k] = tax[k];
  if (isObj(raw.ingredients)) out.ingredients = raw.ingredients as SiteContent['ingredients'];
  if (isObj((raw.reviews as Record<string, unknown> | undefined)?.pros)) out.reviews.pros = (raw.reviews as SiteContent['reviews']).pros;
  return out;
}

/** The file as committed: stable 2-space JSON with a trailing newline, so git diffs stay readable. */
export const serialize = (c: SiteContent) => JSON.stringify(c, null, 2) + '\n';

/* ---------- ids ---------- */
const TR: Record<string, string> = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya', ӣ: 'i', ӯ: 'u', ҳ: 'h', ҷ: 'j', қ: 'q', ғ: 'g' };
export const slugify = (s: string, max = 48) => s.toLowerCase().split('').map((c) => TR[c] ?? c).join('').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, max).replace(/-+$/, '');
export const uid = (prefix = '') => prefix + Math.random().toString(36).slice(2, 8);
/** a slug not taken yet: base, base-2, base-3… */
export function uniqueId(base: string, taken: (id: string) => boolean) {
  const b = slugify(base) || 'item';
  if (!taken(b)) return b;
  for (let i = 2; ; i++) if (!taken(`${b}-${i}`)) return `${b}-${i}`;
}
export const ID_RE = /^[a-z0-9][a-z0-9_-]*$/;
