'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import { Art } from '@/components/Art';
import { BASE_PATH } from '@/lib/site';
import { discountOf } from '@/lib/shop';
import type { Product, SiteContent, Tag } from '@/lib/types';
import { planImport, PRODUCT_COLS, productRows, type ImportPlan } from '../lib/productsIO';
import { download, readTable, stamp, toCsv, writeXlsx } from '../lib/sheet';
import { productUsages, removeProductRefs } from '../state/refs';
import { uniqueId } from '../state/schema';
import { edit, undo, useAdmin } from '../state/store';
import { Column, DataTable } from '../ui/DataTable';
import { I } from '../ui/icons';
import { Badge, Btn, Card, Check, cx, Empty, Field, IconBtn, Menu, money, NumInput, Note, PageHead, Seg, Select } from '../ui/kit';
import { confirmDialog, Dialog, toast } from '../ui/overlay';

type Status = 'all' | 'active' | 'low' | 'out' | 'sale' | 'hidden';
const LOW = 10;
const TAGS: [Tag, string][] = [['hit', 'Хит'], ['new', 'Новинка'], ['excl', 'Только у нас']];

export function stockState(p: Product) { return p.stock <= 0 ? 'out' : p.stock <= LOW ? 'low' : 'ok'; }

export function newProduct(c: SiteContent, init: Partial<Product> = {}): Product {
  const type = init.type || 'serum';
  const id = uniqueId(init.name ? `${init.brand || ''} ${init.name}` : 'novyy-tovar', (x) => c.products.some((p) => p.id === x));
  return {
    id, brand: init.brand || c.brands[0]?.id || '', name: init.name || 'Новый товар', type, price: init.price ?? 0, rating: 5, reviews: 0, volume: '', tags: [], stock: 0,
    skin: ['all'], concerns: [], ingr: [], art: { shape: 'dropper', c: '#f6e3ec', cap: '#ffffff', ink: '#7a3d5c', big: 'NEW', sub: (c.taxonomy.types[type]?.name || '').toUpperCase() },
    desc: '', hidden: true, ...init, ...(init.id ? {} : { id })
  };
}

function ImportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const draft = useAdmin((s) => s.draft);
  const [plan, setPlan] = useState<ImportPlan | null>(null);
  const [file, setFile] = useState('');
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const reset = () => { setPlan(null); setFile(''); };
  const pick = async (f?: File) => {
    if (!f) return;
    setBusy(true);
    try { setPlan(planImport(draft, await readTable(f))); setFile(f.name); }
    catch (e) { toast({ title: 'Не удалось прочитать файл', text: e instanceof Error ? e.message : String(e), kind: 'error' }); }
    finally { setBusy(false); }
  };
  const apply = () => {
    if (!plan) return;
    edit((d) => {
      for (const u of plan.updates) { const p = d.products.find((x) => x.id === u.id); if (p) Object.assign(p, u.patch); }
      d.products.push(...plan.creates);
    }, { label: `Импорт: ${plan.updates.length} обновлено, ${plan.creates.length} новых` });
    toast({ title: 'Импорт выполнен', text: `Обновлено ${plan.updates.length}, добавлено ${plan.creates.length}`, kind: 'ok', action: { label: 'Отменить', fn: () => undo() } });
    reset();
    onClose();
  };
  return (
    <Dialog open={open} onClose={() => { reset(); onClose(); }} size="wide" label="Импорт товаров">
      <div className="adm-row adm-row--between" style={{ marginBottom: 6 }}>
        <div className="a-dialog__title">Импорт из Excel или CSV</div>
        <IconBtn icon="close" label="Закрыть" onClick={() => { reset(); onClose(); }} />
      </div>
      {!plan ? (
        <div className="a-stack">
          <p className="adm-ink2">Самый простой путь: выгрузите товары в Excel, поправьте цены, остатки или описания и загрузите файл обратно. Строки сопоставляются по колонке <b>ID</b>; новые ID станут новыми товарами (скрытыми, пока вы их не проверите).</p>
          <div className={cx('a-image', busy && 'is-busy')} style={{ minHeight: 170 }} onClick={() => input.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files[0]); }} role="button" tabIndex={0}>
            <div className="a-image__empty"><I name="upload" /><b>Перетащите файл .xlsx или .csv</b><span>или нажмите, чтобы выбрать</span></div>
          </div>
          <input ref={input} type="file" accept=".xlsx,.csv,text/csv" hidden onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
          <Btn variant="ghost" icon="download" onClick={() => download(writeXlsx([{ name: 'Товары', columns: PRODUCT_COLS, rows: productRows(draft, draft.products.slice(0, 3)) }]), 'shablon-tovary.xlsx')}>Скачать шаблон с примерами</Btn>
        </div>
      ) : (
        <div className="a-stack">
          <div className="adm-muted">{file} · колонки: {plan.columns.join(', ') || '—'}{plan.ignored.length ? ` · пропущены: ${plan.ignored.join(', ')}` : ''}</div>
          <div className="adm-grid adm-grid--4">
            <div className="a-kpi" style={{ boxShadow: 'none', background: 'var(--a-soft)' }}><div className="a-kpi__label">Обновится</div><div className="a-kpi__value">{plan.updates.length}</div></div>
            <div className="a-kpi" style={{ boxShadow: 'none', background: 'var(--a-soft)' }}><div className="a-kpi__label">Новых</div><div className="a-kpi__value">{plan.creates.length}</div></div>
            <div className="a-kpi" style={{ boxShadow: 'none', background: 'var(--a-soft)' }}><div className="a-kpi__label">Без изменений</div><div className="a-kpi__value">{plan.unchanged}</div></div>
            <div className="a-kpi" style={{ boxShadow: 'none', background: plan.errors.length ? 'var(--a-red-bg)' : 'var(--a-soft)' }}><div className="a-kpi__label">Ошибок</div><div className="a-kpi__value">{plan.errors.length}</div></div>
          </div>
          <div style={{ maxHeight: '34vh', overflow: 'auto' }} className="a-stack a-stack--sm">
            {plan.errors.map((e, i) => <div key={'e' + i} className="a-change"><span className="a-change__kind is-removed">!</span><span>Строка {e.row}: {e.message}</span></div>)}
            {plan.updates.map((u) => <div key={u.id} className="a-change"><span className="a-change__kind is-changed">~</span><span className="adm-grow adm-ellipsis"><b style={{ fontWeight: 500 }}>{u.name}</b> <span className="a-change__fields">{u.fields.join(', ')}</span></span></div>)}
            {plan.creates.map((p) => <div key={p.id} className="a-change"><span className="a-change__kind is-added">+</span><span className="adm-grow adm-ellipsis">{p.name} <span className="a-change__fields">{p.id} · {money(p.price)}</span></span></div>)}
          </div>
          {plan.errors.length > 0 && <Note kind="warn">Строки с ошибками будут пропущены, остальные применятся.</Note>}
          <div className="a-dialog__foot">
            <Btn onClick={reset}>Другой файл</Btn>
            <Btn variant="primary" icon="check" disabled={!plan.updates.length && !plan.creates.length} onClick={apply}>Применить изменения</Btn>
          </div>
        </div>
      )}
    </Dialog>
  );
}

