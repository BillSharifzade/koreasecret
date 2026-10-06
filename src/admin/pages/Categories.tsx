'use client';
import type { Draft } from 'immer';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Art } from '@/components/Art';
import type { Category, SiteContent, TextureKind, TypeInfo } from '@/lib/types';
import { mapLinks, renameCategory, renameType, rewriteParam } from '../state/refs';
import { ID_RE, uniqueId } from '../state/schema';
import { edit, undo, useAdmin } from '../state/store';
import { useSelected } from '../ui/collection';
import { Column, DataTable } from '../ui/DataTable';
import { I } from '../ui/icons';
import { Badge, Btn, Card, Chips, cx, Empty, Field, IconBtn, Input, LazyInput, Menu, Note, PageHead, Select, TagsInput, TextArea } from '../ui/kit';
import { confirmDialog, promptDialog, Sheet, toast } from '../ui/overlay';
import { IconPicker } from '../ui/pickers';
import { moveItem, SortableList } from '../ui/Sortable';
import { dedupeParam, products, ReassignDialog, reorderKeys } from '../ui/tax-helpers';
import '../styles/taxonomy.css';

const TEXTURES: [TextureKind, string][] = [['cream', 'Крем'], ['gel', 'Гель'], ['smear', 'Мазок'], ['powder', 'Пудра'], ['pad', 'Диск'], ['sheet', 'Тканевая маска'], ['drop', 'Капля']];
const PROTECTED = 'giftcard';

/** Put a type into the first group of a category (creating one when the category has none). */
function addToCategory(d: Draft<SiteContent>, type: string, cat: string) {
  d.taxonomy.categories.forEach((c) => c.groups.forEach((g) => { if (c.id !== cat) g.types = g.types.filter((t) => t !== type); }));
  const c = d.taxonomy.categories.find((x) => x.id === cat);
  if (!c) return;
  if (!c.groups.length) c.groups.push({ name: 'Основное', types: [] });
  if (!c.groups.some((g) => g.types.includes(type))) c.groups[0].types.push(type);
}

