/* Korea Secret — catalogue & content data. Edit products, prices and copy here. */
import type {
  Article, Blogger, Brand, Category, Collection, Concern, HeroSlide, HomeCat, Ingredient, IngredientKey, Offer, Product,
  ProductType, Promo, Review, Skin, Store, Story, TypeInfo
} from './types';

export const CONFIG = {
  /** Tajik somoni */
  currency: 'смн',
  freeShipping: 350,
  giftFrom: 600,
  deliveryFee: 20,
  promo: { code: 'SECRET', tiers: [[1200, 20], [700, 15], [350, 10]] as [number, number][] },
  phone: '+992 44 600-60-60',
  phoneHref: 'tel:+992446006060',
  cities: ['Душанбе', 'Худжанд', 'Бохтар', 'Куляб', 'Истаравшан', 'Турсунзаде', 'Вахдат', 'Гиссар'],
  pageSize: 12
};

/* ---------- taxonomy ---------- */
export const TYPES: Record<ProductType, TypeInfo> = {
  cleansing_oil: { cat: 'face', name: 'Гидрофильное масло', many: 'Гидрофильные масла' },
  cleansing_balm: { cat: 'face', name: 'Очищающий бальзам', many: 'Очищающие бальзамы' },
  cleanser: { cat: 'face', name: 'Пенка для умывания', many: 'Пенки и гели' },
  toner: { cat: 'face', name: 'Тонер для лица', many: 'Тонеры' },
  pads: { cat: 'face', name: 'Тонер-пэды', many: 'Пэды' },
  essence: { cat: 'face', name: 'Эссенция для лица', many: 'Эссенции' },
  serum: { cat: 'face', name: 'Сыворотка для лица', many: 'Сыворотки' },
  ampoule: { cat: 'face', name: 'Ампула для лица', many: 'Ампулы' },
  eye: { cat: 'face', name: 'Сыворотка для век', many: 'Уход для век' },
  cream: { cat: 'face', name: 'Крем для лица', many: 'Кремы для лица' },
  sleeping_mask: { cat: 'face', name: 'Ночная маска', many: 'Ночные маски' },
  sheet_mask: { cat: 'face', name: 'Тканевая маска', many: 'Тканевые маски' },
  lip_mask: { cat: 'face', name: 'Маска для губ', many: 'Маски для губ' },
  sunscreen: { cat: 'sun', name: 'Солнцезащитный крем', many: 'Солнцезащитные кремы' },
  cushion: { cat: 'makeup', name: 'Кушон', many: 'Кушоны' },
  lip_tint: { cat: 'makeup', name: 'Тинт для губ', many: 'Тинты для губ' },
  body_cream: { cat: 'body', name: 'Крем для тела', many: 'Кремы для тела' },
  body_gel: { cat: 'body', name: 'Гель для лица и тела', many: 'Гели' },
  shampoo: { cat: 'hair', name: 'Шампунь', many: 'Шампуни' },
  hair_mask: { cat: 'hair', name: 'Маска для волос', many: 'Маски и бальзамы' },
  set: { cat: 'sets', name: 'Набор', many: 'Наборы' },
  giftcard: { cat: 'sets', name: 'Подарочная карта', many: 'Подарочные карты' }
};

export const CATS: Category[] = [
  { id: 'face', icon: 'drop', name: 'Уход за лицом', groups: [
    { name: 'Очищение', types: ['cleansing_oil', 'cleansing_balm', 'cleanser'] },
    { name: 'Тонизирование', types: ['toner', 'pads'] },
    { name: 'Направленный уход', types: ['essence', 'serum', 'ampoule', 'eye'] },
    { name: 'Увлажнение и маски', types: ['cream', 'sleeping_mask', 'sheet_mask', 'lip_mask'] }
  ] },
  { id: 'sun', icon: 'sun', name: 'Защита от солнца', groups: [{ name: 'SPF-средства', types: ['sunscreen'] }] },
  { id: 'makeup', icon: 'lipstick', name: 'Макияж', groups: [
    { name: 'Лицо', types: ['cushion'] },
    { name: 'Губы', types: ['lip_tint'] }
  ] },
  { id: 'body', icon: 'body', name: 'Тело', groups: [{ name: 'Уход за телом', types: ['body_cream', 'body_gel'] }] },
  { id: 'hair', icon: 'hair', name: 'Волосы', groups: [{ name: 'Уход за волосами', types: ['shampoo', 'hair_mask'] }] },
  { id: 'sets', icon: 'gift', name: 'Наборы и подарки', groups: [{ name: 'Подарки', types: ['set', 'giftcard'] }] }
];

export const SKINS: Record<Skin, string> = {
  all: 'Для всех типов',
  dry: 'Сухая',
  oily: 'Жирная',
  combo: 'Комбинированная',
  sensitive: 'Чувствительная',
  normal: 'Нормальная'
};

export const CONCERNS: Record<Concern, string> = {
  hydration: 'Увлажнение',
  soothing: 'Успокоение',
  glow: 'Сияние и ровный тон',
  antiage: 'Anti-age',
  acne: 'Против несовершенств',
  pores: 'Поры и текстура',
  barrier: 'Восстановление барьера',
  spf: 'Защита от солнца',
  color: 'Макияж'
};

export const OFFERS: Record<Offer, string> = {
  sale: 'Скидки',
  new: 'Новинки',
  hit: 'Хиты',
  excl: 'Только в Korea Secret'
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
  snail: { glyph: 'swirl', tint: '#e9dcc8', name: 'Муцин улитки', note: 'восстанавливает и увлажняет' },
  hyaluronic: { glyph: 'drop', tint: '#cfe3f6', name: 'Гиалуроновая кислота', note: 'глубокое увлажнение' },
  centella: { glyph: 'leaf', tint: '#d6ead0', name: 'Центелла азиатская', note: 'успокаивает раздражения' },
  niacinamide: { glyph: 'molecule', tint: '#ece0f6', name: 'Ниацинамид', note: 'выравнивает тон' },
  propolis: { glyph: 'honey', tint: '#f6e2b8', name: 'Прополис', note: 'питает и придаёт сияние' },
  rice: { glyph: 'grain', tint: '#f1ece2', name: 'Экстракт риса', note: 'смягчает и осветляет' },
  heartleaf: { glyph: 'leaf', tint: '#dcebd9', name: 'Хауттюйния', note: 'снимает покраснения' },
  ceramides: { glyph: 'capsule', tint: '#f3e6dc', name: 'Керамиды', note: 'укрепляют барьер' },
  green_tea: { glyph: 'leaf', tint: '#d4e8c8', name: 'Зелёный чай', note: 'антиоксидантная защита' },
  vitamin_c: { glyph: 'citrus', tint: '#fbe3b3', name: 'Витамин C', note: 'сияние и тонус' },
  peptides: { glyph: 'molecule', tint: '#f6d8e4', name: 'Пептиды', note: 'упругость кожи' },
  pdrn: { glyph: 'helix', tint: '#f8d3e4', name: 'PDRN', note: 'регенерация' },
  collagen: { glyph: 'helix', tint: '#f6dde7', name: 'Коллаген', note: 'эластичность' },
  bha: { glyph: 'molecule', tint: '#dff0ea', name: 'Салициловая кислота', note: 'очищает поры' },
  aha: { glyph: 'citrus', tint: '#fde6c8', name: 'AHA-кислоты', note: 'мягкий пилинг' },
  panthenol: { glyph: 'capsule', tint: '#f5ecd6', name: 'Пантенол', note: 'заживляет' },
  probiotics: { glyph: 'dots', tint: '#e6e2f4', name: 'Пробиотики', note: 'баланс микробиома' },
  tea_tree: { glyph: 'leaf', tint: '#d3ece4', name: 'Чайное дерево', note: 'против воспалений' },
  aloe: { glyph: 'leaf', tint: '#d2ecc6', name: 'Алоэ вера', note: 'охлаждает и увлажняет' },
  carrot: { glyph: 'citrus', tint: '#fcd9bd', name: 'Каротин моркови', note: 'успокаивает' },
  ginseng: { glyph: 'root', tint: '#f1e1c6', name: 'Женьшень', note: 'тонизирует' },
  galactomyces: { glyph: 'dots', tint: '#efe8da', name: 'Галактомисис', note: 'ровная текстура' },
  bean: { glyph: 'grain', tint: '#efe4cc', name: 'Ферментированные бобы', note: 'мягкое обновление' },
  noni: { glyph: 'citrus', tint: '#e5edc8', name: 'Нони', note: 'энергия кожи' },
  birch: { glyph: 'drop', tint: '#dcecf2', name: 'Берёзовый сок', note: 'свежесть' },
  retinal: { glyph: 'molecule', tint: '#f7e2cc', name: 'Ретиналь', note: 'разглаживает' },
  keratin: { glyph: 'helix', tint: '#e8e1f4', name: 'Кератин', note: 'восстанавливает волосы' },
  spf: { glyph: 'sun', tint: '#fde3c4', name: 'Фотофильтры', note: 'защита UVA/UVB' },
  pigments: { glyph: 'dots', tint: '#f9d6dc', name: 'Пигменты', note: 'стойкий цвет' }
};

