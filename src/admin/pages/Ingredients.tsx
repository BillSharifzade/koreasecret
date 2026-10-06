'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Art } from '@/components/Art';
import type { Glyph, Ingredient } from '@/lib/types';
import { renameIngredient } from '../state/refs';
import { ID_RE, uniqueId } from '../state/schema';
import { edit, undo, useAdmin } from '../state/store';
import { useSelected } from '../ui/collection';
import { I } from '../ui/icons';
import { Badge, Btn, Card, ColorInput, cx, Empty, Field, Input, LazyInput, Menu, Note, PageHead, PASTELS, Seg } from '../ui/kit';
import { confirmDialog, promptDialog, Sheet, toast } from '../ui/overlay';
import { products, reorderKeys } from '../ui/tax-helpers';
import '../styles/taxonomy.css';

const GLYPHS: [Glyph, string][] = [['drop', 'Капля'], ['leaf', 'Лист'], ['molecule', 'Молекула'], ['grain', 'Зёрна'], ['honey', 'Соты'], ['citrus', 'Цитрус'], ['swirl', 'Завиток'], ['capsule', 'Капсула'], ['helix', 'Спираль ДНК'], ['dots', 'Точки'], ['root', 'Корень'], ['sun', 'Солнце']];

export function Ingredients() {
  const draft = useAdmin((s) => s.draft);
  const [sel, select] = useSelected();
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<'use' | 'name'>('use');
  const dict = draft.ingredients;

  const uses = useMemo(() => {
    const m: Record<string, number> = {};
    draft.products.forEach((p) => p.ingr.forEach((k) => { m[k] = (m[k] || 0) + 1; }));
    return m;
  }, [draft.products]);

  const list = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return Object.entries(dict).filter(([k, x]) => !ql || `${k} ${x.name} ${x.note}`.toLowerCase().includes(ql))
      .sort((a, b) => (sort === 'name' ? a[1].name.localeCompare(b[1].name) : (uses[b[0]] || 0) - (uses[a[0]] || 0) || a[1].name.localeCompare(b[1].name)));
  }, [dict, q, sort, uses]);

  const unused = Object.keys(dict).filter((k) => !uses[k]).length;

  const create = async () => {
    const name = (await promptDialog({ title: 'Новый ингредиент', label: 'Название', placeholder: 'Например, Бакучиол', confirm: 'Создать', icon: 'flask' }))?.trim();
    if (!name) return;
    const id = uniqueId(name, (x) => !!dict[x.replace(/-/g, '_')]).replace(/-/g, '_');
    edit((d) => { d.ingredients[id] = { glyph: 'drop', tint: PASTELS[Object.keys(d.ingredients).length % PASTELS.length], name, note: '' }; }, { label: `Новый ингредиент: ${name}` });
    select(id);
  };
  const remove = async (k: string) => {
    const x = dict[k];
    const n = uses[k] || 0;
    const ok = await confirmDialog({ title: `Удалить «${x?.name}»?`, text: n ? `Ингредиент указан у ${products(n)} — из их состава он уберётся.` : 'Ингредиент не используется в товарах.', confirm: 'Удалить', danger: true });
    if (!ok) return;
    if (sel === k) select(null);
    edit((d) => { d.products.forEach((p) => { p.ingr = p.ingr.filter((i) => i !== k); }); delete d.ingredients[k]; }, { label: `Удалён ингредиент: ${x?.name}` });
    toast({ title: 'Ингредиент удалён', text: x?.name, icon: 'trash', action: { label: 'Вернуть', fn: () => undo() } });
  };

  const current = sel ? dict[sel] : undefined;

  return (
    <div className="adm-page">
      <PageHead title={<>Ингредиенты <em>и активы</em></>} sub="Справочник ключевых компонентов: из него собирается вкладка «Состав», блок «Активные компоненты» и картинка «Компоненты» в галерее товара."
        actions={<Btn variant="primary" icon="plus" onClick={create}>Новый ингредиент</Btn>} />
      <div className="a-minis tax-minis">
        <div className="a-mini"><span className="a-mini__icon"><I name="flask" /></span><span><b>{Object.keys(dict).length}</b><small>в справочнике</small></span></div>
        <div className="a-mini"><span className="a-mini__icon is-green"><I name="box" /></span><span><b>{draft.products.filter((p) => p.ingr.length).length}</b><small>товаров с составом</small></span></div>
        <div className="a-mini"><span className={cx('a-mini__icon', unused ? 'is-amber' : 'is-gray')}><I name="minus-circle" /></span><span><b>{unused}</b><small>не используются</small></span></div>
      </div>
      <Card flush>
        <div className="a-toolbar">
          <div className="a-affix a-affix--prefix a-search-input"><span className="a-affix__prefix"><I name="search" className="i--sm" /></span><input className="a-input" placeholder="Название, ID или свойство" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <span className="adm-grow" />
          <Seg size="sm" value={sort} onChange={setSort} options={[{ value: 'use', label: 'По популярности' }, { value: 'name', label: 'А–Я' }]} />
        </div>
        {list.length ? (
          <div className="tax-ingr">
            {list.map(([k, x]) => (
              <button key={k} type="button" className={cx('tax-ingr__card', sel === k && 'is-active')} onClick={() => select(k)}>
                <span className="tax-ingr__art"><Art spec={{ kind: 'ingredient', key: k }} /></span>
                <span className="tax-ingr__body">
                  <b className="adm-ellipsis">{x.name}</b>
                  <span className="adm-muted adm-clamp2">{x.note || 'без пояснения'}</span>
                  {uses[k] ? <Badge>{products(uses[k])}</Badge> : <Badge tone="amber">не используется</Badge>}
                </span>
              </button>
            ))}
          </div>
        ) : <Empty title="Ничего не нашлось" text="Измените запрос" />}
      </Card>

      <Sheet open={!!current} onClose={() => select(null)} title={current?.name || ''} sub={sel ? `${products(uses[sel] || 0)} · ID ${sel}` : undefined}
        actions={sel && <Menu items={[{ label: 'Удалить ингредиент', icon: 'trash', danger: true, onClick: () => remove(sel) }]} />}
        foot={<><span className="adm-muted adm-grow" style={{ fontSize: 12.5 }}><I name="check" className="i--xs" /> Изменения сохраняются в черновик сразу</span><Btn variant="dark" onClick={() => select(null)}>Готово</Btn></>}>
        {current && sel && <IngredientForm k={sel} x={current} onRenamed={(id) => select(id)} />}
      </Sheet>
    </div>
  );
}