export function Categories() {
  const draft = useAdmin((s) => s.draft);
  const [catSel, selectCat] = useSelected('cat');
  const [typeSel, selectType] = useSelected('type');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('');
  const [delCat, setDelCat] = useState<Category | null>(null);
  const [delType, setDelType] = useState<string | null>(null);
  const cats = draft.taxonomy.categories;
  const types = draft.taxonomy.types;

  const count = useMemo(() => {
    const m: Record<string, number> = {};
    draft.products.forEach((p) => { m[p.type] = (m[p.type] || 0) + 1; });
    return m;
  }, [draft.products]);
  const catProducts = (id: string) => Object.entries(types).filter(([, t]) => t.cat === id).reduce((s, [k]) => s + (count[k] || 0), 0);

  const rows = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return Object.entries(types).map(([id, t]) => ({ id, ...t })).filter((t) => (!filter || t.cat === filter) && (!ql || `${t.id} ${t.name} ${t.many} ${t.synonyms || ''}`.toLowerCase().includes(ql)));
  }, [types, q, filter]);

  /* ---------- categories ---------- */
  const addCat = async () => {
    const name = (await promptDialog({ title: 'Новая категория', label: 'Название', placeholder: 'Например, Уход за волосами', confirm: 'Создать', icon: 'layers' }))?.trim();
    if (!name) return;
    const id = uniqueId(name, (x) => cats.some((c) => c.id === x));
    edit((d) => { d.taxonomy.categories.push({ id, icon: 'drop', name, groups: [{ name: 'Основное', types: [] }] }); }, { label: `Новая категория: ${name}` });
    selectCat(id);
  };
  const removeCatNow = (c: Category, target?: string) => {
    if (catSel === c.id) selectCat(null);
    edit((d) => {
      if (target) Object.entries(d.taxonomy.types).forEach(([k, t]) => { if (t.cat === c.id) { t.cat = target; addToCategory(d, k, target); } });
      d.taxonomy.categories = d.taxonomy.categories.filter((x) => x.id !== c.id);
      mapLinks(d, (v) => dedupeParam(rewriteParam(v, 'cat', c.id, target ?? null), 'cat'));
    }, { label: `Удалена категория: ${c.name}` });
    toast({ title: 'Категория удалена', text: c.name, icon: 'trash', action: { label: 'Вернуть', fn: () => undo() } });
  };
  const removeCat = async (c: Category) => {
    if (Object.values(types).some((t) => t.cat === c.id)) { setDelCat(c); return; }
    if (await confirmDialog({ title: `Удалить «${c.name}»?`, text: 'Типов в категории нет. Ссылки на неё в меню станут общим каталогом.', confirm: 'Удалить', danger: true })) removeCatNow(c);
  };

  /* ---------- types ---------- */
  const addType = async () => {
    const name = (await promptDialog({ title: 'Новый тип продукта', label: 'Название (в единственном числе)', placeholder: 'Например, Мист для лица', confirm: 'Создать', icon: 'box' }))?.trim();
    if (!name) return;
    const id = uniqueId(name, (x) => !!types[x]);
    const cat = filter || cats[0]?.id || '';
    edit((d) => { d.taxonomy.types[id] = { cat, name, many: name, texture: 'drop', howto: '', synonyms: '' }; addToCategory(d, id, cat); }, { label: `Новый тип: ${name}` });
    selectType(id);
  };
  const removeTypeNow = (id: string, target?: string) => {
    const t = types[id];
    if (typeSel === id) selectType(null);
    edit((d) => {
      if (target) d.products.forEach((p) => { if (p.type === id) p.type = target; });
      d.taxonomy.categories.forEach((c) => c.groups.forEach((g) => { g.types = g.types.filter((x) => x !== id); }));
      mapLinks(d, (v) => dedupeParam(rewriteParam(v, 'type', id, target ?? null), 'type'));
      delete d.taxonomy.types[id];
    }, { label: `Удалён тип: ${t?.name || id}` });
    toast({ title: 'Тип удалён', text: t?.name, icon: 'trash', action: { label: 'Вернуть', fn: () => undo() } });
  };
  const removeType = async (id: string) => {
    if (id === PROTECTED) { toast({ title: 'Этот тип нельзя удалить', text: 'На нём держатся подарочные карты', kind: 'error' }); return; }
    if (count[id]) { setDelType(id); return; }
    if (await confirmDialog({ title: `Удалить тип «${types[id]?.name}»?`, text: 'Товаров этого типа нет. Тип уберётся из меню и фильтров.', confirm: 'Удалить', danger: true })) removeTypeNow(id);
  };

  const columns: Column<{ id: string } & TypeInfo>[] = [
    { key: 'name', label: 'Тип', sort: (t) => t.name, render: (t) => <div><div className="a-cell__title">{t.name}</div><div className="a-cell__sub adm-mono">{t.id}</div></div> },
    { key: 'many', label: 'В меню и фильтрах', wide: true, sort: (t) => t.many, render: (t) => t.many },
    { key: 'cat', label: 'Категория', sort: (t) => cats.find((c) => c.id === t.cat)?.name || t.cat, render: (t) => { const c = cats.find((x) => x.id === t.cat); return c ? <span className="adm-row" style={{ gap: 6 }}><I name={c.icon} className="i--sm adm-muted" />{c.name}</span> : <Badge tone="red">нет категории</Badge>; } },
    { key: 'tex', label: 'Текстура', wide: true, render: (t) => TEXTURES.find((x) => x[0] === (t.texture || 'drop'))?.[1] },
    { key: 'n', label: 'Товаров', num: true, sort: (t) => count[t.id] || 0, render: (t) => count[t.id] ? count[t.id] : <span className="adm-muted">0</span> },
    { key: 'act', label: '', className: 'is-actions', render: (t) => (
      <span onClick={(e) => e.stopPropagation()}>
        <Menu items={[{ label: 'Редактировать', icon: 'edit', onClick: () => selectType(t.id) }, { sep: true }, { label: 'Удалить', icon: 'trash', danger: true, disabled: t.id === PROTECTED, onClick: () => removeType(t.id) }]} />
      </span>
    ) }
  ];

  const cat = cats.find((c) => c.id === catSel);
  const type = typeSel ? types[typeSel] : undefined;

  return (
    <div className="adm-page">
      <PageHead title={<>Категории <em>и типы</em></>} sub="Категории — разделы каталога и мега-меню, группы внутри них — колонки меню, а типы продуктов — то, по чему фильтруется каталог."
        actions={<><Btn icon="plus" onClick={addType}>Тип продукта</Btn><Btn variant="primary" icon="plus" onClick={addCat}>Категория</Btn></>} />

      <div className="adm-grid adm-grid--main">
        <Card title="Категории" sub="Перетащите, чтобы поменять порядок в меню и в чипсах каталога">
          {cats.length ? (
            <SortableList items={cats} getKey={(c) => c.id} onMove={(a, b) => edit((d) => moveItem(d.taxonomy.categories, a, b), { label: 'Категории: порядок' })}
              render={(c, _i, handle) => {
                const nTypes = Object.values(types).filter((t) => t.cat === c.id).length;
                return (
                  <div className={cx('a-item', catSel === c.id && 'is-active')}>
                    <span className="a-item__handle" {...handle}><I name="drag" /></span>
                    <div className="a-item__media a-item__media--square tax-icon" onClick={() => selectCat(c.id)}><I name={c.icon} /></div>
                    <div className="a-item__body" onClick={() => selectCat(c.id)}>
                      <div className="a-item__title">{c.name}</div>
                      <div className="a-item__sub">{c.groups.length} {c.groups.length === 1 ? 'группа' : c.groups.length < 5 ? 'группы' : 'групп'} · {nTypes} {nTypes === 1 ? 'тип' : nTypes < 5 && nTypes > 0 ? 'типа' : 'типов'} · {products(catProducts(c.id))}</div>
                    </div>
                    <span className="adm-mono adm-muted tax-id">{c.id}</span>
                    <div className="a-item__actions">
                      <IconBtn icon="edit" label="Редактировать" onClick={() => selectCat(c.id)} />
                      <Menu items={[{ label: 'Редактировать', icon: 'edit', onClick: () => selectCat(c.id) }, { sep: true }, { label: 'Удалить', icon: 'trash', danger: true, onClick: () => removeCat(c) }]} />
                    </div>
                  </div>
                );
              }} />
          ) : <Empty title="Категорий нет" action={<Btn variant="primary" icon="plus" onClick={addCat}>Создать категорию</Btn>} />}
        </Card>
        <div className="adm-stack">
          <Card title="Как это работает">
            <div className="tax-explain">
              <div><I name="layers" /><span><b>Категория</b> — раздел верхнего уровня: пункт мега-меню и чипса над каталогом.</span></div>
              <div><I name="columns" /><span><b>Группа</b> — колонка внутри меню категории со списком типов.</span></div>
              <div><I name="box" /><span><b>Тип</b> — то, что выбирается в карточке товара; по нему работают фильтры, хлебные крошки и вкладка «Применение».</span></div>
            </div>
          </Card>
          <MenuPreview />
        </div>
      </div>

      <Card flush title="Типы продуктов" sub={`${Object.keys(types).length} типов · название во множественном числе показывается в меню и фильтрах`}>
        <div className="a-toolbar">
          <div className="a-affix a-affix--prefix a-search-input"><span className="a-affix__prefix"><I name="search" className="i--sm" /></span><input className="a-input" placeholder="Тип, ID или слово поиска" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <Select value={filter} onValue={setFilter} options={cats.map((c) => [c.id, c.name] as const)} placeholder="Все категории" />
          <span className="adm-grow" />
          <Btn size="sm" icon="plus" onClick={addType}>Тип продукта</Btn>
        </div>
        <DataTable rows={rows} columns={columns} getKey={(t) => t.id} pageSize={50} onRowClick={(t) => selectType(t.id)} initialSort={undefined}
          empty={<Empty title="Ничего не нашлось" text="Измените поиск или категорию" />} />
      </Card>

      <Sheet open={!!cat} onClose={() => selectCat(null)} title={cat?.name || ''} sub={cat ? `${products(catProducts(cat.id))} в категории` : undefined}
        actions={cat && <Menu items={[{ label: 'Удалить категорию', icon: 'trash', danger: true, onClick: () => removeCat(cat) }]} />}
        foot={<><span className="adm-muted adm-grow" style={{ fontSize: 12.5 }}><I name="check" className="i--xs" /> Изменения сохраняются в черновик сразу</span><Btn variant="dark" onClick={() => selectCat(null)}>Готово</Btn></>}>
        {cat && <CategoryForm c={cat} onRenamed={(id) => selectCat(id)} />}
      </Sheet>

      <Sheet open={!!type && !!typeSel} onClose={() => selectType(null)} title={type?.name || ''} sub={typeSel ? `${products(count[typeSel] || 0)} · ID ${typeSel}` : undefined}
        actions={typeSel && typeSel !== PROTECTED ? <Menu items={[{ label: 'Удалить тип', icon: 'trash', danger: true, onClick: () => removeType(typeSel) }]} /> : undefined}
        foot={<><span className="adm-muted adm-grow" style={{ fontSize: 12.5 }}><I name="check" className="i--xs" /> Изменения сохраняются в черновик сразу</span><Btn variant="dark" onClick={() => selectType(null)}>Готово</Btn></>}>
        {type && typeSel && <TypeForm id={typeSel} t={type} n={count[typeSel] || 0} onRenamed={(id) => selectType(id)} />}
      </Sheet>

      {delCat && (
        <ReassignDialog open onClose={() => setDelCat(null)} title={`Удалить «${delCat.name}»?`}
          text={<>В категории {Object.values(types).filter((t) => t.cat === delCat.id).length} типов продуктов ({products(catProducts(delCat.id))}). Куда их перенести?</>}
          label="Перенести типы в категорию" confirm="Перенести и удалить" options={cats.filter((c) => c.id !== delCat.id).map((c) => [c.id, c.name])}
          onConfirm={(target) => removeCatNow(delCat, target)} />
      )}
      {delType && (
        <ReassignDialog open onClose={() => setDelType(null)} title={`Удалить тип «${types[delType]?.name}»?`}
          text={<>Этот тип у {products(count[delType] || 0)}. Выберите новый тип для них — ссылки каталога тоже обновятся.</>}
          label="Новый тип для товаров" confirm="Перенести и удалить" options={Object.entries(types).filter(([k]) => k !== delType && k !== PROTECTED).map(([k, t]) => [k, `${t.name} · ${cats.find((c) => c.id === t.cat)?.name || ''}`])}
          onConfirm={(target) => removeTypeNow(delType, target)} />
      )}
    </div>
  );
}

