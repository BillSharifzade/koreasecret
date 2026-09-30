/* Korea Secret — catalogue & content data. Edit products, prices and copy here. */
import type {
  Article, Brand, Category, Collection, Concern, HeroSlide, HomeCat, Ingredient, IngredientKey, Loc, Offer, Product,
  ProductType, Promo, Review, Skin, Store, Story, TypeInfo
} from './types';

export const CONFIG = {
  currency: '₽',
  freeShipping: 3000,
  giftFrom: 5000,
  deliveryFee: 390,
  promo: { code: 'SECRET', tiers: [[10000, 20], [6000, 15], [3000, 10]] as [number, number][] },
  phone: '8 800 123-45-67',
  phoneHref: 'tel:88001234567',
  cities: ['Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург', 'Новосибирск', 'Краснодар'],
  pageSize: 12
};

/* ---------- taxonomy ---------- */
export const TYPES: Record<ProductType, TypeInfo> = {
  cleansing_oil: { cat: 'face', ru: 'Гидрофильное масло', en: 'Cleansing oil', many: { ru: 'Гидрофильные масла', en: 'Cleansing oils' } },
  cleansing_balm: { cat: 'face', ru: 'Очищающий бальзам', en: 'Cleansing balm', many: { ru: 'Очищающие бальзамы', en: 'Cleansing balms' } },
  cleanser: { cat: 'face', ru: 'Пенка для умывания', en: 'Face cleanser', many: { ru: 'Пенки и гели', en: 'Foams & gels' } },
  toner: { cat: 'face', ru: 'Тонер для лица', en: 'Face toner', many: { ru: 'Тонеры', en: 'Toners' } },
  pads: { cat: 'face', ru: 'Тонер-пэды', en: 'Toner pads', many: { ru: 'Пэды', en: 'Toner pads' } },
  essence: { cat: 'face', ru: 'Эссенция для лица', en: 'Face essence', many: { ru: 'Эссенции', en: 'Essences' } },
  serum: { cat: 'face', ru: 'Сыворотка для лица', en: 'Face serum', many: { ru: 'Сыворотки', en: 'Serums' } },
  ampoule: { cat: 'face', ru: 'Ампула для лица', en: 'Face ampoule', many: { ru: 'Ампулы', en: 'Ampoules' } },
  eye: { cat: 'face', ru: 'Сыворотка для век', en: 'Eye serum', many: { ru: 'Уход для век', en: 'Eye care' } },
  cream: { cat: 'face', ru: 'Крем для лица', en: 'Face cream', many: { ru: 'Кремы для лица', en: 'Face creams' } },
  sleeping_mask: { cat: 'face', ru: 'Ночная маска', en: 'Sleeping mask', many: { ru: 'Ночные маски', en: 'Sleeping masks' } },
  sheet_mask: { cat: 'face', ru: 'Тканевая маска', en: 'Sheet mask', many: { ru: 'Тканевые маски', en: 'Sheet masks' } },
  lip_mask: { cat: 'face', ru: 'Маска для губ', en: 'Lip mask', many: { ru: 'Маски для губ', en: 'Lip masks' } },
  sunscreen: { cat: 'sun', ru: 'Солнцезащитный крем', en: 'Sunscreen', many: { ru: 'Солнцезащитные кремы', en: 'Sunscreens' } },
  cushion: { cat: 'makeup', ru: 'Кушон', en: 'Cushion foundation', many: { ru: 'Кушоны', en: 'Cushions' } },
  lip_tint: { cat: 'makeup', ru: 'Тинт для губ', en: 'Lip tint', many: { ru: 'Тинты для губ', en: 'Lip tints' } },
  body_cream: { cat: 'body', ru: 'Крем для тела', en: 'Body cream', many: { ru: 'Кремы для тела', en: 'Body creams' } },
  body_gel: { cat: 'body', ru: 'Гель для лица и тела', en: 'Face & body gel', many: { ru: 'Гели', en: 'Gels' } },
  shampoo: { cat: 'hair', ru: 'Шампунь', en: 'Shampoo', many: { ru: 'Шампуни', en: 'Shampoos' } },
  hair_mask: { cat: 'hair', ru: 'Маска для волос', en: 'Hair treatment', many: { ru: 'Маски и бальзамы', en: 'Masks & treatments' } },
  set: { cat: 'sets', ru: 'Набор', en: 'Gift set', many: { ru: 'Наборы', en: 'Gift sets' } },
  giftcard: { cat: 'sets', ru: 'Подарочная карта', en: 'Gift card', many: { ru: 'Подарочные карты', en: 'Gift cards' } }
};

export const CATS: Category[] = [
  { id: 'face', icon: 'drop', ru: 'Уход за лицом', en: 'Skincare', groups: [
    { ru: 'Очищение', en: 'Cleansing', types: ['cleansing_oil', 'cleansing_balm', 'cleanser'] },
    { ru: 'Тонизирование', en: 'Toning', types: ['toner', 'pads'] },
    { ru: 'Направленный уход', en: 'Treatments', types: ['essence', 'serum', 'ampoule', 'eye'] },
    { ru: 'Увлажнение и маски', en: 'Moisture & masks', types: ['cream', 'sleeping_mask', 'sheet_mask', 'lip_mask'] }
  ] },
  { id: 'sun', icon: 'sun', ru: 'Защита от солнца', en: 'Sun care', groups: [{ ru: 'SPF-средства', en: 'SPF', types: ['sunscreen'] }] },
  { id: 'makeup', icon: 'lipstick', ru: 'Макияж', en: 'Makeup', groups: [
    { ru: 'Лицо', en: 'Face', types: ['cushion'] },
    { ru: 'Губы', en: 'Lips', types: ['lip_tint'] }
  ] },
  { id: 'body', icon: 'body', ru: 'Тело', en: 'Body', groups: [{ ru: 'Уход за телом', en: 'Body care', types: ['body_cream', 'body_gel'] }] },
  { id: 'hair', icon: 'hair', ru: 'Волосы', en: 'Hair', groups: [{ ru: 'Уход за волосами', en: 'Hair care', types: ['shampoo', 'hair_mask'] }] },
  { id: 'sets', icon: 'gift', ru: 'Наборы и подарки', en: 'Sets & gifts', groups: [{ ru: 'Подарки', en: 'Gifts', types: ['set', 'giftcard'] }] }
];

export const SKINS: Record<Skin, Loc> = {
  all: { ru: 'Для всех типов', en: 'All skin types' },
  dry: { ru: 'Сухая', en: 'Dry' },
  oily: { ru: 'Жирная', en: 'Oily' },
  combo: { ru: 'Комбинированная', en: 'Combination' },
  sensitive: { ru: 'Чувствительная', en: 'Sensitive' },
  normal: { ru: 'Нормальная', en: 'Normal' }
};

export const CONCERNS: Record<Concern, Loc> = {
  hydration: { ru: 'Увлажнение', en: 'Hydration' },
  soothing: { ru: 'Успокоение', en: 'Soothing' },
  glow: { ru: 'Сияние и ровный тон', en: 'Glow & even tone' },
  antiage: { ru: 'Anti-age', en: 'Anti-age' },
  acne: { ru: 'Против несовершенств', en: 'Blemishes' },
  pores: { ru: 'Поры и текстура', en: 'Pores & texture' },
  barrier: { ru: 'Восстановление барьера', en: 'Barrier repair' },
  spf: { ru: 'Защита от солнца', en: 'Sun protection' },
  color: { ru: 'Макияж', en: 'Makeup' }
};

export const OFFERS: Record<Offer, Loc> = {
  sale: { ru: 'Скидки', en: 'On sale' },
  new: { ru: 'Новинки', en: 'New in' },
  hit: { ru: 'Хиты', en: 'Bestsellers' },
  excl: { ru: 'Только в Korea Secret', en: 'Only at Korea Secret' }
};

/* ---------- brands (tile style is purely typographic) ---------- */
export const BRANDS: Brand[] = [
  { id: 'cosrx', name: 'COSRX', style: 'caps' },
  { id: 'beauty-of-joseon', name: 'Beauty of Joseon', style: 'stack' },
  { id: 'anua', name: 'Anua', style: 'light' },
  { id: 'torriden', name: 'Torriden', style: 'wide' },
  { id: 'round-lab', name: 'Round Lab', style: 'serif' },
  { id: 'skin1004', name: 'SKIN1004', style: 'wide' },
  { id: 'medicube', name: 'medicube', style: 'bold' },
  { id: 'laneige', name: 'LANEIGE', style: 'wide' },
  { id: 'innisfree', name: 'innisfree', style: 'light' },
  { id: 'missha', name: 'MISSHA', style: 'caps' },
  { id: 'some-by-mi', name: 'SOME BY MI', style: 'caps' },
  { id: 'dr-jart', name: 'Dr.Jart+', style: 'bold' },
  { id: 'klairs', name: 'Klairs', style: 'italic' },
  { id: 'isntree', name: 'Isntree', style: 'light' },
  { id: 'mixsoon', name: 'mixsoon', style: 'italic' },
  { id: 'numbuzin', name: 'numbuzin', style: 'bold' },
  { id: 'romand', name: 'rom&nd', style: 'serif' },
  { id: 'peripera', name: 'PERIPERA', style: 'caps' },
  { id: 'clio', name: 'CLIO', style: 'wide' },
  { id: 'tirtir', name: 'TIRTIR', style: 'caps' },
  { id: 'etude', name: 'ETUDE', style: 'wide' },
  { id: 'heimish', name: 'heimish', style: 'italic' },
  { id: 'banila-co', name: 'banila co', style: 'light' },
  { id: 'im-from', name: "I'm from", style: 'serif' },
  { id: 'pyunkang-yul', name: 'Pyunkang Yul', style: 'stack' },
  { id: 'axis-y', name: 'AXIS-Y', style: 'wide' },
  { id: 'holika-holika', name: 'Holika Holika', style: 'italic' },
  { id: 'goodal', name: 'goodal', style: 'bold' },
  { id: 'manyo', name: 'ma:nyo', style: 'light' },
  { id: 'celimax', name: 'celimax', style: 'bold' },
  { id: 'abib', name: 'Abib', style: 'serif' },
  { id: 'mediheal', name: 'MEDIHEAL', style: 'caps' },
  { id: 'skinfood', name: 'SKINFOOD', style: 'caps' },
  { id: 'sulwhasoo', name: 'Sulwhasoo', style: 'serif' },
  { id: 'lador', name: "La'dor", style: 'italic' },
  { id: 'ryo', name: 'Ryo', style: 'serif' },
  { id: 'illiyoon', name: 'ILLIYOON', style: 'wide' },
  { id: 'korea-secret', name: 'Korea Secret', style: 'serif' }
];

