import type { Lang, Loc } from './types';

export const LANGS = ['ru', 'en'] as const satisfies readonly Lang[];
export const DEFAULT_LANG: Lang = 'ru';
export const isLang = (s: string): s is Lang => (LANGS as readonly string[]).includes(s);

const ru = {
  /* chrome */
  'city.default': 'Москва', 'nav.catalog': 'Каталог', 'nav.search': 'Поиск', 'nav.fav': 'Избранное', 'nav.cart': 'Корзина', 'nav.account': 'Профиль', 'nav.home': 'Главная', 'nav.menu': 'Меню', 'logo.home': 'Korea Secret — на главную', 'skip': 'Перейти к содержимому',
  'nav.new': 'Новинки', 'nav.hits': 'Хиты', 'nav.spf': 'Сезон SPF', 'nav.masks': 'Маски', 'nav.sets': 'Наборы', 'nav.giftcards': 'Подарочные карты', 'nav.stores': 'Магазины', 'nav.journal': 'Журнал', 'nav.excl': 'Только в Korea Secret', 'nav.sale': 'Скидки до 30%', 'nav.main': 'Основная навигация',
  'mega.brands': 'Бренды', 'mega.hits': 'Бестселлеры', 'mega.offers': 'Акции', 'mega.all': 'Смотреть всё', 'mega.brandSearch': 'Найти бренд', 'mega.back': 'Назад', 'mega.promo1': '−25% на санскрины SKIN1004 и Round Lab', 'mega.promo2': 'PDRN-уход medicube — новинка сезона', 'mega.byCat': 'Хиты по категориям', 'mega.top': 'Топ-5', 'mega.offersTitle': 'Предложения', 'mega.phone': 'Звонок бесплатный',
  'search.placeholder': 'Найти средство, бренд или компонент', 'search.popular': 'Популярные запросы', 'search.hits': 'Часто ищут', 'search.found': 'Найдено', 'search.all': 'Показать все результаты', 'search.empty': 'По запросу «{q}» ничего не нашлось. Попробуйте другое слово или посмотрите хиты.',
  'search.chips': ['санскрин', 'центелла', 'COSRX', 'тонер', 'PDRN', 'тинт', 'увлажнение', 'Anua'],
  'cart.title': 'Корзина', 'cart.empty.title': 'Корзина пуста', 'cart.empty.text': 'Загляните в каталог — там много секретов красивой кожи', 'cart.toCatalog': 'Перейти в каталог', 'cart.free.left': 'До бесплатной доставки — <b>{sum}</b>', 'cart.gift.left': 'Доставка бесплатная. Ещё <b>{sum}</b> — и миниатюра в подарок', 'cart.all.ok': 'Бесплатная доставка и <b>миниатюра в подарок</b>',
  'cart.promo.ph': 'Промокод', 'cart.promo.apply': 'Применить', 'cart.promo.ok': 'Промокод {code}: −{pct}%', 'cart.promo.min': 'Промокод {code} применён — скидка начнётся от {sum}', 'cart.promo.bad': 'Такого промокода нет', 'cart.promo.remove': 'Убрать', 'cart.subtotal': 'Товары', 'cart.savings': 'Скидка на товары', 'cart.promoLine': 'Промокод', 'cart.delivery': 'Доставка', 'cart.free': 'бесплатно', 'cart.total': 'Итого', 'cart.checkout': 'Оформить заказ', 'cart.remove': 'Удалить', 'cart.added': 'Добавлено в корзину', 'cart.open': 'Корзина', 'cart.removed': 'Товар удалён', 'cart.undo': 'Вернуть',
  'fav.title': 'Избранное', 'fav.empty.title': 'Здесь пока пусто', 'fav.empty.text': 'Нажимайте на сердечко, чтобы сохранить понравившиеся средства', 'fav.added': 'Добавлено в избранное', 'fav.removed': 'Удалено из избранного',
  'card.fav': 'В избранное', 'card.add': 'В корзину', 'card.from': 'от', 'card.oos': 'Нет в наличии', 'card.pcs': 'шт', 'card.dec': 'Уменьшить количество', 'card.inc': 'Увеличить количество', 'tag.hit': 'Хит', 'tag.new': 'New',
  'common.all': 'Все', 'common.prev': 'Назад', 'common.next': 'Вперёд', 'common.close': 'Закрыть', 'common.more': 'Подробнее', 'common.copied': 'Промокод {code} скопирован', 'common.copiedText': 'Мы уже применили его к корзине', 'common.demo': 'Демо-версия магазина', 'common.soon': 'Раздел появится в полной версии сайта',
  'f.about': 'О нас', 'f.aboutLinks': ['О компании', 'Магазины', 'Журнал', 'Вакансии', 'Контакты'], 'f.buyers': 'Покупателям', 'f.buyersLinks': ['Как заказать', 'Оплата', 'Доставка', 'Возврат', 'Программа лояльности'], 'f.info': 'Информация', 'f.infoLinks': ['Подарочные карты', 'Проверка подлинности', 'Вопрос-ответ', 'Оптовым клиентам', 'Карта сайта'], 'f.stores': 'Магазины',
  'f.hours': 'ежедневно с 9:00 до 21:00', 'f.free': 'Звонок бесплатный', 'f.sub': 'Секреты красоты и закрытые акции — раз в неделю', 'f.subPh': 'Ваш e-mail', 'f.subBtn': 'Подписаться', 'f.subOk': 'Спасибо! Первый секрет уже летит к вам', 'f.subBad': 'Проверьте адрес почты', 'f.terms': 'Договор оферты', 'f.privacy': 'Конфиденциальность', 'f.copy': '© 2026 Korea Secret',
  'cookie.text': 'Мы используем cookie, чтобы сайт работал удобнее. Продолжая пользоваться сайтом, вы соглашаетесь с <a href="#">правилами cookie</a>.', 'cookie.ok': 'Хорошо',
  'chat.fab': 'Напишите нам, мы онлайн!', 'chat.name': 'Консультант Korea Secret', 'chat.status': 'Онлайн · отвечаем за 2 минуты', 'chat.hello': 'Здравствуйте! Поможем подобрать уход под ваш тип кожи. Где вам удобнее общаться?', 'chat.call': 'Позвонить',
  'city.title': 'Ваш город', 'city.text': 'От города зависят сроки доставки и наличие в магазинах', 'city.saved': 'Город: {city}',
  'acc.title': 'Вход или регистрация', 'acc.text': 'Введите номер телефона — мы отправим код подтверждения. Бонусы за покупки, история заказов и персональные подборки ждут вас.', 'acc.phone': 'Номер телефона', 'acc.btn': 'Получить код', 'acc.note': 'Нажимая кнопку, вы соглашаетесь с условиями обработки персональных данных', 'acc.demo': 'Демо-режим: SMS не отправляются', 'acc.bad': 'Введите номер полностью',
  'co.title': 'Оформление заказа', 'co.name': 'Имя', 'co.phone': 'Телефон', 'co.email': 'E-mail', 'co.method': 'Способ получения', 'co.courier': 'Курьер', 'co.courierNote': 'завтра', 'co.pickup': 'Пункт выдачи', 'co.pickupNote': '1–3 дня', 'co.store': 'Из магазина', 'co.storeNote': 'сегодня, бесплатно', 'co.address': 'Адрес доставки', 'co.comment': 'Комментарий к заказу', 'co.pay': 'Оплата', 'co.payCard': 'Картой онлайн', 'co.payCardNote': 'Visa, Mastercard, МИР', 'co.paySbp': 'СБП', 'co.paySbpNote': 'по QR-коду', 'co.payCash': 'При получении', 'co.payCashNote': 'картой или наличными', 'co.confirm': 'Подтвердить заказ', 'co.summary': 'Ваш заказ', 'co.success': 'Заказ оформлен!', 'co.successText': 'Номер заказа <span class="success__num">{num}</span>. Мы пришлём SMS, когда он будет готов. Это демо — оплата не списывается.', 'co.continue': 'Продолжить покупки', 'co.required': 'Заполните имя и телефон',
  'gc.title': 'Подарочная карта', 'gc.text': 'Выберите номинал — карту можно вручить в конверте или отправить по e-mail.', 'gc.add': 'Добавить в корзину',
  'story.cta': 'Смотреть товар', 'story.label': 'Истории Korea Secret',
  'pl.reviews': ['{n} отзыв', '{n} отзыва', '{n} отзывов'], 'pl.products': ['{n} продукт', '{n} продукта', '{n} продуктов'], 'pl.items': ['{n} товар', '{n} товара', '{n} товаров'], 'pl.variants': ['Ещё {n} вариант', 'Ещё {n} варианта', 'Ещё {n} вариантов'], 'pl.minutes': ['{n} минута', '{n} минуты', '{n} минут'],
  /* home */
  'home.new': 'Новинки', 'home.excl': 'Только в <em>Korea Secret</em>', 'home.stories': 'Короткие видео', 'home.promos': 'Акции', 'home.sale': 'Скидки', 'home.hits': 'Хиты',
  'home.expert': 'Выбор косметолога', 'home.inEdit': 'в подборке', 'home.strip': 'PDRN-уход medicube: розовое сияние кожи', 'home.stripCta': 'Перейти в каталог',
  'home.reviews': 'Ваши отзывы', 'home.allReviews': 'Все отзывы', 'home.journal': 'Журнал <em>Korea Secret</em>', 'home.read': 'Читать', 'home.collections': 'Подборки', 'home.stores': 'Ждём в гости', 'home.open': 'Открыто до {t}', 'home.route': 'Построить маршрут',
  'home.gift.title': 'Подарочные <br>карты', 'home.gift.text': 'Идеальный подарок для близких. В физическом или электронном формате, на любой номинал.', 'home.gift.cta': 'Купить',
  'home.brands': 'Топ-бренды', 'home.recommend': 'Рекомендуем', 'home.showAll': 'Показать всё', 'home.collapse': 'Свернуть', 'home.categories': 'Категории', 'home.slide': 'Слайд {n}', 'home.heroLabel': 'Акции и новости', 'home.related': 'Товары из статьи',
  /* catalog */
  'c.title': 'Каталог', 'c.home': 'Главная', 'c.search': 'Поиск: «{q}»', 'c.searchCrumb': 'Поиск', 'c.brands': 'Бренды', 'c.expert': 'Выбор косметолога',
  'c.sub': 'Оригинальная корейская косметика со свежими сроками годности', 'c.subCount': '{n} из Кореи — оригинальная продукция со свежими сроками годности',
  'f.instock': 'В наличии', 'f.price': 'Цена', 'f.offer': 'Предложения', 'f.brand': 'Бренд', 'f.type': 'Тип продукта', 'f.skin': 'Тип кожи', 'f.concern': 'Задача', 'f.cat': 'Категория',
  'f.from': 'от', 'f.to': 'до', 'f.reset': 'Сбросить', 'f.resetAll': 'Сбросить всё', 'f.findBrand': 'Найти бренд', 'f.filters': 'Фильтры', 'f.show': 'Показать', 'f.priceChip': 'Цена: {a}–{b}', 'f.qChip': '«{q}»',
  'sort.default': 'По умолчанию', 'sort.popular': 'По популярности', 'sort.priceAsc': 'Сначала дешевле', 'sort.priceDesc': 'Сначала дороже', 'sort.rating': 'По рейтингу', 'sort.discount': 'По размеру скидки', 'sort.new': 'Сначала новинки',
  'c.more': 'Больше продуктов', 'c.next': 'Дальше', 'c.of': '{a} из {b}', 'c.none': 'Ничего не нашлось', 'c.noneText': 'Попробуйте изменить или сбросить фильтры — у нас точно найдётся что-то подходящее.', 'c.hits': 'Хиты категории', 'c.allHits': 'Хиты Korea Secret', 'c.pages': 'Страницы',
  /* product */
  'pp.share': 'Поделиться', 'pp.shared': 'Ссылка скопирована', 'pp.split': '{sum} × 4 платежа частями',
  'pp.shade': 'Оттенок', 'pp.amount': 'Номинал', 'pp.add': 'Добавить в корзину', 'pp.goCart': 'Перейти в корзину', 'pp.online': 'Интернет-магазин', 'pp.stores': 'Магазины',
  'pp.lvl.many': 'много', 'pp.lvl.some': 'есть', 'pp.lvl.few': 'мало', 'pp.lvl.none': 'нет', 'pp.allBrand': 'Все товары бренда',
  'pp.about': 'О продукте', 'pp.desc': 'Описание', 'pp.specs': 'Характеристики', 'pp.ingr': 'Состав', 'pp.how': 'Применение',
  'pp.brand': 'Бренд', 'pp.type': 'Тип', 'pp.skin': 'Тип кожи', 'pp.concern': 'Задачи', 'pp.country': 'Страна', 'pp.korea': 'Республика Корея', 'pp.vol': 'Объём', 'pp.sku': 'Артикул',
  'pp.suits': 'Подходит для кожи: {v}.', 'pp.solves': 'Решает задачи: {v}.', 'pp.keyIngr': 'Ключевые компоненты', 'pp.inci': 'Полный состав (INCI) указан на упаковке.',
  'pp.actives': 'Активные компоненты', 'pp.reviews': 'Отзывы', 'pp.write': 'Написать отзыв', 'pp.helpful': 'Полезно', 'pp.basedOn': 'на основе {n}', 'pp.recommend': '{p}% покупателей рекомендуют',
  'pp.related': 'С этим покупают', 'pp.similar': 'Похожие товары', 'pp.recent': 'Вы смотрели',
  'pp.perk1': 'Оригинал из Кореи', 'pp.perk1t': 'Сертификаты на каждую партию', 'pp.perk2': 'Доставка завтра', 'pp.perk2t': 'Бесплатно от 3 000 ₽', 'pp.perk3': 'Возврат 14 дней', 'pp.perk3t': 'Если упаковка не вскрыта',
  'pp.view.front': 'Упаковка', 'pp.view.texture': 'Текстура', 'pp.view.ingredients': 'Компоненты', 'pp.view.box': 'Коробка', 'pp.view.duo': 'Дуэт', 'pp.zoom': 'Наведите для увеличения',
  'rv.title': 'Ваш отзыв', 'rv.rating': 'Оценка', 'rv.name': 'Имя', 'rv.text': 'Отзыв', 'rv.send': 'Отправить', 'rv.thanks': 'Спасибо! Отзыв появится после модерации', 'rv.need': 'Поставьте оценку и напишите пару слов', 'rv.star': 'Оценка {n} из 5',
  /* misc */
  'nf.title': 'Страница не найдена', 'nf.text': 'Кажется, эта бабочка улетела. Загляните в каталог — там точно найдётся что-то красивое.', 'nf.home': 'На главную',
  'meta.title': 'Korea Secret — корейская косметика: уход, SPF и макияж', 'meta.desc': 'Korea Secret — магазин оригинальной корейской косметики: тонеры, сыворотки, санскрины, кушоны и подарочные наборы. Бесплатная доставка от 3 000 ₽.'
} as const;