/** The mega menu as the storefront builds it: categories → groups → types (with product counts). */
function MenuPreview() {
  const draft = useAdmin((s) => s.draft);
  const cats = draft.taxonomy.categories;
  const [open, setOpen] = useState(cats[0]?.id || '');
  const c = cats.find((x) => x.id === open) || cats[0];
  const n = (t: string) => draft.products.filter((p) => p.type === t && !p.hidden).length;
  if (!c) return null;
  return (
    <Card title="Меню каталога" sub="Предпросмотр колонок мега-меню">
      <div className="tax-menu">
        <div className="tax-menu__side">
          {cats.map((x) => <button key={x.id} type="button" className={cx(x.id === c.id && 'is-active')} onClick={() => setOpen(x.id)}><I name={x.icon} className="i--sm" />{x.name}</button>)}
        </div>
        <div className="tax-menu__cols">
          {c.groups.map((g, i) => (
            <div key={i}>
              <b>{g.name}</b>
              {g.types.filter((t) => draft.taxonomy.types[t]).map((t) => <span key={t}>{draft.taxonomy.types[t].many} <small>{n(t)}</small></span>)}
              {!g.types.length && <span className="adm-muted">пусто</span>}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function CategoryForm({ c, onRenamed }: { c: Category; onRenamed: (id: string) => void }) {
  const draft = useAdmin((s) => s.draft);
  const types = draft.taxonomy.types;
  const own = Object.entries(types).filter(([, t]) => t.cat === c.id);
  const grouped = new Set(c.groups.flatMap((g) => g.types));
  const orphans = own.filter(([k]) => !grouped.has(k));
  const upd = (fn: (x: Draft<Category>) => void, label: string, key?: string) => edit((d) => { const x = d.taxonomy.categories.find((y) => y.id === c.id); if (x) fn(x); }, { label, key });
  const rename = (v: string) => {
    const to = v.trim();
    edit((d) => renameCategory(d, c.id, to), { label: 'Категория: новый ID' });
    onRenamed(to);
    toast({ title: 'ID категории изменён', text: 'Типы и ссылки каталога обновлены', kind: 'ok' });
  };
  return (
    <div className="adm-stack adm-stack--lg">
      <div className="a-form">
        <Field label="Название" error={!c.name.trim() ? 'Нужно название' : undefined}><Input size="title" value={c.name} onValue={(v) => upd((x) => { x.name = v; }, 'Категория: название', `cat:${c.id}:name`)} /></Field>
        <Field label="Иконка в меню"><IconPicker kind="sprite" value={c.icon} onChange={(v) => upd((x) => { x.icon = v; }, 'Категория: иконка')} /></Field>
        <Field label="ID категории" hint={<>В ссылках: <span className="adm-mono">/catalog?cat={c.id}</span></>}>
          <LazyInput value={c.id} onCommit={rename} validate={(v) => (!ID_RE.test(v.trim()) ? 'Только латиница, цифры и дефис' : draft.taxonomy.categories.some((x) => x.id === v.trim() && x.id !== c.id) ? 'Такой ID уже есть' : null)} />
        </Field>
      </div>
      <div className="adm-stack adm-stack--sm">
        <div className="adm-row adm-row--between"><div className="a-card__title" style={{ fontSize: 20 }}>Группы в меню</div><Btn size="sm" icon="plus" onClick={() => upd((x) => { x.groups.push({ name: 'Новая группа', types: [] }); }, 'Группа добавлена')}>Группа</Btn></div>
        {orphans.length > 0 && (
          <Note kind="warn">Не попали ни в одну группу: {orphans.map(([, t]) => t.name).join(', ')}. В меню их не будет. {c.groups.length > 0 && <button type="button" className="a-link" onClick={() => upd((x) => { x.groups[0].types.push(...orphans.map(([k]) => k)); }, 'Типы добавлены в группу')}>Добавить в «{c.groups[0].name}»</button>}</Note>
        )}
        {c.groups.length ? (
          <SortableList items={c.groups} getKey={(_, i) => String(i)} gap={10} className="adm-stack" onMove={(a, b) => upd((x) => moveItem(x.groups, a, b), 'Группы: порядок')}
            render={(g, i, handle) => (
              <div className="tax-group">
                <div className="adm-row">
                  <span className="a-item__handle" {...handle}><I name="drag" /></span>
                  <div className="adm-grow"><Input value={g.name} onValue={(v) => upd((x) => { x.groups[i].name = v; }, 'Группа: название', `cat:${c.id}:g:${i}`)} /></div>
                  <IconBtn icon="trash" label="Удалить группу" danger onClick={() => upd((x) => { x.groups.splice(i, 1); }, 'Группа удалена')} />
                </div>
                <Chips size="sm" value={g.types} onChange={(v) => upd((x) => { x.groups[i].types = v; }, 'Группа: типы')}
                  options={[...own.map(([k, t]) => [k, t.many] as const), ...g.types.filter((k) => !own.some(([o]) => o === k)).map((k) => [k, `${types[k]?.many || k} (другая категория)`] as const)]} />
              </div>
            )} />
        ) : <Note>Групп нет — меню категории будет пустым.</Note>}
        {!own.length && <Note>В категории пока нет типов. Создайте тип и выберите для него эту категорию.</Note>}
      </div>
    </div>
  );
}

function TypeForm({ id, t, n, onRenamed }: { id: string; t: TypeInfo; n: number; onRenamed: (id: string) => void }) {
  const draft = useAdmin((s) => s.draft);
  const sample = draft.products.find((p) => p.type === id && !p.images?.length) || draft.products.find((p) => p.type === id);
  const upd = (fn: (x: Draft<TypeInfo>) => void, label: string, key?: string) => edit((d) => { const x = d.taxonomy.types[id]; if (x) fn(x); }, { label, key });
  const rename = (v: string) => {
    const to = v.trim();
    const order = Object.keys(draft.taxonomy.types).map((k) => (k === id ? to : k));
    edit((d) => { renameType(d, id, to); reorderKeys(d.taxonomy.types, order); }, { label: 'Тип: новый ID' });
    onRenamed(to);
    toast({ title: 'ID типа изменён', text: 'Товары, меню и ссылки обновлены', kind: 'ok' });
  };
  const items = draft.products.filter((p) => p.type === id);
  return (
    <div className="adm-stack adm-stack--lg">
      <div className="a-form">
        <div className="a-form-row a-form-row--2">
          <Field label="Название" hint="В карточке и на странице товара" error={!t.name.trim() ? 'Нужно название' : undefined}><Input value={t.name} onValue={(v) => upd((x) => { x.name = v; }, 'Тип: название', `type:${id}:name`)} /></Field>
          <Field label="Во множественном числе" hint="В меню, фильтрах и крошках"><Input value={t.many} onValue={(v) => upd((x) => { x.many = v; }, 'Тип: множественное', `type:${id}:many`)} /></Field>
        </div>
        <Field label="Категория">
          <Select value={t.cat} onValue={(v) => edit((d) => { const x = d.taxonomy.types[id]; if (x) { x.cat = v; addToCategory(d, id, v); } }, { label: 'Тип: категория' })} options={draft.taxonomy.categories.map((c) => [c.id, c.name] as const)} />
        </Field>
        <div className="tax-texture">
          <Field label="Текстура" hint="Рисуется на картинке «Текстура» в галерее товара">
            <Select value={t.texture || 'drop'} onValue={(v) => upd((x) => { x.texture = v; }, 'Тип: текстура')} options={TEXTURES} />
          </Field>
          {sample && <div className="tax-texture__art" title={sample.name}><Art spec={{ kind: 'gallery', id: sample.id, view: 'texture' }} /></div>}
        </div>
        <Field label="Как применять" hint="Вкладка «Применение» на странице каждого товара этого типа"><TextArea value={t.howto || ''} onValue={(v) => upd((x) => { x.howto = v; }, 'Тип: применение', `type:${id}:howto`)} rows={4} autoGrow /></Field>
        <Field label="Слова для поиска" hint="Синонимы и английские названия: по ним поиск найдёт товары этого типа">
          <TagsInput value={(t.synonyms || '').split(/\s+/).filter(Boolean)} onChange={(v) => upd((x) => { x.synonyms = v.join(' '); }, 'Тип: слова для поиска')} placeholder="например: тонер toner тоник" />
        </Field>
        <Field label="ID типа" hint={id === PROTECTED ? 'Служебный тип подарочных карт — ID менять нельзя' : <>В ссылках: <span className="adm-mono">/catalog?type={id}</span></>}>
          {id === PROTECTED ? <Input value={id} onValue={() => {}} readOnly /> : (
            <LazyInput value={id} onCommit={rename} validate={(v) => (!ID_RE.test(v.trim()) ? 'Только латиница, цифры и дефис' : draft.taxonomy.types[v.trim()] && v.trim() !== id ? 'Такой ID уже есть' : null)} />
          )}
        </Field>
      </div>
      <Card soft title={`Товары этого типа · ${n}`}>
        {items.length ? (
          <div className="a-changes">
            {items.slice(0, 10).map((p) => (
              <Link key={p.id} className="a-change" href={`/admin/products/edit/?id=${encodeURIComponent(p.id)}`}>
                <span className="a-cell__art" style={{ width: 34, height: 34, borderRadius: 9 }}><Art spec={{ kind: 'product', id: p.id }} /></span>
                <span className="adm-grow adm-ellipsis" style={{ fontWeight: 500 }}>{p.name}</span>
                <I name="chev-right" className="i--sm adm-muted" />
              </Link>
            ))}
            {items.length > 10 && <div className="adm-muted" style={{ padding: '6px 10px', fontSize: 13 }}>и ещё {items.length - 10}…</div>}
          </div>
        ) : <Note>Товаров этого типа пока нет.</Note>}
      </Card>
    </div>
  );
}