/* ---------- how-to by product type ---------- */
const HOW_SERUM = 'Нанесите 2–3 капли на очищенную кожу после тонера, распределите и дождитесь впитывания. Затем — крем.';
export const HOWTO: Record<ProductType, string> = {
  cleansing_oil: 'Нанесите 2–3 нажатия на сухую кожу и помассируйте 30–60 секунд. Добавьте немного воды, чтобы масло превратилось в эмульсию, и смойте. Завершите умывание мягкой пенкой.',
  cleansing_balm: 'Возьмите шпателем небольшое количество, растопите в ладонях и помассируйте сухую кожу. Эмульгируйте водой и смойте.',
  cleanser: 'Вспеньте небольшое количество с водой, помассируйте влажную кожу и смойте тёплой водой. Подходит для утреннего и вечернего умывания.',
  toner: 'После умывания нанесите на ладони или ватный диск и распределите по лицу лёгкими похлопываниями. Можно наслаивать 2–3 раза.',
  pads: 'Протрите лицо гладкой стороной пэда, затем текстурированной — по зонам с расширенными порами. Не смывайте.',
  essence: 'После тонера распределите 2–3 капли по лицу и мягко вбейте в кожу похлопывающими движениями.',
  serum: HOW_SERUM,
  ampoule: HOW_SERUM,
  eye: 'Небольшое количество нанесите безымянным пальцем по орбитальной косточке, похлопывая до полного впитывания.',
  cream: 'Завершающим шагом ухода распределите крем по лицу и шее массажными движениями утром и вечером.',
  sleeping_mask: 'Вечером последним шагом нанесите ровным слоем. Оставьте на ночь, утром умойтесь.',
  sheet_mask: 'После тонера наложите маску на 15–20 минут. Снимите и вбейте остатки эссенции в кожу.',
  lip_mask: 'Нанесите на губы плотным слоем перед сном, утром удалите остатки салфеткой.',
  sunscreen: 'Последним шагом ухода нанесите за 15 минут до выхода на улицу. Обновляйте каждые 2–3 часа.',
  cushion: 'Прижмите спонж к подушечке и нанесите тон похлопывающими движениями от центра лица к периферии.',
  lip_tint: 'Нанесите на центр губ и растушуйте пальцем для эффекта «зацелованных» губ или распределите по всей поверхности.',
  body_cream: 'Нанесите на чистую кожу тела после душа, распределяя массажными движениями.',
  body_gel: 'Нанесите на лицо или тело тонким слоем. Для охлаждающего эффекта храните в холодильнике.',
  shampoo: 'Нанесите на влажные волосы, вспеньте, помассируйте кожу головы 1–2 минуты и смойте.',
  hair_mask: 'После шампуня распределите по длине волос, оставьте на 1–5 минут и тщательно смойте.',
  set: 'Используйте средства по порядку: очищение, тонер, сыворотка, крем. Подробная схема ухода — на открытке внутри набора.',
  giftcard: 'Карта действует 12 месяцев с момента покупки. Используйте её при оформлении заказа на сайте или в наших магазинах.'
};