/* ---------- ingredients (glyph + tint drive the generated artwork) ---------- */
export const INGREDIENTS: Record<IngredientKey, Ingredient> = {
  snail: { glyph: 'swirl', tint: '#e9dcc8', ru: 'Муцин улитки', en: 'Snail mucin', note: { ru: 'восстанавливает и увлажняет', en: 'repairs and hydrates' } },
  hyaluronic: { glyph: 'drop', tint: '#cfe3f6', ru: 'Гиалуроновая кислота', en: 'Hyaluronic acid', note: { ru: 'глубокое увлажнение', en: 'deep hydration' } },
  centella: { glyph: 'leaf', tint: '#d6ead0', ru: 'Центелла азиатская', en: 'Centella asiatica', note: { ru: 'успокаивает раздражения', en: 'calms irritation' } },
  niacinamide: { glyph: 'molecule', tint: '#ece0f6', ru: 'Ниацинамид', en: 'Niacinamide', note: { ru: 'выравнивает тон', en: 'evens skin tone' } },
  propolis: { glyph: 'honey', tint: '#f6e2b8', ru: 'Прополис', en: 'Propolis', note: { ru: 'питает и придаёт сияние', en: 'nourishes and adds glow' } },
  rice: { glyph: 'grain', tint: '#f1ece2', ru: 'Экстракт риса', en: 'Rice extract', note: { ru: 'смягчает и осветляет', en: 'softens and brightens' } },
  heartleaf: { glyph: 'leaf', tint: '#dcebd9', ru: 'Хауттюйния', en: 'Heartleaf', note: { ru: 'снимает покраснения', en: 'reduces redness' } },
  ceramides: { glyph: 'capsule', tint: '#f3e6dc', ru: 'Керамиды', en: 'Ceramides', note: { ru: 'укрепляют барьер', en: 'strengthen the barrier' } },
  green_tea: { glyph: 'leaf', tint: '#d4e8c8', ru: 'Зелёный чай', en: 'Green tea', note: { ru: 'антиоксидантная защита', en: 'antioxidant defence' } },
  vitamin_c: { glyph: 'citrus', tint: '#fbe3b3', ru: 'Витамин C', en: 'Vitamin C', note: { ru: 'сияние и тонус', en: 'radiance and tone' } },
  peptides: { glyph: 'molecule', tint: '#f6d8e4', ru: 'Пептиды', en: 'Peptides', note: { ru: 'упругость кожи', en: 'firmness' } },
  pdrn: { glyph: 'helix', tint: '#f8d3e4', ru: 'PDRN', en: 'PDRN', note: { ru: 'регенерация', en: 'renewal' } },
  collagen: { glyph: 'helix', tint: '#f6dde7', ru: 'Коллаген', en: 'Collagen', note: { ru: 'эластичность', en: 'elasticity' } },
  bha: { glyph: 'molecule', tint: '#dff0ea', ru: 'Салициловая кислота', en: 'Salicylic acid (BHA)', note: { ru: 'очищает поры', en: 'clears pores' } },
  aha: { glyph: 'citrus', tint: '#fde6c8', ru: 'AHA-кислоты', en: 'AHA acids', note: { ru: 'мягкий пилинг', en: 'gentle exfoliation' } },
  panthenol: { glyph: 'capsule', tint: '#f5ecd6', ru: 'Пантенол', en: 'Panthenol', note: { ru: 'заживляет', en: 'soothes and heals' } },
  probiotics: { glyph: 'dots', tint: '#e6e2f4', ru: 'Пробиотики', en: 'Probiotics', note: { ru: 'баланс микробиома', en: 'balances microbiome' } },
  tea_tree: { glyph: 'leaf', tint: '#d3ece4', ru: 'Чайное дерево', en: 'Tea tree', note: { ru: 'против воспалений', en: 'fights breakouts' } },
  aloe: { glyph: 'leaf', tint: '#d2ecc6', ru: 'Алоэ вера', en: 'Aloe vera', note: { ru: 'охлаждает и увлажняет', en: 'cools and hydrates' } },
  carrot: { glyph: 'citrus', tint: '#fcd9bd', ru: 'Каротин моркови', en: 'Carrot carotene', note: { ru: 'успокаивает', en: 'calms' } },
  ginseng: { glyph: 'root', tint: '#f1e1c6', ru: 'Женьшень', en: 'Ginseng', note: { ru: 'тонизирует', en: 'energises' } },
  galactomyces: { glyph: 'dots', tint: '#efe8da', ru: 'Галактомисис', en: 'Galactomyces', note: { ru: 'ровная текстура', en: 'smooth texture' } },
  bean: { glyph: 'grain', tint: '#efe4cc', ru: 'Ферментированные бобы', en: 'Fermented soybean', note: { ru: 'мягкое обновление', en: 'gentle renewal' } },
  noni: { glyph: 'citrus', tint: '#e5edc8', ru: 'Нони', en: 'Noni fruit', note: { ru: 'энергия кожи', en: 'skin energy' } },
  birch: { glyph: 'drop', tint: '#dcecf2', ru: 'Берёзовый сок', en: 'Birch sap', note: { ru: 'свежесть', en: 'freshness' } },
  retinal: { glyph: 'molecule', tint: '#f7e2cc', ru: 'Ретиналь', en: 'Retinal', note: { ru: 'разглаживает', en: 'smooths lines' } },
  keratin: { glyph: 'helix', tint: '#e8e1f4', ru: 'Кератин', en: 'Keratin', note: { ru: 'восстанавливает волосы', en: 'rebuilds hair' } },
  spf: { glyph: 'sun', tint: '#fde3c4', ru: 'Фотофильтры', en: 'UV filters', note: { ru: 'защита UVA/UVB', en: 'UVA/UVB defence' } },
  pigments: { glyph: 'dots', tint: '#f9d6dc', ru: 'Пигменты', en: 'Pigments', note: { ru: 'стойкий цвет', en: 'lasting colour' } }
};

/* ---------- how-to by product type ---------- */
const HOW_SERUM: Loc = { ru: 'Нанесите 2–3 капли на очищенную кожу после тонера, распределите и дождитесь впитывания. Затем — крем.', en: 'Apply 2–3 drops after toner, spread evenly and let it absorb before your moisturiser.' };
export const HOWTO: Record<ProductType, Loc> = {
  cleansing_oil: { ru: 'Нанесите 2–3 нажатия на сухую кожу и помассируйте 30–60 секунд. Добавьте немного воды, чтобы масло превратилось в эмульсию, и смойте. Завершите умывание мягкой пенкой.', en: 'Massage 2–3 pumps onto dry skin for 30–60 seconds. Add a little water to emulsify, rinse, then follow with a gentle cleanser.' },
  cleansing_balm: { ru: 'Возьмите шпателем небольшое количество, растопите в ладонях и помассируйте сухую кожу. Эмульгируйте водой и смойте.', en: 'Scoop a small amount, melt it between your palms and massage onto dry skin. Emulsify with water and rinse.' },
  cleanser: { ru: 'Вспеньте небольшое количество с водой, помассируйте влажную кожу и смойте тёплой водой. Подходит для утреннего и вечернего умывания.', en: 'Lather a small amount with water, massage onto damp skin and rinse with lukewarm water. Morning and evening.' },
  toner: { ru: 'После умывания нанесите на ладони или ватный диск и распределите по лицу лёгкими похлопываниями. Можно наслаивать 2–3 раза.', en: 'After cleansing, pat onto the face with palms or a cotton pad. Layer 2–3 times for extra hydration.' },
  pads: { ru: 'Протрите лицо гладкой стороной пэда, затем текстурированной — по зонам с расширенными порами. Не смывайте.', en: 'Wipe the face with the smooth side, then use the textured side on congested areas. No need to rinse.' },
  essence: { ru: 'После тонера распределите 2–3 капли по лицу и мягко вбейте в кожу похлопывающими движениями.', en: 'After toner, spread 2–3 drops over the face and pat gently until absorbed.' },
  serum: HOW_SERUM,
  ampoule: HOW_SERUM,
  eye: { ru: 'Небольшое количество нанесите безымянным пальцем по орбитальной косточке, похлопывая до полного впитывания.', en: 'Tap a small amount along the orbital bone with your ring finger until absorbed.' },
  cream: { ru: 'Завершающим шагом ухода распределите крем по лицу и шее массажными движениями утром и вечером.', en: 'As the last step of your routine, massage over face and neck morning and evening.' },
  sleeping_mask: { ru: 'Вечером последним шагом нанесите ровным слоем. Оставьте на ночь, утром умойтесь.', en: 'Apply an even layer as the last evening step. Leave on overnight and rinse in the morning.' },
  sheet_mask: { ru: 'После тонера наложите маску на 15–20 минут. Снимите и вбейте остатки эссенции в кожу.', en: 'After toner, apply the mask for 15–20 minutes. Remove and pat in the remaining essence.' },
  lip_mask: { ru: 'Нанесите на губы плотным слоем перед сном, утром удалите остатки салфеткой.', en: 'Apply a generous layer before bed and wipe off any excess in the morning.' },
  sunscreen: { ru: 'Последним шагом ухода нанесите за 15 минут до выхода на улицу. Обновляйте каждые 2–3 часа.', en: 'Apply as the final skincare step 15 minutes before going out. Reapply every 2–3 hours.' },
  cushion: { ru: 'Прижмите спонж к подушечке и нанесите тон похлопывающими движениями от центра лица к периферии.', en: 'Press the puff into the cushion and tap from the centre of the face outwards.' },
  lip_tint: { ru: 'Нанесите на центр губ и растушуйте пальцем для эффекта «зацелованных» губ или распределите по всей поверхности.', en: 'Dab onto the centre of the lips and blend with a fingertip for a soft gradient, or apply all over.' },
  body_cream: { ru: 'Нанесите на чистую кожу тела после душа, распределяя массажными движениями.', en: 'Massage onto clean skin after a shower.' },
  body_gel: { ru: 'Нанесите на лицо или тело тонким слоем. Для охлаждающего эффекта храните в холодильнике.', en: 'Apply a thin layer to face or body. Keep refrigerated for an extra cooling effect.' },
  shampoo: { ru: 'Нанесите на влажные волосы, вспеньте, помассируйте кожу головы 1–2 минуты и смойте.', en: 'Lather into wet hair, massage the scalp for 1–2 minutes and rinse.' },
  hair_mask: { ru: 'После шампуня распределите по длине волос, оставьте на 1–5 минут и тщательно смойте.', en: 'After shampooing, work through the lengths, leave for 1–5 minutes and rinse well.' },
  set: { ru: 'Используйте средства по порядку: очищение, тонер, сыворотка, крем. Подробная схема ухода — на открытке внутри набора.', en: 'Use in order: cleanse, tone, serum, cream. A step-by-step card is included in the box.' },
  giftcard: { ru: 'Карта действует 12 месяцев с момента покупки. Используйте её при оформлении заказа на сайте или в наших магазинах.', en: 'Valid for 12 months from purchase. Redeem online at checkout or in any of our stores.' }
};