function IngredientForm({ k, x, onRenamed }: { k: string; x: Ingredient; onRenamed: (id: string) => void }) {
  const draft = useAdmin((s) => s.draft);
  const items = draft.products.filter((p) => p.ingr.includes(k));
  const upd = (fn: (i: Ingredient) => void, label: string, key?: string) => edit((d) => { const i = d.ingredients[k]; if (i) fn(i); }, { label, key });
  const rename = (v: string) => {
    const to = v.trim();
    const order = Object.keys(draft.ingredients).map((o) => (o === k ? to : o));
    edit((d) => { renameIngredient(d, k, to); reorderKeys(d.ingredients, order); }, { label: 'Ингредиент: новый ID' });
    onRenamed(to);
    toast({ title: 'ID ингредиента изменён', text: 'Состав товаров обновлён', kind: 'ok' });
  };
  return (
    <div className="adm-stack adm-stack--lg">
      <div className="tax-ingr-hero">
        <span className="a-preview__label"><I name="eye" />Как на странице товара</span>
        <div className="ingredient tax-ingr-hero__site">
          <Art className="ingredient__art" as="div" spec={{ kind: 'ingredient', key: k }} />
          <span>{x.name || 'Без названия'}<br /><small>{x.note || 'короткое пояснение'}</small></span>
        </div>
      </div>
      <div className="a-form">
        <Field label="Название" error={!x.name.trim() ? 'Нужно название' : undefined}><Input size="title" value={x.name} onValue={(v) => upd((i) => { i.name = v; }, 'Ингредиент: название', `ing:${k}:name`)} /></Field>
        <Field label="Чем полезен" hint="Пара слов: «успокаивает раздражения», «глубокое увлажнение»"><Input value={x.note} onValue={(v) => upd((i) => { i.note = v; }, 'Ингредиент: пояснение', `ing:${k}:note`)} /></Field>
        <Field label="Символ">
          <div className="tax-glyphs">
            {GLYPHS.map(([g, label]) => <button key={g} type="button" className={cx('a-chip', x.glyph === g && 'is-active')} onClick={() => upd((i) => { i.glyph = g; }, 'Ингредиент: символ')}>{x.glyph === g && <I name="check" />}{label}</button>)}
          </div>
        </Field>
        <Field label="Цвет фона" hint="Пастельный тон — символ рисуется более тёмным оттенком того же цвета"><ColorInput value={x.tint} onChange={(v) => upd((i) => { i.tint = v; }, 'Ингредиент: цвет', `ing:${k}:tint`)} palette={PASTELS} /></Field>
        <Field label="ID ингредиента" hint="Служебный ключ в составе товаров. При смене состав обновится автоматически.">
          <LazyInput value={k} onCommit={rename} validate={(v) => (!ID_RE.test(v.trim()) ? 'Только латиница, цифры, дефис и _' : draft.ingredients[v.trim()] && v.trim() !== k ? 'Такой ID уже есть' : null)} />
        </Field>
      </div>
      <Card soft title={`Товары с ингредиентом · ${items.length}`}>
        {items.length ? (
          <div className="a-changes">
            {items.map((p) => (
              <Link key={p.id} className="a-change" href={`/admin/products/edit/?id=${encodeURIComponent(p.id)}`}>
                <span className="a-cell__art" style={{ width: 34, height: 34, borderRadius: 9 }}><Art spec={{ kind: 'product', id: p.id }} /></span>
                <span className="adm-grow adm-ellipsis" style={{ fontWeight: 500 }}>{p.name}</span>
                {p.ingr.indexOf(k) > 2 && <Badge>не на картинке</Badge>}
                <I name="chev-right" className="i--sm adm-muted" />
              </Link>
            ))}
          </div>
        ) : <Note>Пока ни у одного товара. Ингредиенты выбираются в карточке товара, в блоке «Для кого и состав».</Note>}
      </Card>
    </div>
  );
}
