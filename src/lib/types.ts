export type Lang = 'ru' | 'en';
export type Loc = { ru: string; en: string };
export type LocList = { ru: string[]; en: string[] };

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
  desc: Loc;
}

export type BrandStyle = 'caps' | 'stack' | 'light' | 'wide' | 'serif' | 'bold' | 'italic';
export interface Brand { id: string; name: string; style: BrandStyle }

export interface TypeInfo extends Loc { cat: CatId; many: Loc }
export interface CatGroup extends Loc { types: ProductType[] }
export interface Category extends Loc { id: CatId; icon: string; groups: CatGroup[] }
export interface Ingredient extends Loc { glyph: Glyph; tint: string; note: Loc }

export interface Review { name: Loc; rating: number; text: Loc; pros: string[] }
export interface HeroSlide { id: 'promo' | 'glass' | 'spf' | 'gifts'; bg: string; kicker: Loc; title: Loc; text: Loc; cta: Loc; action?: 'copy'; link: string }
export interface HomeCat extends Loc { icon: string; href: string }
export interface Story { id: string; palette: [string, string]; products: string[]; title: Loc; dur: string; frames: Loc[] }
export interface Promo { id: 'p1' | 'p2' | 'p3' | 'p4'; theme: string; dark?: boolean; title: Loc; date: Loc; link: string }
export interface Article { id: string; theme: 'routine' | 'pdrn' | 'spf' | 'oil' | 'store'; mins: number; tag: Loc; title: Loc; body: LocList }
export interface Store { city: Loc; addr: Loc; metro: Loc; metroColor: string; hours: string }
export interface Collection { id: string; theme: 'gift' | 'antiage'; title: Loc; href: string; filter: (p: Product) => boolean }

export interface CartItem { id: string; v: number; q: number }