type Shape<T> = { [K in keyof T]: T[K] extends readonly string[] ? readonly string[] : string };

const en: Shape<typeof ru> = {
  'city.default': 'Moscow', 'nav.catalog': 'Catalogue', 'nav.search': 'Search', 'nav.fav': 'Wishlist', 'nav.cart': 'Bag', 'nav.account': 'Account', 'nav.home': 'Home', 'nav.menu': 'Menu', 'logo.home': 'Korea Secret — home', 'skip': 'Skip to content',
  'nav.new': 'New in', 'nav.hits': 'Bestsellers', 'nav.spf': 'SPF season', 'nav.masks': 'Masks', 'nav.sets': 'Gift sets', 'nav.giftcards': 'Gift cards', 'nav.stores': 'Stores', 'nav.journal': 'Journal', 'nav.excl': 'Only at Korea Secret', 'nav.sale': 'Sale up to 30%', 'nav.main': 'Main navigation',
  'mega.brands': 'Brands', 'mega.hits': 'Bestsellers', 'mega.offers': 'Offers', 'mega.all': 'View all', 'mega.brandSearch': 'Find a brand', 'mega.back': 'Back', 'mega.promo1': '25% off SKIN1004 & Round Lab sunscreens', 'mega.promo2': 'medicube PDRN care — new this season', 'mega.byCat': 'Bestsellers by category', 'mega.top': 'Top 5', 'mega.offersTitle': 'Offers', 'mega.phone': 'Toll-free',
  'search.placeholder': 'Search products, brands or ingredients', 'search.popular': 'Popular searches', 'search.hits': 'Trending now', 'search.found': 'Found', 'search.all': 'Show all results', 'search.empty': 'Nothing found for “{q}”. Try another word or browse our bestsellers.',
  'search.chips': ['sunscreen', 'centella', 'COSRX', 'toner', 'PDRN', 'tint', 'hydration', 'Anua'],
  'cart.title': 'Your bag', 'cart.empty.title': 'Your bag is empty', 'cart.empty.text': 'Browse the catalogue — plenty of skin secrets are waiting', 'cart.toCatalog': 'Go to catalogue', 'cart.free.left': '<b>{sum}</b> to go until free delivery', 'cart.gift.left': 'Free delivery unlocked. <b>{sum}</b> more for a free mini', 'cart.all.ok': 'Free delivery and a <b>free mini</b> unlocked',
  'cart.promo.ph': 'Promo code', 'cart.promo.apply': 'Apply', 'cart.promo.ok': 'Code {code}: −{pct}%', 'cart.promo.min': 'Code {code} applied — discount starts from {sum}', 'cart.promo.bad': 'That code doesn’t exist', 'cart.promo.remove': 'Remove', 'cart.subtotal': 'Items', 'cart.savings': 'Product discounts', 'cart.promoLine': 'Promo code', 'cart.delivery': 'Delivery', 'cart.free': 'free', 'cart.total': 'Total', 'cart.checkout': 'Checkout', 'cart.remove': 'Remove', 'cart.added': 'Added to bag', 'cart.open': 'View bag', 'cart.removed': 'Item removed', 'cart.undo': 'Undo',
  'fav.title': 'Wishlist', 'fav.empty.title': 'Nothing here yet', 'fav.empty.text': 'Tap the heart to save the products you love', 'fav.added': 'Saved to wishlist', 'fav.removed': 'Removed from wishlist',
  'card.fav': 'Save to wishlist', 'card.add': 'Add to bag', 'card.from': 'from', 'card.oos': 'Out of stock', 'card.pcs': 'pcs', 'card.dec': 'Decrease quantity', 'card.inc': 'Increase quantity', 'tag.hit': 'Hit', 'tag.new': 'New',
  'common.all': 'All', 'common.prev': 'Previous', 'common.next': 'Next', 'common.close': 'Close', 'common.more': 'Learn more', 'common.copied': 'Code {code} copied', 'common.copiedText': 'We’ve already applied it to your bag', 'common.demo': 'Demo storefront', 'common.soon': 'This page comes with the full version of the site',
  'f.about': 'About', 'f.aboutLinks': ['About us', 'Stores', 'Journal', 'Careers', 'Contacts'], 'f.buyers': 'Customer care', 'f.buyersLinks': ['How to order', 'Payment', 'Delivery', 'Returns', 'Loyalty programme'], 'f.info': 'Information', 'f.infoLinks': ['Gift cards', 'Authenticity check', 'FAQ', 'Wholesale', 'Sitemap'], 'f.stores': 'Stores',
  'f.hours': 'daily 9:00–21:00', 'f.free': 'Toll-free', 'f.sub': 'Beauty secrets and private offers — once a week', 'f.subPh': 'Your e-mail', 'f.subBtn': 'Subscribe', 'f.subOk': 'Thank you! Your first secret is on its way', 'f.subBad': 'Please check your e-mail address', 'f.terms': 'Terms of sale', 'f.privacy': 'Privacy', 'f.copy': '© 2026 Korea Secret',
  'cookie.text': 'We use cookies to make the site work better. By continuing to browse you agree to our <a href="#">cookie policy</a>.', 'cookie.ok': 'Got it',
  'chat.fab': 'Chat with us — we’re online!', 'chat.name': 'Korea Secret advisor', 'chat.status': 'Online · replies in 2 minutes', 'chat.hello': 'Hi! We’ll help you build a routine for your skin type. Where would you like to chat?', 'chat.call': 'Call us',
  'city.title': 'Your city', 'city.text': 'Delivery times and store stock depend on your city', 'city.saved': 'City: {city}',
  'acc.title': 'Sign in or sign up', 'acc.text': 'Enter your phone number and we’ll text you a code. Bonus points, order history and personal picks are waiting.', 'acc.phone': 'Phone number', 'acc.btn': 'Get code', 'acc.note': 'By continuing you agree to our personal data policy', 'acc.demo': 'Demo mode: no texts are sent', 'acc.bad': 'Please enter the full number',
  'co.title': 'Checkout', 'co.name': 'Name', 'co.phone': 'Phone', 'co.email': 'E-mail', 'co.method': 'Delivery method', 'co.courier': 'Courier', 'co.courierNote': 'tomorrow', 'co.pickup': 'Pick-up point', 'co.pickupNote': '1–3 days', 'co.store': 'Store pick-up', 'co.storeNote': 'today, free', 'co.address': 'Delivery address', 'co.comment': 'Order note', 'co.pay': 'Payment', 'co.payCard': 'Card online', 'co.payCardNote': 'Visa, Mastercard, MIR', 'co.paySbp': 'SBP', 'co.paySbpNote': 'QR code', 'co.payCash': 'On delivery', 'co.payCashNote': 'card or cash', 'co.confirm': 'Place order', 'co.summary': 'Your order', 'co.success': 'Order placed!', 'co.successText': 'Order number <span class="success__num">{num}</span>. We’ll text you when it’s ready. This is a demo — no payment is taken.', 'co.continue': 'Continue shopping', 'co.required': 'Please fill in your name and phone',
  'gc.title': 'Gift card', 'gc.text': 'Choose an amount — give it in an envelope or send it by e-mail.', 'gc.add': 'Add to bag',
  'story.cta': 'View product', 'story.label': 'Korea Secret stories',
  'pl.reviews': ['{n} review', '{n} reviews'], 'pl.products': ['{n} product', '{n} products'], 'pl.items': ['{n} item', '{n} items'], 'pl.variants': ['+{n} option', '+{n} options'], 'pl.minutes': ['{n} min', '{n} min'],
  'home.new': 'New in', 'home.excl': 'Only at <em>Korea Secret</em>', 'home.stories': 'Short videos', 'home.promos': 'Offers', 'home.sale': 'On sale', 'home.hits': 'Bestsellers',
  'home.expert': 'Cosmetologist’s pick', 'home.inEdit': 'in this edit', 'home.strip': 'medicube PDRN care: a rosy glow', 'home.stripCta': 'Shop now',
  'home.reviews': 'Your reviews', 'home.allReviews': 'All reviews', 'home.journal': 'Korea Secret <em>Journal</em>', 'home.read': 'Read', 'home.collections': 'Collections', 'home.stores': 'Visit us', 'home.open': 'Open until {t}', 'home.route': 'Get directions',
  'home.gift.title': 'Gift <br>cards', 'home.gift.text': 'The perfect present for the people you love. Physical or digital, in any amount.', 'home.gift.cta': 'Buy',
  'home.brands': 'Top brands', 'home.recommend': 'Recommended', 'home.showAll': 'Show all', 'home.collapse': 'Collapse', 'home.categories': 'Categories', 'home.slide': 'Slide {n}', 'home.heroLabel': 'Offers and news', 'home.related': 'Products from this story',
  'c.title': 'Catalogue', 'c.home': 'Home', 'c.search': 'Search: “{q}”', 'c.searchCrumb': 'Search', 'c.brands': 'Brands', 'c.expert': 'Cosmetologist’s pick',
  'c.sub': 'Authentic Korean cosmetics, always freshly dated', 'c.subCount': '{n} from Korea — authentic and always freshly dated',
  'f.instock': 'In stock', 'f.price': 'Price', 'f.offer': 'Offers', 'f.brand': 'Brand', 'f.type': 'Product type', 'f.skin': 'Skin type', 'f.concern': 'Concern', 'f.cat': 'Category',
  'f.from': 'from', 'f.to': 'to', 'f.reset': 'Reset', 'f.resetAll': 'Clear all', 'f.findBrand': 'Find a brand', 'f.filters': 'Filters', 'f.show': 'Show', 'f.priceChip': 'Price: {a}–{b}', 'f.qChip': '“{q}”',
  'sort.default': 'Featured', 'sort.popular': 'Most popular', 'sort.priceAsc': 'Price: low to high', 'sort.priceDesc': 'Price: high to low', 'sort.rating': 'Top rated', 'sort.discount': 'Biggest discount', 'sort.new': 'Newest first',
  'c.more': 'Load more', 'c.next': 'Next', 'c.of': '{a} of {b}', 'c.none': 'No products found', 'c.noneText': 'Try adjusting or clearing the filters — there’s surely something for you.', 'c.hits': 'Category bestsellers', 'c.allHits': 'Korea Secret bestsellers', 'c.pages': 'Pages',
  'pp.share': 'Share', 'pp.shared': 'Link copied', 'pp.split': '4 interest-free payments of {sum}',
  'pp.shade': 'Shade', 'pp.amount': 'Amount', 'pp.add': 'Add to bag', 'pp.goCart': 'View bag', 'pp.online': 'Online', 'pp.stores': 'Stores',
  'pp.lvl.many': 'plenty', 'pp.lvl.some': 'in stock', 'pp.lvl.few': 'few left', 'pp.lvl.none': 'none', 'pp.allBrand': 'All products by',
  'pp.about': 'About the product', 'pp.desc': 'Description', 'pp.specs': 'Details', 'pp.ingr': 'Ingredients', 'pp.how': 'How to use',
  'pp.brand': 'Brand', 'pp.type': 'Type', 'pp.skin': 'Skin type', 'pp.concern': 'Concerns', 'pp.country': 'Country', 'pp.korea': 'South Korea', 'pp.vol': 'Size', 'pp.sku': 'SKU',
  'pp.suits': 'Suits skin types: {v}.', 'pp.solves': 'Targets: {v}.', 'pp.keyIngr': 'Key ingredients', 'pp.inci': 'The full INCI list is printed on the packaging.',
  'pp.actives': 'Active ingredients', 'pp.reviews': 'Reviews', 'pp.write': 'Write a review', 'pp.helpful': 'Helpful', 'pp.basedOn': 'based on {n}', 'pp.recommend': '{p}% of buyers recommend it',
  'pp.related': 'Frequently bought together', 'pp.similar': 'You may also like', 'pp.recent': 'Recently viewed',
  'pp.perk1': 'Authentic from Korea', 'pp.perk1t': 'Certified batches', 'pp.perk2': 'Delivery tomorrow', 'pp.perk2t': 'Free over 3 000 ₽', 'pp.perk3': '14-day returns', 'pp.perk3t': 'For unopened items',
  'pp.view.front': 'Pack', 'pp.view.texture': 'Texture', 'pp.view.ingredients': 'Ingredients', 'pp.view.box': 'Box', 'pp.view.duo': 'Duo', 'pp.zoom': 'Hover to zoom',
  'rv.title': 'Your review', 'rv.rating': 'Rating', 'rv.name': 'Name', 'rv.text': 'Review', 'rv.send': 'Submit', 'rv.thanks': 'Thank you! Your review will appear after moderation', 'rv.need': 'Please add a rating and a few words', 'rv.star': 'Rate {n} of 5',
  'nf.title': 'Page not found', 'nf.text': 'Looks like this butterfly flew away. Browse the catalogue — there’s plenty of beauty waiting.', 'nf.home': 'Back to home',
  'meta.title': 'Korea Secret — Korean skincare, SPF and makeup', 'meta.desc': 'Korea Secret — authentic Korean cosmetics: toners, serums, sunscreens, cushions and gift sets. Free delivery over 3 000 ₽.'
};

