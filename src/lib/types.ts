export type CatId = 'face' | 'sun' | 'makeup' | 'body' | 'hair' | 'sets';

export type ProductType =
  | 'cleansing_oil' | 'cleansing_balm' | 'cleanser' | 'toner' | 'pads' | 'essence' | 'serum' | 'ampoule' | 'eye'
  | 'cream' | 'sleeping_mask' | 'sheet_mask' | 'lip_mask' | 'sunscreen' | 'cushion' | 'lip_tint'
  | 'body_cream' | 'body_gel' | 'shampoo' | 'hair_mask' | 'set' | 'giftcard';

export type Skin = 'all' | 'dry' | 'oily' | 'combo' | 'sensitive' | 'normal';
export type Concern = 'hydration' | 'soothing' | 'glow' | 'antiage' | 'acne' | 'pores' | 'barrier' | 'spf' | 'color';
export type Offer = 'sale' | 'new' | 'hit' | 'excl';
export type Tag = 'hit' | 'new' | 'excl';

export type IngredientKey =
  | 'snail' | 'hyaluronic' | 'centella' | 'niacinamide' | 'propolis' | 'rice' | 'heartleaf' | 'ceramides' | 'green_tea'
  | 'vitamin_c' | 'peptides' | 'pdrn' | 'collagen' | 'bha' | 'aha' | 'panthenol' | 'probiotics' | 'tea_tree' | 'aloe'
  | 'carrot' | 'ginseng' | 'galactomyces' | 'bean' | 'noni' | 'birch' | 'retinal' | 'keratin' | 'spf' | 'pigments';

export type Glyph = 'drop' | 'leaf' | 'molecule' | 'grain' | 'honey' | 'citrus' | 'swirl' | 'capsule' | 'helix' | 'dots' | 'root' | 'sun';

export type Shape = 'tube' | 'pump' | 'dropper' | 'jar' | 'toner' | 'cushion' | 'lip' | 'pads' | 'mask' | 'box' | 'giftcard' | 'minijar';

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
}

export type BrandStyle = 'caps' | 'stack' | 'light' | 'wide' | 'serif' | 'bold' | 'italic';
export interface Brand { id: string; name: string; style: BrandStyle }

export interface TypeInfo { cat: CatId; name: string; many: string }
export interface CatGroup { name: string; types: ProductType[] }
export interface Category { id: CatId; icon: string; name: string; groups: CatGroup[] }
export interface Ingredient { glyph: Glyph; tint: string; name: string; note: string }

export interface Review { name: string; rating: number; text: string; pros: string[] }
export interface HeroSlide { id: 'promo' | 'glass' | 'spf' | 'gifts'; bg: string; /** forced ink; otherwise derived from the background colours */ tone?: Tone; kicker: string; title: string; text: string; cta: string; action?: 'copy'; link: string }
export type Tone = 'light' | 'dark';
export interface HomeCat { icon: string; name: string; href: string }
export interface Story { id: string; palette: [string, string]; products: string[]; title: string; dur: string; frames: string[] }
export interface Promo { id: string; theme: string; /** dark text on a pale card */ dark?: boolean; title: string; date: string; link: string }
export interface Article { id: string; theme: 'routine' | 'pdrn' | 'spf' | 'oil' | 'store'; mins: number; tag: string; title: string; body: string[] }
export interface Store { id: string; city: string; addr: string; area: string; note?: string; hours: string; lat: number; lon: number; photo: string }
export interface Collection { id: string; title: string; /** background palette, see art.ts THEMES */ theme: string; /** products drawn on the card */ art: string[]; href: string; filter: (p: Product) => boolean }
export type HairStyle = 'long' | 'bun' | 'wavy' | 'bob';
export interface BloggerLook { skin: string; hair: string; style: HairStyle; outfit: string; bg: [string, string]; accent: string }
export interface Blogger { id: string; name: string; /** genitive, for «Фавориты в уходе …» */ nameGen: string; about: string; look: BloggerLook; products: string[] }

export interface CartItem { id: string; v: number; q: number }
