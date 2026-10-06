'use client';
import Link from 'next/link';
import { useState } from 'react';
import { mdText } from '@/lib/md';
import type { HomeSection, SectionType, Sort } from '@/lib/types';
import { sectionProducts } from '@/components/home/sections';
import { SECTION_NAMES } from '../state/diff';
import { mapLinks } from '../state/refs';
import { ID_RE, uid } from '../state/schema';
import { edit, undo, useAdmin } from '../state/store';
import { useSelected } from '../ui/collection';
import { MarkdownField } from '../ui/fields';
import { I } from '../ui/icons';
import { Badge, Btn, cx, Field, IconBtn, Input, LazyInput, Menu, Note, NumInput, PageHead, Select, Seg, Switch, TextArea } from '../ui/kit';
import { confirmDialog, Dialog, toast } from '../ui/overlay';
import { ImageField, LinkField, ProductsField, QueryBuilder } from '../ui/pickers';
import { SitePreview, type Device } from '../ui/preview';
import { moveItem, SortableList } from '../ui/Sortable';

const META: Record<SectionType, { icon: string; desc: string; manage?: [string, string]; multi?: boolean }> = {
  hero: { icon: 'image', desc: 'Большой слайдер с баннерами в начале страницы', manage: ['/admin/banners/', 'Баннеры'] },
  categories: { icon: 'grid', desc: 'Круглые иконки-плитки разделов каталога', manage: ['/admin/navigation/?tab=tiles', 'Плитки'] },
  products: { icon: 'box', desc: 'Лента или сетка товаров по подбору: новинки, скидки, хиты, бренд, категория…', multi: true },
  stories: { icon: 'play', desc: 'Короткие видео-истории в формате сторис', manage: ['/admin/stories/', 'Истории'] },
  promos: { icon: 'percent', desc: 'Карусель карточек с акциями', manage: ['/admin/promos/', 'Акции'] },
  bloggers: { icon: 'user', desc: 'Подборки товаров от блогеров', manage: ['/admin/bloggers/', 'Блогеры'] },
  strip: { icon: 'nav', desc: 'Узкий баннер-ссылка с товарами', multi: true },
  reviews: { icon: 'star-o', desc: 'Карусель товаров с отзывами покупателей' },
  journal: { icon: 'book', desc: 'Статьи журнала: большая обложка и карточки', manage: ['/admin/journal/', 'Журнал'] },
  spotlight: { icon: 'sparkle', desc: 'Бренд в фокусе: описание, картинка и товары бренда', multi: true },
  collections: { icon: 'layers', desc: 'Большие карточки тематических подборок', manage: ['/admin/collections/', 'Подборки'] },
  stores: { icon: 'store', desc: 'Магазины с фото, часами работы и картой', manage: ['/admin/stores/', 'Магазины'] },
  giftcards: { icon: 'gift', desc: 'Баннер подарочных карт с кнопкой покупки', multi: true },
  brands: { icon: 'tag', desc: 'Плитки самых популярных брендов' },
  seo: { icon: 'type', desc: 'Текстовый блок для поисковиков с кнопкой «Показать всё»', multi: true }
};
const SORT_NAMES: [Sort, string][] = [['default', 'Хиты, затем по рейтингу'], ['popular', 'По популярности'], ['new', 'Сначала новинки'], ['discount', 'По размеру скидки'], ['rating', 'По рейтингу'], ['priceAsc', 'Сначала дешевле'], ['priceDesc', 'Сначала дороже']];

