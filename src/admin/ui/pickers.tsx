'use client';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Art } from '@/components/Art';
import { asset } from '@/lib/asset';
import { fromQuery, results, SORTS, toQuery, type CatalogState } from '@/lib/catalog';
import { mdText } from '@/lib/md';
import { brandOf, getProduct, price, titleOf } from '@/lib/shop';
import type { Product, SiteContent } from '@/lib/types';
import { SECTION_NAMES } from '../state/diff';
import { contentImages, fmtBytes, uploadImage, type ImageOpts } from '../state/media';
import { useAdmin } from '../state/store';
import { I } from './icons';
import { Badge, Btn, Chips, cx, Empty, Field, IconBtn, Input, Select, Seg, Switch } from './kit';
import { Dialog, toast } from './overlay';
import { moveItem, SortableList } from './Sortable';

const useDraft = () => useAdmin((s) => s.draft);

/* ---------- product thumbnails ---------- */
export function ProductThumb({ id, className = 'a-cell__art' }: { id: string; className?: string }) {
  return <span className={className}><Art spec={{ kind: 'product', id }} /></span>;
}

export function ProductCell({ p, sub }: { p: Product; sub?: ReactNode }) {
  return (
    <div className="a-cell">
      <ProductThumb id={p.id} />
      <div style={{ minWidth: 0 }}>
        <div className="a-cell__title adm-clamp2">{p.name}</div>
        <div className="a-cell__sub">{sub ?? `${brandOf(p.brand).name} · ${price(p.price)}`}</div>
      </div>
    </div>
  );
}

/* ---------- product picker ---------- */
export function ProductPicker({ open, onClose, value, onDone, multiple = true, title = 'Выбор товаров', max }: { open: boolean; onClose: () => void; value: string[]; onDone: (ids: string[]) => void; multiple?: boolean; title?: string; max?: number }) {
  const draft = useDraft();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [sel, setSel] = useState<string[]>(value);
  useEffect(() => { if (open) { setSel(value); setQ(''); } }, [open, value]);
  const list = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return draft.products.filter((p) => (!cat || draft.taxonomy.types[p.type]?.cat === cat) && (!ql || `${p.name} ${brandOf(p.brand).name} ${p.id}`.toLowerCase().includes(ql)));
  }, [draft, q, cat]);
  const toggle = (id: string) => {
    if (!multiple) { onDone([id]); onClose(); return; }
    setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : max && s.length >= max ? s : [...s, id]));
  };
  return (
    <Dialog open={open} onClose={onClose} size="xl" label={title}>
      <div className="adm-row adm-row--between" style={{ marginBottom: 14 }}>
        <div className="a-dialog__title">{title}</div>
        <IconBtn icon="close" label="Закрыть" onClick={onClose} />
      </div>
      <div className="adm-row adm-row--wrap" style={{ marginBottom: 14 }}>
        <div className="a-affix a-affix--prefix adm-grow" style={{ minWidth: 220 }}>
          <span className="a-affix__prefix"><I name="search" className="i--sm" /></span>
          <input className="a-input" autoFocus placeholder="Название, бренд или id" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={cat} onValue={setCat} options={draft.taxonomy.categories.map((c) => [c.id, c.name] as const)} placeholder="Все категории" />
      </div>
      <div style={{ maxHeight: '58vh', overflow: 'auto', padding: 2 }}>
        {list.length ? (
          <div className="a-pgrid">
            {list.map((p) => {
              const i = sel.indexOf(p.id);
              return (
                <button key={p.id} type="button" className={cx('a-pgrid__item', i >= 0 && 'is-active')} onClick={() => toggle(p.id)}>
                  <span className="a-pgrid__art"><Art spec={{ kind: 'product', id: p.id }} /></span>
                  {i >= 0 && <span className="a-pgrid__check">{multiple ? <b style={{ fontSize: 12 }}>{i + 1}</b> : <I name="check" />}</span>}
                  <span className="a-pgrid__name">{p.name}</span>
                  <span className="adm-row" style={{ gap: 6, fontSize: 12, color: 'var(--muted)' }}>{brandOf(p.brand).name}{p.hidden && <Badge>скрыт</Badge>}</span>
                </button>
              );
            })}
          </div>
        ) : <Empty title="Ничего не нашлось" text="Измените запрос или категорию" />}
      </div>
      {multiple && (
        <div className="a-dialog__foot" style={{ alignItems: 'center' }}>
          <span className="adm-muted adm-grow">Выбрано: {sel.length}{max ? ` из ${max}` : ''} · порядок — по очерёдности выбора</span>
          {sel.length > 0 && <Btn variant="ghost" onClick={() => setSel([])}>Сбросить</Btn>}
          <Btn variant="primary" onClick={() => { onDone(sel); onClose(); }}>Готово</Btn>
        </div>
      )}
    </Dialog>
  );
}