/* ---------- products ---------- */
export const PRODUCTS: Product[] = [
  { id: 'cosrx-snail-essence', brand: 'cosrx', name: 'Advanced Snail 96 Mucin Power Essence', type: 'essence', price: 219, old: 259, rating: 4.9, reviews: 1243, volume: '100 мл', tags: ['hit'], stock: 42, skin: ['all', 'dry', 'sensitive'], concerns: ['hydration', 'barrier'], ingr: ['snail', 'hyaluronic', 'panthenol'],
    art: { shape: 'toner', c: '#ece5dc', cap: '#f8f5f0', ink: '#5a4a3a', big: '96', sub: 'SNAIL MUCIN ESSENCE' },
    desc: 'Легендарная эссенция с 96% муцина улитки. Тянущаяся текстура мгновенно впитывается, успокаивает покраснения и возвращает коже упругость и гладкость.' },
  { id: 'cosrx-good-morning', brand: 'cosrx', name: 'Low pH Good Morning Gel Cleanser', type: 'cleanser', price: 109, rating: 4.7, reviews: 512, volume: '150 мл', tags: [], stock: 60, skin: ['oily', 'combo', 'sensitive'], concerns: ['acne', 'pores'], ingr: ['tea_tree', 'bha'],
    art: { shape: 'tube', c: '#e6f2e8', cap: '#5ea46e', ink: '#2f6b3f', big: 'pH 5', sub: 'GEL CLEANSER' },
    desc: 'Мягкий гель с низким pH и маслом чайного дерева. Очищает, не пересушивая, и поддерживает естественный кислотный баланс кожи.' },
  { id: 'cosrx-snail-cream', brand: 'cosrx', name: 'Advanced Snail 92 All in One Cream', type: 'cream', price: 229, rating: 4.8, reviews: 687, volume: '100 г', tags: [], stock: 25, skin: ['dry', 'normal', 'sensitive'], concerns: ['hydration', 'barrier'], ingr: ['snail', 'ceramides'],
    art: { shape: 'jar', c: '#f4f0ea', cap: '#e8dfd1', ink: '#5a4a3a', big: '92', sub: 'ALL IN ONE CREAM' },
    desc: 'Питательный гель-крем с 92% муцина улитки. Восстанавливает барьер после активов и дарит коже мягкость на весь день.' },
  { id: 'boj-relief-sun', brand: 'beauty-of-joseon', name: 'Relief Sun: Rice + Probiotics SPF50+ PA++++', type: 'sunscreen', price: 169, old: 209, rating: 4.9, reviews: 2021, volume: '50 мл', tags: ['hit'], stock: 80, skin: ['all', 'dry', 'normal'], concerns: ['spf', 'hydration'], ingr: ['rice', 'probiotics', 'spf'],
    art: { shape: 'tube', c: '#f3ede0', cap: '#2e4a3c', ink: '#2e4a3c', big: 'SPF 50+', sub: 'RICE + PROBIOTICS', serif: true },
    desc: 'Лёгкий крем-санскрин на основе рисового экстракта. Не белит, не скатывается под макияжем и оставляет кожу увлажнённой.' },
  { id: 'boj-glow-serum', brand: 'beauty-of-joseon', name: 'Glow Serum: Propolis + Niacinamide', type: 'serum', price: 199, rating: 4.8, reviews: 842, volume: '30 мл', tags: [], stock: 33, skin: ['oily', 'combo', 'normal'], concerns: ['glow', 'acne'], ingr: ['propolis', 'niacinamide'],
    art: { shape: 'dropper', c: '#d8913a', glass: true, liquid: '#e9a94c', cap: '#f2ede3', label: '#f7f2e7', ink: '#5b3b1a', big: 'Glow', sub: 'PROPOLIS + NIACINAMIDE', serif: true },
    desc: 'Медовая сыворотка с 60% прополиса и 2% ниацинамида. Успокаивает воспаления и выравнивает тон, придавая коже тёплое сияние.' },
  { id: 'boj-dynasty-cream', brand: 'beauty-of-joseon', name: 'Dynasty Cream', type: 'cream', price: 249, rating: 4.8, reviews: 311, volume: '50 мл', tags: [], stock: 14, skin: ['dry', 'normal'], concerns: ['hydration', 'glow'], ingr: ['rice', 'ginseng'],
    art: { shape: 'jar', c: '#f6f0e4', cap: '#c9a96a', ink: '#6b4e23', big: 'Dynasty', sub: 'HANBANG CREAM', serif: true },
    desc: 'Насыщенный крем по рецептам ханбанг с рисовой водой и женьшенем. Питает и придаёт коже фарфоровое сияние без жирного блеска.' },
  { id: 'boj-revive-eye', brand: 'beauty-of-joseon', name: 'Revive Eye Serum: Ginseng + Retinal', type: 'eye', price: 179, rating: 4.8, reviews: 455, volume: '30 мл', tags: ['new'], stock: 20, skin: ['all'], concerns: ['antiage'], ingr: ['ginseng', 'retinal', 'peptides'],
    art: { shape: 'tube', c: '#efe4cf', cap: '#2e4a3c', ink: '#2e4a3c', big: 'Revive', sub: 'GINSENG + RETINAL', serif: true, slim: true },
    desc: 'Сыворотка для кожи вокруг глаз с женьшенем и мягким ретиналем. Разглаживает мимические морщинки и освежает взгляд.' },
  { id: 'boj-green-plum-cleanser', brand: 'beauty-of-joseon', name: 'Green Plum Refreshing Cleanser', type: 'cleanser', price: 149, rating: 4.7, reviews: 388, volume: '100 мл', tags: [], stock: 31, skin: ['all', 'combo'], concerns: ['pores'], ingr: ['aha', 'rice'],
    art: { shape: 'tube', c: '#e5efd8', cap: '#2e4a3c', ink: '#2e4a3c', big: 'Plum', sub: 'REFRESHING CLEANSER', serif: true },
    desc: 'Освежающий гель-пенка с экстрактом зелёной сливы. Бережно очищает поры и оставляет ощущение чистоты без стянутости.' },
  { id: 'boj-ginseng-water', brand: 'beauty-of-joseon', name: 'Ginseng Essence Water', type: 'toner', price: 229, old: 279, rating: 4.8, reviews: 276, volume: '150 мл', tags: [], stock: 18, skin: ['dry', 'normal'], concerns: ['antiage', 'hydration'], ingr: ['ginseng', 'niacinamide'],
    art: { shape: 'toner', c: '#f3e6cc', glass: true, liquid: '#f2ddb0', cap: '#c9a96a', ink: '#5b3b1a', big: 'Ginseng', sub: 'ESSENCE WATER', serif: true },
    desc: 'Тонер-эссенция с 80% воды женьшеня. Питает уставшую кожу, повышает упругость и готовит её к следующим шагам ухода.' },
  { id: 'roundlab-dokdo-toner', brand: 'round-lab', name: '1025 Dokdo Toner', type: 'toner', price: 209, rating: 4.8, reviews: 955, volume: '200 мл', tags: [], stock: 40, skin: ['all', 'sensitive'], concerns: ['hydration', 'pores'], ingr: ['hyaluronic', 'panthenol'],
    art: { shape: 'toner', c: '#dbe9f3', glass: true, liquid: '#e9f2fa', cap: '#1f3a5f', ink: '#1f3a5f', big: '1025', sub: 'DOKDO TONER' },
    desc: 'Мягкий отшелушивающий тонер на глубоководной морской воде. Убирает ороговевшие частички и увлажняет даже чувствительную кожу.' },
  { id: 'roundlab-birch-sun', brand: 'round-lab', name: 'Birch Juice Moisturizing Sunscreen SPF45', type: 'sunscreen', price: 179, rating: 4.7, reviews: 402, volume: '50 мл', tags: [], stock: 22, skin: ['dry', 'normal'], concerns: ['spf', 'hydration'], ingr: ['birch', 'hyaluronic', 'spf'],
    art: { shape: 'tube', c: '#e8f3f7', cap: '#7fb6d0', ink: '#2e6a86', big: 'SPF 45', sub: 'BIRCH JUICE' },
    desc: 'Увлажняющий санскрин с берёзовым соком. Невесомо ложится, освежает и защищает от UVA/UVB-лучей в городе.' },
  { id: 'anua-heartleaf-toner', brand: 'anua', name: 'Heartleaf 77% Soothing Toner', type: 'toner', price: 249, old: 299, rating: 4.8, reviews: 1320, volume: '250 мл', tags: ['hit'], stock: 55, skin: ['sensitive', 'oily', 'combo'], concerns: ['soothing', 'acne'], ingr: ['heartleaf', 'panthenol'],
    art: { shape: 'toner', c: '#e3efe2', glass: true, liquid: '#eef6ec', cap: '#ffffff', ink: '#3d6b45', big: '77%', sub: 'HEARTLEAF TONER' },
    desc: 'Успокаивающий тонер с 77% экстракта хауттюйнии. Снимает покраснения, балансирует жирность и делает кожу свежей и ровной.' },
  { id: 'anua-cleansing-oil', brand: 'anua', name: 'Heartleaf Pore Control Cleansing Oil', type: 'cleansing_oil', price: 259, rating: 4.8, reviews: 744, volume: '200 мл', tags: [], stock: 29, skin: ['oily', 'combo'], concerns: ['pores'], ingr: ['heartleaf', 'bha'],
    art: { shape: 'pump', c: '#f2f0e4', glass: true, liquid: '#efe0ac', cap: '#ffffff', ink: '#3d6b45', big: 'Oil', sub: 'PORE CONTROL' },
    desc: 'Гидрофильное масло растворяет стойкий макияж, SPF и чёрные точки. Легко смывается и не оставляет плёнки.' },
  { id: 'torriden-dive-in-serum', brand: 'torriden', name: 'DIVE-IN Low Molecular Hyaluronic Acid Serum', type: 'serum', price: 229, rating: 4.9, reviews: 1187, volume: '50 мл', tags: ['hit'], stock: 48, skin: ['all', 'dry', 'sensitive'], concerns: ['hydration'], ingr: ['hyaluronic', 'panthenol'],
    art: { shape: 'dropper', c: '#d3e5f6', glass: true, liquid: '#e6f1fb', cap: '#ffffff', label: '#ffffff', ink: '#2a5b8c', big: 'DIVE-IN', sub: 'HYALURONIC SERUM' },
    desc: 'Сыворотка с пятью видами низкомолекулярной гиалуроновой кислоты. Увлажняет в глубину и делает кожу плотной и «сочной».' },
  { id: 'torriden-soothing-cream', brand: 'torriden', name: 'DIVE-IN Soothing Cream', type: 'cream', price: 259, rating: 4.7, reviews: 366, volume: '100 мл', tags: [], stock: 16, skin: ['sensitive', 'combo'], concerns: ['soothing', 'hydration'], ingr: ['hyaluronic', 'centella'],
    art: { shape: 'jar', c: '#f1f6fb', cap: '#bfd9ee', ink: '#2a5b8c', big: 'DIVE-IN', sub: 'SOOTHING CREAM' },
    desc: 'Лёгкий гель-крем с гиалуроновой кислотой и центеллой. Охлаждает, успокаивает и надолго сохраняет увлажнение.' },
  { id: 'skin1004-centella-ampoule', brand: 'skin1004', name: 'Madagascar Centella Ampoule', type: 'ampoule', price: 219, rating: 4.8, reviews: 1540, volume: '100 мл', tags: ['hit'], stock: 37, skin: ['sensitive', 'all'], concerns: ['soothing', 'barrier'], ingr: ['centella'],
    art: { shape: 'dropper', c: '#efe9d9', glass: true, liquid: '#f4eac6', cap: '#e7dcc0', label: '#fbf8f0', ink: '#6a5a3a', big: 'CENTELLA', sub: 'MADAGASCAR' },
    desc: 'Ампула на 100% экстракте мадагаскарской центеллы. Мгновенно успокаивает раздражённую кожу и ускоряет её восстановление.' },
  { id: 'skin1004-sun-serum', brand: 'skin1004', name: 'Hyalu-Cica Water-Fit Sun Serum SPF50+', type: 'sunscreen', price: 199, rating: 4.8, reviews: 1102, volume: '50 мл', tags: ['new'], stock: 44, skin: ['oily', 'combo', 'all'], concerns: ['spf', 'soothing'], ingr: ['centella', 'hyaluronic', 'spf'],
    art: { shape: 'tube', c: '#e5f1f3', cap: '#c6e0e5', ink: '#2f6a74', big: 'SPF 50+', sub: 'WATER-FIT SUN SERUM' },
    desc: 'Санскрин-сыворотка с водянистой текстурой. Быстро впитывается, не оставляет липкости и идеально подходит под макияж.' },
  { id: 'medicube-zero-pad', brand: 'medicube', name: 'Zero Pore Pad 2.0', type: 'pads', price: 279, old: 339, rating: 4.7, reviews: 688, volume: '70 шт', tags: ['excl'], stock: 21, skin: ['oily', 'combo'], concerns: ['pores', 'acne'], ingr: ['aha', 'bha'],
    art: { shape: 'pads', c: '#d9e7f7', cap: '#ffffff', ink: '#2d5f9a', big: 'ZERO', sub: 'PORE PAD 2.0' },
    desc: 'Двусторонние пэды с AHA и BHA-кислотами. Сужают поры, выравнивают текстуру и контролируют жирный блеск.' },
  { id: 'medicube-pdrn-serum', brand: 'medicube', name: 'PDRN Pink Peptide Serum', type: 'serum', price: 329, rating: 4.8, reviews: 274, volume: '30 мл', tags: ['new', 'excl'], stock: 12, skin: ['all', 'dry'], concerns: ['antiage', 'glow'], ingr: ['pdrn', 'peptides', 'niacinamide'],
    art: { shape: 'dropper', c: '#f6c8da', glass: true, liquid: '#f3b1cb', cap: '#fbdde8', label: '#fff6fa', ink: '#b43f72', big: 'PDRN', sub: 'PINK PEPTIDE SERUM' },
    desc: 'Розовая сыворотка с PDRN и пептидами. Возвращает коже плотность и сияние, помогает ей восстанавливаться быстрее.' },
  { id: 'medicube-collagen-mask', brand: 'medicube', name: 'Collagen Night Wrapping Mask', type: 'sleeping_mask', price: 289, rating: 4.6, reviews: 193, volume: '75 мл', tags: ['new'], stock: 9, skin: ['dry', 'normal'], concerns: ['antiage', 'hydration'], ingr: ['collagen', 'peptides'],
    art: { shape: 'tube', c: '#f7d3e0', cap: '#f2b7cd', ink: '#a83a68', big: 'COLLAGEN', sub: 'NIGHT WRAPPING MASK' },
    desc: 'Ночная маска-плёнка с коллагеном. Утром снимается одним движением и открывает гладкую, подтянутую кожу.' },
  { id: 'laneige-lip-mask', brand: 'laneige', name: 'Lip Sleeping Mask Berry', type: 'lip_mask', price: 209, rating: 4.9, reviews: 2310, volume: '20 г', tags: ['hit'], stock: 70, skin: ['all'], concerns: ['hydration'], ingr: ['vitamin_c', 'hyaluronic'],
    art: { shape: 'minijar', c: '#f28db2', cap: '#e8729f', ink: '#ffffff', big: 'LIP', sub: 'SLEEPING MASK' },
    desc: 'Ночная маска для губ с ягодным ароматом. За одну ночь делает губы мягкими, гладкими и заметно более пухлыми.' },
  { id: 'laneige-water-bank', brand: 'laneige', name: 'Water Bank Blue Hyaluronic Cream', type: 'cream', price: 399, rating: 4.7, reviews: 211, volume: '50 мл', tags: [], stock: 11, skin: ['dry', 'normal'], concerns: ['hydration'], ingr: ['hyaluronic', 'ceramides'],
    art: { shape: 'jar', c: '#cfe2f7', cap: '#8fb5e3', ink: '#23548f', big: 'Water Bank', sub: 'BLUE HYALURONIC' },
    desc: 'Увлажняющий крем с голубой гиалуроновой кислотой. Наполняет кожу влагой на 100 часов и укрепляет её барьер.' },
  { id: 'innisfree-green-tea-serum', brand: 'innisfree', name: 'Green Tea Seed Hyaluronic Serum', type: 'serum', price: 279, old: 329, rating: 4.7, reviews: 512, volume: '80 мл', tags: [], stock: 27, skin: ['all', 'combo'], concerns: ['hydration'], ingr: ['green_tea', 'hyaluronic'],
    art: { shape: 'pump', c: '#bcdcae', glass: true, liquid: '#a9d494', cap: '#ffffff', label: '#ffffff', ink: '#2f5a2a', big: 'Green Tea', sub: 'SEED SERUM' },
    desc: 'Сыворотка с семенами зелёного чая с острова Чеджу. Насыщает кожу влагой и защищает её от стресса и сухости.' },
  { id: 'missha-fte', brand: 'missha', name: 'Time Revolution The First Treatment Essence RX', type: 'essence', price: 369, rating: 4.8, reviews: 402, volume: '150 мл', tags: [], stock: 15, skin: ['all', 'normal'], concerns: ['glow', 'antiage'], ingr: ['galactomyces', 'niacinamide'],
    art: { shape: 'toner', c: '#ede5d4', glass: true, liquid: '#f5eddb', cap: '#c8a96b', ink: '#6a5530', big: 'First', sub: 'TREATMENT ESSENCE', serif: true },
    desc: 'Ферментированная эссенция с галактомисисом. Выравнивает тон, улучшает текстуру и делает кожу светящейся изнутри.' },
  { id: 'somebymi-miracle-toner', brand: 'some-by-mi', name: 'AHA BHA PHA 30 Days Miracle Toner', type: 'toner', price: 159, old: 209, rating: 4.6, reviews: 866, volume: '150 мл', tags: [], stock: 34, skin: ['oily', 'combo'], concerns: ['acne', 'pores'], ingr: ['aha', 'bha', 'tea_tree'],
    art: { shape: 'toner', c: '#dcefd4', cap: '#6bb36b', ink: '#2f6a2f', big: '30 DAYS', sub: 'MIRACLE TONER' },
    desc: 'Тонер с тремя видами кислот и чайным деревом. Бережно обновляет кожу и за 30 дней уменьшает количество высыпаний.' },
  { id: 'drjart-cicapair', brand: 'dr-jart', name: 'Cicapair Tiger Grass Color Correcting Treatment', type: 'cream', price: 449, rating: 4.7, reviews: 529, volume: '50 мл', tags: [], stock: 0, skin: ['sensitive'], concerns: ['soothing'], ingr: ['centella', 'spf'],
    art: { shape: 'jar', c: '#dbead6', cap: '#4e8b57', ink: '#2f5a36', big: 'Cicapair', sub: 'COLOR CORRECTING' },
    desc: 'Зелёный корректирующий крем с центеллой. Маскирует покраснения, успокаивает кожу и защищает её SPF.' },
  { id: 'klairs-vitamin-drop', brand: 'klairs', name: 'Freshly Juiced Vitamin Drop', type: 'serum', price: 229, rating: 4.6, reviews: 344, volume: '35 мл', tags: [], stock: 19, skin: ['all', 'sensitive'], concerns: ['glow'], ingr: ['vitamin_c', 'centella'],
    art: { shape: 'dropper', c: '#f2d27a', glass: true, liquid: '#f4c84f', cap: '#ffffff', label: '#ffffff', ink: '#7a5a12', big: 'Vitamin', sub: 'FRESHLY JUICED DROP' },
    desc: 'Мягкая сыворотка с 5% витамина C для чувствительной кожи. Осветляет пигментацию и дарит коже свежий, отдохнувший вид.' },
  { id: 'isntree-sun-gel', brand: 'isntree', name: 'Hyaluronic Acid Watery Sun Gel SPF50+', type: 'sunscreen', price: 179, rating: 4.8, reviews: 733, volume: '50 мл', tags: [], stock: 36, skin: ['oily', 'combo', 'all'], concerns: ['spf', 'hydration'], ingr: ['hyaluronic', 'spf'],
    art: { shape: 'tube', c: '#e4f0fa', cap: '#ffffff', ink: '#2b6fa6', big: 'SPF 50+', sub: 'WATERY SUN GEL' },
    desc: 'Гелевый санскрин с гиалуроновой кислотой. Прозрачный, лёгкий и совсем не ощущается на коже.' },
  { id: 'mixsoon-bean-essence', brand: 'mixsoon', name: 'Bean Essence', type: 'essence', price: 229, rating: 4.8, reviews: 889, volume: '50 мл', tags: ['new'], stock: 23, skin: ['all', 'combo'], concerns: ['pores', 'glow'], ingr: ['bean'],
    art: { shape: 'dropper', c: '#eee4cf', glass: true, liquid: '#e7d6b1', cap: '#2b2b2b', label: '#ffffff', ink: '#2b2b2b', big: 'bean', sub: 'ESSENCE' },
    desc: 'Эссенция на ферментированных соевых бобах. Мягко обновляет кожу, сглаживает текстуру и придаёт стеклянное сияние.' },
  { id: 'numbuzin-no3', brand: 'numbuzin', name: 'No.3 Skin Softening Serum', type: 'serum', price: 259, rating: 4.7, reviews: 402, volume: '50 мл', tags: [], stock: 17, skin: ['dry', 'normal'], concerns: ['glow', 'pores'], ingr: ['galactomyces', 'niacinamide'],
    art: { shape: 'dropper', c: '#f2dbce', glass: true, liquid: '#efccb9', cap: '#e6c8b6', label: '#fff8f3', ink: '#8a4f37', big: 'No.3', sub: 'SKIN SOFTENING' },
    desc: 'Сыворотка с ферментами для «бархатной» кожи. Сглаживает рельеф и делает кожу мягкой, как шёлк.' },
  { id: 'numbuzin-no5', brand: 'numbuzin', name: 'No.5 Vitamin Concentrated Serum', type: 'serum', price: 259, rating: 4.7, reviews: 291, volume: '50 мл', tags: ['new'], stock: 13, skin: ['all'], concerns: ['glow'], ingr: ['vitamin_c', 'niacinamide'],
    art: { shape: 'dropper', c: '#f6e3b4', glass: true, liquid: '#f2d27a', cap: '#f7e6c0', label: '#fffaf0', ink: '#8a6320', big: 'No.5', sub: 'VITAMIN SERUM' },
    desc: 'Витаминный концентрат для ровного тона. Осветляет постакне и возвращает тусклой коже сияние.' },
  { id: 'romand-juicy-tint', brand: 'romand', name: 'Juicy Lasting Tint', type: 'lip_tint', price: 99, rating: 4.8, reviews: 1765, volume: '5.5 г', tags: ['hit'], stock: 90, skin: ['all'], concerns: ['color'], ingr: ['pigments'],
    variants: [{ name: '01 Pink Pumpkin', color: '#e0735d' }, { name: '06 Figfig', color: '#b84e5c' }, { name: '09 Litchi Coral', color: '#f08a7e' }, { name: '12 Cherry Bomb', color: '#c8283e' }, { name: '18 Mulled Peach', color: '#d9725f' }, { name: '23 Nucadamia', color: '#b7746a' }],
    art: { shape: 'lip', c: '#e0735d', cap: '#f3eee9', ink: '#9b3d2f' },
    desc: 'Сочный глянцевый тинт с эффектом «стеклянных» губ. Стойкий пигмент не сушит и не растекается.' },
  { id: 'peripera-ink-mood', brand: 'peripera', name: 'Ink Mood Glowy Tint', type: 'lip_tint', price: 89, old: 109, rating: 4.7, reviews: 642, volume: '4 г', tags: [], stock: 52, skin: ['all'], concerns: ['color'], ingr: ['pigments'],
    variants: [{ name: '01 Pinkish Show', color: '#e86d84' }, { name: '03 Coral Influencer', color: '#f07f6b' }, { name: '05 Rosy Taste', color: '#c9566b' }, { name: '08 Mauve Roll', color: '#b46479' }],
    art: { shape: 'lip', c: '#e86d84', cap: '#2a2a2e', ink: '#ffffff' },
    desc: 'Сияющий тинт с мягким финишем. Лёгкое покрытие создаёт эффект естественных, увлажнённых губ.' },
  { id: 'clio-kill-cover', brand: 'clio', name: 'Kill Cover Fixer Cushion', type: 'cushion', price: 319, rating: 4.7, reviews: 512, volume: '15 г × 2', tags: [], stock: 24, skin: ['oily', 'combo'], concerns: ['color'], ingr: ['spf', 'pigments'],
    variants: [{ name: '02 Lingerie', color: '#f3d6c4' }, { name: '03 Linen', color: '#edcdb4' }, { name: '04 Ginger', color: '#e2bc9f' }],
    art: { shape: 'cushion', c: '#1e1e22', cap: '#caa56a', ink: '#ffffff', big: 'CLIO' },
    desc: 'Кушон с плотным стойким покрытием и SPF50+. Скрывает несовершенства и держится весь день без обновления.' },
  { id: 'tirtir-red-cushion', brand: 'tirtir', name: 'Mask Fit Red Cushion', type: 'cushion', price: 289, old: 339, rating: 4.8, reviews: 1402, volume: '18 г', tags: ['hit'], stock: 38, skin: ['all', 'combo'], concerns: ['color'], ingr: ['spf', 'pigments'],
    variants: [{ name: '17C Porcelain', color: '#f4dccb' }, { name: '21N Ivory', color: '#edcfb7' }, { name: '23N Sand', color: '#e3c0a2' }],
    art: { shape: 'cushion', c: '#c8202e', cap: '#e8e8ea', ink: '#ffffff', big: 'TIRTIR' },
    desc: 'Культовый красный кушон с полуматовым финишем. Выравнивает тон, не забивает поры и не отпечатывается.' },
  { id: 'etude-soonjung-cream', brand: 'etude', name: 'SoonJung 2x Barrier Intensive Cream', type: 'cream', price: 149, rating: 4.7, reviews: 505, volume: '60 мл', tags: [], stock: 30, skin: ['sensitive', 'dry'], concerns: ['barrier', 'soothing'], ingr: ['panthenol', 'ceramides'],
    art: { shape: 'tube', c: '#ffffff', cap: '#eef4f5', ink: '#3a8c8f', big: 'SoonJung', sub: 'BARRIER CREAM' },
    desc: 'Гипоаллергенный крем с пантенолом для реактивной кожи. Укрепляет барьер и снимает ощущение стянутости.' },
  { id: 'heimish-clean-balm', brand: 'heimish', name: 'All Clean Balm', type: 'cleansing_balm', price: 199, rating: 4.8, reviews: 699, volume: '120 мл', tags: [], stock: 20, skin: ['all', 'dry'], concerns: ['pores'], ingr: ['galactomyces'],
    art: { shape: 'jar', c: '#f3ece2', cap: '#d6c7b2', ink: '#6b5a45', big: 'heimish', sub: 'ALL CLEAN BALM', serif: true },
    desc: 'Бальзам-щербет для снятия макияжа. Превращается в масло при контакте с кожей и растворяет даже водостойкую тушь.' },
  { id: 'banila-clean-it-zero', brand: 'banila-co', name: 'Clean it Zero Cleansing Balm Original', type: 'cleansing_balm', price: 219, old: 259, rating: 4.8, reviews: 1213, volume: '100 мл', tags: ['hit'], stock: 45, skin: ['all'], concerns: ['pores'], ingr: ['vitamin_c'],
    art: { shape: 'jar', c: '#f7c5d7', cap: '#f1a8c3', ink: '#b03d6b', big: 'ZERO', sub: 'CLEANSING BALM' },
    desc: 'Самый известный очищающий бальзам Кореи. Мягко снимает макияж и SPF, оставляя кожу чистой и мягкой.' },
  { id: 'imfrom-rice-toner', brand: 'im-from', name: 'Rice Toner', type: 'toner', price: 239, rating: 4.8, reviews: 477, volume: '150 мл', tags: [], stock: 26, skin: ['dry', 'normal'], concerns: ['glow', 'hydration'], ingr: ['rice', 'niacinamide'],
    art: { shape: 'toner', c: '#f4f1eb', cap: '#d8c8a6', ink: '#4a4033', big: 'Rice', sub: 'TONER 77.78%', serif: true },
    desc: 'Молочный тонер с 77,78% рисового экстракта. Смягчает, выравнивает тон и дарит коже шелковистое сияние.' },
  { id: 'pyunkang-essence-toner', brand: 'pyunkang-yul', name: 'Essence Toner', type: 'toner', price: 169, rating: 4.7, reviews: 366, volume: '200 мл', tags: [], stock: 32, skin: ['dry', 'sensitive'], concerns: ['hydration', 'barrier'], ingr: ['panthenol'],
    art: { shape: 'toner', c: '#f2efe8', cap: '#c9b38a', ink: '#3a3a3a', big: 'Essence', sub: 'TONER', serif: true },
    desc: 'Минималистичный тонер-эссенция на корне астрагала. Питает сухую кожу всего из 7 ингредиентов.' },
  { id: 'axisy-dark-spot', brand: 'axis-y', name: 'Dark Spot Correcting Glow Serum', type: 'serum', price: 179, old: 229, rating: 4.6, reviews: 344, volume: '50 мл', tags: [], stock: 28, skin: ['all', 'oily'], concerns: ['glow', 'acne'], ingr: ['niacinamide', 'rice'],
    art: { shape: 'pump', c: '#ffffff', cap: '#f4a93c', ink: '#e08a1e', big: 'Glow', sub: 'DARK SPOT SERUM' },
    desc: 'Сыворотка с 5% ниацинамида против пигментации. Осветляет следы постакне и выравнивает тон кожи.' },
  { id: 'holika-aloe', brand: 'holika-holika', name: 'Aloe 99% Soothing Gel', type: 'body_gel', price: 89, rating: 4.6, reviews: 1402, volume: '250 мл', tags: [], stock: 64, skin: ['all'], concerns: ['soothing', 'hydration'], ingr: ['aloe'],
    art: { shape: 'jar', c: '#bfe3b2', cap: '#7cc36a', ink: '#2f6b2a', big: '99%', sub: 'ALOE GEL', tall: true },
    desc: 'Универсальный гель с 99% алоэ вера. Охлаждает кожу после солнца, увлажняет лицо, тело и волосы.' },
  { id: 'goodal-vita-c', brand: 'goodal', name: 'Green Tangerine Vita C Dark Spot Care Serum', type: 'serum', price: 249, rating: 4.7, reviews: 322, volume: '40 мл', tags: [], stock: 0, skin: ['all'], concerns: ['glow'], ingr: ['vitamin_c', 'niacinamide'],
    art: { shape: 'dropper', c: '#dbeac5', glass: true, liquid: '#f2c14e', cap: '#ffffff', label: '#ffffff', ink: '#4e7a2a', big: 'Vita C', sub: 'GREEN TANGERINE' },
    desc: 'Сыворотка с экстрактом зелёного мандарина с Чеджу. Осветляет тусклую кожу и ослабляет пигментные пятна.' },
  { id: 'manyo-cleansing-oil', brand: 'manyo', name: 'Pure Cleansing Oil', type: 'cleansing_oil', price: 229, rating: 4.8, reviews: 588, volume: '200 мл', tags: [], stock: 22, skin: ['all', 'dry'], concerns: ['pores'], ingr: ['galactomyces'],
    art: { shape: 'pump', c: '#f6eed8', glass: true, liquid: '#f0dca0', cap: '#e8e0cd', ink: '#5a4a2f', big: 'Pure', sub: 'CLEANSING OIL', serif: true },
    desc: 'Гидрофильное масло на растительных маслах. Растворяет себум и макияж, не нарушая барьер кожи.' },
  { id: 'celimax-noni-ampoule', brand: 'celimax', name: 'The Real Noni Energy Ampoule', type: 'ampoule', price: 199, rating: 4.6, reviews: 211, volume: '30 мл', tags: [], stock: 18, skin: ['dry', 'normal'], concerns: ['barrier', 'antiage'], ingr: ['noni', 'peptides'],
    art: { shape: 'dropper', c: '#e5eec8', glass: true, liquid: '#d8e5a6', cap: '#ffffff', label: '#ffffff', ink: '#56702a', big: 'Noni', sub: 'ENERGY AMPOULE' },
    desc: 'Ампула с экстрактом нони. Заряжает кожу энергией, восстанавливает и помогает бороться с первыми признаками старения.' },
  { id: 'abib-heartleaf-mask', brand: 'abib', name: 'Mild Acidic pH Sheet Mask Heartleaf Fit', type: 'sheet_mask', price: 29, rating: 4.8, reviews: 211, volume: '1 шт', tags: [], stock: 120, skin: ['sensitive', 'oily'], concerns: ['soothing'], ingr: ['heartleaf'],
    art: { shape: 'mask', c: '#dcefd7', ink: '#2f6b3f', big: 'Heartleaf', sub: 'SHEET MASK' },
    desc: 'Тканевая маска с хауттюйнией и слабокислым pH. Успокаивает кожу и снимает раздражения за 20 минут.' },
  { id: 'mediheal-teatree-mask', brand: 'mediheal', name: 'Tea Tree Essential Mask', type: 'sheet_mask', price: 19, old: 25, rating: 4.6, reviews: 873, volume: '1 шт', tags: [], stock: 150, skin: ['oily', 'combo'], concerns: ['acne', 'soothing'], ingr: ['tea_tree'],
    art: { shape: 'mask', c: '#d6efe9', ink: '#1f6f5f', big: 'Tea Tree', sub: 'ESSENTIAL MASK' },
    desc: 'Маска с чайным деревом для проблемной кожи. Уменьшает воспаления и матирует кожу.' },
  { id: 'skinfood-carrot-pad', brand: 'skinfood', name: 'Carrot Carotene Calming Water Pad', type: 'pads', price: 229, rating: 4.8, reviews: 411, volume: '60 шт', tags: ['new'], stock: 20, skin: ['sensitive', 'all'], concerns: ['soothing'], ingr: ['carrot', 'panthenol'],
    art: { shape: 'pads', c: '#fbd8b9', cap: '#f39a4b', ink: '#b2561a', big: 'Carrot', sub: 'WATER PAD' },
    desc: 'Успокаивающие пэды с каротином моркови. Отлично работают как 5-минутная маска для раздражённых участков.' },
  { id: 'sulwhasoo-first-care', brand: 'sulwhasoo', name: 'First Care Activating Serum', type: 'serum', price: 1029, rating: 4.9, reviews: 211, volume: '60 мл', tags: ['excl'], stock: 6, skin: ['all', 'dry'], concerns: ['antiage', 'glow'], ingr: ['ginseng', 'peptides'],
    art: { shape: 'pump', c: '#c68b39', glass: true, liquid: '#d49a45', cap: '#d9b26e', ink: '#ffffff', big: 'First Care', sub: 'ACTIVATING SERUM', serif: true },
    desc: 'Легендарная сыворотка-бустер на основе корейских трав. Первым шагом ухода усиливает действие всех следующих средств.' },
  { id: 'lador-lpp', brand: 'lador', name: 'Perfect Hair Fill-Up', type: 'hair_mask', price: 149, rating: 4.7, reviews: 366, volume: '150 мл', tags: [], stock: 24, skin: ['all'], concerns: ['barrier'], ingr: ['keratin', 'collagen'],
    art: { shape: 'tube', c: '#f3f0fa', cap: '#9a86c9', ink: '#5b4a91', big: 'Fill-Up', sub: 'HAIR TREATMENT' },
    desc: 'Филлер для волос с кератином и коллагеном. Заполняет повреждения и делает волосы гладкими и блестящими.' },
  { id: 'ryo-hair-shampoo', brand: 'ryo', name: 'Hair Loss Expert Care Shampoo', type: 'shampoo', price: 199, rating: 4.7, reviews: 288, volume: '400 мл', tags: [], stock: 19, skin: ['all'], concerns: ['barrier'], ingr: ['ginseng'],
    art: { shape: 'pump', c: '#3a2f2c', cap: '#c9a96a', ink: '#e9d8b3', big: 'Ryo', sub: 'EXPERT CARE', serif: true, big2: true },
    desc: 'Шампунь с женьшенем для ослабленных волос. Укрепляет корни и очищает кожу головы, не пересушивая её.' },
  { id: 'illiyoon-ceramide', brand: 'illiyoon', name: 'Ceramide Ato Concentrate Cream', type: 'body_cream', price: 219, rating: 4.8, reviews: 402, volume: '200 мл', tags: [], stock: 33, skin: ['dry', 'sensitive'], concerns: ['barrier', 'hydration'], ingr: ['ceramides'],
    art: { shape: 'tube', c: '#f1f5fa', cap: '#ffffff', ink: '#2a63a8', big: 'Ceramide', sub: 'ATO CREAM' },
    desc: 'Плотный крем с керамидами для очень сухой кожи тела. Снимает зуд и стянутость, подходит всей семье.' },
  { id: 'ks-glass-skin-set', brand: 'korea-secret', name: 'Glass Skin Ritual Set', type: 'set', price: 569, old: 749, rating: 4.9, reviews: 128, volume: '4 средства', tags: ['excl', 'hit'], stock: 14, skin: ['all'], concerns: ['glow', 'hydration'], ingr: ['hyaluronic', 'rice', 'niacinamide'],
    art: { shape: 'box', c: '#dd4487', cap: '#ffffff', ink: '#ffffff' },
    desc: 'Наш фирменный набор для эффекта «стеклянной кожи»: масло, тонер, сыворотка и крем в полноразмерных форматах. Упакован в подарочную коробку с бабочкой.' },
  { id: 'ks-mini-routine', brand: 'korea-secret', name: 'Mini Routine Travel Set', type: 'set', price: 339, rating: 4.8, reviews: 96, volume: '5 миниатюр', tags: ['excl', 'new'], stock: 30, skin: ['all'], concerns: ['hydration'], ingr: ['centella', 'hyaluronic'],
    art: { shape: 'box', c: '#ffffff', cap: '#dd4487', ink: '#dd4487' },
    desc: 'Пять миниатюр бестселлеров для путешествий и знакомства с корейским уходом. Всё, что нужно на 2 недели.' },
  { id: 'ks-giftcard', brand: 'korea-secret', name: 'Gift Card', type: 'giftcard', price: 300, rating: 5, reviews: 64, volume: '', tags: ['excl'], stock: 999, skin: ['all'], concerns: [], ingr: [],
    variants: [{ name: '300 смн', price: 300 }, { name: '500 смн', price: 500 }, { name: '1 000 смн', price: 1000 }, { name: '1 500 смн', price: 1500 }],
    art: { shape: 'giftcard', c: '#dd4487', ink: '#ffffff' },
    desc: 'Подарочная карта Korea Secret — идеальный подарок, когда хочется порадовать наверняка. Физическая или электронная, на любой номинал.' }
];

