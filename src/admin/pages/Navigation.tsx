'use client';
import { useState } from 'react';
import { Art } from '@/components/Art';
import { Footer } from '@/components/chrome/Footer';
import { asset } from '@/lib/asset';
import type { HomeCat, Link as NavLink, MegaPromo, NavItem } from '@/lib/types';
import { useContentVersion } from '@/lib/useContent';
import { uid } from '../state/schema';
import { edit, useAdmin } from '../state/store';
import { useSelected } from '../ui/collection';
import { ThemePicker } from '../ui/fields';
import { I } from '../ui/icons';
import { Badge, Btn, Card, cx, Empty, Field, IconBtn, Input, Note, PageHead, Seg, Switch, TagsInput } from '../ui/kit';
import { confirmDialog, toast } from '../ui/overlay';
import { IconPicker, ImageField, LinkField, ProductsField } from '../ui/pickers';
import { Scaled } from '../ui/preview';
import { moveItem, SortableList } from '../ui/Sortable';
import { undo } from '../state/store';
import '../styles/content.css';

type Tab = 'header' | 'tiles' | 'footer' | 'mega' | 'search';
const TABS: { value: Tab; label: string; icon: string }[] = [
  { value: 'header', label: 'Шапка', icon: 'nav' },
  { value: 'tiles', label: 'Плитки категорий', icon: 'grid' },
  { value: 'footer', label: 'Подвал', icon: 'columns' },
  { value: 'mega', label: 'Мега-меню', icon: 'layout' },
  { value: 'search', label: 'Поиск', icon: 'search' }
];

/* ---------- header menu ---------- */
function HeaderTab() {
  const items = useAdmin((s) => s.draft.nav.header);
  const set = (i: number, patch: Partial<NavItem>, key: string) => edit((d) => { Object.assign(d.nav.header[i], patch); }, { label: 'Меню в шапке', key: `nav:${i}:${key}` });
  return (
    <div className="a-stack">
      <div className="c-nav-preview">
        <div className="a-section-title" style={{ marginBottom: 10 }}>Так выглядит строка меню под логотипом</div>
        <nav className="header__nav">
          {items.map((n, i) => <span key={i} className={n.accent ? 'is-accent' : undefined} style={{ padding: '6px 10px', fontSize: 15, whiteSpace: 'nowrap', color: n.accent ? 'var(--brand)' : undefined, fontWeight: n.accent ? 500 : undefined }}>{n.label || '…'}</span>)}
        </nav>
      </div>
      <Card title="Пункты меню" sub="Порядок — слева направо. На телефоне эта строка скрыта: там работает нижнее меню и каталог."
        actions={<Btn size="sm" icon="plus" onClick={() => edit((d) => { d.nav.header.push({ label: 'Новый пункт', href: '/catalog' }); }, { label: 'Меню: новый пункт' })}>Добавить пункт</Btn>}>
        {items.length ? (
          <SortableList items={items} getKey={(_, i) => String(i)} onMove={(a, b) => edit((d) => moveItem(d.nav.header, a, b), { label: 'Меню: порядок' })}
            render={(n, i, handle) => (
              <div className="c-link-row">
                <span className="a-item__handle" {...handle}><I name="drag" /></span>
                <Input value={n.label} onValue={(v) => set(i, { label: v }, 'l')} placeholder="Название" />
                <LinkField value={n.href} onChange={(v) => set(i, { href: v }, 'h')} />
                <div style={{ paddingTop: 10 }}><Switch checked={!!n.accent} onChange={(v) => set(i, { accent: v || undefined }, 'a')} label={<span style={{ fontSize: 13 }}>Акцент</span>} /></div>
                <IconBtn icon="trash" label="Удалить пункт" danger onClick={() => edit((d) => { d.nav.header.splice(i, 1); }, { label: 'Меню: пункт удалён' })} />
              </div>
            )} />
        ) : <Empty title="Меню пустое" text="Добавьте хотя бы пару пунктов — строка под логотипом иначе останется пустой" />}
      </Card>
      {items.length > 11 && <Note kind="warn">Больше 11 пунктов не помещаются в одну строку на экранах до 1440 px — лишние обрежутся.</Note>}
      <Note>«Акцент» выделяет пункт цветом бренда — обычно это скидки. Ссылка <span className="adm-mono">#giftcard</span> открывает окно подарочной карты, <span className="adm-mono">/#stores</span> — блок главной.</Note>
    </div>
  );
}

/* ---------- category tiles ---------- */
function TileIcon({ t }: { t: HomeCat }) {
  return (
    <span className="c-tile-row__icon">
      {t.image
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={asset(t.image)} alt="" />
        : <Art spec={{ kind: 'icon', name: t.icon }} />}
    </span>
  );
}