/* ---------- products ---------- */
export const PRODUCTS: Product[] = [
  { id: 'cosrx-snail-essence', brand: 'cosrx', name: 'Advanced Snail 96 Mucin Power Essence', type: 'essence', price: 1890, old: 2290, rating: 4.9, reviews: 1243, volume: '100 мл', tags: ['hit'], stock: 42, skin: ['all', 'dry', 'sensitive'], concerns: ['hydration', 'barrier'], ingr: ['snail', 'hyaluronic', 'panthenol'],
    art: { shape: 'toner', c: '#ece5dc', cap: '#f8f5f0', ink: '#5a4a3a', big: '96', sub: 'SNAIL MUCIN ESSENCE' },
    desc: { ru: 'Легендарная эссенция с 96% муцина улитки. Тянущаяся текстура мгновенно впитывается, успокаивает покраснения и возвращает коже упругость и гладкость.', en: 'The cult essence with 96% snail mucin. Its stretchy texture sinks in instantly, calms redness and restores bounce and smoothness.' } },
  { id: 'cosrx-good-morning', brand: 'cosrx', name: 'Low pH Good Morning Gel Cleanser', type: 'cleanser', price: 990, rating: 4.7, reviews: 512, volume: '150 мл', tags: [], stock: 60, skin: ['oily', 'combo', 'sensitive'], concerns: ['acne', 'pores'], ingr: ['tea_tree', 'bha'],
    art: { shape: 'tube', c: '#e6f2e8', cap: '#5ea46e', ink: '#2f6b3f', big: 'pH 5', sub: 'GEL CLEANSER' },
    desc: { ru: 'Мягкий гель с низким pH и маслом чайного дерева. Очищает, не пересушивая, и поддерживает естественный кислотный баланс кожи.', en: 'A gentle low-pH gel with tea tree oil that cleanses without stripping and keeps the skin’s natural acid mantle intact.' } },
  { id: 'cosrx-snail-cream', brand: 'cosrx', name: 'Advanced Snail 92 All in One Cream', type: 'cream', price: 1990, rating: 4.8, reviews: 687, volume: '100 г', tags: [], stock: 25, skin: ['dry', 'normal', 'sensitive'], concerns: ['hydration', 'barrier'], ingr: ['snail', 'ceramides'],
    art: { shape: 'jar', c: '#f4f0ea', cap: '#e8dfd1', ink: '#5a4a3a', big: '92', sub: 'ALL IN ONE CREAM' },
    desc: { ru: 'Питательный гель-крем с 92% муцина улитки. Восстанавливает барьер после активов и дарит коже мягкость на весь день.', en: 'A nourishing gel-cream with 92% snail mucin that repairs the barrier after actives and keeps skin soft all day.' } },
  { id: 'boj-relief-sun', brand: 'beauty-of-joseon', name: 'Relief Sun: Rice + Probiotics SPF50+ PA++++', type: 'sunscreen', price: 1490, old: 1790, rating: 4.9, reviews: 2021, volume: '50 мл', tags: ['hit'], stock: 80, skin: ['all', 'dry', 'normal'], concerns: ['spf', 'hydration'], ingr: ['rice', 'probiotics', 'spf'],
    art: { shape: 'tube', c: '#f3ede0', cap: '#2e4a3c', ink: '#2e4a3c', big: 'SPF 50+', sub: 'RICE + PROBIOTICS', serif: true },
    desc: { ru: 'Лёгкий крем-санскрин на основе рисового экстракта. Не белит, не скатывается под макияжем и оставляет кожу увлажнённой.', en: 'A featherweight rice-based sunscreen that leaves no white cast, never pills under makeup and keeps skin comfortably hydrated.' } },
  { id: 'boj-glow-serum', brand: 'beauty-of-joseon', name: 'Glow Serum: Propolis + Niacinamide', type: 'serum', price: 1690, rating: 4.8, reviews: 842, volume: '30 мл', tags: [], stock: 33, skin: ['oily', 'combo', 'normal'], concerns: ['glow', 'acne'], ingr: ['propolis', 'niacinamide'],
    art: { shape: 'dropper', c: '#d8913a', glass: true, liquid: '#e9a94c', cap: '#f2ede3', label: '#f7f2e7', ink: '#5b3b1a', big: 'Glow', sub: 'PROPOLIS + NIACINAMIDE', serif: true },
    desc: { ru: 'Медовая сыворотка с 60% прополиса и 2% ниацинамида. Успокаивает воспаления и выравнивает тон, придавая коже тёплое сияние.', en: 'A honey-toned serum with 60% propolis and 2% niacinamide that calms breakouts and evens tone for a warm glow.' } },
  { id: 'boj-dynasty-cream', brand: 'beauty-of-joseon', name: 'Dynasty Cream', type: 'cream', price: 2190, rating: 4.8, reviews: 311, volume: '50 мл', tags: [], stock: 14, skin: ['dry', 'normal'], concerns: ['hydration', 'glow'], ingr: ['rice', 'ginseng'],
    art: { shape: 'jar', c: '#f6f0e4', cap: '#c9a96a', ink: '#6b4e23', big: 'Dynasty', sub: 'HANBANG CREAM', serif: true },
    desc: { ru: 'Насыщенный крем по рецептам ханбанг с рисовой водой и женьшенем. Питает и придаёт коже фарфоровое сияние без жирного блеска.', en: 'A rich hanbang cream with rice water and ginseng that nourishes and lends a porcelain glow without greasiness.' } },
  { id: 'boj-revive-eye', brand: 'beauty-of-joseon', name: 'Revive Eye Serum: Ginseng + Retinal', type: 'eye', price: 1590, rating: 4.8, reviews: 455, volume: '30 мл', tags: ['new'], stock: 20, skin: ['all'], concerns: ['antiage'], ingr: ['ginseng', 'retinal', 'peptides'],
    art: { shape: 'tube', c: '#efe4cf', cap: '#2e4a3c', ink: '#2e4a3c', big: 'Revive', sub: 'GINSENG + RETINAL', serif: true, slim: true },
    desc: { ru: 'Сыворотка для кожи вокруг глаз с женьшенем и мягким ретиналем. Разглаживает мимические морщинки и освежает взгляд.', en: 'An eye serum with ginseng and gentle retinal that softens fine lines and refreshes tired eyes.' } },
  { id: 'boj-green-plum-cleanser', brand: 'beauty-of-joseon', name: 'Green Plum Refreshing Cleanser', type: 'cleanser', price: 1290, rating: 4.7, reviews: 388, volume: '100 мл', tags: [], stock: 31, skin: ['all', 'combo'], concerns: ['pores'], ingr: ['aha', 'rice'],
    art: { shape: 'tube', c: '#e5efd8', cap: '#2e4a3c', ink: '#2e4a3c', big: 'Plum', sub: 'REFRESHING CLEANSER', serif: true },
    desc: { ru: 'Освежающий гель-пенка с экстрактом зелёной сливы. Бережно очищает поры и оставляет ощущение чистоты без стянутости.', en: 'A refreshing gel-foam with green plum that gently clears pores and leaves skin clean, never tight.' } },
  { id: 'boj-ginseng-water', brand: 'beauty-of-joseon', name: 'Ginseng Essence Water', type: 'toner', price: 1990, old: 2390, rating: 4.8, reviews: 276, volume: '150 мл', tags: [], stock: 18, skin: ['dry', 'normal'], concerns: ['antiage', 'hydration'], ingr: ['ginseng', 'niacinamide'],
    art: { shape: 'toner', c: '#f3e6cc', glass: true, liquid: '#f2ddb0', cap: '#c9a96a', ink: '#5b3b1a', big: 'Ginseng', sub: 'ESSENCE WATER', serif: true },
    desc: { ru: 'Тонер-эссенция с 80% воды женьшеня. Питает уставшую кожу, повышает упругость и готовит её к следующим шагам ухода.', en: 'A toner-essence with 80% ginseng water that revives tired skin, boosts firmness and preps for the next steps.' } },
  { id: 'roundlab-dokdo-toner', brand: 'round-lab', name: '1025 Dokdo Toner', type: 'toner', price: 1790, rating: 4.8, reviews: 955, volume: '200 мл', tags: [], stock: 40, skin: ['all', 'sensitive'], concerns: ['hydration', 'pores'], ingr: ['hyaluronic', 'panthenol'],
    art: { shape: 'toner', c: '#dbe9f3', glass: true, liquid: '#e9f2fa', cap: '#1f3a5f', ink: '#1f3a5f', big: '1025', sub: 'DOKDO TONER' },
    desc: { ru: 'Мягкий отшелушивающий тонер на глубоководной морской воде. Убирает ороговевшие частички и увлажняет даже чувствительную кожу.', en: 'A mild exfoliating toner with deep-sea water that lifts dull flakes and hydrates even sensitive skin.' } },
  { id: 'roundlab-birch-sun', brand: 'round-lab', name: 'Birch Juice Moisturizing Sunscreen SPF45', type: 'sunscreen', price: 1590, rating: 4.7, reviews: 402, volume: '50 мл', tags: [], stock: 22, skin: ['dry', 'normal'], concerns: ['spf', 'hydration'], ingr: ['birch', 'hyaluronic', 'spf'],
    art: { shape: 'tube', c: '#e8f3f7', cap: '#7fb6d0', ink: '#2e6a86', big: 'SPF 45', sub: 'BIRCH JUICE' },
    desc: { ru: 'Увлажняющий санскрин с берёзовым соком. Невесомо ложится, освежает и защищает от UVA/UVB-лучей в городе.', en: 'A hydrating sunscreen with birch sap that feels weightless, refreshes and shields from UVA/UVB in the city.' } },
  { id: 'anua-heartleaf-toner', brand: 'anua', name: 'Heartleaf 77% Soothing Toner', type: 'toner', price: 2190, old: 2590, rating: 4.8, reviews: 1320, volume: '250 мл', tags: ['hit'], stock: 55, skin: ['sensitive', 'oily', 'combo'], concerns: ['soothing', 'acne'], ingr: ['heartleaf', 'panthenol'],
    art: { shape: 'toner', c: '#e3efe2', glass: true, liquid: '#eef6ec', cap: '#ffffff', ink: '#3d6b45', big: '77%', sub: 'HEARTLEAF TONER' },
    desc: { ru: 'Успокаивающий тонер с 77% экстракта хауттюйнии. Снимает покраснения, балансирует жирность и делает кожу свежей и ровной.', en: 'A soothing toner with 77% heartleaf extract that reduces redness, balances oil and leaves skin fresh and even.' } },
  { id: 'anua-cleansing-oil', brand: 'anua', name: 'Heartleaf Pore Control Cleansing Oil', type: 'cleansing_oil', price: 2290, rating: 4.8, reviews: 744, volume: '200 мл', tags: [], stock: 29, skin: ['oily', 'combo'], concerns: ['pores'], ingr: ['heartleaf', 'bha'],
    art: { shape: 'pump', c: '#f2f0e4', glass: true, liquid: '#efe0ac', cap: '#ffffff', ink: '#3d6b45', big: 'Oil', sub: 'PORE CONTROL' },
    desc: { ru: 'Гидрофильное масло растворяет стойкий макияж, SPF и чёрные точки. Легко смывается и не оставляет плёнки.', en: 'A cleansing oil that melts long-wear makeup, SPF and blackheads, then rinses away without residue.' } },
  { id: 'torriden-dive-in-serum', brand: 'torriden', name: 'DIVE-IN Low Molecular Hyaluronic Acid Serum', type: 'serum', price: 1990, rating: 4.9, reviews: 1187, volume: '50 мл', tags: ['hit'], stock: 48, skin: ['all', 'dry', 'sensitive'], concerns: ['hydration'], ingr: ['hyaluronic', 'panthenol'],
    art: { shape: 'dropper', c: '#d3e5f6', glass: true, liquid: '#e6f1fb', cap: '#ffffff', label: '#ffffff', ink: '#2a5b8c', big: 'DIVE-IN', sub: 'HYALURONIC SERUM' },
    desc: { ru: 'Сыворотка с пятью видами низкомолекулярной гиалуроновой кислоты. Увлажняет в глубину и делает кожу плотной и «сочной».', en: 'Five types of low-molecular hyaluronic acid hydrate deep down for plump, juicy-looking skin.' } },
  { id: 'torriden-soothing-cream', brand: 'torriden', name: 'DIVE-IN Soothing Cream', type: 'cream', price: 2290, rating: 4.7, reviews: 366, volume: '100 мл', tags: [], stock: 16, skin: ['sensitive', 'combo'], concerns: ['soothing', 'hydration'], ingr: ['hyaluronic', 'centella'],
    art: { shape: 'jar', c: '#f1f6fb', cap: '#bfd9ee', ink: '#2a5b8c', big: 'DIVE-IN', sub: 'SOOTHING CREAM' },
    desc: { ru: 'Лёгкий гель-крем с гиалуроновой кислотой и центеллой. Охлаждает, успокаивает и надолго сохраняет увлажнение.', en: 'A light gel-cream with hyaluronic acid and centella that cools, calms and locks in moisture.' } },
  { id: 'skin1004-centella-ampoule', brand: 'skin1004', name: 'Madagascar Centella Ampoule', type: 'ampoule', price: 1890, rating: 4.8, reviews: 1540, volume: '100 мл', tags: ['hit'], stock: 37, skin: ['sensitive', 'all'], concerns: ['soothing', 'barrier'], ingr: ['centella'],
    art: { shape: 'dropper', c: '#efe9d9', glass: true, liquid: '#f4eac6', cap: '#e7dcc0', label: '#fbf8f0', ink: '#6a5a3a', big: 'CENTELLA', sub: 'MADAGASCAR' },
    desc: { ru: 'Ампула на 100% экстракте мадагаскарской центеллы. Мгновенно успокаивает раздражённую кожу и ускоряет её восстановление.', en: 'An ampoule made with 100% Madagascar centella extract that instantly calms irritated skin and speeds recovery.' } },
  { id: 'skin1004-sun-serum', brand: 'skin1004', name: 'Hyalu-Cica Water-Fit Sun Serum SPF50+', type: 'sunscreen', price: 1690, rating: 4.8, reviews: 1102, volume: '50 мл', tags: ['new'], stock: 44, skin: ['oily', 'combo', 'all'], concerns: ['spf', 'soothing'], ingr: ['centella', 'hyaluronic', 'spf'],
    art: { shape: 'tube', c: '#e5f1f3', cap: '#c6e0e5', ink: '#2f6a74', big: 'SPF 50+', sub: 'WATER-FIT SUN SERUM' },
    desc: { ru: 'Санскрин-сыворотка с водянистой текстурой. Быстро впитывается, не оставляет липкости и идеально подходит под макияж.', en: 'A watery sun serum that absorbs in seconds, leaves no stickiness and sits perfectly under makeup.' } },
  { id: 'medicube-zero-pad', brand: 'medicube', name: 'Zero Pore Pad 2.0', type: 'pads', price: 2390, old: 2990, rating: 4.7, reviews: 688, volume: '70 шт', tags: ['excl'], stock: 21, skin: ['oily', 'combo'], concerns: ['pores', 'acne'], ingr: ['aha', 'bha'],
    art: { shape: 'pads', c: '#d9e7f7', cap: '#ffffff', ink: '#2d5f9a', big: 'ZERO', sub: 'PORE PAD 2.0' },
    desc: { ru: 'Двусторонние пэды с AHA и BHA-кислотами. Сужают поры, выравнивают текстуру и контролируют жирный блеск.', en: 'Dual-sided pads with AHA and BHA that refine pores, smooth texture and keep shine in check.' } },
  { id: 'medicube-pdrn-serum', brand: 'medicube', name: 'PDRN Pink Peptide Serum', type: 'serum', price: 2890, rating: 4.8, reviews: 274, volume: '30 мл', tags: ['new', 'excl'], stock: 12, skin: ['all', 'dry'], concerns: ['antiage', 'glow'], ingr: ['pdrn', 'peptides', 'niacinamide'],
    art: { shape: 'dropper', c: '#f6c8da', glass: true, liquid: '#f3b1cb', cap: '#fbdde8', label: '#fff6fa', ink: '#b43f72', big: 'PDRN', sub: 'PINK PEPTIDE SERUM' },
    desc: { ru: 'Розовая сыворотка с PDRN и пептидами. Возвращает коже плотность и сияние, помогает ей восстанавливаться быстрее.', en: 'A pink serum with PDRN and peptides that restores density and radiance and helps skin bounce back faster.' } },
  { id: 'medicube-collagen-mask', brand: 'medicube', name: 'Collagen Night Wrapping Mask', type: 'sleeping_mask', price: 2490, rating: 4.6, reviews: 193, volume: '75 мл', tags: ['new'], stock: 9, skin: ['dry', 'normal'], concerns: ['antiage', 'hydration'], ingr: ['collagen', 'peptides'],
    art: { shape: 'tube', c: '#f7d3e0', cap: '#f2b7cd', ink: '#a83a68', big: 'COLLAGEN', sub: 'NIGHT WRAPPING MASK' },
    desc: { ru: 'Ночная маска-плёнка с коллагеном. Утром снимается одним движением и открывает гладкую, подтянутую кожу.', en: 'An overnight peel-off mask with collagen. Lift it off in the morning to reveal smooth, bouncy skin.' } },
  { id: 'laneige-lip-mask', brand: 'laneige', name: 'Lip Sleeping Mask Berry', type: 'lip_mask', price: 1790, rating: 4.9, reviews: 2310, volume: '20 г', tags: ['hit'], stock: 70, skin: ['all'], concerns: ['hydration'], ingr: ['vitamin_c', 'hyaluronic'],
    art: { shape: 'minijar', c: '#f28db2', cap: '#e8729f', ink: '#ffffff', big: 'LIP', sub: 'SLEEPING MASK' },
    desc: { ru: 'Ночная маска для губ с ягодным ароматом. За одну ночь делает губы мягкими, гладкими и заметно более пухлыми.', en: 'An overnight lip mask with a berry scent that leaves lips soft, smooth and visibly plumper by morning.' } },
  { id: 'laneige-water-bank', brand: 'laneige', name: 'Water Bank Blue Hyaluronic Cream', type: 'cream', price: 3490, rating: 4.7, reviews: 211, volume: '50 мл', tags: [], stock: 11, skin: ['dry', 'normal'], concerns: ['hydration'], ingr: ['hyaluronic', 'ceramides'],
    art: { shape: 'jar', c: '#cfe2f7', cap: '#8fb5e3', ink: '#23548f', big: 'Water Bank', sub: 'BLUE HYALURONIC' },
    desc: { ru: 'Увлажняющий крем с голубой гиалуроновой кислотой. Наполняет кожу влагой на 100 часов и укрепляет её барьер.', en: 'A moisturiser with blue hyaluronic acid that floods skin with 100-hour hydration and reinforces the barrier.' } },
  { id: 'innisfree-green-tea-serum', brand: 'innisfree', name: 'Green Tea Seed Hyaluronic Serum', type: 'serum', price: 2390, old: 2890, rating: 4.7, reviews: 512, volume: '80 мл', tags: [], stock: 27, skin: ['all', 'combo'], concerns: ['hydration'], ingr: ['green_tea', 'hyaluronic'],
    art: { shape: 'pump', c: '#bcdcae', glass: true, liquid: '#a9d494', cap: '#ffffff', label: '#ffffff', ink: '#2f5a2a', big: 'Green Tea', sub: 'SEED SERUM' },
    desc: { ru: 'Сыворотка с семенами зелёного чая с острова Чеджу. Насыщает кожу влагой и защищает её от стресса и сухости.', en: 'A serum with Jeju green tea seeds that floods skin with moisture and defends against stress and dryness.' } },
  { id: 'missha-fte', brand: 'missha', name: 'Time Revolution The First Treatment Essence RX', type: 'essence', price: 3190, rating: 4.8, reviews: 402, volume: '150 мл', tags: [], stock: 15, skin: ['all', 'normal'], concerns: ['glow', 'antiage'], ingr: ['galactomyces', 'niacinamide'],
    art: { shape: 'toner', c: '#ede5d4', glass: true, liquid: '#f5eddb', cap: '#c8a96b', ink: '#6a5530', big: 'First', sub: 'TREATMENT ESSENCE', serif: true },
    desc: { ru: 'Ферментированная эссенция с галактомисисом. Выравнивает тон, улучшает текстуру и делает кожу светящейся изнутри.', en: 'A fermented essence with galactomyces that evens tone, refines texture and makes skin glow from within.' } },
  { id: 'somebymi-miracle-toner', brand: 'some-by-mi', name: 'AHA BHA PHA 30 Days Miracle Toner', type: 'toner', price: 1390, old: 1790, rating: 4.6, reviews: 866, volume: '150 мл', tags: [], stock: 34, skin: ['oily', 'combo'], concerns: ['acne', 'pores'], ingr: ['aha', 'bha', 'tea_tree'],
    art: { shape: 'toner', c: '#dcefd4', cap: '#6bb36b', ink: '#2f6a2f', big: '30 DAYS', sub: 'MIRACLE TONER' },
    desc: { ru: 'Тонер с тремя видами кислот и чайным деревом. Бережно обновляет кожу и за 30 дней уменьшает количество высыпаний.', en: 'A toner with three acids and tea tree that gently resurfaces and visibly reduces breakouts within 30 days.' } },
  { id: 'drjart-cicapair', brand: 'dr-jart', name: 'Cicapair Tiger Grass Color Correcting Treatment', type: 'cream', price: 3890, rating: 4.7, reviews: 529, volume: '50 мл', tags: [], stock: 10, skin: ['sensitive'], concerns: ['soothing'], ingr: ['centella', 'spf'],
    art: { shape: 'jar', c: '#dbead6', cap: '#4e8b57', ink: '#2f5a36', big: 'Cicapair', sub: 'COLOR CORRECTING' },
    desc: { ru: 'Зелёный корректирующий крем с центеллой. Маскирует покраснения, успокаивает кожу и защищает её SPF.', en: 'A green colour-correcting cream with centella that masks redness, soothes skin and adds SPF protection.' } },
  { id: 'klairs-vitamin-drop', brand: 'klairs', name: 'Freshly Juiced Vitamin Drop', type: 'serum', price: 1990, rating: 4.6, reviews: 344, volume: '35 мл', tags: [], stock: 19, skin: ['all', 'sensitive'], concerns: ['glow'], ingr: ['vitamin_c', 'centella'],
    art: { shape: 'dropper', c: '#f2d27a', glass: true, liquid: '#f4c84f', cap: '#ffffff', label: '#ffffff', ink: '#7a5a12', big: 'Vitamin', sub: 'FRESHLY JUICED DROP' },
    desc: { ru: 'Мягкая сыворотка с 5% витамина C для чувствительной кожи. Осветляет пигментацию и дарит коже свежий, отдохнувший вид.', en: 'A gentle 5% vitamin C serum for sensitive skin that fades dark spots and gives a fresh, rested look.' } },
  { id: 'isntree-sun-gel', brand: 'isntree', name: 'Hyaluronic Acid Watery Sun Gel SPF50+', type: 'sunscreen', price: 1590, rating: 4.8, reviews: 733, volume: '50 мл', tags: [], stock: 36, skin: ['oily', 'combo', 'all'], concerns: ['spf', 'hydration'], ingr: ['hyaluronic', 'spf'],
    art: { shape: 'tube', c: '#e4f0fa', cap: '#ffffff', ink: '#2b6fa6', big: 'SPF 50+', sub: 'WATERY SUN GEL' },
    desc: { ru: 'Гелевый санскрин с гиалуроновой кислотой. Прозрачный, лёгкий и совсем не ощущается на коже.', en: 'A gel sunscreen with hyaluronic acid — clear, lightweight and practically invisible on skin.' } },
  { id: 'mixsoon-bean-essence', brand: 'mixsoon', name: 'Bean Essence', type: 'essence', price: 1990, rating: 4.8, reviews: 889, volume: '50 мл', tags: ['new'], stock: 23, skin: ['all', 'combo'], concerns: ['pores', 'glow'], ingr: ['bean'],
    art: { shape: 'dropper', c: '#eee4cf', glass: true, liquid: '#e7d6b1', cap: '#2b2b2b', label: '#ffffff', ink: '#2b2b2b', big: 'bean', sub: 'ESSENCE' },
    desc: { ru: 'Эссенция на ферментированных соевых бобах. Мягко обновляет кожу, сглаживает текстуру и придаёт стеклянное сияние.', en: 'A fermented soybean essence that gently renews, smooths texture and adds a glass-skin sheen.' } },
  { id: 'numbuzin-no3', brand: 'numbuzin', name: 'No.3 Skin Softening Serum', type: 'serum', price: 2290, rating: 4.7, reviews: 402, volume: '50 мл', tags: [], stock: 17, skin: ['dry', 'normal'], concerns: ['glow', 'pores'], ingr: ['galactomyces', 'niacinamide'],
    art: { shape: 'dropper', c: '#f2dbce', glass: true, liquid: '#efccb9', cap: '#e6c8b6', label: '#fff8f3', ink: '#8a4f37', big: 'No.3', sub: 'SKIN SOFTENING' },
    desc: { ru: 'Сыворотка с ферментами для «бархатной» кожи. Сглаживает рельеф и делает кожу мягкой, как шёлк.', en: 'A ferment-rich serum for velvety skin that refines texture and leaves it silky soft.' } },
  { id: 'numbuzin-no5', brand: 'numbuzin', name: 'No.5 Vitamin Concentrated Serum', type: 'serum', price: 2290, rating: 4.7, reviews: 291, volume: '50 мл', tags: ['new'], stock: 13, skin: ['all'], concerns: ['glow'], ingr: ['vitamin_c', 'niacinamide'],
    art: { shape: 'dropper', c: '#f6e3b4', glass: true, liquid: '#f2d27a', cap: '#f7e6c0', label: '#fffaf0', ink: '#8a6320', big: 'No.5', sub: 'VITAMIN SERUM' },
    desc: { ru: 'Витаминный концентрат для ровного тона. Осветляет постакне и возвращает тусклой коже сияние.', en: 'A vitamin concentrate that fades post-acne marks and brings back radiance to dull skin.' } },
  { id: 'romand-juicy-tint', brand: 'romand', name: 'Juicy Lasting Tint', type: 'lip_tint', price: 890, rating: 4.8, reviews: 1765, volume: '5.5 г', tags: ['hit'], stock: 90, skin: ['all'], concerns: ['color'], ingr: ['pigments'],
    variants: [{ name: '01 Pink Pumpkin', color: '#e0735d' }, { name: '06 Figfig', color: '#b84e5c' }, { name: '09 Litchi Coral', color: '#f08a7e' }, { name: '12 Cherry Bomb', color: '#c8283e' }, { name: '18 Mulled Peach', color: '#d9725f' }, { name: '23 Nucadamia', color: '#b7746a' }],
    art: { shape: 'lip', c: '#e0735d', cap: '#f3eee9', ink: '#9b3d2f' },
    desc: { ru: 'Сочный глянцевый тинт с эффектом «стеклянных» губ. Стойкий пигмент не сушит и не растекается.', en: 'A juicy, glossy tint for glass-like lips. Long-lasting pigment that never dries or feathers.' } },
  { id: 'peripera-ink-mood', brand: 'peripera', name: 'Ink Mood Glowy Tint', type: 'lip_tint', price: 790, old: 990, rating: 4.7, reviews: 642, volume: '4 г', tags: [], stock: 52, skin: ['all'], concerns: ['color'], ingr: ['pigments'],
    variants: [{ name: '01 Pinkish Show', color: '#e86d84' }, { name: '03 Coral Influencer', color: '#f07f6b' }, { name: '05 Rosy Taste', color: '#c9566b' }, { name: '08 Mauve Roll', color: '#b46479' }],
    art: { shape: 'lip', c: '#e86d84', cap: '#2a2a2e', ink: '#ffffff' },
    desc: { ru: 'Сияющий тинт с мягким финишем. Лёгкое покрытие создаёт эффект естественных, увлажнённых губ.', en: 'A glowy tint with a soft finish that gives a natural, hydrated-lip look.' } },
  { id: 'clio-kill-cover', brand: 'clio', name: 'Kill Cover Fixer Cushion', type: 'cushion', price: 2790, rating: 4.7, reviews: 512, volume: '15 г × 2', tags: [], stock: 24, skin: ['oily', 'combo'], concerns: ['color'], ingr: ['spf', 'pigments'],
    variants: [{ name: '02 Lingerie', color: '#f3d6c4' }, { name: '03 Linen', color: '#edcdb4' }, { name: '04 Ginger', color: '#e2bc9f' }],
    art: { shape: 'cushion', c: '#1e1e22', cap: '#caa56a', ink: '#ffffff', big: 'CLIO' },
    desc: { ru: 'Кушон с плотным стойким покрытием и SPF50+. Скрывает несовершенства и держится весь день без обновления.', en: 'A full-coverage, long-wear cushion with SPF50+ that hides imperfections and lasts all day.' } },
  { id: 'tirtir-red-cushion', brand: 'tirtir', name: 'Mask Fit Red Cushion', type: 'cushion', price: 2490, old: 2990, rating: 4.8, reviews: 1402, volume: '18 г', tags: ['hit'], stock: 38, skin: ['all', 'combo'], concerns: ['color'], ingr: ['spf', 'pigments'],
    variants: [{ name: '17C Porcelain', color: '#f4dccb' }, { name: '21N Ivory', color: '#edcfb7' }, { name: '23N Sand', color: '#e3c0a2' }],
    art: { shape: 'cushion', c: '#c8202e', cap: '#e8e8ea', ink: '#ffffff', big: 'TIRTIR' },
    desc: { ru: 'Культовый красный кушон с полуматовым финишем. Выравнивает тон, не забивает поры и не отпечатывается.', en: 'The iconic red cushion with a semi-matte finish that evens tone, stays breathable and doesn’t transfer.' } },
  { id: 'etude-soonjung-cream', brand: 'etude', name: 'SoonJung 2x Barrier Intensive Cream', type: 'cream', price: 1290, rating: 4.7, reviews: 505, volume: '60 мл', tags: [], stock: 30, skin: ['sensitive', 'dry'], concerns: ['barrier', 'soothing'], ingr: ['panthenol', 'ceramides'],
    art: { shape: 'tube', c: '#ffffff', cap: '#eef4f5', ink: '#3a8c8f', big: 'SoonJung', sub: 'BARRIER CREAM' },
    desc: { ru: 'Гипоаллергенный крем с пантенолом для реактивной кожи. Укрепляет барьер и снимает ощущение стянутости.', en: 'A hypoallergenic panthenol cream for reactive skin that reinforces the barrier and relieves tightness.' } },
  { id: 'heimish-clean-balm', brand: 'heimish', name: 'All Clean Balm', type: 'cleansing_balm', price: 1690, rating: 4.8, reviews: 699, volume: '120 мл', tags: [], stock: 20, skin: ['all', 'dry'], concerns: ['pores'], ingr: ['galactomyces'],
    art: { shape: 'jar', c: '#f3ece2', cap: '#d6c7b2', ink: '#6b5a45', big: 'heimish', sub: 'ALL CLEAN BALM', serif: true },
    desc: { ru: 'Бальзам-щербет для снятия макияжа. Превращается в масло при контакте с кожей и растворяет даже водостойкую тушь.', en: 'A sherbet balm that melts into oil on contact and dissolves even waterproof mascara.' } },
  { id: 'banila-clean-it-zero', brand: 'banila-co', name: 'Clean it Zero Cleansing Balm Original', type: 'cleansing_balm', price: 1890, old: 2290, rating: 4.8, reviews: 1213, volume: '100 мл', tags: ['hit'], stock: 45, skin: ['all'], concerns: ['pores'], ingr: ['vitamin_c'],
    art: { shape: 'jar', c: '#f7c5d7', cap: '#f1a8c3', ink: '#b03d6b', big: 'ZERO', sub: 'CLEANSING BALM' },
    desc: { ru: 'Самый известный очищающий бальзам Кореи. Мягко снимает макияж и SPF, оставляя кожу чистой и мягкой.', en: 'Korea’s most famous cleansing balm — melts away makeup and SPF and leaves skin soft and clean.' } },
  { id: 'imfrom-rice-toner', brand: 'im-from', name: 'Rice Toner', type: 'toner', price: 2090, rating: 4.8, reviews: 477, volume: '150 мл', tags: [], stock: 26, skin: ['dry', 'normal'], concerns: ['glow', 'hydration'], ingr: ['rice', 'niacinamide'],
    art: { shape: 'toner', c: '#f4f1eb', cap: '#d8c8a6', ink: '#4a4033', big: 'Rice', sub: 'TONER 77.78%', serif: true },
    desc: { ru: 'Молочный тонер с 77,78% рисового экстракта. Смягчает, выравнивает тон и дарит коже шелковистое сияние.', en: 'A milky toner with 77.78% rice extract that softens, evens tone and leaves a silky glow.' } },
  { id: 'pyunkang-essence-toner', brand: 'pyunkang-yul', name: 'Essence Toner', type: 'toner', price: 1490, rating: 4.7, reviews: 366, volume: '200 мл', tags: [], stock: 32, skin: ['dry', 'sensitive'], concerns: ['hydration', 'barrier'], ingr: ['panthenol'],
    art: { shape: 'toner', c: '#f2efe8', cap: '#c9b38a', ink: '#3a3a3a', big: 'Essence', sub: 'TONER', serif: true },
    desc: { ru: 'Минималистичный тонер-эссенция на корне астрагала. Питает сухую кожу всего из 7 ингредиентов.', en: 'A minimalist essence toner with milk vetch root that nourishes dry skin with just 7 ingredients.' } },
  { id: 'axisy-dark-spot', brand: 'axis-y', name: 'Dark Spot Correcting Glow Serum', type: 'serum', price: 1590, old: 1990, rating: 4.6, reviews: 344, volume: '50 мл', tags: [], stock: 28, skin: ['all', 'oily'], concerns: ['glow', 'acne'], ingr: ['niacinamide', 'rice'],
    art: { shape: 'pump', c: '#ffffff', cap: '#f4a93c', ink: '#e08a1e', big: 'Glow', sub: 'DARK SPOT SERUM' },
    desc: { ru: 'Сыворотка с 5% ниацинамида против пигментации. Осветляет следы постакне и выравнивает тон кожи.', en: 'A 5% niacinamide serum that fades post-acne marks and evens out skin tone.' } },
  { id: 'holika-aloe', brand: 'holika-holika', name: 'Aloe 99% Soothing Gel', type: 'body_gel', price: 790, rating: 4.6, reviews: 1402, volume: '250 мл', tags: [], stock: 64, skin: ['all'], concerns: ['soothing', 'hydration'], ingr: ['aloe'],
    art: { shape: 'jar', c: '#bfe3b2', cap: '#7cc36a', ink: '#2f6b2a', big: '99%', sub: 'ALOE GEL', tall: true },
    desc: { ru: 'Универсальный гель с 99% алоэ вера. Охлаждает кожу после солнца, увлажняет лицо, тело и волосы.', en: 'A multi-use gel with 99% aloe vera that cools after sun and hydrates face, body and hair.' } },
  { id: 'goodal-vita-c', brand: 'goodal', name: 'Green Tangerine Vita C Dark Spot Care Serum', type: 'serum', price: 2190, rating: 4.7, reviews: 322, volume: '40 мл', tags: [], stock: 15, skin: ['all'], concerns: ['glow'], ingr: ['vitamin_c', 'niacinamide'],
    art: { shape: 'dropper', c: '#dbeac5', glass: true, liquid: '#f2c14e', cap: '#ffffff', label: '#ffffff', ink: '#4e7a2a', big: 'Vita C', sub: 'GREEN TANGERINE' },
    desc: { ru: 'Сыворотка с экстрактом зелёного мандарина с Чеджу. Осветляет тусклую кожу и ослабляет пигментные пятна.', en: 'A serum with Jeju green tangerine that brightens dull skin and fades dark spots.' } },
  { id: 'manyo-cleansing-oil', brand: 'manyo', name: 'Pure Cleansing Oil', type: 'cleansing_oil', price: 1990, rating: 4.8, reviews: 588, volume: '200 мл', tags: [], stock: 22, skin: ['all', 'dry'], concerns: ['pores'], ingr: ['galactomyces'],
    art: { shape: 'pump', c: '#f6eed8', glass: true, liquid: '#f0dca0', cap: '#e8e0cd', ink: '#5a4a2f', big: 'Pure', sub: 'CLEANSING OIL', serif: true },
    desc: { ru: 'Гидрофильное масло на растительных маслах. Растворяет себум и макияж, не нарушая барьер кожи.', en: 'A plant-oil cleanser that dissolves sebum and makeup without disrupting the skin barrier.' } },
  { id: 'celimax-noni-ampoule', brand: 'celimax', name: 'The Real Noni Energy Ampoule', type: 'ampoule', price: 1690, rating: 4.6, reviews: 211, volume: '30 мл', tags: [], stock: 18, skin: ['dry', 'normal'], concerns: ['barrier', 'antiage'], ingr: ['noni', 'peptides'],
    art: { shape: 'dropper', c: '#e5eec8', glass: true, liquid: '#d8e5a6', cap: '#ffffff', label: '#ffffff', ink: '#56702a', big: 'Noni', sub: 'ENERGY AMPOULE' },
    desc: { ru: 'Ампула с экстрактом нони. Заряжает кожу энергией, восстанавливает и помогает бороться с первыми признаками старения.', en: 'A noni extract ampoule that energises, repairs and helps address early signs of ageing.' } },
  { id: 'abib-heartleaf-mask', brand: 'abib', name: 'Mild Acidic pH Sheet Mask Heartleaf Fit', type: 'sheet_mask', price: 290, rating: 4.8, reviews: 211, volume: '1 шт', tags: [], stock: 120, skin: ['sensitive', 'oily'], concerns: ['soothing'], ingr: ['heartleaf'],
    art: { shape: 'mask', c: '#dcefd7', ink: '#2f6b3f', big: 'Heartleaf', sub: 'SHEET MASK' },
    desc: { ru: 'Тканевая маска с хауттюйнией и слабокислым pH. Успокаивает кожу и снимает раздражения за 20 минут.', en: 'A mildly acidic sheet mask with heartleaf that calms skin and eases irritation in 20 minutes.' } },
  { id: 'mediheal-teatree-mask', brand: 'mediheal', name: 'Tea Tree Essential Mask', type: 'sheet_mask', price: 190, old: 250, rating: 4.6, reviews: 873, volume: '1 шт', tags: [], stock: 150, skin: ['oily', 'combo'], concerns: ['acne', 'soothing'], ingr: ['tea_tree'],
    art: { shape: 'mask', c: '#d6efe9', ink: '#1f6f5f', big: 'Tea Tree', sub: 'ESSENTIAL MASK' },
    desc: { ru: 'Маска с чайным деревом для проблемной кожи. Уменьшает воспаления и матирует кожу.', en: 'A tea tree mask for blemish-prone skin that reduces inflammation and mattifies.' } },
  { id: 'skinfood-carrot-pad', brand: 'skinfood', name: 'Carrot Carotene Calming Water Pad', type: 'pads', price: 1990, rating: 4.8, reviews: 411, volume: '60 шт', tags: ['new'], stock: 20, skin: ['sensitive', 'all'], concerns: ['soothing'], ingr: ['carrot', 'panthenol'],
    art: { shape: 'pads', c: '#fbd8b9', cap: '#f39a4b', ink: '#b2561a', big: 'Carrot', sub: 'WATER PAD' },
    desc: { ru: 'Успокаивающие пэды с каротином моркови. Отлично работают как 5-минутная маска для раздражённых участков.', en: 'Calming pads with carrot carotene — perfect as a 5-minute mask on irritated areas.' } },
  { id: 'sulwhasoo-first-care', brand: 'sulwhasoo', name: 'First Care Activating Serum', type: 'serum', price: 8990, rating: 4.9, reviews: 211, volume: '60 мл', tags: ['excl'], stock: 6, skin: ['all', 'dry'], concerns: ['antiage', 'glow'], ingr: ['ginseng', 'peptides'],
    art: { shape: 'pump', c: '#c68b39', glass: true, liquid: '#d49a45', cap: '#d9b26e', ink: '#ffffff', big: 'First Care', sub: 'ACTIVATING SERUM', serif: true },
    desc: { ru: 'Легендарная сыворотка-бустер на основе корейских трав. Первым шагом ухода усиливает действие всех следующих средств.', en: 'A legendary herbal booster serum — used as the first step, it amplifies everything that follows.' } },
  { id: 'lador-lpp', brand: 'lador', name: 'Perfect Hair Fill-Up', type: 'hair_mask', price: 1290, rating: 4.7, reviews: 366, volume: '150 мл', tags: [], stock: 24, skin: ['all'], concerns: ['barrier'], ingr: ['keratin', 'collagen'],
    art: { shape: 'tube', c: '#f3f0fa', cap: '#9a86c9', ink: '#5b4a91', big: 'Fill-Up', sub: 'HAIR TREATMENT' },
    desc: { ru: 'Филлер для волос с кератином и коллагеном. Заполняет повреждения и делает волосы гладкими и блестящими.', en: 'A hair filler with keratin and collagen that patches damage and leaves hair smooth and glossy.' } },
  { id: 'ryo-hair-shampoo', brand: 'ryo', name: 'Hair Loss Expert Care Shampoo', type: 'shampoo', price: 1690, rating: 4.7, reviews: 288, volume: '400 мл', tags: [], stock: 19, skin: ['all'], concerns: ['barrier'], ingr: ['ginseng'],
    art: { shape: 'pump', c: '#3a2f2c', cap: '#c9a96a', ink: '#e9d8b3', big: 'Ryo', sub: 'EXPERT CARE', serif: true, big2: true },
    desc: { ru: 'Шампунь с женьшенем для ослабленных волос. Укрепляет корни и очищает кожу головы, не пересушивая её.', en: 'A ginseng shampoo for weakened hair that strengthens roots and cleans the scalp without drying it.' } },
  { id: 'illiyoon-ceramide', brand: 'illiyoon', name: 'Ceramide Ato Concentrate Cream', type: 'body_cream', price: 1890, rating: 4.8, reviews: 402, volume: '200 мл', tags: [], stock: 33, skin: ['dry', 'sensitive'], concerns: ['barrier', 'hydration'], ingr: ['ceramides'],
    art: { shape: 'tube', c: '#f1f5fa', cap: '#ffffff', ink: '#2a63a8', big: 'Ceramide', sub: 'ATO CREAM' },
    desc: { ru: 'Плотный крем с керамидами для очень сухой кожи тела. Снимает зуд и стянутость, подходит всей семье.', en: 'A rich ceramide cream for very dry body skin that relieves itch and tightness — family-friendly.' } },
  { id: 'ks-glass-skin-set', brand: 'korea-secret', name: 'Glass Skin Ritual Set', type: 'set', price: 4990, old: 6490, rating: 4.9, reviews: 128, volume: '4 средства', tags: ['excl', 'hit'], stock: 14, skin: ['all'], concerns: ['glow', 'hydration'], ingr: ['hyaluronic', 'rice', 'niacinamide'],
    art: { shape: 'box', c: '#dd4487', cap: '#ffffff', ink: '#ffffff' },
    desc: { ru: 'Наш фирменный набор для эффекта «стеклянной кожи»: масло, тонер, сыворотка и крем в полноразмерных форматах. Упакован в подарочную коробку с бабочкой.', en: 'Our signature glass-skin kit: oil, toner, serum and cream in full sizes, packed in a butterfly gift box.' } },
  { id: 'ks-mini-routine', brand: 'korea-secret', name: 'Mini Routine Travel Set', type: 'set', price: 2990, rating: 4.8, reviews: 96, volume: '5 миниатюр', tags: ['excl', 'new'], stock: 30, skin: ['all'], concerns: ['hydration'], ingr: ['centella', 'hyaluronic'],
    art: { shape: 'box', c: '#ffffff', cap: '#dd4487', ink: '#dd4487' },
    desc: { ru: 'Пять миниатюр бестселлеров для путешествий и знакомства с корейским уходом. Всё, что нужно на 2 недели.', en: 'Five bestseller minis for travel or a first taste of K-beauty — everything you need for two weeks.' } },
  { id: 'ks-giftcard', brand: 'korea-secret', name: 'Gift Card', type: 'giftcard', price: 3000, rating: 5, reviews: 64, volume: '', tags: ['excl'], stock: 999, skin: ['all'], concerns: [], ingr: [],
    variants: [{ name: '3 000 ₽', price: 3000 }, { name: '5 000 ₽', price: 5000 }, { name: '10 000 ₽', price: 10000 }, { name: '15 000 ₽', price: 15000 }],
    art: { shape: 'giftcard', c: '#dd4487', ink: '#ffffff' },
    desc: { ru: 'Подарочная карта Korea Secret — идеальный подарок, когда хочется порадовать наверняка. Физическая или электронная, на любой номинал.', en: 'A Korea Secret gift card — the safe way to delight someone. Physical or digital, in any amount.' } }
];

