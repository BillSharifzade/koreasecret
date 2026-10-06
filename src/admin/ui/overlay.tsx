'use client';
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useLayer, useMounted } from '@/components/layer';
import { I } from './icons';
import { Btn, cx } from './kit';

/* ---------- side sheet (editors) ---------- */
export function Sheet({ open, onClose, title, sub, children, foot, wide, actions }: { open: boolean; onClose: () => void; title: ReactNode; sub?: ReactNode; children: ReactNode; foot?: ReactNode; wide?: boolean; actions?: ReactNode }) {
  const mounted = useMounted();
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(open);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (open) { setShown(true); const r = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true))); return () => cancelAnimationFrame(r); }
    setVisible(false);
    const t = window.setTimeout(() => setShown(false), 420);
    return () => window.clearTimeout(t);
  }, [open]);
  useLayer(open, onClose, ref, '.a-sheet__x');
  if (!mounted || !shown) return null;
  return createPortal(
    <div ref={ref}>
      <div className={cx('a-overlay', visible && 'is-open')} onClick={onClose} />
      <aside className={cx('a-sheet', wide && 'a-sheet--wide', visible && 'is-open')} role="dialog" aria-modal="true">
        <div className="a-sheet__head">
          <h2 className="a-sheet__title">{title}{sub && <small>{sub}</small>}</h2>
          {actions}
          <button type="button" className="a-icon-btn a-sheet__x" onClick={onClose} aria-label="Закрыть"><I name="close" /></button>
        </div>
        <div className="a-sheet__body">{children}</div>
        {foot && <div className="a-sheet__foot">{foot}</div>}
      </aside>
    </div>,
    document.body
  );
}

/* ---------- modal dialog ---------- */
export function Dialog({ open, onClose, children, size, label }: { open: boolean; onClose: () => void; children: ReactNode; size?: 'wide' | 'xl'; label?: string }) {
  const mounted = useMounted();
  const ref = useRef<HTMLDivElement>(null);
  useLayer(open, onClose, ref);
  if (!mounted || !open) return null;
  return createPortal(
    <div ref={ref}>
      <div className="a-overlay is-open" onClick={onClose} />
      <div className="a-dialog-wrap">
        <div className={cx('a-dialog', size && `a-dialog--${size}`)} role="dialog" aria-modal="true" aria-label={label}>{children}</div>
      </div>
    </div>,
    document.body
  );
}

/* ---------- imperative confirm / prompt ---------- */
interface Ask { id: number; title: string; text?: ReactNode; confirm: string; cancel?: string; danger?: boolean; icon?: string; input?: { value: string; placeholder?: string; label?: string }; resolve: (v: string | boolean | null) => void }
let asks: Ask[] = [];
let askSeq = 0;
const askListeners = new Set<() => void>();
const emitAsk = () => askListeners.forEach((l) => l());

export function confirmDialog(o: { title: string; text?: ReactNode; confirm?: string; cancel?: string; danger?: boolean; icon?: string }): Promise<boolean> {
  return new Promise((resolve) => {
    asks = [...asks, { id: ++askSeq, confirm: 'Подтвердить', ...o, resolve: (v) => resolve(v === true) }];
    emitAsk();
  });
}
export function promptDialog(o: { title: string; text?: ReactNode; confirm?: string; value?: string; placeholder?: string; label?: string; icon?: string }): Promise<string | null> {
  return new Promise((resolve) => {
    asks = [...asks, { id: ++askSeq, title: o.title, text: o.text, icon: o.icon, confirm: o.confirm || 'Готово', input: { value: o.value || '', placeholder: o.placeholder, label: o.label }, resolve: (v) => resolve(typeof v === 'string' ? v : null) }];
    emitAsk();
  });
}

function AskView({ a }: { a: Ask }) {
  const [v, setV] = useState(a.input?.value || '');
  const close = (r: string | boolean | null) => { asks = asks.filter((x) => x.id !== a.id); emitAsk(); a.resolve(r); };
  return (
    <Dialog open onClose={() => close(a.input ? null : false)} label={a.title}>
      <div className={cx('a-dialog__icon', a.danger && 'is-danger')}><I name={a.icon || (a.danger ? 'trash' : a.input ? 'edit' : 'info')} /></div>
      <div className="a-dialog__title">{a.title}</div>
      {a.text && <div className="a-dialog__text">{a.text}</div>}
      {a.input && (
        <form style={{ marginTop: 16 }} onSubmit={(e) => { e.preventDefault(); close(v); }}>
          {a.input.label && <div className="a-field__label" style={{ marginBottom: 6 }}>{a.input.label}</div>}
          <input className="a-input" autoFocus value={v} placeholder={a.input.placeholder} onChange={(e) => setV(e.target.value)} />
        </form>
      )}
      <div className="a-dialog__foot">
        <Btn onClick={() => close(a.input ? null : false)}>{a.cancel || 'Отмена'}</Btn>
        <Btn variant={a.danger ? 'danger' : 'primary'} onClick={() => close(a.input ? v : true)} autoFocus={!a.input}>{a.confirm}</Btn>
      </div>
    </Dialog>
  );
}

export function AskHost() {
  const list = useSyncExternalStore((f) => { askListeners.add(f); return () => { askListeners.delete(f); }; }, () => asks, () => asks);
  return <>{list.map((a) => <AskView key={a.id} a={a} />)}</>;
}

/* ---------- toasts ---------- */
export interface ToastIn { title: string; text?: string; kind?: 'ok' | 'error' | 'info'; icon?: string; action?: { label: string; fn: () => void }; ms?: number }
interface ToastItem extends ToastIn { id: number; out?: boolean }
let toasts: ToastItem[] = [];
let toastSeq = 0;
const toastListeners = new Set<() => void>();
const emitToast = () => toastListeners.forEach((l) => l());

function dismiss(id: number) {
  toasts = toasts.map((t) => (t.id === id ? { ...t, out: true } : t));
  emitToast();
  window.setTimeout(() => { toasts = toasts.filter((t) => t.id !== id); emitToast(); }, 320);
}
export function toast(t: ToastIn) {
  const id = ++toastSeq;
  toasts = [...toasts.slice(-3), { ...t, id }];
  emitToast();
  window.setTimeout(() => dismiss(id), t.ms ?? (t.action ? 6000 : 3400));
}

export function ToastHost() {
  const mounted = useMounted();
  const list = useSyncExternalStore((f) => { toastListeners.add(f); return () => { toastListeners.delete(f); }; }, () => toasts, () => toasts);
  if (!mounted) return null;
  return createPortal(
    <div className="a-toasts" role="status" aria-live="polite">
      {list.map((t) => (
        <div key={t.id} className={cx('a-toast', t.out && 'is-out')}>
          <div className={cx('a-toast__icon', t.kind === 'error' && 'is-error', t.kind === 'ok' && 'is-ok')}><I name={t.icon || (t.kind === 'error' ? 'alert' : t.kind === 'ok' ? 'check' : 'sparkle')} /></div>
          <div className="a-toast__body"><div className="a-toast__title">{t.title}</div>{t.text && <div className="a-toast__text">{t.text}</div>}</div>
          {t.action && <button type="button" className="a-toast__action" onClick={() => { t.action!.fn(); dismiss(t.id); }}>{t.action.label}</button>}
        </div>
      ))}
    </div>,
    document.body
  );
}