/** An ordered list of products: drag to reorder, add from the picker, remove. */
export function ProductsField({ value, onChange, max, addLabel = 'Добавить товары', empty = 'Товары не выбраны' }: { value: string[]; onChange: (ids: string[]) => void; max?: number; addLabel?: string; empty?: string }) {
  const [open, setOpen] = useState(false);
  useDraft();
  return (
    <div className="a-picker">
      {value.length ? (
        <SortableList items={value} getKey={(id, i) => id + i} gap={6} className="a-picker__list" onMove={(a, b) => { const next = value.slice(); moveItem(next, a, b); onChange(next); }}
          render={(id, i, handle) => {
            const p = getProduct(id);
            return (
              <div className={cx('a-picker__row', !p && 'is-missing')}>
                <span className="a-item__handle" {...handle}><I name="drag" className="i--sm" /></span>
                {p ? <ProductThumb id={id} /> : <span className="a-cell__art"><I name="alert" className="adm-red" /></span>}
                <div className="adm-grow">
                  <div className="a-cell__title adm-ellipsis">{p ? p.name : `Товар «${id}» не найден`}</div>
                  <div className="a-cell__sub">{p ? `${brandOf(p.brand).name} · ${price(p.price)}${p.hidden ? ' · скрыт' : ''}` : 'удалён из каталога — уберите его'}</div>
                </div>
                <IconBtn icon="close" size="sm" label="Убрать" danger onClick={() => onChange(value.filter((_, k) => k !== i))} />
              </div>
            );
          }} />
      ) : <div className="a-field__hint" style={{ padding: '6px 2px' }}>{empty}</div>}
      {(!max || value.length < max) && <Btn size="sm" icon="plus" onClick={() => setOpen(true)}>{addLabel}</Btn>}
      <ProductPicker open={open} onClose={() => setOpen(false)} value={value} onDone={onChange} max={max} />
    </div>
  );
}