/* ---------- reviews (sample content) ---------- */
export const REVIEW_POOL: Review[] = [
  { name: { ru: 'Марина К.', en: 'Marina K.' }, rating: 5, text: { ru: 'Пользуюсь третий месяц — кожа стала заметно ровнее и мягче, ушли шелушения на щеках. Текстура приятная, быстро впитывается, под макияж ложится идеально.', en: 'Third month of use — my skin is noticeably smoother and softer, the flaky patches on my cheeks are gone. Lovely texture, absorbs fast and sits perfectly under makeup.' }, pros: ['texture', 'effect'] },
  { name: { ru: 'Светлана М.', en: 'Svetlana M.' }, rating: 5, text: { ru: 'Просто восторг! Брала по совету подруги и не пожалела. Коллеги спрашивают, что я сделала с кожей — сияет как после отпуска.', en: 'Absolutely love it! Bought it on a friend’s advice and have zero regrets. Colleagues keep asking what I did to my skin — it glows like I’ve been on holiday.' }, pros: ['effect', 'glow'] },
  { name: { ru: 'Эльмира', en: 'Elmira' }, rating: 5, text: { ru: 'Отличное средство, эффект виден уже через неделю. Кожа упругая, ровная, покраснения стали гораздо меньше. Флакона хватает надолго.', en: 'Great product, results after one week. Skin is firmer and more even, and the redness has calmed down a lot. The bottle lasts ages.' }, pros: ['economy', 'effect'] },
  { name: { ru: 'Анна Л.', en: 'Anna L.' }, rating: 4, text: { ru: 'Хорошее средство, но аромат на любителя. По действию всё отлично: увлажняет и не забивает поры, сухость ушла.', en: 'Good product, though the scent is not for everyone. Performance is great: hydrates, doesn’t clog pores, dryness is gone.' }, pros: ['hydration'] },
  { name: { ru: 'Ольга В.', en: 'Olga V.' }, rating: 5, text: { ru: 'Покупаю уже четвёртый раз. Для моей чувствительной кожи это спасение — ни разу не было реакции, только комфорт.', en: 'Buying it for the fourth time. A lifesaver for my sensitive skin — never a single reaction, just comfort.' }, pros: ['sensitive'] },
  { name: { ru: 'Дарья', en: 'Daria' }, rating: 5, text: { ru: 'Заказывала с доставкой — пришло на следующий день, упаковано бережно, в подарок положили пробники. Средство классное, беру ещё!', en: 'Ordered for delivery — arrived the next day, carefully packed, with free samples inside. The product is fantastic, buying more!' }, pros: ['delivery'] },
  { name: { ru: 'Кристина Р.', en: 'Kristina R.' }, rating: 5, text: { ru: 'Лучшее, что я пробовала из этой категории. Лёгкое, не липкое, кожа после него как шёлк. Беру вторую баночку.', en: 'The best thing I’ve tried in this category. Light, not sticky, and my skin feels like silk afterwards. On my second one now.' }, pros: ['texture'] },
  { name: { ru: 'Юлия Т.', en: 'Yulia T.' }, rating: 4, text: { ru: 'Эффект хороший, но хотелось бы флакон побольше. В остальном только плюсы: поры меньше, тон ровнее.', en: 'Good results, though I wish the bottle were bigger. Otherwise only pluses: smaller pores and a more even tone.' }, pros: ['pores'] },
  { name: { ru: 'Екатерина', en: 'Ekaterina' }, rating: 5, text: { ru: 'Консультант в магазине на Петровке помогла подобрать уход — это попадание в сто процентов. Спасибо Korea Secret!', en: 'The consultant at the Petrovka store helped me build my routine — a perfect match. Thank you, Korea Secret!' }, pros: ['service'] },
  { name: { ru: 'Алёна Ш.', en: 'Alyona Sh.' }, rating: 5, text: { ru: 'Кожа после зимы была как пергамент, а сейчас — мягкая и увлажнённая. Наношу утром и вечером, очень экономично.', en: 'After winter my skin felt like parchment; now it’s soft and hydrated. I use it morning and night, very economical.' }, pros: ['hydration', 'economy'] },
  { name: { ru: 'Виктория', en: 'Victoria' }, rating: 5, text: { ru: 'Не ожидала такого результата за такие деньги. Высыпаний стало меньше, следы постакне бледнеют.', en: 'Didn’t expect results like this for the price. Fewer breakouts, and post-acne marks are fading.' }, pros: ['price', 'effect'] },
  { name: { ru: 'Ирина Н.', en: 'Irina N.' }, rating: 3, text: { ru: 'Мне не хватило увлажнения — кожа очень сухая. Но для жирной и комбинированной, думаю, будет идеально.', en: 'Not quite hydrating enough for my very dry skin. For oily or combination skin I think it would be perfect.' }, pros: [] },
  { name: { ru: 'Полина Г.', en: 'Polina G.' }, rating: 5, text: { ru: 'Упаковка — любовь, средство — тоже. Красиво смотрится на полке и реально работает.', en: 'In love with the packaging and the formula. Looks beautiful on the shelf and actually works.' }, pros: ['design'] },
  { name: { ru: 'Наталья', en: 'Natalia' }, rating: 5, text: { ru: 'Беру маме и себе. У мамы возрастная кожа, у меня комбинированная — обеим подошло, кожа сияет.', en: 'I buy it for my mum and myself. She has mature skin, mine is combination — it suits us both, skin glows.' }, pros: ['effect'] }
];