const DICT = { ru: ru as Shape<typeof ru>, en };

export type Key = keyof typeof ru;
export type ListKey = { [K in Key]: (typeof ru)[K] extends readonly string[] ? K : never }[Key];
export type StrKey = Exclude<Key, ListKey>;
export type Vars = Record<string, string | number>;

const fill = (s: string, vars?: Vars) => (vars ? s.replace(/\{(\w+)\}/g, (_, k: string) => (vars[k] != null ? String(vars[k]) : '')) : s);
export const fmt = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const MONTHS: Record<Lang, string[]> = {
  ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
};

export interface Translator {
  lang: Lang;
  t: (key: StrKey, vars?: Vars) => string;
  list: (key: ListKey) => readonly string[];
  pl: (key: ListKey, n: number) => string;
  L: (o: Loc | undefined | null) => string;
  date: (d: Date) => string;
}

const cache = new Map<Lang, Translator>();
export function translator(lang: Lang): Translator {
  const hit = cache.get(lang);
  if (hit) return hit;
  const d = DICT[lang];
  const tr: Translator = {
    lang,
    t: (key, vars) => fill(d[key] as string, vars),
    list: (key) => d[key] as readonly string[],
    pl: (key, n) => {
      const forms = d[key] as readonly string[];
      let f: string;
      if (lang === 'ru') { const a = n % 10, b = n % 100; f = a === 1 && b !== 11 ? forms[0] : a >= 2 && a <= 4 && (b < 12 || b > 14) ? forms[1] : forms[2]; }
      else f = n === 1 ? forms[0] : forms[1];
      return fill(f, { n: fmt(n) });
    },
    L: (o) => (o ? o[lang] ?? o.ru : ''),
    date: (dt) => (lang === 'ru' ? `${dt.getUTCDate()} ${MONTHS.ru[dt.getUTCMonth()]}` : `${dt.getUTCDate()} ${MONTHS.en[dt.getUTCMonth()]}`)
  };
  cache.set(lang, tr);
  return tr;
}

/** Prefix a site path with the language: href('ru', '/catalog?x=1') → '/ru/catalog?x=1' */
export const href = (lang: Lang, path = '/') => {
  if (/^(https?:|tel:|mailto:)/.test(path)) return path;
  if (path.startsWith('#')) return `/${lang}${path}`;
  if (path === '/' || path === '') return `/${lang}`;
  if (path.startsWith('/#')) return `/${lang}${path.slice(1)}`;
  return `/${lang}${path.startsWith('/') ? path : '/' + path}`;
};