function make(type: SectionType, c: { brands: { id: string }[] }): HomeSection {
  const id = uid(`${type}-`);
  switch (type) {
    case 'products': return { id, type, title: 'Новая *подборка*', link: '/catalog', query: '', sort: 'popular', limit: 10, pinned: [], layout: 'slider' };
    case 'strip': return { id, type, title: 'Короткий заголовок баннера', link: '/catalog', cta: 'Смотреть', products: [] };
    case 'spotlight': return { id, type, brand: c.brands[0]?.id || '', text: 'Пара предложений о бренде', cta: 'К покупкам', art: [] };
    case 'giftcards': return { id, type, title: 'Подарочные\nкарты', text: 'Идеальный подарок для близких.', cta: 'Купить', amount: '1 000 смн' };
    case 'seo': return { id, type, title: 'Заголовок', body: 'Текст для поисковиков.' };
    case 'reviews': return { id, type, title: 'Ваши отзывы', minReviews: 300, limit: 6 };
    case 'brands': return { id, type, title: 'Топ-бренды', link: '/catalog', limit: 16 };
    case 'promos': return { id, type, title: 'Акции', link: '/catalog?offer=sale' };
    case 'hero': case 'categories': return { id, type } as HomeSection;
    default: return { id, type, title: SECTION_NAMES[type] } as HomeSection;
  }
}
const label = (s: HomeSection) => ('title' in s && s.title ? mdText(s.title) : s.type === 'spotlight' ? 'Бренд в фокусе' : SECTION_NAMES[s.type]);