export const REVIEW_PROS: Record<string, Loc> = {
  texture: { ru: 'Текстура', en: 'Texture' }, effect: { ru: 'Заметный эффект', en: 'Visible results' }, glow: { ru: 'Сияние', en: 'Glow' },
  economy: { ru: 'Экономичный расход', en: 'Lasts long' }, hydration: { ru: 'Увлажнение', en: 'Hydration' }, sensitive: { ru: 'Для чувствительной кожи', en: 'Gentle' },
  delivery: { ru: 'Быстрая доставка', en: 'Fast delivery' }, pores: { ru: 'Поры', en: 'Pores' }, service: { ru: 'Консультация', en: 'Advice' },
  price: { ru: 'Цена', en: 'Price' }, design: { ru: 'Дизайн', en: 'Design' }
};

/* ---------- home page content ---------- */
export const PROMO_BAR: { ru: string; en: string; code?: string }[] = [
  { ru: 'Секретный промокод {code} — до −20% на заказ', en: 'Secret promo code {code} — up to 20% off', code: 'SECRET' },
  { ru: 'Бесплатная доставка от 3 000 ₽ по всей России', en: 'Free delivery on orders over 3 000 ₽' },
  { ru: 'Миниатюра в подарок к каждому заказу от 5 000 ₽', en: 'A free mini with every order over 5 000 ₽' }
];

