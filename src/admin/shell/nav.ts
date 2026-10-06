export interface NavItem { href: string; label: string; icon: string; badge?: 'orders' | 'products' | 'changes' | 'issues'; keywords?: string }
export interface NavGroup { label: string; items: NavItem[] }

export const NAV: NavGroup[] = [
  { label: 'Обзор', items: [
    { href: '/admin/', label: 'Дашборд', icon: 'dashboard', keywords: 'главная обзор сводка' },
    { href: '/admin/orders/', label: 'Заказы', icon: 'receipt', badge: 'orders', keywords: 'продажи покупки статусы' },
    { href: '/admin/customers/', label: 'Клиенты', icon: 'users', keywords: 'покупатели crm' },
    { href: '/admin/analytics/', label: 'Аналитика', icon: 'chart', keywords: 'статистика графики выручка' },
    { href: '/admin/reports/', label: 'Отчёты', icon: 'report', keywords: 'экспорт excel xlsx csv pdf выгрузка' }
  ] },
  { label: 'Каталог', items: [
    { href: '/admin/products/', label: 'Товары', icon: 'box', badge: 'products', keywords: 'продукты цены остатки склад' },
    { href: '/admin/brands/', label: 'Бренды', icon: 'tag', keywords: 'компании производители' },
    { href: '/admin/categories/', label: 'Категории и типы', icon: 'layers', keywords: 'разделы меню таксономия' },
    { href: '/admin/ingredients/', label: 'Ингредиенты', icon: 'flask', keywords: 'состав компоненты' },
    { href: '/admin/dictionaries/', label: 'Справочники', icon: 'list', keywords: 'тип кожи задачи предложения' },
    { href: '/admin/reviews/', label: 'Отзывы', icon: 'star-o', keywords: 'оценки комментарии' }
  ] },
  { label: 'Витрина', items: [
    { href: '/admin/home/', label: 'Главная страница', icon: 'layout', keywords: 'конструктор блоки секции порядок' },
    { href: '/admin/banners/', label: 'Баннеры', icon: 'image', keywords: 'слайдер hero слайды' },
    { href: '/admin/promos/', label: 'Акции', icon: 'percent', keywords: 'промо скидки промо-полоса' },
    { href: '/admin/stories/', label: 'Истории', icon: 'play', keywords: 'видео сторис' },
    { href: '/admin/collections/', label: 'Подборки', icon: 'grid', keywords: 'коллекции' },
    { href: '/admin/bloggers/', label: 'Блогеры', icon: 'user', keywords: 'выбор блогеров фавориты' },
    { href: '/admin/journal/', label: 'Журнал', icon: 'book', keywords: 'статьи блог' },
    { href: '/admin/stores/', label: 'Магазины', icon: 'store', keywords: 'адреса карта шоурум' },
    { href: '/admin/navigation/', label: 'Навигация', icon: 'nav', keywords: 'меню шапка подвал футер плитки' },
    { href: '/admin/texts/', label: 'Тексты и SEO', icon: 'type', keywords: 'seo заголовки чат cookie оформление заказа' }
  ] },
  { label: 'Система', items: [
    { href: '/admin/settings/', label: 'Настройки магазина', icon: 'settings', keywords: 'доставка промокод валюта телефон города соцсети' },
    { href: '/admin/appearance/', label: 'Оформление', icon: 'palette', keywords: 'цвет тема бренд' },
    { href: '/admin/media/', label: 'Медиатека', icon: 'images', keywords: 'картинки фото загрузки' },
    { href: '/admin/publish/', label: 'Публикация', icon: 'cloud', badge: 'changes', keywords: 'github история версии деплой резервная копия' }
  ] }
];

export const ALL_PAGES = NAV.flatMap((g) => g.items.map((i) => ({ ...i, group: g.label })));