/* ---------- reviews (sample content) ---------- */
export const REVIEW_POOL: Review[] = [
  { name: 'Малика К.', rating: 5, text: 'Пользуюсь третий месяц — кожа стала заметно ровнее и мягче, ушли шелушения на щеках. Текстура приятная, быстро впитывается, под макияж ложится идеально.', pros: ['texture', 'effect'] },
  { name: 'Светлана М.', rating: 5, text: 'Просто восторг! Брала по совету подруги и не пожалела. Коллеги спрашивают, что я сделала с кожей — сияет как после отпуска.', pros: ['effect', 'glow'] },
  { name: 'Нигора', rating: 5, text: 'Отличное средство, эффект виден уже через неделю. Кожа упругая, ровная, покраснения стали гораздо меньше. Флакона хватает надолго.', pros: ['economy', 'effect'] },
  { name: 'Анна Л.', rating: 4, text: 'Хорошее средство, но аромат на любителя. По действию всё отлично: увлажняет и не забивает поры, сухость ушла.', pros: ['hydration'] },
  { name: 'Шахноза Р.', rating: 5, text: 'Покупаю уже четвёртый раз. Для моей чувствительной кожи это спасение — ни разу не было реакции, только комфорт.', pros: ['sensitive'] },
  { name: 'Дарья', rating: 5, text: 'Заказывала доставку по Душанбе — привезли в тот же вечер, упаковано бережно, в подарок положили пробники. Средство классное, беру ещё!', pros: ['delivery'] },
  { name: 'Фарзона Х.', rating: 5, text: 'Лучшее, что я пробовала из этой категории. Лёгкое, не липкое, кожа после него как шёлк. Беру вторую баночку.', pros: ['texture'] },
  { name: 'Юлия Т.', rating: 4, text: 'Эффект хороший, но хотелось бы флакон побольше. В остальном только плюсы: поры меньше, тон ровнее.', pros: ['pores'] },
  { name: 'Сабрина', rating: 5, text: 'Консультант в магазине на Рудаки помогла подобрать уход — это попадание в сто процентов. Спасибо Korea Secret!', pros: ['service'] },
  { name: 'Алёна Ш.', rating: 5, text: 'Летом в Душанбе кожа сохнет от жары, а с этим средством — мягкая и увлажнённая. Наношу утром и вечером, очень экономично.', pros: ['hydration', 'economy'] },
  { name: 'Тахмина', rating: 5, text: 'Не ожидала такого результата за такие деньги. Высыпаний стало меньше, следы постакне бледнеют.', pros: ['price', 'effect'] },
  { name: 'Ирина Н.', rating: 3, text: 'Мне не хватило увлажнения — кожа очень сухая. Но для жирной и комбинированной, думаю, будет идеально.', pros: [] },
  { name: 'Мехрона Г.', rating: 5, text: 'Упаковка — любовь, средство — тоже. Красиво смотрится на полке и реально работает.', pros: ['design'] },
  { name: 'Наталья', rating: 5, text: 'Беру маме и себе. У мамы возрастная кожа, у меня комбинированная — обеим подошло, кожа сияет.', pros: ['effect'] }
];

