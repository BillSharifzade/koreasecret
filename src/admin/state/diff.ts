import { mdText } from '@/lib/md';
import type { SiteContent } from '@/lib/types';

/* What changed between two content documents, item by item, in words a shop manager understands. */

export type ChangeKind = 'added' | 'removed' | 'changed' | 'reordered';
export interface Change { area: string; kind: ChangeKind; id?: string; label: string; fields?: string[]; href?: string }

type Item = { id: string; [k: string]: unknown };
interface Area { key: string; label: string; get: (c: SiteContent) => Item[]; name: (x: Item) => string; href?: (id: string) => string }

const t = (x: unknown) => (typeof x === 'string' ? mdText(x) : '');
export const AREAS: Area[] = [
  { key: 'products', label: 'Товары', get: (c) => c.products as unknown as Item[], name: (x) => `${x.name}`, href: (id) => `/admin/products/edit/?id=${encodeURIComponent(id)}` },
  { key: 'brands', label: 'Бренды', get: (c) => c.brands as unknown as Item[], name: (x) => `${x.name}`, href: (id) => `/admin/brands/?id=${encodeURIComponent(id)}` },
  { key: 'categories', label: 'Категории', get: (c) => c.taxonomy.categories as unknown as Item[], name: (x) => `${x.name}`, href: () => '/admin/categories/' },
  { key: 'heroSlides', label: 'Баннеры', get: (c) => c.heroSlides as unknown as Item[], name: (x) => t(x.title), href: (id) => `/admin/banners/?id=${id}` },
  { key: 'sections', label: 'Главная страница', get: (c) => c.home.sections as unknown as Item[], name: (x) => t(x.title) || SECTION_NAMES[String(x.type)] || String(x.type), href: (id) => `/admin/home/?id=${id}` },
  { key: 'homeCats', label: 'Плитки категорий', get: (c) => c.homeCats as unknown as Item[], name: (x) => `${x.name}`, href: () => '/admin/navigation/?tab=tiles' },
  { key: 'promos', label: 'Акции', get: (c) => c.promos as unknown as Item[], name: (x) => `${x.title}`, href: (id) => `/admin/promos/?id=${id}` },
  { key: 'stories', label: 'Истории', get: (c) => c.stories as unknown as Item[], name: (x) => `${x.title}`, href: (id) => `/admin/stories/?id=${id}` },
  { key: 'collections', label: 'Подборки', get: (c) => c.collections as unknown as Item[], name: (x) => `${x.title}`, href: (id) => `/admin/collections/?id=${id}` },
  { key: 'bloggers', label: 'Блогеры', get: (c) => c.bloggers as unknown as Item[], name: (x) => `${x.name}`, href: (id) => `/admin/bloggers/?id=${id}` },
  { key: 'articles', label: 'Журнал', get: (c) => c.articles as unknown as Item[], name: (x) => `${x.title}`, href: (id) => `/admin/journal/?id=${id}` },
  { key: 'stores', label: 'Магазины', get: (c) => c.stores as unknown as Item[], name: (x) => `${x.addr}`, href: (id) => `/admin/stores/?id=${id}` },
  { key: 'megaPromos', label: 'Промо в меню', get: (c) => c.nav.megaPromos as unknown as Item[], name: (x) => `${x.title}`, href: () => '/admin/navigation/?tab=mega' }
];

