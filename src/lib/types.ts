/* Content model. Everything the shop shows lives in one JSON document (content/site.json) of this shape:
   the storefront renders it, the admin panel (/admin) edits it and publishes it back to the repository. */

/* ---------- taxonomy (ids are editable in the admin, so they are plain strings) ---------- */
export type CatId = string;
export type ProductType = string;
export type Skin = string;
export type Concern = string;
export type IngredientKey = string;
export type Offer = 'sale' | 'new' | 'hit' | 'excl';
export type Tag = 'hit' | 'new' | 'excl';

export type Glyph = 'drop' | 'leaf' | 'molecule' | 'grain' | 'honey' | 'citrus' | 'swirl' | 'capsule' | 'helix' | 'dots' | 'root' | 'sun';
export type Shape = 'tube' | 'pump' | 'dropper' | 'jar' | 'toner' | 'cushion' | 'lip' | 'pads' | 'mask' | 'box' | 'giftcard' | 'minijar';
export type TextureKind = 'cream' | 'gel' | 'smear' | 'powder' | 'pad' | 'sheet' | 'drop';

/** Procedural packshot: the product is drawn, not photographed (unless it has `images`). */
export interface ArtSpec {
  shape: Shape;
  /** body colour */
  c: string;
  cap?: string;
  /** label text colour */
  ink: string;
  glass?: boolean;
  liquid?: string;
  label?: string;
  big?: string;
  sub?: string;
  serif?: boolean;
  slim?: boolean;
  tall?: boolean;
  big2?: boolean;
  bulb?: string;
}

export interface Variant { name: string; color?: string; price?: number }

export interface Product {
  id: string;
  brand: string;
  name: string;
  type: ProductType;
  price: number;
  old?: number;
  rating: number;
  reviews: number;
  volume: string;
  tags: Tag[];
  stock: number;
  skin: Skin[];
  concerns: Concern[];
  ingr: IngredientKey[];
  variants?: Variant[];
  art: ArtSpec;
  desc: string;
  /** uploaded photos (site paths like /uploads/x.webp); the first replaces the drawn packshot */
  images?: string[];
  /** article number; generated from the id when empty */
  sku?: string;
  /** kept in the catalogue data but not shown on the site */
  hidden?: boolean;
}

export type BrandStyle = 'caps' | 'stack' | 'light' | 'wide' | 'serif' | 'bold' | 'italic';
export interface Brand { id: string; name: string; style: BrandStyle; logo?: string; about?: string }

export interface TypeInfo {
  cat: CatId;
  name: string;
  many: string;
  /** «Применение» tab on the product page */
  howto?: string;
  /** extra search words */
  synonyms?: string;
  /** texture drawn on the «Текстура» gallery view */
  texture?: TextureKind;
}
export interface CatGroup { name: string; types: ProductType[] }
export interface Category { id: CatId; icon: string; name: string; groups: CatGroup[] }
export interface Ingredient { glyph: Glyph; tint: string; name: string; note: string }

export interface Review { name: string; rating: number; text: string; pros: string[] }

/* ---------- storefront building blocks ---------- */
export type Tone = 'light' | 'dark';
export type Theme = 'pink' | 'peach' | 'mint' | 'lilac' | 'rose' | 'cream' | 'blue' | 'plum';
export type Decor = 'orbs' | 'sun' | 'petals' | 'butterflies' | 'bubbles';

/** href: '/catalog?…', '/product/…', '/#section', 'https://…', '#giftcard' (opens the gift card dialog) or '' (not built yet) */
export interface Link { label: string; href: string }
export interface NavItem extends Link { accent?: boolean }
export interface Pill { big: string; small: string }

export type HeroArt = 'promo' | 'glass' | 'spf' | 'gifts' | 'none';
export interface HeroSlide {
  id: string;
  hidden?: boolean;
  /** CSS background (gradients) */
  bg: string;
  /** forced ink; otherwise derived from the background colours */
  tone?: Tone;
  kicker: string;
  /** *text* is set in italics */
  title: string;
  text: string;
  cta: string;
  /** 'copy' copies the promo code, 'giftcard' opens the gift card dialog; otherwise the button follows `link` */
  action?: 'copy' | 'giftcard';
  link: string;
  /** composition drawn on the right; products and pills fill it */
  art: HeroArt;
  products: string[];
  pills: Pill[];
  /** uploaded picture shown instead of the drawn composition */
  image?: string;
}