function TilesTab() {
  const tiles = useAdmin((s) => s.draft.homeCats);
  const [open, setOpen] = useState<string | null>(null);
  const set = (id: string, patch: Partial<HomeCat>, key: string) => edit((d) => { const t = d.homeCats.find((x) => x.id === id); if (t) Object.assign(t, patch); }, { label: 'Плитки категорий', key: `tile:${id}:${key}` });
  const add = () => { const t: HomeCat = { id: uid('hc'), icon: 'bag', name: 'Новая плитка', href: '/catalog' }; edit((d) => { d.homeCats.push(t); }, { label: 'Плитки: новая' }); setOpen(t.id); };
  return (
    <div className="a-stack">
      <Scaled width={1340} label="Под баннером на главной" className="c-tiles-preview">
        <div className="cats__card">
          <nav className="cats__list">
            {tiles.map((t) => (
              <span key={t.id} className="cat-tile">
                {t.image
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <span className="art cat-tile__icon"><img src={asset(t.image)} alt="" /></span>
                  : <Art className="cat-tile__icon" spec={{ kind: 'icon', name: t.icon }} />}
                <span className="cat-tile__label">{t.name}</span>
              </span>
            ))}
          </nav>
        </div>
      </Scaled>
      {tiles.length !== 8 && tiles.length > 0 && <Note kind="warn">На компьютере плитки стоят в сетке по 8 в ряд — сейчас их {tiles.length}, ряд будет {tiles.length < 8 ? 'неполным' : 'переноситься'}.</Note>}
      <Card title="Плитки" sub="Быстрые ссылки в карточке под баннером. Иконка — объёмная из набора или своя картинка (PNG/WebP с прозрачным фоном)."
        actions={<Btn size="sm" icon="plus" onClick={add}>Добавить плитку</Btn>}>
        {tiles.length ? (
          <SortableList items={tiles} getKey={(t) => t.id} onMove={(a, b) => edit((d) => moveItem(d.homeCats, a, b), { label: 'Плитки: порядок' })}
            render={(t, i, handle) => (
              <div className={cx('c-tile-row', open === t.id && 'is-open')}>
                <span className="a-item__handle" {...handle}><I name="drag" /></span>
                <TileIcon t={t} />
                <div className="a-item__body" onClick={() => setOpen(open === t.id ? null : t.id)}>
                  <div className="a-item__title">{t.name || '—'}</div>
                  <div className="a-item__sub">{t.href || 'без ссылки'}</div>
                </div>
                <div className="a-item__actions">
                  <IconBtn icon={open === t.id ? 'chev-down' : 'edit'} label={open === t.id ? 'Свернуть' : 'Редактировать'} onClick={() => setOpen(open === t.id ? null : t.id)} />
                  <IconBtn icon="trash" label="Удалить плитку" danger onClick={() => { edit((d) => { d.homeCats.splice(i, 1); }, { label: 'Плитки: удалена' }); toast({ title: 'Плитка удалена', icon: 'trash', action: { label: 'Вернуть', fn: () => undo() } }); }} />
                </div>
                {open === t.id && (
                  <div className="c-tile-edit a-form">
                    <div className="a-form-row a-form-row--2">
                      <Field label="Подпись"><Input value={t.name} onValue={(v) => set(t.id, { name: v }, 'n')} /></Field>
                      <Field label="Куда ведёт"><LinkField value={t.href} onChange={(v) => set(t.id, { href: v }, 'h')} /></Field>
                    </div>
                    {!t.image && <Field label="Иконка"><IconPicker kind="art" value={t.icon} onChange={(v) => set(t.id, { icon: v }, 'i')} /></Field>}
                    <Field label="Своя картинка вместо иконки" hint="Квадратная, с прозрачным фоном">
                      <ImageField value={t.image} onChange={(v) => set(t.id, { image: v }, 'img')} folder="tiles" opts={{ max: 400 }} aspect="1 / 1" />
                    </Field>
                  </div>
                )}
              </div>
            )} />
        ) : <Empty title="Плиток нет" text="Блок «Плитки категорий» на главной не покажется, пока здесь пусто" />}
      </Card>
    </div>
  );
}

/* ---------- footer ---------- */
function LinkRows({ links, onChange, label }: { links: NavLink[]; onChange: (fn: (l: NavLink[]) => void, label: string, key?: string) => void; label: string }) {
  return (
    <div className="a-stack a-stack--sm">
      <SortableList items={links} getKey={(_, i) => String(i)} gap={6} className="a-stack a-stack--sm" onMove={(a, b) => onChange((l) => moveItem(l, a, b), `${label}: порядок`)}
        render={(l, i, handle) => (
          <div className="c-link-row c-link-row--stack">
            <span className="a-item__handle" {...handle}><I name="drag" className="i--sm" /></span>
            <Input value={l.label} onValue={(v) => onChange((x) => { x[i].label = v; }, label, `${label}:${i}:l`)} placeholder="Текст ссылки" />
            <IconBtn icon="trash" label="Удалить ссылку" danger size="sm" onClick={() => onChange((x) => { x.splice(i, 1); }, `${label}: ссылка удалена`)} />
            <div className="c-link-row__link"><LinkField value={l.href} onChange={(v) => onChange((x) => { x[i].href = v; }, label, `${label}:${i}:h`)} placeholder="пусто — «скоро»" /></div>
          </div>
        )} />
      <Btn size="sm" icon="plus" onClick={() => onChange((x) => { x.push({ label: 'Новая ссылка', href: '' }); }, `${label}: новая ссылка`)}>Добавить ссылку</Btn>
    </div>
  );
}