export function ProductSelect({ value, onChange, placeholder = 'Выбрать товар' }: { value: string; onChange: (id: string) => void; placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const p = value ? getProduct(value) : undefined;
  return (
    <>
      <button type="button" className="a-picker__row" style={{ width: '100%', textAlign: 'left' }} onClick={() => setOpen(true)}>
        {p ? <ProductThumb id={p.id} /> : <span className="a-cell__art"><I name="box" /></span>}
        <span className="adm-grow adm-ellipsis">{p ? titleOf(p) : <span className="adm-muted">{placeholder}</span>}</span>
        <I name="chev-down" className="i--sm" />
      </button>
      <ProductPicker open={open} onClose={() => setOpen(false)} value={value ? [value] : []} onDone={(ids) => onChange(ids[0] || '')} multiple={false} title="Выбор товара" />
    </>
  );
}

/* ---------- images ---------- */
export function MediaPicker({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (path: string) => void }) {
  const draft = useDraft();
  const uploads = useAdmin((s) => s.uploads);
  const list = useMemo(() => {
    const seen = new Map<string, string>();
    uploads.forEach((u) => seen.set(u.path, 'Новая, ещё не опубликована'));
    contentImages(draft).forEach((x) => { if (!seen.has(x.path)) seen.set(x.path, x.where); });
    return [...seen.entries()];
  }, [draft, uploads]);
  return (
    <Dialog open={open} onClose={onClose} size="xl" label="Медиатека">
      <div className="adm-row adm-row--between" style={{ marginBottom: 14 }}>
        <div className="a-dialog__title">Медиатека</div>
        <IconBtn icon="close" label="Закрыть" onClick={onClose} />
      </div>
      {list.length ? (
        <div className="a-thumbs" style={{ maxHeight: '60vh', overflow: 'auto' }}>
          {list.map(([path, where]) => (
            <button key={path} type="button" className="a-thumb" title={`${path}\n${where}`} onClick={() => { onPick(path); onClose(); }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset(path)} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      ) : <Empty title="Пока пусто" text="Загруженные картинки появятся здесь" icon="images" />}
    </Dialog>
  );
}

/** One picture: drop, click, paste or a URL; converted to WebP and queued for publishing. */
export function ImageField({ value, onChange, folder, opts, hint, aspect, allowRemove = true, label = 'Картинка' }: { value?: string; onChange: (path: string | undefined) => void; folder?: string; opts?: ImageOpts; hint?: ReactNode; aspect?: string; allowRemove?: boolean; label?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [lib, setLib] = useState(false);
  const [cut, setCut] = useState(!!opts?.removeWhite);
  const take = async (file: File | Blob | null | undefined, name = 'image') => {
    if (!file) return;
    setBusy(true);
    try { onChange(await uploadImage(file, (file as File).name || name, { ...opts, folder, removeWhite: cut })); }
    catch (e) { toast({ title: 'Не удалось загрузить', text: e instanceof Error ? e.message : String(e), kind: 'error' }); }
    finally { setBusy(false); }
  };
  const fromUrl = () => {
    const url = window.prompt('Ссылка на картинку (https://…)');
    if (url && /^https:\/\//i.test(url.trim())) onChange(url.trim());
  };
  return (
    <div className="a-stack a-stack--sm">
      <div
        className={cx('a-image', value && 'has-img', drag && 'is-drag', busy && 'is-busy')}
        style={aspect ? { aspectRatio: aspect, minHeight: 0 } : undefined}
        role="button" tabIndex={0} aria-label={label}
        onClick={() => input.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.current?.click(); } }}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); take(e.dataTransfer.files[0]); }}
        onPaste={(e) => { const f = [...e.clipboardData.files][0]; if (f) { e.preventDefault(); take(f, 'paste'); } }}
      >
        {value
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={asset(value)} alt="" />
          : <div className="a-image__empty"><I name="image" /><b>Перетащите картинку сюда</b><span>или нажмите, чтобы выбрать · можно вставить из буфера</span></div>}
        {value && (
          <div className="a-image__bar" onClick={(e) => e.stopPropagation()}>
            <Btn size="sm" variant="white" icon="refresh" onClick={() => input.current?.click()}>Заменить</Btn>
            {allowRemove && <Btn size="sm" variant="white" icon="trash" onClick={() => onChange(undefined)}>Убрать</Btn>}
          </div>
        )}
        <input ref={input} type="file" accept="image/*" hidden onChange={(e) => { take(e.target.files?.[0]); e.target.value = ''; }} />
      </div>
      <div className="adm-row adm-row--wrap" style={{ gap: 6 }}>
        <Btn size="sm" variant="ghost" icon="images" onClick={() => setLib(true)}>Из медиатеки</Btn>
        <Btn size="sm" variant="ghost" icon="link" onClick={fromUrl}>По ссылке</Btn>
        {opts?.removeWhite !== undefined && <Switch checked={cut} onChange={setCut} label={<span style={{ fontSize: 13 }}>Убирать белый фон</span>} />}
      </div>
      {hint && <div className="a-field__hint">{hint}</div>}
      <MediaPicker open={lib} onClose={() => setLib(false)} onPick={onChange} />
    </div>
  );
}

/** Several pictures (product photos): the first one is the main one. */
export function ImagesField({ value, onChange, folder, opts }: { value: string[]; onChange: (v: string[]) => void; folder?: string; opts?: ImageOpts }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(0);
  const [cut, setCut] = useState(!!opts?.removeWhite);
  const add = async (files: FileList | File[]) => {
    const list = [...files].filter((f) => f.type.startsWith('image/'));
    if (!list.length) return;
    setBusy(list.length);
    const out: string[] = [];
    for (const f of list) {
      try { out.push(await uploadImage(f, f.name, { ...opts, folder, removeWhite: cut })); }
      catch (e) { toast({ title: `Не удалось загрузить ${f.name}`, text: e instanceof Error ? e.message : String(e), kind: 'error' }); }
      setBusy((n) => n - 1);
    }
    if (out.length) onChange([...value, ...out]);
  };
  return (
    <div className="a-stack a-stack--sm">
      <div className="a-thumbs" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); add(e.dataTransfer.files); }}>
        {value.map((src, i) => (
          <div key={src + i} className="a-thumb">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset(src)} alt="" />
            {i === 0 && <span className="a-thumb__main"><Badge tone="dark">Главное</Badge></span>}
            <div className="a-thumb__bar">
              {i > 0 && <button type="button" aria-label="Сделать главным" title="Сделать главным" onClick={() => { const n = value.slice(); moveItem(n, i, 0); onChange(n); }}><I name="star-o" className="i--sm" /></button>}
              <button type="button" aria-label="Удалить" title="Удалить" onClick={() => onChange(value.filter((_, k) => k !== i))}><I name="trash" className="i--sm" /></button>
            </div>
          </div>
        ))}
        <button type="button" className={cx('a-thumb', 'a-image', busy > 0 && 'is-busy')} style={{ minHeight: 0 }} onClick={() => input.current?.click()} aria-label="Добавить фото">
          <span className="a-image__empty" style={{ padding: 8 }}><I name="plus" /><span>Добавить</span></span>
        </button>
      </div>
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => { if (e.target.files) add(e.target.files); e.target.value = ''; }} />
      {opts?.removeWhite !== undefined && <Switch checked={cut} onChange={setCut} label={<span style={{ fontSize: 13 }}>Убирать белый фон у новых фото</span>} hint="Для снимков упаковки на белом фоне — получится аккуратная «вырезка»" />}
    </div>
  );
}