export const HERO_SLIDES: HeroSlide[] = [
  { id: 'promo', bg: 'radial-gradient(60% 80% at 72% 42%, rgba(255,214,232,.75) 0%, rgba(255,214,232,0) 60%), radial-gradient(40% 50% at 10% 90%, rgba(160,60,150,.55) 0%, transparent 70%), linear-gradient(118deg, #f38bba 0%, #e05595 40%, #c1408c 70%, #8f3a8f 100%)',
    kicker: { ru: 'Korea Secret', en: 'Korea Secret' }, title: { ru: 'Твой <em>секретный</em> промокод', en: 'Your <em>secret</em> promo code' },
    text: { ru: 'до −20% на заказ по коду SECRET — только до конца октября', en: 'up to 20% off with code SECRET — until the end of October' },
    cta: { ru: 'Скопировать промокод', en: 'Copy the code' }, action: 'copy', link: '/catalog' },
  { id: 'glass', bg: 'radial-gradient(55% 70% at 70% 45%, rgba(236,120,180,.55) 0%, transparent 65%), radial-gradient(35% 45% at 88% 88%, rgba(120,70,180,.5) 0%, transparent 70%), linear-gradient(120deg, #1d0f1c 0%, #3e1636 45%, #6b2156 75%, #a2346f 100%)',
    kicker: { ru: 'Новинки сезона', en: 'New this season' }, title: { ru: 'Сияние <em>стеклянной</em> кожи', en: 'The <em>glass</em> skin glow' },
    text: { ru: 'PDRN, пептиды и ферменты — сыворотки, о которых говорит вся Корея', en: 'PDRN, peptides and ferments — the serums all of Korea is talking about' },
    cta: { ru: 'Смотреть новинки', en: 'Shop new in' }, link: '/catalog?offer=new' },
  { id: 'spf', bg: 'radial-gradient(40% 55% at 74% 34%, rgba(255,236,200,.95) 0%, rgba(255,236,200,0) 60%), radial-gradient(60% 70% at 20% 100%, rgba(221,68,135,.55) 0%, transparent 70%), linear-gradient(120deg, #ff9f8e 0%, #f9798f 40%, #ea5a8f 70%, #d24784 100%)',
    kicker: { ru: 'Сезон SPF', en: 'SPF season' }, title: { ru: 'Солнце <em>не</em> пройдёт', en: 'Sunshine, <em>handled</em>' },
    text: { ru: 'Лёгкие санскрины без белого следа — для города, отпуска и каждого дня', en: 'Featherweight sunscreens with zero white cast — for city, travel and every day' },
    cta: { ru: 'Выбрать SPF', en: 'Find your SPF' }, link: '/catalog?cat=sun' },
  { id: 'gifts', bg: 'radial-gradient(50% 60% at 72% 40%, rgba(255,255,255,.55) 0%, transparent 60%), radial-gradient(50% 60% at 0% 100%, rgba(140,70,170,.55) 0%, transparent 70%), linear-gradient(120deg, #c9a8f0 0%, #d98bd0 45%, #e0609f 80%, #dd4487 100%)',
    kicker: { ru: 'Только в Korea Secret', en: 'Only at Korea Secret' }, title: { ru: 'Подарки <em>со смыслом</em>', en: 'Gifts <em>that mean it</em>' },
    text: { ru: 'Фирменные наборы в коробке с бабочкой и подарочные карты на любой номинал', en: 'Signature sets in our butterfly box and gift cards in any amount' },
    cta: { ru: 'Собрать подарок', en: 'Build a gift' }, link: '/catalog?cat=sets' }
];