export interface HomeCat { id: string; icon: string; name: string; href: string; image?: string }
export interface Story { id: string; hidden?: boolean; palette: [string, string]; products: string[]; title: string; dur: string; frames: string[] }
export interface Promo { id: string; hidden?: boolean; theme: Theme; /** dark text on a pale card */ dark?: boolean; title: string; date: string; link: string; decor: Decor; products: string[]; image?: string }
export type ArticleTheme = 'routine' | 'pdrn' | 'spf' | 'oil' | 'store';
export interface Article {
  id: string;
  hidden?: boolean;
  theme: ArticleTheme;
  mins: number;
  tag: string;
  title: string;
  /** light markdown: paragraphs, ## headings, - lists, **bold**, *italic*, [links](…) */
  body: string;
  /** products drawn on the cover */
  art: string[];
  /** «Товары из статьи»: a catalogue query (e.g. cat=sun) … */
  query: string;
  /** … or a hand-picked list, which wins when not empty */
  products: string[];
  image?: string;
}
export interface Store { id: string; hidden?: boolean; city: string; addr: string; area: string; note?: string; hours: string; lat: number; lon: number; photo: string; map?: string; phone?: string }
export interface PhotoCredit { author: string; license: string; url: string }
export interface Collection { id: string; hidden?: boolean; title: string; theme: Theme; /** products drawn on the card */ art: string[]; /** catalogue link; its query also counts the products */ href: string; image?: string }
export interface Blogger { id: string; hidden?: boolean; name: string; /** genitive, for «Фавориты в уходе …» */ nameGen: string; about: string; /** pastel behind the profile */ tint: string; products: string[]; avatar?: string }
export interface MegaPromo { id: string; title: string; link: string; theme: Theme; products: string[]; image?: string }

/* ---------- home page builder ---------- */
export type Sort = 'default' | 'popular' | 'priceAsc' | 'priceDesc' | 'rating' | 'discount' | 'new';
interface SectionBase { id: string; hidden?: boolean }
export type HomeSection = SectionBase & (
  | { type: 'hero' }
  | { type: 'categories' }
  | { type: 'products'; title: string; link: string; /** catalogue query, e.g. offer=new&cat=face */ query: string; sort: Sort; limit: number; offset?: number; /** shown first, in this order */ pinned: string[]; /** top up with other products when the query finds fewer than `limit` */ fill?: boolean; layout: 'slider' | 'grid' }
  | { type: 'stories'; title: string }
  | { type: 'promos'; title: string; link: string }
  | { type: 'bloggers'; title: string }
  | { type: 'strip'; title: string; link: string; cta: string; products: string[]; image?: string }
  | { type: 'reviews'; title: string; minReviews: number; limit: number }
  | { type: 'journal'; title: string }
  | { type: 'spotlight'; brand: string; text: string; cta: string; /** products drawn on the banner */ art: string[]; image?: string }
  | { type: 'collections'; title: string }
  | { type: 'stores'; title: string }
  | { type: 'giftcards'; title: string; text: string; cta: string; amount: string; image?: string }
  | { type: 'brands'; title: string; link: string; limit: number }
  | { type: 'seo'; title: string; body: string }
);
export type SectionType = HomeSection['type'];

/* ---------- settings & texts ---------- */
export interface Settings {
  /** shop name used in titles and texts */
  name: string;
  currency: string;
  freeShipping: number;
  giftFrom: number;
  deliveryFee: number;
  promo: { code: string; tiers: [number, number][] };
  phone: string;
  hours: string;
  hoursNote: string;
  cities: string[];
  pageSize: number;
  returnDays: number;
  socials: { telegram: string; whatsapp: string; instagram: string; tiktok: string };
}
export interface Perk { icon: string; title: string; text: string }
export interface Option { id: string; title: string; note: string }
export interface Texts {
  chat: { title: string; status: string; greeting: string; fab: string };
  cookie: { text: string; linkLabel: string; href: string };
  perks: Perk[];
  checkout: { delivery: Option[]; payment: Option[]; success: string };
  account: { title: string; text: string };
  giftcard: { title: string; text: string };
  catalog: { subtitle: string; empty: string };
  notFound: { title: string; text: string };
}
export interface PromoBar { enabled: boolean; messages: { text: string; code?: string }[] }

export interface SiteContent {
  meta: { schema: 1; updatedAt: string };
  settings: Settings;
  theme: { brand: string };
  seo: { title: string; description: string; catalogTitle: string; catalogDescription: string };
  promoBar: PromoBar;
  nav: { header: NavItem[]; searchChips: string[]; megaPromos: MegaPromo[] };
  footer: { columns: { title: string; links: Link[] }[]; legal: Link[]; copyright: string; subscribe: string };
  home: { sections: HomeSection[] };
  heroSlides: HeroSlide[];
  homeCats: HomeCat[];
  stories: Story[];
  promos: Promo[];
  bloggers: Blogger[];
  collections: Collection[];
  articles: Article[];
  stores: Store[];
  photoCredits: PhotoCredit[];
  taxonomy: {
    categories: Category[];
    types: Record<ProductType, TypeInfo>;
    skins: Record<Skin, string>;
    concerns: Record<Concern, string>;
    offers: Record<Offer, string>;
  };
  brands: Brand[];
  ingredients: Record<IngredientKey, Ingredient>;
  products: Product[];
  reviews: { pool: Review[]; pros: Record<string, string> };
  texts: Texts;
}

export interface CartItem { id: string; v: number; q: number }