function FooterTab() {
  const footer = useAdmin((s) => s.draft.footer);
  const stores = useAdmin((s) => s.draft.stores.filter((x) => !x.hidden).length);
  const v = useContentVersion();
  const col = (ci: number) => (fn: (l: NavLink[]) => void, label: string, key?: string) => edit((d) => fn(d.footer.columns[ci].links), { label: `Подвал: ${label}`, key });
  const removeCol = async (ci: number) => {
    if (!(await confirmDialog({ title: 'Удалить колонку?', text: `«${footer.columns[ci].title}» и все её ссылки исчезнут из подвала.`, confirm: 'Удалить', danger: true }))) return;
    edit((d) => { d.footer.columns.splice(ci, 1); }, { label: 'Подвал: колонка удалена' });
  };
  return (
    <div className="a-stack">
      <Scaled width={1440} label="Подвал сайта" className="c-footer-preview">
        <Footer key={v} />
      </Scaled>
      <Note>Колонка «Магазины» ({stores}) и контакты собираются сами — из раздела «Магазины» и настроек магазина. Пустая ссылка показывает покупателю уведомление «скоро».</Note>
      <div className="c-footer-cols">
        {footer.columns.map((c, ci) => (
          <Card key={ci} title={<span className="adm-row" style={{ gap: 8 }}>Колонка {ci + 1}<Badge>{c.links.length}</Badge></span>}
            actions={<>
              <IconBtn icon="chev-left" label="Левее" size="sm" disabled={ci === 0} onClick={() => edit((d) => moveItem(d.footer.columns, ci, ci - 1), { label: 'Подвал: порядок колонок' })} />
              <IconBtn icon="chev-right" label="Правее" size="sm" disabled={ci === footer.columns.length - 1} onClick={() => edit((d) => moveItem(d.footer.columns, ci, ci + 1), { label: 'Подвал: порядок колонок' })} />
              <IconBtn icon="trash" label="Удалить колонку" danger size="sm" onClick={() => removeCol(ci)} />
            </>}>
            <div className="c-footer-col">
              <Field label="Заголовок колонки"><Input value={c.title} onValue={(val) => edit((d) => { d.footer.columns[ci].title = val; }, { label: 'Подвал: заголовок', key: `foot:${ci}:t` })} /></Field>
              <LinkRows links={c.links} onChange={col(ci)} label={c.title || `Колонка ${ci + 1}`} />
            </div>
          </Card>
        ))}
        {footer.columns.length < 4 && (
          <button type="button" className="a-card a-image" style={{ minHeight: 160 }} onClick={() => edit((d) => { d.footer.columns.push({ title: 'Новая колонка', links: [{ label: 'Ссылка', href: '' }] }); }, { label: 'Подвал: новая колонка' })}>
            <span className="a-image__empty"><I name="plus" /><b>Добавить колонку</b><span>до четырёх колонок ссылок</span></span>
          </button>
        )}
      </div>
      <div className="adm-grid adm-grid--2">
        <Card title="Документы" sub="Ссылки в нижней строке подвала">
          <LinkRows links={footer.legal} onChange={(fn, label, key) => edit((d) => fn(d.footer.legal), { label: `Подвал: ${label}`, key })} label="Документы" />
        </Card>
        <Card title="Тексты">
          <div className="a-form">
            <Field label="Копирайт"><Input value={footer.copyright} onValue={(val) => edit((d) => { d.footer.copyright = val; }, { label: 'Подвал: копирайт', key: 'foot:copy' })} /></Field>
            <Field label="Подпись к подписке на рассылку"><Input value={footer.subscribe} onValue={(val) => edit((d) => { d.footer.subscribe = val; }, { label: 'Подвал: подписка', key: 'foot:sub' })} /></Field>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------- mega menu promos ---------- */
function MegaTab() {
  const list = useAdmin((s) => s.draft.nav.megaPromos);
  const set = (id: string, patch: Partial<MegaPromo>, key: string) => edit((d) => { const m = d.nav.megaPromos.find((x) => x.id === id); if (m) Object.assign(m, patch); }, { label: 'Промо в меню', key: `mega:${id}:${key}` });
  const add = () => edit((d) => { d.nav.megaPromos.push({ id: uid('mp'), title: 'Новое промо', link: '/catalog?offer=sale', theme: 'pink', products: [] }); }, { label: 'Промо в меню: новое' });
  return (
    <div className="a-stack">
      <Note>Карточки справа в выпадающем каталоге (кнопка «Каталог» в шапке). Лучше всего смотрятся две: больше не помещаются без прокрутки.</Note>
      <div className="adm-grid adm-grid--2">
        {list.map((m, i) => (
          <Card key={m.id} title={`Промо ${i + 1}`} actions={<>
            <IconBtn icon="chev-left" label="Выше" size="sm" disabled={i === 0} onClick={() => edit((d) => moveItem(d.nav.megaPromos, i, i - 1), { label: 'Промо в меню: порядок' })} />
            <IconBtn icon="chev-right" label="Ниже" size="sm" disabled={i === list.length - 1} onClick={() => edit((d) => moveItem(d.nav.megaPromos, i, i + 1), { label: 'Промо в меню: порядок' })} />
            <IconBtn icon="trash" label="Удалить" danger size="sm" onClick={() => { edit((d) => { d.nav.megaPromos.splice(i, 1); }, { label: 'Промо в меню: удалено' }); toast({ title: 'Промо удалено', icon: 'trash', action: { label: 'Вернуть', fn: () => undo() } }); }} />
          </>}>
            <div className="a-stack">
              <div>
                <div className="c-mega-preview"><Art spec={{ kind: 'megaPromo', id: m.id }} /></div>
                <div className="c-mega-title">{m.title}</div>
              </div>
              <div className="a-form">
                <Field label="Заголовок"><Input value={m.title} onValue={(v) => set(m.id, { title: v }, 't')} /></Field>
                <Field label="Куда ведёт"><LinkField value={m.link} onChange={(v) => set(m.id, { link: v }, 'l')} /></Field>
                <Field label="Тема"><ThemePicker value={m.theme} onChange={(v) => set(m.id, { theme: v }, 'th')} /></Field>
                {!m.image && <Field label="Товары" hint="Один или два"><ProductsField value={m.products} onChange={(v) => set(m.id, { products: v }, 'p')} max={2} /></Field>}
                <Field label="Своя картинка" hint="16:9 — заменит рисунок"><ImageField value={m.image} onChange={(v) => set(m.id, { image: v }, 'img')} folder="menu" opts={{ max: 1280 }} aspect="16 / 9" /></Field>
              </div>
            </div>
          </Card>
        ))}
        {list.length < 3 && (
          <button type="button" className="a-card a-image" style={{ minHeight: 220 }} onClick={add}>
            <span className="a-image__empty"><I name="plus" /><b>Добавить промо</b><span>картинка-ссылка в меню каталога</span></span>
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- search chips ---------- */
function SearchTab() {
  const chips = useAdmin((s) => s.draft.nav.searchChips);
  return (
    <div className="adm-grid adm-grid--2">
      <Card title="Подсказки «Часто ищут»" sub="Слова-кнопки под полем поиска. Нажатие подставляет слово в поиск — результаты появляются сразу.">
        <div className="a-stack">
          <TagsInput value={chips} onChange={(v) => edit((d) => { d.nav.searchChips = v; }, { label: 'Подсказки поиска' })} placeholder="Слово и Enter" />
          <div className="a-field__hint">Удачные подсказки — названия брендов, компонентов и задач: «центелла», «SPF», «COSRX». Поиск понимает русские и английские слова.</div>
        </div>
      </Card>
      <Card title="Как это выглядит">
        <div className="search__label" style={{ marginTop: 0 }}>Часто ищут</div>
        {chips.length ? <div className="search__chips">{chips.map((c) => <span key={c} className="chip">{c}</span>)}</div> : <div className="adm-muted">Подсказок нет — блок не покажется.</div>}
      </Card>
    </div>
  );
}

export function Navigation() {
  const [tab, setTab] = useSelected('tab');
  const t = (TABS.some((x) => x.value === tab) ? tab : 'header') as Tab;
  return (
    <div className="adm-page c-page">
      <PageHead title={<>Навигация <em>сайта</em></>} sub="Меню в шапке, плитки под баннером, подвал, промо в каталоге и подсказки поиска — всё, по чему покупатель ходит по сайту." />
      <div className="c-tabs"><Seg value={t} onChange={(v) => setTab(v === 'header' ? null : v)} options={TABS} /></div>
      {t === 'header' && <HeaderTab />}
      {t === 'tiles' && <TilesTab />}
      {t === 'footer' && <FooterTab />}
      {t === 'mega' && <MegaTab />}
      {t === 'search' && <SearchTab />}
    </div>
  );
}