export const REVIEW_PROS: Record<string, string> = {
  texture: 'Текстура', effect: 'Заметный эффект', glow: 'Сияние',
  economy: 'Экономичный расход', hydration: 'Увлажнение', sensitive: 'Для чувствительной кожи',
  delivery: 'Быстрая доставка', pores: 'Поры', service: 'Консультация',
  price: 'Цена', design: 'Дизайн'
};

/* ---------- home page content ---------- */

/** Announcement bar above the header. Managed from the admin panel later — switched off for now. */
export const PROMO_BAR: { enabled: boolean; messages: { text: string; code?: string }[] } = {
  enabled: false,
  messages: [
    { text: 'Секретный промокод {code} — до −20% на заказ', code: 'SECRET' },
    { text: 'Бесплатная доставка по Душанбе от 350 смн' },
    { text: 'Миниатюра в подарок к каждому заказу от 600 смн' }
  ]
};

/* Banner text, grid lines and dots switch between light and dark ink from the background colours (see heroTone). */
export const HERO_SLIDES: HeroSlide[] = [
  { id: 'promo', bg: 'radial-gradient(60% 80% at 72% 42%, rgba(255,214,232,.75) 0%, rgba(255,214,232,0) 60%), radial-gradient(40% 50% at 10% 90%, rgba(160,60,150,.55) 0%, transparent 70%), linear-gradient(118deg, #f38bba 0%, #e05595 40%, #c1408c 70%, #8f3a8f 100%)',
    kicker: 'Korea Secret', title: 'Твой <em>секретный</em> промокод',
    text: 'до −20% на заказ по коду SECRET — только до конца октября',
    cta: 'Скопировать промокод', action: 'copy', link: '/catalog' },
  { id: 'spf', bg: 'radial-gradient(42% 58% at 72% 36%, rgba(255,255,255,.95) 0%, rgba(255,255,255,0) 62%), radial-gradient(55% 70% at 8% 100%, rgba(255,190,160,.42) 0%, transparent 70%), linear-gradient(120deg, #fff8ee 0%, #ffeedd 45%, #ffe1cf 75%, #fcd2c2 100%)',
    kicker: 'Сезон SPF', title: 'Солнце <em>не</em> пройдёт',
    text: 'Лёгкие санскрины без белого следа — для города, гор и каждого дня',
    cta: 'Выбрать SPF', link: '/catalog?cat=sun' },
  { id: 'glass', bg: 'radial-gradient(55% 70% at 70% 45%, rgba(236,120,180,.55) 0%, transparent 65%), radial-gradient(35% 45% at 88% 88%, rgba(120,70,180,.5) 0%, transparent 70%), linear-gradient(120deg, #1d0f1c 0%, #3e1636 45%, #6b2156 75%, #a2346f 100%)',
    kicker: 'Новинки сезона', title: 'Сияние <em>стеклянной</em> кожи',
    text: 'PDRN, пептиды и ферменты — сыворотки, о которых говорит вся Корея',
    cta: 'Смотреть новинки', link: '/catalog?offer=new' },
  { id: 'gifts', bg: 'radial-gradient(50% 60% at 72% 40%, rgba(255,255,255,.8) 0%, transparent 60%), radial-gradient(50% 60% at 0% 100%, rgba(214,170,240,.5) 0%, transparent 70%), linear-gradient(120deg, #f6f0ff 0%, #ece0fd 45%, #f6dcf0 80%, #f4c9e0 100%)',
    kicker: 'Только в Korea Secret', title: 'Подарки <em>со смыслом</em>',
    text: 'Фирменные наборы в коробке с бабочкой и подарочные карты на любой номинал',
    cta: 'Собрать подарок', link: '/catalog?cat=sets' }
];