export const HOME_CATS: HomeCat[] = [
  { icon: 'sale', ru: 'Скидки', en: 'Sale', href: '/catalog?offer=sale' },
  { icon: 'bag', ru: 'Новинки', en: 'New in', href: '/catalog?offer=new' },
  { icon: 'dropper', ru: 'Сыворотки', en: 'Serums', href: '/catalog?type=serum,ampoule,essence' },
  { icon: 'sun', ru: 'SPF-защита', en: 'SPF', href: '/catalog?cat=sun' },
  { icon: 'jar', ru: 'Кремы', en: 'Creams', href: '/catalog?type=cream' },
  { icon: 'mask', ru: 'Маски', en: 'Masks', href: '/catalog?type=sheet_mask,sleeping_mask,lip_mask' },
  { icon: 'lipstick', ru: 'Макияж', en: 'Makeup', href: '/catalog?cat=makeup' },
  { icon: 'gift', ru: 'Наборы', en: 'Gift sets', href: '/catalog?cat=sets' }
];

export const STORIES: Story[] = [
  { id: 's1', palette: ['#f7c6d9', '#dd4487'], products: ['cosrx-snail-essence'], title: { ru: 'Эссенция: техника похлопываний', en: 'Essence: the patting technique' }, dur: '0:34',
    frames: [{ ru: 'Шаг 1. Нанесите 2–3 капли на ладони', en: 'Step 1. Warm 2–3 drops in your palms' }, { ru: 'Шаг 2. Прижмите ладони к лицу и мягко похлопайте', en: 'Step 2. Press onto your face and pat gently' }, { ru: 'Результат — мягкая, «сочная» кожа', en: 'The result: soft, bouncy skin' }] },
  { id: 's2', palette: ['#ffe3c7', '#f08a72'], products: ['boj-relief-sun'], title: { ru: 'Санскрин, который не белит', en: 'The sunscreen with no white cast' }, dur: '0:41',
    frames: [{ ru: 'Два пальца средства — ровно столько нужно для лица', en: 'Two finger-lengths — exactly enough for your face' }, { ru: 'Распределите лёгкими движениями без втирания', en: 'Spread with light strokes — no rubbing' }, { ru: 'Через 5 минут можно наносить макияж', en: 'Makeup can go on after 5 minutes' }] },
  { id: 's3', palette: ['#e7f0dc', '#6c9f5e'], products: ['anua-cleansing-oil', 'cosrx-good-morning'], title: { ru: 'Двойное очищение за 60 секунд', en: 'Double cleansing in 60 seconds' }, dur: '1:02',
    frames: [{ ru: 'Масло растворяет макияж и SPF', en: 'Oil melts makeup and SPF' }, { ru: 'Эмульгируйте водой и смойте', en: 'Emulsify with water and rinse' }, { ru: 'Гель с низким pH — финальный шаг', en: 'Finish with a low-pH gel' }] },
  { id: 's4', palette: ['#d9e9f8', '#4f86c6'], products: ['torriden-dive-in-serum'], title: { ru: 'Glass skin за три шага', en: 'Glass skin in three steps' }, dur: '0:52',
    frames: [{ ru: 'Тонер в 3 слоя для максимума влаги', en: 'Three layers of toner for maximum moisture' }, { ru: 'Гиалуроновая сыворотка на влажную кожу', en: 'Hyaluronic serum on damp skin' }, { ru: 'Запечатайте лёгким гель-кремом', en: 'Seal with a light gel-cream' }] },
  { id: 's5', palette: ['#ffd6db', '#c8283e'], products: ['romand-juicy-tint'], title: { ru: 'Шесть оттенков Juicy Tint на губах', en: 'Six Juicy Tint shades, swatched' }, dur: '0:28',
    frames: [{ ru: '01 Pink Pumpkin — тёплый персик', en: '01 Pink Pumpkin — warm peach' }, { ru: '12 Cherry Bomb — сочная вишня', en: '12 Cherry Bomb — juicy cherry' }, { ru: '06 Figfig — ягодный нюд', en: '06 Figfig — berry nude' }] },
  { id: 's6', palette: ['#fbd3e3', '#b43f72'], products: ['medicube-pdrn-serum'], title: { ru: 'PDRN: новый хит medicube', en: 'PDRN: medicube’s new hit' }, dur: '0:45',
    frames: [{ ru: 'PDRN — компонент для регенерации кожи', en: 'PDRN helps skin renew itself' }, { ru: 'Утром — сияние, вечером — восстановление', en: 'Glow by day, repair by night' }, { ru: 'Сочетайте с увлажняющим кремом', en: 'Pair with a hydrating cream' }] }
];