function SectionForm({ s }: { s: HomeSection }) {
  const draft = useAdmin((st) => st.draft);
  const set = (patch: Record<string, unknown>, key?: string) => edit((d) => { const x = d.home.sections.find((y) => y.id === s.id); if (x) Object.assign(x, patch); }, { label: `Главная: ${label(s)}`, key: key ? `home:${s.id}:${key}` : undefined });
  const meta = META[s.type];
  const count = (n: number, one: string, many: string) => `${n} ${n % 10 === 1 && n % 100 !== 11 ? one : many}`;
  const manage = meta.manage && (() => {
    const n = s.type === 'hero' ? draft.heroSlides.filter((x) => !x.hidden).length : s.type === 'categories' ? draft.homeCats.length : s.type === 'stories' ? draft.stories.length : s.type === 'promos' ? draft.promos.length : s.type === 'bloggers' ? draft.bloggers.length : s.type === 'journal' ? draft.articles.length : s.type === 'collections' ? draft.collections.length : draft.stores.length;
    return <Note icon={meta.icon}>Содержимое блока ({count(n, 'элемент', 'элементов')}) редактируется в разделе <Link className="a-link" href={meta.manage[0]}>{meta.manage[1]} →</Link></Note>;
  })();

  const title = 'title' in s && (
    <Field label="Заголовок" hint="*Слово в звёздочках* — курсивом"><Input value={s.title} onValue={(v) => set({ title: v }, 'title')} /></Field>
  );
  return (
    <div className="a-form">
      {manage}
      {s.type === 'products' && (() => {
        const found = sectionProducts({ ...s, limit: 999 }).length;
        return (
          <>
            {title}
            <Field label="Ссылка «Все»"><LinkField value={s.link} onChange={(v) => set({ link: v })} /></Field>
            <Field label="Вид"><Seg value={s.layout} onChange={(v) => set({ layout: v })} options={[{ value: 'slider', label: 'Лента', icon: 'columns' }, { value: 'grid', label: 'Сетка', icon: 'grid' }]} /></Field>
            <div className="a-form-row a-form-row--2">
              <Field label="Сколько товаров"><NumInput value={s.limit} onValue={(v) => set({ limit: Math.max(1, Math.round(v || 1)) }, 'limit')} min={1} max={60} /></Field>
              <Field label="Пропустить первые" hint="Чтобы не повторять соседний блок"><NumInput value={s.offset || 0} onValue={(v) => set({ offset: Math.max(0, Math.round(v || 0)) || undefined }, 'offset')} min={0} /></Field>
            </div>
            <Field label="Порядок"><Select value={s.sort} onValue={(v) => set({ sort: v })} options={SORT_NAMES} /></Field>
            <div className="a-card a-card--soft" style={{ padding: 16 }}>
              <div className="a-section-title" style={{ marginBottom: 12 }}>Подбор товаров · найдено {found}</div>
              <QueryBuilder value={s.query} onChange={(v) => set({ query: v }, 'query')} withSort={false} />
            </div>
            <Field label="Закрепить в начале" hint="Эти товары покажутся первыми, в этом порядке"><ProductsField value={s.pinned} onChange={(v) => set({ pinned: v })} /></Field>
            <Switch checked={!!s.fill} onChange={(v) => set({ fill: v || undefined })} label="Добирать до нужного количества" hint="Если подбор нашёл меньше товаров — добавить другие в том же порядке" />
          </>
        );
      })()}
      {(s.type === 'stories' || s.type === 'bloggers' || s.type === 'journal' || s.type === 'collections' || s.type === 'stores') && title}
      {s.type === 'promos' && <>{title}<Field label="Ссылка «Все»"><LinkField value={s.link} onChange={(v) => set({ link: v })} /></Field></>}
      {s.type === 'strip' && <>
        <Field label="Текст баннера"><Input value={s.title} onValue={(v) => set({ title: v }, 'title')} /></Field>
        <div className="a-form-row a-form-row--2"><Field label="Кнопка"><Input value={s.cta} onValue={(v) => set({ cta: v }, 'cta')} /></Field></div>
        <Field label="Ссылка"><LinkField value={s.link} onChange={(v) => set({ link: v })} /></Field>
        <Field label="Товары на баннере" hint="До трёх"><ProductsField value={s.products} onChange={(v) => set({ products: v })} max={3} /></Field>
        <Field label="Или своя картинка"><ImageField value={s.image} onChange={(v) => set({ image: v })} folder="home" opts={{ max: 1000 }} /></Field>
      </>}
      {s.type === 'reviews' && <>
        {title}
        <div className="a-form-row a-form-row--2">
          <Field label="Товаров в карусели"><NumInput value={s.limit} onValue={(v) => set({ limit: Math.max(1, Math.round(v || 1)) }, 'limit')} min={1} max={20} /></Field>
          <Field label="Минимум отзывов у товара"><NumInput value={s.minReviews} onValue={(v) => set({ minReviews: Math.max(0, Math.round(v || 0)) }, 'min')} min={0} /></Field>
        </div>
      </>}
      {s.type === 'spotlight' && <>
        <Field label="Бренд"><Select value={s.brand} onValue={(v) => set({ brand: v })} options={draft.brands.map((b) => [b.id, b.name] as const)} /></Field>
        <Field label="Текст"><TextArea value={s.text} onValue={(v) => set({ text: v }, 'text')} rows={3} /></Field>
        <Field label="Кнопка"><Input value={s.cta} onValue={(v) => set({ cta: v }, 'cta')} /></Field>
        <Field label="Товары на картинке" hint="До трёх; ниже баннера покажутся все товары бренда"><ProductsField value={s.art} onChange={(v) => set({ art: v })} max={3} /></Field>
        <Field label="Или своя картинка"><ImageField value={s.image} onChange={(v) => set({ image: v })} folder="home" opts={{ max: 1200 }} /></Field>
      </>}
      {s.type === 'giftcards' && <>
        <Field label="Заголовок" hint="Перенос строки — Enter"><TextArea value={s.title} onValue={(v) => set({ title: v }, 'title')} rows={2} /></Field>
        <Field label="Текст"><TextArea value={s.text} onValue={(v) => set({ text: v }, 'text')} rows={2} /></Field>
        <div className="a-form-row a-form-row--2">
          <Field label="Кнопка"><Input value={s.cta} onValue={(v) => set({ cta: v }, 'cta')} /></Field>
          <Field label="Номинал на карте"><Input value={s.amount} onValue={(v) => set({ amount: v }, 'amount')} /></Field>
        </div>
        <Field label="Или своя картинка"><ImageField value={s.image} onChange={(v) => set({ image: v })} folder="home" opts={{ max: 1200 }} /></Field>
      </>}
      {s.type === 'brands' && <>
        {title}
        <div className="a-form-row a-form-row--2">
          <Field label="Сколько брендов"><NumInput value={s.limit} onValue={(v) => set({ limit: Math.max(1, Math.round(v || 1)) }, 'limit')} min={1} max={40} /></Field>
        </div>
        <Field label="Ссылка «Все»"><LinkField value={s.link} onChange={(v) => set({ link: v })} /></Field>
      </>}
      {s.type === 'seo' && <>
        <Field label="Заголовок (H1 страницы)" hint="Единственный H1 главной — важен для поиска"><Input value={s.title} onValue={(v) => set({ title: v }, 'title')} /></Field>
        <Field label="Текст"><MarkdownField value={s.body} onChange={(v) => set({ body: v }, 'body')} /></Field>
      </>}
      <details className="a-details">
        <summary>Якорь блока: #{s.id}</summary>
        <Field hint="Ссылки вида /#якорь ведут к этому блоку; при смене обновятся автоматически">
          <LazyInput value={s.id} validate={(v) => (!ID_RE.test(v) ? 'Латиница, цифры и дефис' : draft.home.sections.some((x) => x.id === v && x !== s) ? 'Уже занят' : null)}
            onCommit={(v) => edit((d) => { const x = d.home.sections.find((y) => y.id === s.id); if (x) x.id = v; mapLinks(d, (l) => (l === `/#${s.id}` ? `/#${v}` : l)); }, { label: 'Главная: якорь' })} />
        </Field>
      </details>
    </div>
  );
}