export const HOME_CATS: HomeCat[] = [
  { icon: 'sale', name: 'Скидки', href: '/catalog?offer=sale' },
  { icon: 'bag', name: 'Новинки', href: '/catalog?offer=new' },
  { icon: 'dropper', name: 'Сыворотки', href: '/catalog?type=serum,ampoule,essence' },
  { icon: 'sun', name: 'SPF-защита', href: '/catalog?cat=sun' },
  { icon: 'jar', name: 'Кремы', href: '/catalog?type=cream' },
  { icon: 'mask', name: 'Маски', href: '/catalog?type=sheet_mask,sleeping_mask,lip_mask' },
  { icon: 'lipstick', name: 'Макияж', href: '/catalog?cat=makeup' },
  { icon: 'gift', name: 'Наборы', href: '/catalog?cat=sets' }
];

export const STORIES: Story[] = [
  { id: 's1', palette: ['#f7c6d9', '#dd4487'], products: ['cosrx-snail-essence'], title: 'Эссенция: техника похлопываний', dur: '0:34',
    frames: ['Шаг 1. Нанесите 2–3 капли на ладони', 'Шаг 2. Прижмите ладони к лицу и мягко похлопайте', 'Результат — мягкая, «сочная» кожа'] },
  { id: 's2', palette: ['#ffe3c7', '#f08a72'], products: ['boj-relief-sun'], title: 'Санскрин, который не белит', dur: '0:41',
    frames: ['Два пальца средства — ровно столько нужно для лица', 'Распределите лёгкими движениями без втирания', 'Через 5 минут можно наносить макияж'] },
  { id: 's3', palette: ['#e7f0dc', '#6c9f5e'], products: ['anua-cleansing-oil', 'cosrx-good-morning'], title: 'Двойное очищение за 60 секунд', dur: '1:02',
    frames: ['Масло растворяет макияж и SPF', 'Эмульгируйте водой и смойте', 'Гель с низким pH — финальный шаг'] },
  { id: 's4', palette: ['#d9e9f8', '#4f86c6'], products: ['torriden-dive-in-serum'], title: 'Glass skin за три шага', dur: '0:52',
    frames: ['Тонер в 3 слоя для максимума влаги', 'Гиалуроновая сыворотка на влажную кожу', 'Запечатайте лёгким гель-кремом'] },
  { id: 's5', palette: ['#ffd6db', '#c8283e'], products: ['romand-juicy-tint'], title: 'Шесть оттенков Juicy Tint на губах', dur: '0:28',
    frames: ['01 Pink Pumpkin — тёплый персик', '12 Cherry Bomb — сочная вишня', '06 Figfig — ягодный нюд'] },
  { id: 's6', palette: ['#fbd3e3', '#b43f72'], products: ['medicube-pdrn-serum'], title: 'PDRN: новый хит medicube', dur: '0:45',
    frames: ['PDRN — компонент для регенерации кожи', 'Утром — сияние, вечером — восстановление', 'Сочетайте с увлажняющим кремом'] }
];