export { fmtBytes };

/* ---------- icons ---------- */
export const ART_ICONS = ['sale', 'bag', 'dropper', 'sun', 'jar', 'mask', 'lipstick', 'gift'] as const;
export const SPRITE_ICONS = ['drop', 'sun', 'lipstick', 'body', 'hair', 'gift', 'brands', 'fire', 'percent', 'sparkle', 'heart', 'star', 'shield', 'truck', 'return', 'clock', 'globe', 'eye', 'bag', 'card', 'phone', 'chat', 'home', 'grid', 'pin', 'thumb', 'qr', 'map'] as const;

export function IconPicker({ value, onChange, kind }: { value: string; onChange: (v: string) => void; kind: 'art' | 'sprite' }) {
  const list = kind === 'art' ? ART_ICONS : SPRITE_ICONS;
  return (
    <div className="a-iconpick">
      {list.map((n) => (
        <button key={n} type="button" className={value === n ? 'is-active' : ''} onClick={() => onChange(n)} aria-label={n} title={n}>
          {kind === 'art' ? <Art spec={{ kind: 'icon', name: n }} /> : <I name={n} size={24} />}
        </button>
      ))}
    </div>
  );
}

/* ---------- links ---------- */
type LinkKind = 'catalog' | 'product' | 'section' | 'giftcard' | 'external' | 'soon';
const kindOf = (l: string): LinkKind => (l === '#giftcard' ? 'giftcard' : !l ? 'soon' : l.startsWith('/catalog') ? 'catalog' : l.startsWith('/product/') ? 'product' : l.startsWith('/#') ? 'section' : /^(https?:|mailto:|tel:)/i.test(l) ? 'external' : 'catalog');

