import { mdText } from '@/lib/md';
import { isHex } from '@/lib/theme';
import type { SiteContent } from '@/lib/types';
import { SECTION_NAMES } from './diff';
import { ID_RE } from './schema';

/* Content checks. Errors block publishing (the site would break or show nonsense); warnings are worth a look. */

export interface Issue { level: 'error' | 'warning'; area: string; label: string; message: string; href: string; id?: string }

const KNOWN_ROUTES = /^\/(catalog\/?(\?.*)?|product\/[^/?#]+\/?(#.*)?|#[\w-]+|)$/;

export function validate(c: SiteContent): Issue[] {
  const out: Issue[] = [];
  const err = (area: string, label: string, message: string, href: string, id?: string) => out.push({ level: 'error', area, label, message, href, id });
  const warn = (area: string, label: string, message: string, href: string, id?: string) => out.push({ level: 'warning', area, label, message, href, id });

  const pid = new Map(c.products.map((p) => [p.id, p]));
  const brands = new Set(c.brands.map((b) => b.id));
  const types = c.taxonomy.types;
  const cats = new Set(c.taxonomy.categories.map((x) => x.id));
  const dup = <T extends { id: string }>(list: T[]) => { const seen = new Set<string>(), d = new Set<string>(); list.forEach((x) => (seen.has(x.id) ? d.add(x.id) : seen.add(x.id))); return d; };

  /* products */
  const dupP = dup(c.products);
  for (const p of c.products) {
    const href = `/admin/products/edit/?id=${encodeURIComponent(p.id)}`;
    const L = p.name || p.id;
    if (dupP.has(p.id)) err('Товары', L, `Идентификатор «${p.id}» повторяется`, href, p.id);
    if (!ID_RE.test(p.id)) err('Товары', L, 'Идентификатор (адрес страницы) — только латиница, цифры и дефис', href, p.id);
    if (!p.name.trim()) err('Товары', p.id, 'Нет названия', href, p.id);
    if (!brands.has(p.brand)) err('Товары', L, `Бренд «${p.brand}» не найден`, href, p.id);
    if (!types[p.type]) err('Товары', L, `Тип «${p.type}» не найден`, href, p.id);
    if (!(p.price > 0)) err('Товары', L, 'Цена должна быть больше нуля', href, p.id);
    if (p.old && p.old <= p.price) warn('Товары', L, 'Старая цена не больше текущей — скидка не покажется', href, p.id);
    if (p.rating < 0 || p.rating > 5) err('Товары', L, 'Рейтинг — от 0 до 5', href, p.id);
    if (p.stock < 0 || !Number.isFinite(p.stock)) err('Товары', L, 'Остаток не может быть отрицательным', href, p.id);
    if (!p.desc.trim() && !p.hidden) warn('Товары', L, 'Нет описания', href, p.id);
    if (!p.hidden && p.stock === 0) warn('Товары', L, 'Нет в наличии — покупатели увидят «Нет в наличии»', href, p.id);
    p.ingr.forEach((k) => { if (!c.ingredients[k]) warn('Товары', L, `Ингредиент «${k}» не найден в справочнике`, href, p.id); });
    p.skin.forEach((k) => { if (!c.taxonomy.skins[k]) warn('Товары', L, `Тип кожи «${k}» не найден`, href, p.id); });
    p.concerns.forEach((k) => { if (!c.taxonomy.concerns[k]) warn('Товары', L, `Задача «${k}» не найдена`, href, p.id); });
    p.variants?.forEach((v, i) => { if (!v.name.trim()) err('Товары', L, `У варианта №${i + 1} нет названия`, href, p.id); });
    if (!isHex(p.art.c) || !isHex(p.art.ink)) warn('Товары', L, 'Цвета упаковки должны быть в формате #rrggbb', href, p.id);
  }

  /* brands, taxonomy */
  const dupB = dup(c.brands);
  c.brands.forEach((b) => {
    if (dupB.has(b.id)) err('Бренды', b.name, `Идентификатор «${b.id}» повторяется`, `/admin/brands/?id=${b.id}`, b.id);
    if (!ID_RE.test(b.id)) err('Бренды', b.name, 'Идентификатор — только латиница, цифры и дефис', `/admin/brands/?id=${b.id}`, b.id);
    if (!b.name.trim()) err('Бренды', b.id, 'Нет названия', `/admin/brands/?id=${b.id}`, b.id);
  });
  Object.entries(types).forEach(([k, t]) => {
    if (!cats.has(t.cat)) err('Типы продуктов', t.name, `Категория «${t.cat}» не найдена`, '/admin/categories/', k);
    if (!c.taxonomy.categories.some((cat) => cat.groups.some((g) => g.types.includes(k)))) warn('Типы продуктов', t.name, 'Тип не входит ни в одну группу меню', '/admin/categories/', k);
  });
  c.taxonomy.categories.forEach((cat) => cat.groups.forEach((g) => g.types.forEach((t) => { if (!types[t]) err('Категории', cat.name, `В группе «${g.name}» неизвестный тип «${t}»`, '/admin/categories/', cat.id); })));

  /* product references */
  const refList = (area: string, label: string, href: string, ids: string[]) => ids.forEach((id) => {
    const p = pid.get(id);
    if (!p) warn(area, label, `Товар «${id}» удалён — он не покажется`, href);
    else if (p.hidden) warn(area, label, `Товар «${p.name}» скрыт — он не покажется`, href);
  });
  c.heroSlides.forEach((s) => refList('Баннеры', mdText(s.title), `/admin/banners/?id=${s.id}`, s.products));
  c.promos.forEach((s) => refList('Акции', s.title, `/admin/promos/?id=${s.id}`, s.products));
  c.stories.forEach((s) => { refList('Истории', s.title, `/admin/stories/?id=${s.id}`, s.products); if (!s.products.length) warn('Истории', s.title, 'Нет товара — кнопка «Смотреть товар» не появится', `/admin/stories/?id=${s.id}`); if (!s.frames.length) err('Истории', s.title, 'Нет ни одного кадра', `/admin/stories/?id=${s.id}`); });
  c.collections.forEach((s) => refList('Подборки', s.title, `/admin/collections/?id=${s.id}`, s.art));
  c.bloggers.forEach((s) => { refList('Блогеры', s.name, `/admin/bloggers/?id=${s.id}`, s.products); if (!s.products.length) warn('Блогеры', s.name, 'В подборке нет товаров', `/admin/bloggers/?id=${s.id}`); });
  c.articles.forEach((s) => { refList('Журнал', s.title, `/admin/journal/?id=${s.id}`, [...s.art, ...s.products]); if (!s.body.trim()) warn('Журнал', s.title, 'Пустой текст статьи', `/admin/journal/?id=${s.id}`); });
  c.nav.megaPromos.forEach((s) => refList('Меню', s.title, '/admin/navigation/?tab=mega', s.products));
  c.home.sections.forEach((s) => {
    const label = ('title' in s && s.title ? mdText(s.title) : SECTION_NAMES[s.type]) || s.type;
    const href = `/admin/home/?id=${s.id}`;
    if (s.type === 'products') { refList('Главная', label, href, s.pinned); if (!(s.limit > 0)) err('Главная', label, 'Количество товаров должно быть больше нуля', href); }
    if (s.type === 'strip') refList('Главная', label, href, s.products);
    if (s.type === 'spotlight') { refList('Главная', label, href, s.art); if (!brands.has(s.brand)) err('Главная', 'Бренд в фокусе', `Бренд «${s.brand}» не найден`, href); }
  });
  const dupS = dup(c.home.sections);
  dupS.forEach((id) => err('Главная', id, `Якорь секции «${id}» повторяется`, '/admin/home/'));
  if (c.home.sections.some((s) => s.type === 'hero' && !s.hidden) && !c.heroSlides.some((s) => !s.hidden)) warn('Баннеры', 'Главная', 'Секция баннеров включена, но все баннеры скрыты', '/admin/banners/');

  /* links */
  const checkLink = (area: string, label: string, link: string, href: string) => {
    if (!link || link === '#giftcard' || /^(https?:\/\/|mailto:|tel:)/i.test(link)) return;
    if (!link.startsWith('/')) { err(area, label, `Ссылка «${link}» должна начинаться с / или https://`, href); return; }
    if (!KNOWN_ROUTES.test(link)) { warn(area, label, `Страницы «${link}» на сайте нет`, href); return; }
    const m = link.match(/^\/product\/([^/?#]+)/);
    if (m && !pid.get(decodeURIComponent(m[1]))) err(area, label, `Ссылка ведёт на удалённый товар «${m[1]}»`, href);
  };
  c.nav.header.forEach((n) => checkLink('Меню', n.label, n.href, '/admin/navigation/'));
  c.footer.columns.forEach((col) => col.links.forEach((l) => checkLink('Подвал', l.label, l.href, '/admin/navigation/?tab=footer')));
  c.homeCats.forEach((h) => checkLink('Плитки', h.name, h.href, '/admin/navigation/?tab=tiles'));
  c.heroSlides.forEach((s) => { if (!s.action) checkLink('Баннеры', mdText(s.title), s.link, `/admin/banners/?id=${s.id}`); });
  c.promos.forEach((s) => checkLink('Акции', s.title, s.link, `/admin/promos/?id=${s.id}`));
  c.collections.forEach((s) => checkLink('Подборки', s.title, s.href, `/admin/collections/?id=${s.id}`));

  /* settings */
  const st = c.settings;
  const href = '/admin/settings/';
  if (!st.name.trim()) err('Настройки', 'Название', 'Нет названия магазина', href);
  if (!st.currency.trim()) err('Настройки', 'Валюта', 'Не указана валюта', href);
  if (!st.cities.length) err('Настройки', 'Города', 'Нужен хотя бы один город', href);
  if (st.promo.tiers.some(([min, pct]) => !(min > 0) || !(pct > 0 && pct < 100))) err('Настройки', 'Промокод', 'Пороги промокода: сумма > 0, скидка от 1 до 99%', href);
  if (st.pageSize < 4 || st.pageSize > 60) warn('Настройки', 'Каталог', 'Товаров на странице — от 4 до 60', href);
  if (!isHex(c.theme.brand)) err('Оформление', 'Цвет бренда', 'Цвет — в формате #rrggbb', '/admin/appearance/');
  return out;
}
