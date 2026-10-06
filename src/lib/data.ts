/* Korea Secret — content runtime.
 *
 * All copy, products and settings live in content/site.json (edited in the admin panel at /admin). This module exposes
 * that document under the familiar names (PRODUCTS, CONFIG, HERO_SLIDES…). They are live ES-module bindings:
 * setContent() swaps the whole document at runtime (the admin's draft, the storefront preview) and every importer
 * reads the new values on its next render. Hidden items are filtered out here, so the storefront never sees them.
 */
import seed from '../../content/site.json';
import type {
  Article, Blogger, Brand, Category, Collection, Concern, HeroSlide, HomeCat, HomeSection, Ingredient, IngredientKey, MegaPromo, NavItem,
  Offer, PhotoCredit, Product, ProductType, Promo, PromoBar, Review, Settings, SiteContent, Skin, Store, Story, Texts, TypeInfo
} from './types';

export type { SiteContent };

export interface Config extends Settings { phoneHref: string }

let current = seed as unknown as SiteContent;
let showHidden = false;
let version = 0;
const hooks = new Set<() => void>();

export let CONFIG!: Config;
export let SETTINGS!: Settings;
export let TYPES!: Record<ProductType, TypeInfo>;
export let CATS!: Category[];
export let SKINS!: Record<Skin, string>;
export let CONCERNS!: Record<Concern, string>;
export let OFFERS!: Record<Offer, string>;
export let BRANDS!: Brand[];
export let INGREDIENTS!: Record<IngredientKey, Ingredient>;
/** products shown on the site */
export let PRODUCTS!: Product[];
export let REVIEW_POOL!: Review[];
export let REVIEW_PROS!: Record<string, string>;
export let PROMO_BAR!: PromoBar;
export let HERO_SLIDES!: HeroSlide[];
export let HOME_CATS!: HomeCat[];
export let HOME_SECTIONS!: HomeSection[];
export let STORIES!: Story[];
export let PROMOS!: Promo[];
export let BLOGGERS!: Blogger[];
export let COLLECTIONS!: Collection[];
export let ARTICLES!: Article[];
export let STORES!: Store[];
export let PHOTO_CREDITS!: PhotoCredit[];
export let NAV!: NavItem[];
export let SEARCH_CHIPS!: string[];
export let MEGA_PROMOS!: MegaPromo[];
export let FOOTER!: SiteContent['footer'];
export let SEO!: SiteContent['seo'];
export let TEXTS!: Texts;
export let THEME!: SiteContent['theme'];

const visible = <T extends { hidden?: boolean }>(list: T[]) => (showHidden ? list : list.filter((x) => !x.hidden));

function assign(c: SiteContent) {
  SETTINGS = c.settings;
  CONFIG = { ...c.settings, phoneHref: 'tel:+' + c.settings.phone.replace(/\D/g, '') };
  TYPES = c.taxonomy.types;
  CATS = c.taxonomy.categories;
  SKINS = c.taxonomy.skins;
  CONCERNS = c.taxonomy.concerns;
  OFFERS = c.taxonomy.offers;
  BRANDS = c.brands;
  INGREDIENTS = c.ingredients;
  PRODUCTS = visible(c.products);
  REVIEW_POOL = c.reviews.pool;
  REVIEW_PROS = c.reviews.pros;
  PROMO_BAR = c.promoBar;
  HERO_SLIDES = visible(c.heroSlides);
  HOME_CATS = c.homeCats;
  HOME_SECTIONS = visible(c.home.sections);
  STORIES = visible(c.stories);
  PROMOS = visible(c.promos);
  BLOGGERS = visible(c.bloggers);
  COLLECTIONS = visible(c.collections);
  ARTICLES = visible(c.articles);
  STORES = visible(c.stores);
  PHOTO_CREDITS = c.photoCredits;
  NAV = c.nav.header;
  SEARCH_CHIPS = c.nav.searchChips;
  MEGA_PROMOS = c.nav.megaPromos;
  FOOTER = c.footer;
  SEO = c.seo;
  TEXTS = c.texts;
  THEME = c.theme;
}
assign(current);

/** The document currently in use (published content, or a draft while previewing / in the admin). */
export const getContent = () => current;
/** The content this build was made from. */
export const publishedContent = () => seed as unknown as SiteContent;
export const contentVersion = () => version;

/** Swap the content at runtime. `showHidden` keeps hidden items (the admin previews everything). */
export function setContent(c: SiteContent, opts: { showHidden?: boolean } = {}) {
  current = c;
  showHidden = !!opts.showHidden;
  assign(c);
  version++;
  hooks.forEach((h) => h());
}

/** Runs after every content swap: derived caches (lookup maps, search index) and React subscriptions. */
export function onContent(fn: () => void) {
  hooks.add(fn);
  return () => { hooks.delete(fn); };
}

/** Fills {placeholders} in shop copy: {freeShipping}, {giftFrom}, {deliveryFee} (with currency), {code}, {phone}, {returnDays}, {name}. */
export function fill(text: string) {
  const money = (n: number) => `${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ${CONFIG.currency}`;
  const vars: Record<string, string> = {
    freeShipping: money(CONFIG.freeShipping), giftFrom: money(CONFIG.giftFrom), deliveryFee: money(CONFIG.deliveryFee),
    code: CONFIG.promo.code, phone: CONFIG.phone, returnDays: String(CONFIG.returnDays), name: CONFIG.name
  };
  return text.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m);
}
