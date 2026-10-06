'use client';
import type { Draft } from 'immer';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, type ReactNode } from 'react';
import type { SiteContent } from '@/lib/types';
import { uid } from '../state/schema';
import { edit, useAdmin } from '../state/store';
import { I } from './icons';
import { Badge, Btn, cx, Empty, IconBtn, Menu, PageHead } from './kit';
import { confirmDialog, Sheet, toast } from './overlay';
import { moveItem, SortableList } from './Sortable';
import { redo, undo } from '../state/store';

export type ListOf<T> = (d: Draft<SiteContent> | SiteContent) => T[];

/** Editing helpers for one item of a content list; edits to one field coalesce into one undo step. */
export function itemEditor<T extends { id: string }>(list: ListOf<T>, id: string, area: string) {
  const find = (d: Draft<SiteContent>) => (list(d) as unknown as Draft<T>[]).find((x) => x.id === id);
  return {
    set<K extends keyof T & string>(k: K, v: T[K], label?: string) {
      edit((d) => { const x = find(d); if (x) (x as unknown as T)[k] = v; }, { label: label || `${area}: ${k}`, key: `${area}:${id}:${k}` });
    },
    update(fn: (x: Draft<T>) => void, label?: string, key?: string) {
      edit((d) => { const x = find(d); if (x) fn(x); }, { label: label || area, key });
    }
  };
}

/** ?id=… in the URL selects the item being edited (links from the change list, the command palette). */
export function useSelected(param = 'id') {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const id = sp.get(param) || '';
  const select = useCallback((next: string | null) => {
    const q = new URLSearchParams(sp.toString());
    if (next) q.set(param, next); else q.delete(param);
    const s = q.toString();
    router.replace(`${pathname}${s ? '?' + s : ''}`, { scroll: false });
  }, [sp, router, pathname, param]);
  return [id, select] as const;
}

export interface CollectionProps<T extends { id: string; hidden?: boolean }> {
  area: string;
  list: ListOf<T>;
  title: ReactNode;
  sub?: ReactNode;
  noun: { one: string; add: string; gen?: string };
  label: (x: T) => ReactNode;
  caption?: (x: T) => ReactNode;
  media?: (x: T) => ReactNode;
  squareMedia?: boolean;
  create: (d: SiteContent) => T;
  editor: (x: T, ed: ReturnType<typeof itemEditor<T>>) => ReactNode;
  sheetTitle?: (x: T) => ReactNode;
  wide?: boolean;
  canHide?: boolean;
  extra?: (x: T) => ReactNode;
  actions?: ReactNode;
  before?: ReactNode;
  after?: ReactNode;
  head?: boolean;
  onRemove?: (d: Draft<SiteContent>, x: T) => void;
  removeText?: (x: T) => ReactNode;
}