export const PROMOS: Promo[] = [
  { id: 'p1', theme: 'pink', title: 'До −20% по секретному промокоду', date: 'до 31 октября', link: '/catalog?offer=sale' },
  { id: 'p2', theme: 'peach', title: 'Санскрины SKIN1004 и Round Lab', date: '1–15 октября', link: '/catalog?cat=sun' },
  { id: 'p3', theme: 'mint', dark: true, title: '3 = 2 на тканевые маски', date: 'весь октябрь', link: '/catalog?type=sheet_mask' },
  { id: 'p4', theme: 'lilac', dark: true, title: 'Мини-набор в подарок от 600 смн', date: 'пока есть в наличии', link: '/catalog?cat=sets' },
  { id: 'p5', theme: 'cream', dark: true, title: 'Ханбанг-уход Beauty of Joseon: −15%', date: 'до 20 октября', link: '/catalog?brand=beauty-of-joseon' },
  { id: 'p6', theme: 'blue', dark: true, title: 'Неделя увлажнения Torriden и Laneige', date: '14–21 октября', link: '/catalog?concern=hydration' }
];

/* Fictional bloggers with the default no-photo avatar — swap in real partners, their photos and their picks. */
export const BLOGGERS: Blogger[] = [
  { id: 'madina', name: 'Мадина', nameGen: 'Мадины', about: 'уход за сухой кожей и плотный «сочный» тон', tint: '#fde3ee',
    products: ['torriden-dive-in-serum', 'cosrx-snail-essence', 'laneige-water-bank', 'roundlab-dokdo-toner', 'cosrx-snail-cream', 'laneige-lip-mask', 'pyunkang-essence-toner', 'illiyoon-ceramide', 'heimish-clean-balm'] },
  { id: 'nigina', name: 'Нигина', nameGen: 'Нигины', about: 'glass skin, сияние и PDRN-новинки', tint: '#efe3ff',
    products: ['medicube-pdrn-serum', 'boj-glow-serum', 'mixsoon-bean-essence', 'numbuzin-no3', 'missha-fte', 'imfrom-rice-toner', 'klairs-vitamin-drop', 'goodal-vita-c', 'medicube-collagen-mask'] },
  { id: 'farangis', name: 'Фарангис', nameGen: 'Фарангис', about: 'чувствительная кожа и SPF под палящее солнце', tint: '#e4f3e8',
    products: ['anua-heartleaf-toner', 'skin1004-centella-ampoule', 'boj-relief-sun', 'isntree-sun-gel', 'etude-soonjung-cream', 'abib-heartleaf-mask', 'drjart-cicapair', 'skin1004-sun-serum', 'holika-aloe'] },
  { id: 'zarina', name: 'Зарина', nameGen: 'Зарины', about: 'стойкий макияж, тинты и кушоны', tint: '#ffe6dc',
    products: ['romand-juicy-tint', 'tirtir-red-cushion', 'peripera-ink-mood', 'clio-kill-cover', 'banila-clean-it-zero', 'anua-cleansing-oil', 'manyo-cleansing-oil', 'medicube-zero-pad'] }
];