interface Dict { key: string; label: string; get: (c: SiteContent) => Record<string, unknown>; name: (k: string, v: unknown) => string; href: string }
const DICTS: Dict[] = [
  { key: 'types', label: 'Типы продуктов', get: (c) => c.taxonomy.types, name: (_k, v) => String((v as { name: string }).name), href: '/admin/categories/' },
  { key: 'ingredients', label: 'Ингредиенты', get: (c) => c.ingredients, name: (_k, v) => String((v as { name: string }).name), href: '/admin/ingredients/' },
  { key: 'skins', label: 'Типы кожи', get: (c) => c.taxonomy.skins, name: (_k, v) => String(v), href: '/admin/dictionaries/' },
  { key: 'concerns', label: 'Задачи кожи', get: (c) => c.taxonomy.concerns, name: (_k, v) => String(v), href: '/admin/dictionaries/' },
  { key: 'offers', label: 'Предложения', get: (c) => c.taxonomy.offers, name: (_k, v) => String(v), href: '/admin/dictionaries/' },
  { key: 'pros', label: 'Плюсы в отзывах', get: (c) => c.reviews.pros, name: (_k, v) => String(v), href: '/admin/reviews/' }
];

const SINGLES: { key: string; label: string; get: (c: SiteContent) => unknown; href: string }[] = [
  { key: 'settings', label: 'Настройки магазина', get: (c) => c.settings, href: '/admin/settings/' },
  { key: 'theme', label: 'Оформление', get: (c) => c.theme, href: '/admin/appearance/' },
  { key: 'seo', label: 'SEO', get: (c) => c.seo, href: '/admin/texts/?tab=seo' },
  { key: 'promoBar', label: 'Промо-полоса', get: (c) => c.promoBar, href: '/admin/promos/?tab=bar' },
  { key: 'nav', label: 'Меню в шапке', get: (c) => c.nav.header, href: '/admin/navigation/' },
  { key: 'chips', label: 'Подсказки поиска', get: (c) => c.nav.searchChips, href: '/admin/navigation/?tab=search' },
  { key: 'footer', label: 'Подвал', get: (c) => c.footer, href: '/admin/navigation/?tab=footer' },
  { key: 'texts', label: 'Тексты сайта', get: (c) => c.texts, href: '/admin/texts/' },
  { key: 'reviews', label: 'Отзывы', get: (c) => c.reviews.pool, href: '/admin/reviews/' },
  { key: 'credits', label: 'Авторы фото', get: (c) => c.photoCredits, href: '/admin/stores/?tab=credits' }
];

export const SECTION_NAMES: Record<string, string> = {
  hero: 'Баннеры', categories: 'Плитки категорий', products: 'Товары', stories: 'Короткие видео', promos: 'Акции', bloggers: 'Выбор блогеров',
  strip: 'Узкий баннер', reviews: 'Отзывы', journal: 'Журнал', spotlight: 'Бренд в фокусе', collections: 'Подборки', stores: 'Магазины',
  giftcards: 'Подарочные карты', brands: 'Топ-бренды', seo: 'SEO-текст'
};

export const FIELD_NAMES: Record<string, string> = {
  name: 'название', brand: 'бренд', type: 'тип', price: 'цена', old: 'старая цена', rating: 'рейтинг', reviews: 'отзывы', volume: 'объём', tags: 'метки',
  stock: 'остаток', skin: 'тип кожи', concerns: 'задачи', ingr: 'состав', variants: 'варианты', art: 'упаковка', desc: 'описание', images: 'фото', sku: 'артикул',
  hidden: 'видимость', title: 'заголовок', text: 'текст', link: 'ссылка', href: 'ссылка', cta: 'кнопка', bg: 'фон', tone: 'цвет текста', kicker: 'надзаголовок',
  products: 'товары', pills: 'плашки', image: 'картинка', theme: 'тема', decor: 'декор', date: 'даты', dark: 'тёмный текст', frames: 'кадры', palette: 'палитра',
  dur: 'длительность', about: 'описание', tint: 'цвет', avatar: 'фото', nameGen: 'имя в род. падеже', body: 'текст', mins: 'время чтения', tag: 'тег', query: 'подбор товаров',
  city: 'город', addr: 'адрес', area: 'район', note: 'пометка', hours: 'часы', lat: 'координаты', lon: 'координаты', photo: 'фото', map: 'карта', phone: 'телефон',
  icon: 'иконка', groups: 'группы', style: 'стиль', logo: 'логотип', limit: 'количество', sort: 'сортировка', pinned: 'закреплённые', layout: 'вид', fill: 'дополнение',
  offset: 'пропуск', minReviews: 'мин. отзывов', amount: 'номинал', action: 'действие', id: 'идентификатор'
};