export function CollectionEditor<T extends { id: string; hidden?: boolean }>(p: CollectionProps<T>) {
  const draft = useAdmin((s) => s.draft);
  const items = p.list(draft);
  const [sel, select] = useSelected();
  const current = items.find((x) => x.id === sel);
  const ed = current ? itemEditor(p.list, current.id, p.area) : null;

  const add = () => {
    const x = p.create(draft);
    edit((d) => { (p.list(d) as unknown as T[]).push(x); }, { label: `${p.area}: добавлен ${p.noun.one}` });
    select(x.id);
  };
  const duplicate = (x: T) => {
    const copy = { ...JSON.parse(JSON.stringify(x)), id: uid(x.id.replace(/-[a-z0-9]{6}$/, '') + '-') } as T;
    edit((d) => { const l = p.list(d) as unknown as T[]; const i = l.findIndex((y) => y.id === x.id); l.splice(i + 1, 0, copy); }, { label: `${p.area}: копия` });
    select(copy.id);
    toast({ title: 'Создана копия', icon: 'duplicate' });
  };
  const remove = async (x: T) => {
    const ok = await confirmDialog({ title: `Удалить ${p.noun.one}?`, text: p.removeText?.(x) ?? <>«{p.label(x)}» исчезнет с сайта после публикации. Удаление можно отменить.</>, confirm: 'Удалить', danger: true });
    if (!ok) return;
    if (sel === x.id) select(null);
    edit((d) => {
      const l = p.list(d) as unknown as T[];
      const i = l.findIndex((y) => y.id === x.id);
      if (i >= 0) l.splice(i, 1);
      p.onRemove?.(d, x);
    }, { label: `${p.area}: удалён ${p.noun.one}` });
    toast({ title: 'Удалено', text: String(typeof p.label(x) === 'string' ? p.label(x) : ''), icon: 'trash', action: { label: 'Вернуть', fn: () => undo() } });
  };
  const toggle = (x: T) => edit((d) => { const y = (p.list(d) as unknown as T[]).find((z) => z.id === x.id); if (y) y.hidden = !y.hidden; }, { label: `${p.area}: видимость` });

  return (
    <div className="adm-page">
      {p.head !== false && <PageHead title={p.title} sub={p.sub} actions={<>{p.actions}<Btn variant="primary" icon="plus" onClick={add}>{p.noun.add}</Btn></>} />}
      {p.before}
      {items.length ? (
        <SortableList items={items} getKey={(x) => x.id} onMove={(a, b) => edit((d) => moveItem(p.list(d) as unknown as T[], a, b), { label: `${p.area}: порядок` })}
          render={(x, i, handle) => (
            <div className={cx('a-item', x.hidden && 'is-hidden', sel === x.id && 'is-active')}>
              <span className="a-item__handle" {...handle}><I name="drag" /></span>
              {p.media && <div className={cx('a-item__media', p.squareMedia && 'a-item__media--square')} onClick={() => select(x.id)}>{p.media(x)}</div>}
              <div className="a-item__body" onClick={() => select(x.id)}>
                <div className="a-item__title">{p.label(x)}</div>
                {p.caption && <div className="a-item__sub">{p.caption(x)}</div>}
              </div>
              {x.hidden && <Badge icon="eye-off">скрыт</Badge>}
              {p.extra?.(x)}
              <div className="a-item__actions">
                {p.canHide !== false && <IconBtn icon={x.hidden ? 'eye-off' : 'eye'} label={x.hidden ? 'Показать на сайте' : 'Скрыть с сайта'} onClick={() => toggle(x)} />}
                <IconBtn icon="edit" label="Редактировать" onClick={() => select(x.id)} />
                <Menu items={[
                  { label: 'Редактировать', icon: 'edit', onClick: () => select(x.id) },
                  { label: 'Дублировать', icon: 'duplicate', onClick: () => duplicate(x) },
                  { label: 'Наверх', icon: 'arrow-right', onClick: () => edit((d) => moveItem(p.list(d) as unknown as T[], i, 0), { label: `${p.area}: порядок` }), disabled: i === 0 },
                  { sep: true },
                  { label: 'Удалить', icon: 'trash', danger: true, onClick: () => remove(x) }
                ]} />
              </div>
            </div>
          )} />
      ) : (
        <div className="a-card"><Empty title={`Пока нет ни одного: ${p.noun.gen || p.noun.one}`} text="Создайте первый — он сразу появится в черновике сайта" action={<Btn variant="primary" icon="plus" onClick={add}>{p.noun.add}</Btn>} /></div>
      )}
      {p.after}
      <Sheet open={!!current} onClose={() => select(null)} wide={p.wide} title={current ? (p.sheetTitle?.(current) ?? p.label(current)) : ''} sub={current?.hidden ? 'Скрыт с сайта' : undefined}
        actions={current && <Menu items={[{ label: 'Дублировать', icon: 'duplicate', onClick: () => duplicate(current) }, ...(p.canHide !== false ? [{ label: current.hidden ? 'Показать на сайте' : 'Скрыть с сайта', icon: current.hidden ? 'eye' : 'eye-off', onClick: () => toggle(current) }] : []), { sep: true }, { label: 'Удалить', icon: 'trash', danger: true, onClick: () => remove(current) }]} />}
        foot={<><span className="adm-muted adm-grow" style={{ fontSize: 12.5 }}><I name="check" className="i--xs" /> Изменения сохраняются в черновик сразу</span><Btn variant="dark" onClick={() => select(null)}>Готово</Btn></>}>
        {current && ed && p.editor(current, ed)}
      </Sheet>
    </div>
  );
}

export { redo };
