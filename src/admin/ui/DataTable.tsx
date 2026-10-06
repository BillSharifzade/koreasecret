'use client';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { I } from './icons';
import { Check, cx } from './kit';

export interface Column<T> {
  key: string;
  label: ReactNode;
  render: (row: T, index: number) => ReactNode;
  /** value to sort by; the column is sortable when set */
  sort?: (row: T) => number | string;
  num?: boolean;
  width?: number | string;
  /** hide on narrow screens */
  wide?: boolean;
  className?: string;
}

export function DataTable<T>({ rows, columns, getKey, selected, onSelect, onRowClick, pageSize = 25, initialSort, empty, rowClass, footer, compact }: {
  rows: T[];
  columns: Column<T>[];
  getKey: (row: T) => string;
  selected?: Set<string>;
  onSelect?: (next: Set<string>) => void;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  initialSort?: { key: string; dir: 1 | -1 };
  empty?: ReactNode;
  rowClass?: (row: T) => string | undefined;
  footer?: ReactNode;
  compact?: boolean;
}) {
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(1);
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  const cols = narrow ? columns.filter((c) => !c.wide) : columns;

  const sorted = useMemo(() => {
    const col = sort && columns.find((c) => c.key === sort.key);
    if (!col?.sort) return rows;
    const get = col.sort;
    return rows.slice().sort((a, b) => {
      const x = get(a), y = get(b);
      return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'ru')) * sort!.dir;
    });
  }, [rows, sort, columns]);

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  useEffect(() => { if (page > pages) setPage(pages); }, [page, pages]);
  const shown = sorted.slice((page - 1) * pageSize, page * pageSize);
  const keys = shown.map(getKey);
  const allOn = !!selected && keys.length > 0 && keys.every((k) => selected.has(k));
  const someOn = !!selected && keys.some((k) => selected.has(k));

  const toggleAll = (on: boolean) => {
    if (!onSelect || !selected) return;
    const next = new Set(selected);
    keys.forEach((k) => (on ? next.add(k) : next.delete(k)));
    onSelect(next);
  };

  const nums: (number | '…')[] = [];
  for (let n = 1; n <= pages; n++) { if (n === 1 || n === pages || Math.abs(n - page) <= 1) nums.push(n); else if (nums[nums.length - 1] !== '…') nums.push('…'); }

  return (
    <>
      <div className="a-table-wrap">
        <table className={cx('a-table', compact && 'a-table--compact')}>
          <thead>
            <tr>
              {onSelect && <th className="is-check"><Check checked={allOn} indeterminate={!allOn && someOn} onChange={toggleAll} ariaLabel="Выбрать все" /></th>}
              {cols.map((c) => (
                <th key={c.key} style={{ width: c.width }} className={cx(c.num && 'is-num', c.sort && 'is-sortable', c.className)}
                  onClick={c.sort ? () => setSort((s) => (s?.key === c.key ? { key: c.key, dir: s.dir === 1 ? -1 : 1 } : { key: c.key, dir: c.num ? -1 : 1 })) : undefined}
                  aria-sort={sort?.key === c.key ? (sort.dir === 1 ? 'ascending' : 'descending') : undefined}>
                  {c.label}{sort?.key === c.key && <I name={sort.dir === 1 ? 'chev-down' : 'chev-down'} className="i--xs" />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((row, i) => {
              const k = getKey(row);
              return (
                <tr key={k} className={cx(onRowClick && 'is-clickable', selected?.has(k) && 'is-selected', rowClass?.(row))} onClick={onRowClick ? () => onRowClick(row) : undefined}>
                  {onSelect && selected && <td className="is-check"><Check checked={selected.has(k)} ariaLabel="Выбрать" onChange={(on) => { const next = new Set(selected); if (on) next.add(k); else next.delete(k); onSelect(next); }} /></td>}
                  {cols.map((c) => <td key={c.key} className={cx(c.num && 'is-num', c.className)}>{c.render(row, (page - 1) * pageSize + i)}</td>)}
                </tr>
              );
            })}
          </tbody>
          {footer && <tfoot>{footer}</tfoot>}
        </table>
        {!rows.length && empty}
      </div>
      {pages > 1 && (
        <div className="a-pager">
          <span>{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} из {sorted.length}</span>
          <div className="a-pager__nums">
            <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="Назад" disabled={page === 1}><I name="chev-left" className="i--sm" /></button>
            {nums.map((n, i) => (n === '…' ? <span key={`g${i}`} style={{ padding: '6px 4px' }}>…</span> : <button key={n} type="button" className={n === page ? 'is-active' : ''} onClick={() => setPage(n)}>{n}</button>))}
            <button type="button" onClick={() => setPage((p) => Math.min(pages, p + 1))} aria-label="Вперёд" disabled={page === pages}><I name="chev-right" className="i--sm" /></button>
          </div>
        </div>
      )}
    </>
  );
}