export function describeLink(link: string, c: SiteContent): string {
  const k = kindOf(link);
  if (k === 'soon') return 'Раздел «скоро» — покажет уведомление';
  if (k === 'giftcard') return 'Открывает окно подарочной карты';
  if (k === 'external') return `Внешняя ссылка: ${link}`;
  if (k === 'product') { const p = getProduct(decodeURIComponent(link.split('/')[2] || '')); return p ? `Товар: ${p.name}` : 'Товар не найден'; }
  if (k === 'section') { const s = c.home.sections.find((x) => x.id === link.slice(2)); return s ? `Главная → ${'title' in s && s.title ? mdText(s.title) : SECTION_NAMES[s.type]}` : 'Раздел главной не найден'; }
  const n = results(fromQuery(link)).length;
  return `Каталог · найдётся ${n} ${n % 10 === 1 && n % 100 !== 11 ? 'товар' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'товара' : 'товаров'}`;
}

const SORT_NAMES: Record<string, string> = { default: 'По умолчанию', popular: 'По популярности', priceAsc: 'Сначала дешевле', priceDesc: 'Сначала дороже', rating: 'По рейтингу', discount: 'По скидке', new: 'Сначала новинки' };

/** Catalogue filters → a query string, with a live count of what it finds. */
export function QueryBuilder({ value, onChange, withSort = true }: { value: string; onChange: (q: string) => void; withSort?: boolean }) {
  const draft = useDraft();
  const st = useMemo(() => fromQuery(value), [value]);
  const set = (patch: Partial<CatalogState>) => onChange(toQuery({ ...st, ...patch, page: 1 }).replace(/^\?/, ''));
  const found = useMemo(() => results(st), [st]);
  const types = Object.entries(draft.taxonomy.types).filter(([, t]) => !st.cat || t.cat === st.cat);
  return (
    <div className="a-form">
      <div className="a-form-row a-form-row--2">
        <Field label="Категория"><Select value={st.cat} onValue={(cat) => set({ cat, type: [] })} options={draft.taxonomy.categories.map((c) => [c.id, c.name] as const)} placeholder="Все категории" /></Field>
        {withSort ? <Field label="Сортировка"><Select value={st.sort} onValue={(sort) => set({ sort })} options={SORTS.map((s) => [s, SORT_NAMES[s]] as const)} /></Field> : <Field label="Поиск по словам"><Input value={st.q} onValue={(q) => set({ q })} placeholder="например, центелла" /></Field>}
      </div>
      <Field label="Предложения"><Chips size="sm" value={st.offer} onChange={(offer) => set({ offer })} options={Object.entries(draft.taxonomy.offers) as [CatalogState['offer'][number], string][]} /></Field>
      <Field label="Типы продуктов"><Chips size="sm" value={st.type} onChange={(type) => set({ type })} options={types.map(([k, t]) => [k, t.many] as const)} /></Field>
      <Field label="Бренды"><Chips size="sm" value={st.brand} onChange={(brand) => set({ brand })} options={draft.brands.map((b) => [b.id, b.name] as const)} /></Field>
      <div className="a-form-row a-form-row--2">
        <Field label="Задачи кожи"><Chips size="sm" value={st.concern} onChange={(concern) => set({ concern })} options={Object.entries(draft.taxonomy.concerns)} /></Field>
        <Field label="Тип кожи"><Chips size="sm" value={st.skin} onChange={(skin) => set({ skin })} options={Object.entries(draft.taxonomy.skins).filter(([k]) => k !== 'all')} /></Field>
      </div>
      <div className="a-form-row a-form-row--3">
        <Field label="Цена от"><input className="a-input adm-num" inputMode="numeric" value={st.pmin || ''} onChange={(e) => set({ pmin: Math.max(0, parseInt(e.target.value, 10) || 0) })} /></Field>
        <Field label="Цена до"><input className="a-input adm-num" inputMode="numeric" value={st.pmax || ''} onChange={(e) => set({ pmax: Math.max(0, parseInt(e.target.value, 10) || 0) })} /></Field>
        <Field label="&nbsp;"><Switch checked={st.instock} onChange={(instock) => set({ instock })} label="Только в наличии" /></Field>
      </div>
      <div className="a-note a-note--brand"><I name="search" /><div>Найдётся <b>{found.length}</b>: {found.slice(0, 4).map((p) => p.name).join(', ')}{found.length > 4 ? '…' : ''}</div></div>
    </div>
  );
}