function PriceDialog({ ids, open, onClose }: { ids: string[]; open: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<'pct' | 'sum' | 'sale' | 'unsale'>('pct');
  const [val, setVal] = useState<number | undefined>(10);
  const [round, setRound] = useState('1');
  const apply = () => {
    const r = Number(round);
    const rnd = (n: number) => Math.max(1, Math.round(n / r) * r);
    edit((d) => {
      d.products.forEach((p) => {
        if (!ids.includes(p.id)) return;
        if (mode === 'pct') p.price = rnd(p.price * (1 + (val || 0) / 100));
        else if (mode === 'sum') p.price = rnd(p.price + (val || 0));
        else if (mode === 'sale') { const base = p.old || p.price; p.old = base; p.price = rnd(base * (1 - (val || 0) / 100)); }
        else if (p.old) { p.price = p.old; delete p.old; }
      });
    }, { label: `Цены: ${ids.length} товаров` });
    toast({ title: `Цены обновлены у ${ids.length} товаров`, kind: 'ok', action: { label: 'Отменить', fn: () => undo() } });
    onClose();
  };
  return (
    <Dialog open={open} onClose={onClose} label="Изменить цены">
      <div className="a-dialog__icon"><I name="cash" /></div>
      <div className="a-dialog__title">Цены у {ids.length} товаров</div>
      <div className="a-stack" style={{ marginTop: 16 }}>
        <Seg value={mode} onChange={setMode} options={[{ value: 'pct', label: '± %' }, { value: 'sum', label: '± сумма' }, { value: 'sale', label: 'Скидка' }, { value: 'unsale', label: 'Без скидки' }]} />
        {mode !== 'unsale' && <Field label={mode === 'pct' ? 'Изменить на, %' : mode === 'sum' ? 'Изменить на, смн' : 'Размер скидки, %'} hint={mode === 'sale' ? 'Текущая цена станет зачёркнутой, новая — со скидкой' : 'Отрицательное число — уменьшить'}><NumInput value={val} onValue={setVal} step={1} min={mode === 'sale' ? 1 : undefined} max={mode === 'sale' ? 95 : undefined} /></Field>}
        {mode === 'unsale' && <Note>Зачёркнутая цена станет обычной, скидка исчезнет.</Note>}
        {mode !== 'unsale' && <Field label="Округление"><Seg value={round} onChange={setRound} options={[{ value: '1', label: 'до 1' }, { value: '5', label: 'до 5' }, { value: '10', label: 'до 10' }]} /></Field>}
      </div>
      <div className="a-dialog__foot"><Btn onClick={onClose}>Отмена</Btn><Btn variant="primary" onClick={apply}>Применить</Btn></div>
    </Dialog>
  );
}

export function Products() {
  const draft = useAdmin((s) => s.draft);
  const router = useRouter();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [brand, setBrand] = useState('');
  const [status, setStatus] = useState<Status>('all');
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [pricing, setPricing] = useState(false);
  const all = draft.products;

  const counts = useMemo(() => ({
    all: all.length, active: all.filter((p) => !p.hidden && p.stock > 0).length, low: all.filter((p) => stockState(p) === 'low').length,
    out: all.filter((p) => stockState(p) === 'out').length, sale: all.filter((p) => p.old).length, hidden: all.filter((p) => p.hidden).length
  }), [all]);

  const rows = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return all.filter((p) => {
      if (cat && draft.taxonomy.types[p.type]?.cat !== cat) return false;
      if (brand && p.brand !== brand) return false;
      if (status === 'active' && (p.hidden || p.stock <= 0)) return false;
      if (status === 'low' && stockState(p) !== 'low') return false;
      if (status === 'out' && stockState(p) !== 'out') return false;
      if (status === 'sale' && !p.old) return false;
      if (status === 'hidden' && !p.hidden) return false;
      if (ql && !`${p.name} ${p.id} ${p.sku || ''} ${draft.brands.find((b) => b.id === p.brand)?.name || ''}`.toLowerCase().includes(ql)) return false;
      return true;
    });
  }, [all, q, cat, brand, status, draft]);

  const setField = <K extends keyof Product>(id: string, k: K, v: Product[K], label: string) => edit((d) => { const p = d.products.find((x) => x.id === id); if (p) (p as Product)[k] = v; }, { label, key: `p:${id}:${String(k)}` });
  const ids = [...sel];

  const create = () => {
    const p = newProduct(draft);
    edit((d) => { d.products.unshift(p); }, { label: 'Новый товар' });
    router.push(`/admin/products/edit/?id=${encodeURIComponent(p.id)}`);
  };
  const remove = async (list: string[]) => {
    const used = list.flatMap((id) => productUsages(draft, id));
    const ok = await confirmDialog({
      title: list.length === 1 ? 'Удалить товар?' : `Удалить ${list.length} товаров?`,
      text: <>Товар{list.length > 1 ? 'ы' : ''} исчезнут из каталога после публикации.{used.length ? <> Ссылки на них уберутся из {used.length} мест (баннеры, подборки, блогеры…).</> : null} Можно отменить через ⌘Z.</>,
      confirm: 'Удалить', danger: true
    });
    if (!ok) return;
    edit((d) => { d.products = d.products.filter((p) => !list.includes(p.id)); removeProductRefs(d, list); }, { label: `Удалено товаров: ${list.length}` });
    setSel(new Set());
    toast({ title: `Удалено: ${list.length}`, icon: 'trash', action: { label: 'Вернуть', fn: () => undo() } });
  };
  const bulk = (fn: (p: Product) => void, label: string) => { edit((d) => d.products.forEach((p) => { if (sel.has(p.id)) fn(p as Product); }), { label }); toast({ title: label, kind: 'ok', action: { label: 'Отменить', fn: () => undo() } }); };
  const exportAs = (fmt: 'xlsx' | 'csv', list: Product[]) => {
    const data = productRows(draft, list);
    if (fmt === 'xlsx') download(writeXlsx([{ name: 'Товары', columns: PRODUCT_COLS, rows: data }]), `tovary-${stamp()}.xlsx`);
    else download(toCsv(PRODUCT_COLS, data), `tovary-${stamp()}.csv`, 'text/csv;charset=utf-8');
  };

  const columns: Column<Product>[] = [
    { key: 'name', label: 'Товар', sort: (p) => p.name, render: (p) => (
      <Link className="a-cell" href={`/admin/products/edit/?id=${encodeURIComponent(p.id)}`} onClick={(e) => e.stopPropagation()}>
        <span className="a-cell__art"><Art spec={{ kind: 'product', id: p.id }} /></span>
        <span style={{ minWidth: 0 }}>
          <span className="a-cell__title adm-clamp2" style={{ display: '-webkit-box' }}>{p.name}</span>
          <span className="a-cell__sub" style={{ display: 'block' }}>{draft.brands.find((b) => b.id === p.brand)?.name || p.brand} · {draft.taxonomy.types[p.type]?.name || p.type}</span>
        </span>
      </Link>
    ) },
    { key: 'price', label: 'Цена', num: true, sort: (p) => p.price, render: (p) => <input className="a-inline-num" aria-label="Цена" defaultValue={p.price} key={p.price} onClick={(e) => e.stopPropagation()} onBlur={(e) => { const n = Math.round(Number(e.target.value.replace(/\s/g, ''))); if (n > 0 && n !== p.price) setField(p.id, 'price', n, 'Цена'); else e.target.value = String(p.price); }} onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} /> },
    { key: 'old', label: 'Скидка', num: true, wide: true, sort: (p) => discountOf(p), render: (p) => p.old ? <span className="adm-row adm-row--end" style={{ gap: 6 }}><s className="adm-muted">{money(p.old)}</s><Badge tone="brand">−{discountOf(p)}%</Badge></span> : <span className="adm-muted">—</span> },
    { key: 'stock', label: 'Остаток', num: true, sort: (p) => p.stock, render: (p) => (
      <span className={cx('a-stock', stockState(p) === 'low' && 'is-low', stockState(p) === 'out' && 'is-out')}>
        <i /><input className="a-inline-num" style={{ width: 64 }} aria-label="Остаток" defaultValue={p.stock} key={p.stock} onClick={(e) => e.stopPropagation()} onBlur={(e) => { const n = Math.max(0, Math.round(Number(e.target.value))); if (Number.isFinite(n) && n !== p.stock) setField(p.id, 'stock', n, 'Остаток'); else e.target.value = String(p.stock); }} onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} />
      </span>
    ) },
    { key: 'rating', label: 'Рейтинг', num: true, wide: true, sort: (p) => p.rating, render: (p) => <span className="adm-nowrap"><I name="star" className="i--xs adm-accent" /> {p.rating} <span className="adm-muted">· {p.reviews}</span></span> },
    { key: 'tags', label: 'Метки', wide: true, render: (p) => <span className="adm-row" style={{ gap: 4, flexWrap: 'wrap' }}>{p.tags.map((t) => <Badge key={t} tone={t === 'hit' ? 'brand' : t === 'new' ? 'blue' : 'dark'}>{TAGS.find((x) => x[0] === t)?.[1]}</Badge>)}</span> },
    { key: 'vis', label: 'На сайте', render: (p) => <span onClick={(e) => e.stopPropagation()}><label className="a-switch"><input type="checkbox" checked={!p.hidden} onChange={(e) => setField(p.id, 'hidden', !e.target.checked, e.target.checked ? 'Товар показан' : 'Товар скрыт')} /><span className="a-switch__track" /></label></span> },
    { key: 'act', label: '', className: 'is-actions', render: (p) => (
      <span onClick={(e) => e.stopPropagation()}>
        <Menu items={[
          { label: 'Редактировать', icon: 'edit', href: `/admin/products/edit/?id=${encodeURIComponent(p.id)}` },
          { label: 'Дублировать', icon: 'duplicate', onClick: () => { const copy = { ...JSON.parse(JSON.stringify(p)), id: uniqueId(p.id + '-copy', (x) => draft.products.some((y) => y.id === x)), name: p.name + ' (копия)', hidden: true }; edit((d) => { d.products.splice(d.products.findIndex((x) => x.id === p.id) + 1, 0, copy); }, { label: 'Копия товара' }); router.push(`/admin/products/edit/?id=${copy.id}`); } },
          { label: 'Открыть на сайте', icon: 'external', onClick: () => window.open(`${BASE_PATH}/product/${encodeURIComponent(p.id)}/?preview=1`, '_blank') },
          { sep: true },
          { label: 'Удалить', icon: 'trash', danger: true, onClick: () => remove([p.id]) }
        ]} />
      </span>
    ) }
  ];

  const stat = (k: Status, label: string, icon: string, tone?: string) => (
    <button type="button" className={cx('a-mini', status === k && 'is-active')} onClick={() => setStatus(status === k ? 'all' : k)}>
      <span className={cx('a-mini__icon', tone)}><I name={icon} /></span>
      <span><b>{counts[k]}</b><small>{label}</small></span>
    </button>
  );

  return (
    <div className="adm-page">
      <PageHead title="Товары" sub="Каталог магазина: цены, остатки, описания и фото. Цену и остаток можно править прямо в таблице."
        actions={<>
          <Btn icon="upload" onClick={() => setImporting(true)}>Импорт</Btn>
          <Menu trigger={(t) => <Btn icon="download" iconRight="chev-down" onClick={t}>Экспорт</Btn>} items={[{ label: 'Excel (.xlsx)', icon: 'table', onClick: () => exportAs('xlsx', rows) }, { label: 'CSV', icon: 'file', onClick: () => exportAs('csv', rows) }]} />
          <Btn variant="primary" icon="plus" onClick={create}>Новый товар</Btn>
        </>} />
      <div className="a-minis">
        {stat('all', 'всего товаров', 'box')}
        {stat('active', 'в продаже', 'check-circle', 'is-green')}
        {stat('low', `заканчиваются (≤${LOW})`, 'alert', 'is-amber')}
        {stat('out', 'нет в наличии', 'x-circle', 'is-red')}
        {stat('sale', 'со скидкой', 'percent')}
        {stat('hidden', 'скрыто', 'eye-off', 'is-gray')}
      </div>
      <Card flush>
        <div className="a-toolbar">
          <div className="a-affix a-affix--prefix a-search-input"><span className="a-affix__prefix"><I name="search" className="i--sm" /></span><input className="a-input" placeholder="Название, бренд, ID или артикул" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <Select value={cat} onValue={setCat} options={draft.taxonomy.categories.map((c) => [c.id, c.name] as const)} placeholder="Все категории" />
          <Select value={brand} onValue={setBrand} options={draft.brands.slice().sort((a, b) => a.name.localeCompare(b.name)).map((b) => [b.id, b.name] as const)} placeholder="Все бренды" />
          <span className="adm-grow" />
          <span className="adm-muted">{rows.length} из {all.length}</span>
          <Seg size="sm" value={view} onChange={setView} options={[{ value: 'table', label: '', icon: 'table' }, { value: 'grid', label: '', icon: 'grid' }]} />
        </div>
        {sel.size > 0 && (
          <div className="a-bulk">
            <Check checked onChange={() => setSel(new Set())} ariaLabel="Снять выделение" />
            <b>Выбрано: {sel.size}</b>
            <span className="adm-grow" />
            <Btn size="sm" icon="cash" onClick={() => setPricing(true)}>Цены</Btn>
            <Menu trigger={(t) => <Btn size="sm" icon="tag" onClick={t}>Метки</Btn>} items={[...TAGS.map(([t, l]) => ({ label: `Добавить «${l}»`, icon: 'plus', onClick: () => bulk((p) => { if (!p.tags.includes(t)) p.tags.push(t); }, `Метка «${l}» добавлена`) })), { sep: true }, ...TAGS.map(([t, l]) => ({ label: `Убрать «${l}»`, icon: 'minus', onClick: () => bulk((p) => { p.tags = p.tags.filter((x) => x !== t); }, `Метка «${l}» убрана`) }))]} />
            <Btn size="sm" icon="eye" onClick={() => bulk((p) => { p.hidden = false; }, 'Товары показаны')}>Показать</Btn>
            <Btn size="sm" icon="eye-off" onClick={() => bulk((p) => { p.hidden = true; }, 'Товары скрыты')}>Скрыть</Btn>
            <Btn size="sm" icon="download" onClick={() => exportAs('xlsx', all.filter((p) => sel.has(p.id)))}>Excel</Btn>
            <Btn size="sm" variant="danger" icon="trash" onClick={() => remove(ids)}>Удалить</Btn>
          </div>
        )}
        {view === 'table' ? (
          <DataTable rows={rows} columns={columns} getKey={(p) => p.id} selected={sel} onSelect={setSel} pageSize={30} rowClass={(p) => (p.hidden ? 'is-muted' : undefined)}
            onRowClick={(p) => router.push(`/admin/products/edit/?id=${encodeURIComponent(p.id)}`)}
            empty={<Empty title="Ничего не нашлось" text="Измените фильтры или поиск" action={<Btn onClick={() => { setQ(''); setCat(''); setBrand(''); setStatus('all'); }}>Сбросить фильтры</Btn>} />} />
        ) : (
          <div className="a-pgrid" style={{ padding: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))' }}>
            {rows.map((p) => (
              <Link key={p.id} href={`/admin/products/edit/?id=${encodeURIComponent(p.id)}`} className={cx('a-pgrid__item', sel.has(p.id) && 'is-active')} style={p.hidden ? { opacity: 0.55 } : undefined}>
                <span className="a-pgrid__art"><Art spec={{ kind: 'product', id: p.id }} /></span>
                <span className="a-pgrid__name">{p.name}</span>
                <span className="adm-row adm-row--between" style={{ fontSize: 12.5 }}><b>{money(p.price)}</b><span className={cx('a-stock', stockState(p) === 'low' && 'is-low', stockState(p) === 'out' && 'is-out')}><i />{p.stock}</span></span>
              </Link>
            ))}
          </div>
        )}
      </Card>
      <ImportDialog open={importing} onClose={() => setImporting(false)} />
      <PriceDialog ids={ids} open={pricing} onClose={() => setPricing(false)} />
    </div>
  );
}
