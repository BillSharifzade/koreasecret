'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { plural } from '@/lib/format';
import { I } from './icons';
import { Btn, Field, Select } from './kit';
import { Dialog } from './overlay';

/* Shared bits of the taxonomy pages (brands, categories, types, ingredients, dictionaries). */

/** «3 товара» */
export const products = (n: number) => `${n} ${plural(n, 'товар', 'товара', 'товаров')}`;

/** Rebuild a keyed dictionary in the given key order (a rename should not move the entry to the end). */
export function reorderKeys<T>(dict: Record<string, T>, order: string[]) {
  const entries = order.filter((k) => k in dict).map((k) => [k, dict[k]] as const);
  Object.keys(dict).forEach((k) => { if (!order.includes(k)) entries.push([k, dict[k]] as const); });
  Object.keys(dict).forEach((k) => { delete dict[k]; });
  entries.forEach(([k, v]) => { dict[k] = v; });
}

/** Removes repeated values of one catalogue filter in a link or query: type=a,b,a → type=a,b. */
export function dedupeParam(link: string, key: string) {
  const qi = link.indexOf('?');
  const isQuery = !link.startsWith('/') && !link.startsWith('#') && !/^https?:/i.test(link);
  if (qi < 0 && !isQuery) return link;
  const head = isQuery ? '' : link.slice(0, qi + 1);
  const qs = isQuery ? link : link.slice(qi + 1);
  return head + qs.split('&').map((p) => {
    const [k, v = ''] = p.split('=');
    return k === key ? `${k}=${[...new Set(v.split(','))].join(',')}` : p;
  }).join('&');
}

/** Before deleting something that is still in use: choose where its products (types, …) move to. */
export function ReassignDialog({ open, onClose, title, text, label, options, confirm, onConfirm }: {
  open: boolean; onClose: () => void; title: string; text: ReactNode; label: string; options: [string, string][]; confirm: string; onConfirm: (target: string) => void;
}) {
  const [target, setTarget] = useState(options[0]?.[0] || '');
  useEffect(() => { if (open) setTarget(options[0]?.[0] || ''); }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Dialog open={open} onClose={onClose} label={title}>
      <div className="a-dialog__icon is-danger"><I name="split" /></div>
      <div className="a-dialog__title">{title}</div>
      <div className="a-dialog__text">{text}</div>
      {options.length ? (
        <div style={{ marginTop: 16 }}><Field label={label}><Select value={target} onValue={setTarget} options={options} /></Field></div>
      ) : <div className="a-dialog__text" style={{ color: 'var(--a-red)' }}>Перенести некуда — сначала создайте ещё один вариант.</div>}
      <div className="a-dialog__foot">
        <Btn onClick={onClose}>Отмена</Btn>
        <Btn variant="danger" disabled={!target} onClick={() => { onConfirm(target); onClose(); }}>{confirm}</Btn>
      </div>
    </Dialog>
  );
}