const same = (a: unknown, b: unknown) => a === b || JSON.stringify(a) === JSON.stringify(b);

export function diffContent(a: SiteContent, b: SiteContent): Change[] {
  if (a === b) return [];
  const out: Change[] = [];
  for (const area of AREAS) {
    const A = area.get(a), B = area.get(b);
    if (A === B) continue;
    const am = new Map(A.map((x) => [x.id, x])), bm = new Map(B.map((x) => [x.id, x]));
    for (const x of B) {
      const old = am.get(x.id);
      if (!old) out.push({ area: area.label, kind: 'added', id: x.id, label: area.name(x) || x.id, href: area.href?.(x.id) });
      else if (old !== x && !same(old, x)) {
        const fields = [...new Set([...Object.keys(old), ...Object.keys(x)])].filter((k) => !same(old[k], x[k])).map((k) => FIELD_NAMES[k] || k);
        out.push({ area: area.label, kind: 'changed', id: x.id, label: area.name(x) || x.id, fields: [...new Set(fields)], href: area.href?.(x.id) });
      }
    }
    for (const x of A) if (!bm.has(x.id)) out.push({ area: area.label, kind: 'removed', id: x.id, label: area.name(x) || x.id });
    const order = (L: Item[], keep: Map<string, Item>) => L.filter((x) => keep.has(x.id)).map((x) => x.id).join('|');
    if (order(A, bm) !== order(B, am)) out.push({ area: area.label, kind: 'reordered', label: 'Новый порядок', href: area.href?.('') });
  }
  for (const d of DICTS) {
    const A = d.get(a), B = d.get(b);
    if (A === B) continue;
    for (const k of Object.keys(B)) {
      if (!(k in A)) out.push({ area: d.label, kind: 'added', id: k, label: d.name(k, B[k]), href: d.href });
      else if (!same(A[k], B[k])) out.push({ area: d.label, kind: 'changed', id: k, label: d.name(k, B[k]), href: d.href });
    }
    for (const k of Object.keys(A)) if (!(k in B)) out.push({ area: d.label, kind: 'removed', id: k, label: d.name(k, A[k]) });
  }
  for (const s of SINGLES) {
    const A = s.get(a), B = s.get(b);
    if (A === B || same(A, B)) continue;
    const fields = A && B && typeof A === 'object' && !Array.isArray(A)
      ? Object.keys({ ...(A as object), ...(B as object) }).filter((k) => !same((A as Record<string, unknown>)[k], (B as Record<string, unknown>)[k])).map((k) => FIELD_NAMES[k] || SETTING_NAMES[k] || k)
      : undefined;
    out.push({ area: s.label, kind: 'changed', label: s.label, fields, href: s.href });
  }
  return out;
}

const SETTING_NAMES: Record<string, string> = {
  currency: 'валюта', freeShipping: 'бесплатная доставка', giftFrom: 'подарок от', deliveryFee: 'стоимость доставки', promo: 'промокод', cities: 'города',
  pageSize: 'товаров на странице', returnDays: 'срок возврата', socials: 'соцсети', hoursNote: 'подпись к часам', chat: 'чат', cookie: 'cookie', perks: 'преимущества',
  checkout: 'оформление заказа', account: 'вход', giftcard: 'подарочная карта', catalog: 'каталог', notFound: 'страница 404', columns: 'колонки', legal: 'документы',
  copyright: 'копирайт', subscribe: 'подписка', description: 'описание', catalogTitle: 'заголовок каталога', catalogDescription: 'описание каталога', enabled: 'включение', messages: 'сообщения'
};