export const PROMOS: Promo[] = [
  { id: 'p1', theme: 'pink', title: { ru: 'До −20% по секретному промокоду', en: 'Up to 20% off with the secret code' }, date: { ru: 'до 31 октября', en: 'until October 31' }, link: '/catalog?offer=sale' },
  { id: 'p2', theme: 'peach', title: { ru: 'Санскрины SKIN1004 и Round Lab', en: 'SKIN1004 & Round Lab sunscreens' }, date: { ru: '1–15 октября', en: 'October 1–15' }, link: '/catalog?cat=sun' },
  { id: 'p3', theme: 'mint', dark: true, title: { ru: '3 = 2 на тканевые маски', en: '3 for 2 on sheet masks' }, date: { ru: 'весь октябрь', en: 'all October' }, link: '/catalog?type=sheet_mask' },
  { id: 'p4', theme: 'lilac', dark: true, title: { ru: 'Мини-набор в подарок от 5 000 ₽', en: 'A free mini set over 5 000 ₽' }, date: { ru: 'пока есть в наличии', en: 'while stocks last' }, link: '/catalog?cat=sets' }
];

export const EXPERT = {
  name: { ru: 'Алина Ким', en: 'Alina Kim' } as Loc,
  initials: { ru: 'АК', en: 'AK' } as Loc,
  role: { ru: 'косметолог-эстетист, 12 лет практики', en: 'aesthetic cosmetologist, 12 years in practice' } as Loc,
  quote: { ru: '«Корейский уход — это не десять шагов. Это три-четыре правильных средства под вашу кожу.»', en: '“K-beauty isn’t about ten steps. It’s three or four of the right products for your skin.”' } as Loc,
  products: ['anua-heartleaf-toner', 'torriden-dive-in-serum', 'boj-relief-sun', 'skin1004-centella-ampoule', 'cosrx-snail-cream', 'mixsoon-bean-essence', 'etude-soonjung-cream', 'medicube-pdrn-serum', 'roundlab-dokdo-toner', 'klairs-vitamin-drop', 'heimish-clean-balm', 'numbuzin-no3']
};

export const SPOTLIGHT = {
  brand: 'beauty-of-joseon',
  text: { ru: 'Рецепты ханбанг эпохи Чосон в современных формулах: рис, женьшень и прополис для спокойной сияющей кожи.', en: 'Joseon-era hanbang recipes in modern formulas: rice, ginseng and propolis for calm, luminous skin.' } as Loc,
  cta: { ru: 'К покупкам', en: 'Shop the brand' } as Loc
};

export const COLLECTIONS: Collection[] = [
  { id: 'gifts', theme: 'gift', title: { ru: 'Идеи подарков', en: 'Gift ideas' }, href: '/catalog?cat=sets', filter: (p) => TYPES[p.type].cat === 'sets' || p.tags.includes('hit') },
  { id: 'antiage', theme: 'antiage', title: { ru: 'Anti-age уход', en: 'Anti-age care' }, href: '/catalog?concern=antiage', filter: (p) => p.concerns.includes('antiage') }
];

export const ARTICLES: Article[] = [
  { id: 'a1', theme: 'routine', mins: 5, tag: { ru: '#гид по уходу', en: '#skincare guide' },
    title: { ru: 'Корейский уход за 5 минут: минимальная рутина, которая работает', en: 'Korean skincare in 5 minutes: a minimal routine that works' },
    body: { ru: ['Десятиступенчатый уход давно стал мемом, но корейские косметологи сегодня советуют обратное: меньше шагов, больше смысла. Базовая рутина укладывается в пять минут утром и вечером.', 'Утро: мягкое умывание гелем с низким pH, увлажняющий тонер, лёгкая сыворотка и обязательный SPF. Вечер: двойное очищение, тонер, активная сыворотка по задаче кожи и крем.', 'Главное правило — постоянство. Одна и та же рутина в течение 4–6 недель даст больше, чем бесконечная смена баночек.'],
      en: ['The ten-step routine has become a meme, and Korean cosmetologists now recommend the opposite: fewer steps, more intent. The basics fit into five minutes morning and night.', 'Morning: a gentle low-pH gel cleanse, a hydrating toner, a light serum and non-negotiable SPF. Evening: double cleanse, toner, a targeted serum and a moisturiser.', 'The golden rule is consistency. The same routine for 4–6 weeks beats an endless rotation of new jars.'] } },
  { id: 'a2', theme: 'pdrn', mins: 4, tag: { ru: '#азбука красоты', en: '#ingredient ABC' },
    title: { ru: 'PDRN: что это за компонент и почему о нём говорят все', en: 'PDRN: what it is and why everyone is talking about it' },
    body: { ru: ['PDRN — полидезоксирибонуклеотид, фрагменты ДНК, которые в клиниках используют для ускорения восстановления кожи. В уходовых средствах он помогает коже выглядеть плотнее и свежее.', 'Лучше всего PDRN работает в паре с пептидами и увлажняющими компонентами. Его можно использовать утром и вечером, он не повышает фоточувствительность.', 'Совет: вводите сыворотку с PDRN после курса кислот или ретиноидов — кожа восстановится быстрее.'],
      en: ['PDRN (polydeoxyribonucleotide) is made of DNA fragments that clinics use to speed up skin recovery. In skincare it helps skin look denser and fresher.', 'It works best alongside peptides and humectants, and it can be used morning and night without raising photosensitivity.', 'Tip: bring in a PDRN serum after a course of acids or retinoids to help skin bounce back faster.'] } },
  { id: 'a3', theme: 'spf', mins: 6, tag: { ru: '#разбор мифов', en: '#myth busting' },
    title: { ru: 'SPF круглый год: 7 мифов о солнцезащите', en: 'SPF all year round: 7 sunscreen myths' },
    body: { ru: ['Миф №1: зимой SPF не нужен. UVA-лучи, ответственные за фотостарение, одинаково активны в любое время года и проходят сквозь облака и стёкла.', 'Миф №2: SPF в тональном средстве достаточно. Чтобы получить заявленную защиту, пришлось бы нанести слой тона в пять раз толще обычного.', 'Корейские санскрины решили главную проблему — текстуру. Они лёгкие, не белят и отлично работают под макияж.'],
      en: ['Myth #1: you don’t need SPF in winter. UVA rays that drive photo-ageing are active all year and pass through clouds and glass.', 'Myth #2: SPF in foundation is enough. To get the labelled protection you’d need five times your usual amount.', 'Korean sunscreens solved the biggest problem — texture. They are light, leave no cast and layer beautifully under makeup.'] } },
  { id: 'a4', theme: 'oil', mins: 4, tag: { ru: '#гид по уходу', en: '#skincare guide' },
    title: { ru: 'Двойное очищение: как выбрать гидрофильное масло', en: 'Double cleansing: how to choose a cleansing oil' },
    body: { ru: ['Гидрофильное масло растворяет то, с чем не справляется вода: стойкий макияж, SPF и себум. Второй шаг — пенка — убирает остатки и готовит кожу к уходу.', 'Для жирной кожи выбирайте лёгкие масла с BHA, для сухой — формулы на растительных маслах. Бальзамы удобны в путешествиях и для водостойкого макияжа.', 'Главное — хорошо эмульгировать: добавьте воды и массируйте, пока масло не станет молочком.'],
      en: ['A cleansing oil dissolves what water can’t: long-wear makeup, SPF and sebum. Step two — a foam — clears the rest and preps skin for care.', 'Oily skin loves light oils with BHA; dry skin prefers plant-oil formulas. Balms are great for travel and waterproof makeup.', 'The key is emulsifying: add water and massage until the oil turns milky.'] } },
  { id: 'a5', theme: 'store', mins: 3, tag: { ru: '#новости магазина', en: '#store news' },
    title: { ru: 'Korea Secret открывает шоурум на Петровке', en: 'Korea Secret opens a showroom on Petrovka' },
    body: { ru: ['Новый шоурум — это 200 квадратных метров корейского ухода, зона диагностики кожи и бар тестеров, где можно попробовать всё.', 'Каждые выходные — бесплатные консультации косметологов и мастер-классы по корейскому уходу. Запись — через чат на сайте.', 'В день открытия всех гостей ждут подарочные мини-наборы и секретный промокод.'],
      en: ['The new showroom brings 200 square metres of K-beauty, a skin diagnostics corner and a tester bar where you can try everything.', 'Every weekend: free cosmetologist consultations and K-beauty masterclasses. Book via the chat on the website.', 'On opening day every guest gets a free mini set and a secret promo code.'] } }
];

export const STORES: Store[] = [
  { city: { ru: 'Москва', en: 'Moscow' }, addr: { ru: 'ул. Петровка, 15', en: '15 Petrovka St.' }, metro: { ru: 'Кузнецкий Мост', en: 'Kuznetsky Most' }, metroColor: '#8f479b', hours: '10:00–22:00' },
  { city: { ru: 'Москва', en: 'Moscow' }, addr: { ru: 'Кутузовский пр-т, 57', en: '57 Kutuzovsky Ave.' }, metro: { ru: 'Кутузовская', en: 'Kutuzovskaya' }, metroColor: '#0078c9', hours: '10:00–22:00' },
  { city: { ru: 'Санкт-Петербург', en: 'Saint Petersburg' }, addr: { ru: 'Невский пр-т, 88', en: '88 Nevsky Ave.' }, metro: { ru: 'Маяковская', en: 'Mayakovskaya' }, metroColor: '#e4474d', hours: '10:00–22:00' },
  { city: { ru: 'Казань', en: 'Kazan' }, addr: { ru: 'ул. Баумана, 51', en: '51 Baumana St.' }, metro: { ru: 'Площадь Тукая', en: 'Ploshchad Tukaya' }, metroColor: '#e4474d', hours: '10:00–21:00' }
];

export const SEO = {
  title: { ru: 'Интернет-магазин корейской косметики Korea Secret', en: 'Korea Secret — Korean cosmetics online store' } as Loc,
  html: {
    ru: '<p>Korea Secret — магазин оригинальной корейской косметики, где уход подбирают под кожу, а не под тренды. Мы работаем напрямую с брендами и дистрибьюторами из Сеула, поэтому в каталоге только сертифицированные средства со свежими сроками годности.</p><p>В ассортименте — более 40 брендов: от культовых COSRX, Anua и Beauty of Joseon до нишевых лабораторий, которые мы первыми привозим в Россию. Тонеры, эссенции, сыворотки, санскрины, кушоны и тинты — всё, что делает корейский уход таким узнаваемым.</p><h3>Почему выбирают нас</h3><p>Каждое средство проходит проверку подлинности, а наши консультанты помогут собрать рутину под ваш тип кожи — онлайн в чате или лично в шоурумах в Москве, Санкт-Петербурге и Казани.</p><p>Бесплатная доставка от 3 000 ₽, подарочные миниатюры к заказам и программа лояльности, где каждая покупка приближает к следующему секрету красоты.</p><h3>Как оформить заказ</h3><p>Добавьте товары в корзину, выберите способ доставки — курьер, пункт выдачи или самовывоз из магазина — и оплатите заказ онлайн или при получении. Заказы по Москве доставляем на следующий день.</p>',
    en: '<p>Korea Secret is a store of authentic Korean cosmetics where routines are built around your skin, not trends. We work directly with brands and distributors in Seoul, so every product is certified and freshly dated.</p><p>The range spans 40+ brands — from cult names like COSRX, Anua and Beauty of Joseon to niche labs we are first to bring over. Toners, essences, serums, sunscreens, cushions and tints: everything that makes K-beauty so recognisable.</p><h3>Why shop with us</h3><p>Every product is authenticity-checked, and our consultants will help you build a routine for your skin type — in our online chat or in person at our showrooms in Moscow, Saint Petersburg and Kazan.</p><p>Free delivery over 3 000 ₽, free minis with orders and a loyalty programme where every purchase brings you closer to the next beauty secret.</p><h3>How to order</h3><p>Add products to your bag, choose courier, pick-up point or store collection, and pay online or on delivery. Moscow orders arrive the next day.</p>'
  } as Loc
};