export function HomeBuilder() {
  const draft = useAdmin((s) => s.draft);
  const list = draft.home.sections;
  const [sel, select] = useSelected();
  const [device, setDevice] = useState<Device>('desktop');
  const [adding, setAdding] = useState(false);
  const current = list.find((s) => s.id === sel);

  const add = (type: SectionType) => {
    const s = make(type, draft);
    const at = current ? list.indexOf(current) + 1 : list.length;
    edit((d) => { d.home.sections.splice(at, 0, s); }, { label: `Главная: добавлен блок «${SECTION_NAMES[type]}»` });
    setAdding(false);
    select(s.id);
  };
  const remove = async (s: HomeSection) => {
    if (!(await confirmDialog({ title: 'Удалить блок?', text: <>Блок «{label(s)}» исчезнет с главной. Его содержимое (баннеры, статьи…) останется в своих разделах.</>, confirm: 'Удалить', danger: true }))) return;
    if (sel === s.id) select(null);
    edit((d) => { d.home.sections = d.home.sections.filter((x) => x.id !== s.id); }, { label: `Главная: удалён блок «${label(s)}»` });
    toast({ title: 'Блок удалён', icon: 'trash', action: { label: 'Вернуть', fn: () => undo() } });
  };
  const toggle = (s: HomeSection) => edit((d) => { const x = d.home.sections.find((y) => y.id === s.id); if (x) x.hidden = !x.hidden; }, { label: `Главная: ${s.hidden ? 'показан' : 'скрыт'} блок` });
  const duplicate = (s: HomeSection) => {
    const copy = { ...JSON.parse(JSON.stringify(s)), id: uid(`${s.type}-`) } as HomeSection;
    edit((d) => { d.home.sections.splice(d.home.sections.findIndex((x) => x.id === s.id) + 1, 0, copy); }, { label: 'Главная: копия блока' });
    select(copy.id);
  };

  return (
    <div className="adm-page">
      <PageHead title={<>Главная <em>страница</em></>} sub="Соберите главную из блоков: порядок, видимость и настройки каждого. Справа — настоящий сайт с вашим черновиком; клик по блоку в предпросмотре открывает его настройки."
        actions={<Btn variant="primary" icon="plus" onClick={() => setAdding(true)}>Добавить блок</Btn>} />
      <div className="a-hb">
        <div className="a-stack" style={{ minWidth: 0 }}>
          {current ? (
            <div className="a-card a-hb__panel">
              <div className="adm-row" style={{ marginBottom: 14 }}>
                <IconBtn icon="arrow-left" label="К списку блоков" onClick={() => select(null)} />
                <div className="adm-grow" style={{ minWidth: 0 }}>
                  <div className="a-section-title" style={{ margin: 0 }}>{SECTION_NAMES[current.type]}</div>
                  <div className="a-card__title adm-ellipsis" style={{ fontSize: 20 }}>{label(current)}</div>
                </div>
                <Menu items={[{ label: current.hidden ? 'Показать' : 'Скрыть', icon: current.hidden ? 'eye' : 'eye-off', onClick: () => toggle(current) }, { label: 'Дублировать', icon: 'duplicate', onClick: () => duplicate(current) }, { sep: true }, { label: 'Удалить блок', icon: 'trash', danger: true, onClick: () => remove(current) }]} />
              </div>
              {current.hidden && <div style={{ marginBottom: 14 }}><Note kind="warn" icon="eye-off">Блок скрыт — на сайте его нет. <button type="button" className="a-link" onClick={() => toggle(current)}>Показать</button></Note></div>}
              <SectionForm s={current} />
            </div>
          ) : (
            <SortableList items={list} getKey={(s) => s.id} gap={6} onMove={(a, b) => edit((d) => moveItem(d.home.sections, a, b), { label: 'Главная: порядок блоков' })}
              render={(s, i, handle) => (
                <div className={cx('a-item', 'a-hb__item', s.hidden && 'is-hidden')} style={{ minHeight: 56 }}>
                  <span className="a-item__handle" {...handle}><I name="drag" className="i--sm" /></span>
                  <span className="a-hb__icon"><I name={META[s.type].icon} /></span>
                  <div className="a-item__body" onClick={() => select(s.id)}>
                    <div className="a-item__title" style={{ fontSize: 13.5 }}>{label(s)}</div>
                    <div className="a-item__sub">{SECTION_NAMES[s.type]}{s.type === 'products' ? ` · ${sectionProducts(s).length} товаров` : ''}</div>
                  </div>
                  {s.hidden && <Badge>скрыт</Badge>}
                  <IconBtn size="sm" icon={s.hidden ? 'eye-off' : 'eye'} label={s.hidden ? 'Показать' : 'Скрыть'} onClick={() => toggle(s)} />
                  <span className="adm-muted adm-num" style={{ fontSize: 11, width: 16, textAlign: 'right' }}>{i + 1}</span>
                </div>
              )} />
          )}
          {!current && <Btn icon="plus" block onClick={() => setAdding(true)}>Добавить блок</Btn>}
        </div>
        <div className="a-hb__canvas">
          <SitePreview path="/" device={device} onDevice={setDevice} focus={current?.hidden ? undefined : current?.id} onSelect={(id) => { if (list.some((s) => s.id === id)) select(id); }} height="100%" className="a-hb__site" />
        </div>
      </div>
      <Dialog open={adding} onClose={() => setAdding(false)} size="wide" label="Новый блок">
        <div className="adm-row adm-row--between" style={{ marginBottom: 14 }}>
          <div><div className="a-dialog__title">Новый блок</div><div className="adm-muted" style={{ marginTop: 4 }}>{current ? `Встанет после «${label(current)}»` : 'Встанет в конец страницы'}</div></div>
          <IconBtn icon="close" label="Закрыть" onClick={() => setAdding(false)} />
        </div>
        <div className="a-blocks">
          {(Object.keys(META) as SectionType[]).map((t) => {
            const exists = list.some((s) => s.type === t);
            return (
              <button key={t} type="button" className="a-block" onClick={() => add(t)}>
                <span className="a-hb__icon"><I name={META[t].icon} /></span>
                <span><b>{SECTION_NAMES[t]}</b><small>{META[t].desc}</small>{exists && !META[t].multi && <small className="adm-accent">уже есть на странице</small>}</span>
              </button>
            );
          })}
        </div>
      </Dialog>
    </div>
  );
}