/** A link from the content, with a visual builder (catalogue filters, product, home section, gift card, external). */
export function LinkField({ value, onChange, placeholder = '/catalog?…' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const draft = useDraft();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<LinkKind>(kindOf(value));
  const [tmp, setTmp] = useState(value);
  useEffect(() => { if (open) { setKind(kindOf(value)); setTmp(value); } }, [open, value]);
  const choose = (k: LinkKind) => {
    setKind(k);
    setTmp(k === 'giftcard' ? '#giftcard' : k === 'soon' ? '' : k === 'catalog' ? (tmp.startsWith('/catalog') ? tmp : '/catalog') : k === 'section' ? (tmp.startsWith('/#') ? tmp : `/#${draft.home.sections[0]?.id || ''}`) : k === 'external' ? (/^https?:/.test(tmp) ? tmp : 'https://') : tmp.startsWith('/product/') ? tmp : '');
  };
  return (
    <div className="a-stack a-stack--sm">
      <div className="adm-row" style={{ gap: 6 }}>
        <input className="a-input adm-grow" value={value} placeholder={placeholder} spellCheck={false} onChange={(e) => onChange(e.target.value.trim())} />
        <Btn icon="wand" onClick={() => setOpen(true)}>Собрать</Btn>
      </div>
      <div className="a-field__hint">{describeLink(value, draft)}</div>
      <Dialog open={open} onClose={() => setOpen(false)} size="wide" label="Конструктор ссылки">
        <div className="adm-row adm-row--between" style={{ marginBottom: 14 }}>
          <div className="a-dialog__title">Куда ведёт ссылка</div>
          <IconBtn icon="close" label="Закрыть" onClick={() => setOpen(false)} />
        </div>
        <Seg value={kind} onChange={choose} options={[{ value: 'catalog', label: 'Каталог', icon: 'grid' }, { value: 'product', label: 'Товар', icon: 'box' }, { value: 'section', label: 'Блок главной', icon: 'home' }, { value: 'giftcard', label: 'Подарочная карта', icon: 'gift' }, { value: 'external', label: 'Внешняя', icon: 'external' }, { value: 'soon', label: 'Скоро', icon: 'clock' }]} />
        <div style={{ marginTop: 18 }}>
          {kind === 'catalog' && <QueryBuilder value={tmp.replace(/^\/catalog\/?\??/, '')} onChange={(q) => setTmp(`/catalog${q ? '?' + q : ''}`)} />}
          {kind === 'product' && <ProductSelect value={decodeURIComponent(tmp.split('/')[2] || '')} onChange={(id) => setTmp(id ? `/product/${encodeURIComponent(id)}` : '')} />}
          {kind === 'section' && <Field label="Блок на главной"><Select value={tmp.slice(2)} onValue={(id) => setTmp(`/#${id}`)} options={draft.home.sections.map((s) => [s.id, `${'title' in s && s.title ? mdText(s.title) : SECTION_NAMES[s.type]} (#${s.id})`] as const)} /></Field>}
          {kind === 'external' && <Field label="Адрес" hint="https://…, mailto: или tel:"><Input value={tmp} onValue={setTmp} placeholder="https://" /></Field>}
          {kind === 'giftcard' && <div className="a-note"><I name="gift" /><div>По клику откроется окно выбора номинала подарочной карты.</div></div>}
          {kind === 'soon' && <div className="a-note"><I name="clock" /><div>Ссылка без адреса: покупатель увидит уведомление «Раздел появится в полной версии сайта».</div></div>}
        </div>
        <div className="a-dialog__foot" style={{ alignItems: 'center' }}>
          <code className="adm-mono adm-grow adm-ellipsis adm-muted">{tmp || '—'}</code>
          <Btn onClick={() => setOpen(false)}>Отмена</Btn>
          <Btn variant="primary" onClick={() => { onChange(tmp); setOpen(false); }}>Применить</Btn>
        </div>
      </Dialog>
    </div>
  );
}