export const SPOTLIGHT = {
  brand: 'beauty-of-joseon',
  text: 'Рецепты ханбанг эпохи Чосон в современных формулах: рис, женьшень и прополис для спокойной сияющей кожи.',
  cta: 'К покупкам'
};

export const COLLECTIONS: Collection[] = [
  { id: 'gifts', title: 'Идеи подарков', theme: 'blue', art: ['ks-glass-skin-set', 'ks-giftcard', 'romand-juicy-tint'], href: '/catalog?cat=sets', filter: (p) => TYPES[p.type].cat === 'sets' || p.tags.includes('hit') },
  { id: 'antiage', title: 'Anti-age уход', theme: 'rose', art: ['sulwhasoo-first-care', 'boj-revive-eye', 'medicube-pdrn-serum'], href: '/catalog?concern=antiage', filter: (p) => p.concerns.includes('antiage') },
  { id: 'sensitive', title: 'Для чувствительной кожи', theme: 'mint', art: ['anua-heartleaf-toner', 'skin1004-centella-ampoule', 'etude-soonjung-cream'], href: '/catalog?skin=sensitive', filter: (p) => p.skin.includes('sensitive') },
  { id: 'glow', title: 'Сияние и ровный тон', theme: 'peach', art: ['boj-glow-serum', 'klairs-vitamin-drop', 'imfrom-rice-toner'], href: '/catalog?concern=glow', filter: (p) => p.concerns.includes('glow') },
  { id: 'spf', title: 'SPF на каждый день', theme: 'cream', art: ['boj-relief-sun', 'isntree-sun-gel', 'roundlab-birch-sun'], href: '/catalog?cat=sun', filter: (p) => p.type === 'sunscreen' },
  { id: 'makeup', title: 'Корейский макияж', theme: 'lilac', art: ['tirtir-red-cushion', 'romand-juicy-tint', 'peripera-ink-mood'], href: '/catalog?cat=makeup', filter: (p) => TYPES[p.type].cat === 'makeup' }
];

export const ARTICLES: Article[] = [
  { id: 'a1', theme: 'routine', mins: 5, tag: '#гид по уходу',
    title: 'Корейский уход за 5 минут: минимальная рутина, которая работает',
    body: ['Десятиступенчатый уход давно стал мемом, но корейские косметологи сегодня советуют обратное: меньше шагов, больше смысла. Базовая рутина укладывается в пять минут утром и вечером.', 'Утро: мягкое умывание гелем с низким pH, увлажняющий тонер, лёгкая сыворотка и обязательный SPF. Вечер: двойное очищение, тонер, активная сыворотка по задаче кожи и крем.', 'Главное правило — постоянство. Одна и та же рутина в течение 4–6 недель даст больше, чем бесконечная смена баночек.'] },
  { id: 'a2', theme: 'pdrn', mins: 4, tag: '#азбука красоты',
    title: 'PDRN: что это за компонент и почему о нём говорят все',
    body: ['PDRN — полидезоксирибонуклеотид, фрагменты ДНК, которые в клиниках используют для ускорения восстановления кожи. В уходовых средствах он помогает коже выглядеть плотнее и свежее.', 'Лучше всего PDRN работает в паре с пептидами и увлажняющими компонентами. Его можно использовать утром и вечером, он не повышает фоточувствительность.', 'Совет: вводите сыворотку с PDRN после курса кислот или ретиноидов — кожа восстановится быстрее.'] },
  { id: 'a3', theme: 'spf', mins: 6, tag: '#разбор мифов',
    title: 'SPF круглый год: 7 мифов о солнцезащите',
    body: ['Миф №1: зимой SPF не нужен. UVA-лучи, ответственные за фотостарение, одинаково активны в любое время года и проходят сквозь облака и стёкла.', 'Миф №2: SPF в тональном средстве достаточно. Чтобы получить заявленную защиту, пришлось бы нанести слой тона в пять раз толще обычного.', 'В Таджикистане больше 280 солнечных дней в году, а в горах ультрафиолет ещё сильнее. Корейские санскрины решили главную проблему — текстуру: они лёгкие, не белят и отлично работают под макияж.'] },
  { id: 'a4', theme: 'oil', mins: 4, tag: '#гид по уходу',
    title: 'Двойное очищение: как выбрать гидрофильное масло',
    body: ['Гидрофильное масло растворяет то, с чем не справляется вода: стойкий макияж, SPF и себум. Второй шаг — пенка — убирает остатки и готовит кожу к уходу.', 'Для жирной кожи выбирайте лёгкие масла с BHA, для сухой — формулы на растительных маслах. Бальзамы удобны в путешествиях и для водостойкого макияжа.', 'Главное — хорошо эмульгировать: добавьте воды и массируйте, пока масло не станет молочком.'] },
  { id: 'a5', theme: 'store', mins: 3, tag: '#новости магазина',
    title: 'Korea Secret открывает шоурум на проспекте Рудаки',
    body: ['Новый шоурум — это 200 квадратных метров корейского ухода, зона диагностики кожи и бар тестеров, где можно попробовать всё.', 'Каждые выходные — бесплатные консультации косметологов и мастер-классы по корейскому уходу. Запись — через чат на сайте.', 'В день открытия всех гостей ждут подарочные мини-наборы и секретный промокод.'] }
];

/* Store photos are illustrative (Wikimedia Commons, see PHOTO_CREDITS) — replace with photos of your own shops. */
export const STORES: Store[] = [
  { id: 'rudaki', city: 'Душанбе', addr: 'пр. Рудаки, 92', area: 'р-н Исмоили Сомони', note: 'Флагманский шоурум', hours: '09:00–21:00', lat: 38.58847, lon: 68.78678, photo: '/stores/store-1.webp' },
  { id: 'rustaveli', city: 'Душанбе', addr: 'ул. Шота Руставели, 11', area: 'р-н Исмоили Сомони', hours: '09:00–21:00', lat: 38.57585, lon: 68.79156, photo: '/stores/store-2.webp' },
  { id: 'somoni', city: 'Душанбе', addr: 'пр. Исмоили Сомони, 28', area: 'р-н Сино', hours: '10:00–21:00', lat: 38.58335, lon: 68.77516, photo: '/stores/store-3.webp' },
  { id: 'ayni', city: 'Душанбе', addr: 'ул. Садриддина Айни, 53', area: 'р-н Шохмансур', hours: '10:00–20:00', lat: 38.56308, lon: 68.80774, photo: '/stores/store-4.webp' }
];

export const PHOTO_CREDITS = [
  { author: 'Mmastroianni', license: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Bluemercury_Tribeca_Interior.jpg' },
  { author: 'Samuel Wiki', license: 'CC0', url: 'https://commons.wikimedia.org/wiki/File:Adore_Beauty,_Westfield_Carousel.jpg' },
  { author: 'JollyRancher700', license: 'CC BY-SA 3.0', url: 'https://commons.wikimedia.org/wiki/File:Bluemercury_Interior_-_Upper_West_Side_New_York_City.jpg' },
  { author: 'Samuel Wiki', license: 'CC0', url: 'https://commons.wikimedia.org/wiki/File:Jurlique,_Westfield_Booragoon_04.jpg' }
];

export const SEO = {
  title: 'Интернет-магазин корейской косметики Korea Secret',
  html: '<p>Korea Secret — магазин оригинальной корейской косметики в Душанбе, где уход подбирают под кожу, а не под тренды. Мы работаем напрямую с брендами и дистрибьюторами из Сеула, поэтому в каталоге только сертифицированные средства со свежими сроками годности.</p><p>В ассортименте — более 40 брендов: от культовых COSRX, Anua и Beauty of Joseon до нишевых лабораторий, которые мы первыми привозим в Таджикистан. Тонеры, эссенции, сыворотки, санскрины, кушоны и тинты — всё, что делает корейский уход таким узнаваемым.</p><h3>Почему выбирают нас</h3><p>Каждое средство проходит проверку подлинности, а наши консультанты помогут собрать рутину под ваш тип кожи — онлайн в чате или лично в шоурумах Душанбе: на проспекте Рудаки, улице Шота Руставели, проспекте Исмоили Сомони и улице Айни.</p><p>Бесплатная доставка по Душанбе от 350 смн, подарочные миниатюры к заказам и программа лояльности, где каждая покупка приближает к следующему секрету красоты.</p><h3>Как оформить заказ</h3><p>Добавьте товары в корзину, выберите способ получения — курьер, пункт выдачи или самовывоз из магазина — и оплатите заказ картой Visa, Mastercard, Корти Миллӣ, через мобильный банк или при получении. По Душанбе доставляем в день заказа или на следующий день, в Худжанд, Бохтар, Куляб и другие города Таджикистана — за 2–4 дня.</p>'
};
