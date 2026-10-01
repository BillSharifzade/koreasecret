'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { Art } from './Art';
import { Icon } from './Icon';
import { useLayer, useMounted } from './layer';
import type { ArtSpecInput } from '@/lib/art';
import { getProduct, titleOf } from '@/lib/shop';
import { shop } from '@/lib/store';

/* ---------- UI: overlays, modal, toasts ---------- */
export type OverlayName = 'mega' | 'search' | 'cart' | 'fav' | 'filters';
export interface ModalOpts { wide?: boolean; label?: string; cls?: string }
export interface ToastInput { title: string; text?: string; icon?: string; art?: ArtSpecInput; action?: { label: string; fn: () => void } }
interface Toast extends ToastInput { id: number; out?: boolean }

interface UIValue {
  overlay: OverlayName | null;
  open: (o: OverlayName) => void;
  close: () => void;
  toggle: (o: OverlayName) => void;
  openModal: (node: ReactNode, opts?: ModalOpts) => void;
  closeModal: () => void;
  toast: (t: ToastInput) => void;
  addToCart: (id: string, v?: number, q?: number) => void;
  toggleFav: (id: string) => void;
  copyPromo: (code: string) => void;
  soon: () => void;
  bump: { cart: number; fav: number };
}
const UI = createContext<UIValue | null>(null);
export function useUI() {
  const v = useContext(UI);
  if (!v) throw new Error('useUI outside <Providers>');
  return v;
}

export async function copyText(text: string) {
  try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return; } } catch { /* fall through */ }
  const ta = document.createElement('textarea');
  ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); } catch { /* ignore */ }
  ta.remove();
}

export function Providers({ children }: { children: ReactNode }) {
  const [overlay, setOverlay] = useState<OverlayName | null>(null);
  const [modal, setModal] = useState<{ node: ReactNode; opts: ModalOpts; key: number } | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [bump, setBump] = useState({ cart: 0, fav: 0 });
  const seq = useRef(0);
  const pathname = usePathname();

  // navigating closes menus and dialogs
  useEffect(() => { setOverlay(null); setModal(null); }, [pathname]);

  const dismiss = useCallback((id: number) => {
    setToasts((ts) => ts.map((t) => (t.id === id ? { ...t, out: true } : t)));
    window.setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 350);
  }, []);
  const toast = useCallback((t: ToastInput) => {
    const id = ++seq.current;
    setToasts((ts) => [...ts.slice(-2), { ...t, id }]);
    window.setTimeout(() => dismiss(id), 3400);
  }, [dismiss]);

  const value = useMemo<UIValue>(() => ({
    overlay,
    open: (o) => setOverlay(o),
    close: () => setOverlay(null),
    toggle: (o) => setOverlay((cur) => (cur === o ? null : o)),
    openModal: (node, opts = {}) => setModal({ node, opts, key: ++seq.current }),
    closeModal: () => setModal(null),
    toast,
    addToCart: (id, v = 0, q = 1) => {
      const p = getProduct(id);
      if (!p || p.stock <= 0) return;
      shop.add(id, v, q);
      setBump((b) => ({ ...b, cart: b.cart + 1 }));
      const va = p.variants?.[v];
      toast({ title: 'Добавлено в корзину', text: titleOf(p) + (va ? ` · ${va.name}` : ''), art: { kind: 'product', id, variant: va?.color, amount: va?.price ? va.name : undefined }, action: { label: 'Корзина', fn: () => setOverlay('cart') } });
    },
    toggleFav: (id) => {
      const p = getProduct(id);
      if (!p) return;
      const on = shop.toggleFav(id);
      setBump((b) => ({ ...b, fav: b.fav + 1 }));
      toast({ title: on ? 'Добавлено в избранное' : 'Удалено из избранного', text: titleOf(p), icon: 'heart', action: on ? { label: 'Избранное', fn: () => setOverlay('fav') } : undefined });
    },
    copyPromo: (code) => {
      copyText(code);
      shop.setPromo(code);
      toast({ title: `Промокод ${code} скопирован`, text: 'Мы уже применили его к корзине', icon: 'copy' });
    },
    soon: () => toast({ title: 'Демо-версия магазина', text: 'Раздел появится в полной версии сайта', icon: 'sparkle' }),
    bump
  }), [overlay, toast, bump]);

  return (
    <UI.Provider value={value}>
      {children}
      <ModalHost modal={modal} onClose={() => setModal(null)} />
      <Toasts toasts={toasts} onAction={(t) => { t.action?.fn(); dismiss(t.id); }} />
    </UI.Provider>
  );
}

/* ---------- modal host ---------- */
function ModalHost({ modal, onClose }: { modal: { node: ReactNode; opts: ModalOpts; key: number } | null; onClose: () => void }) {
  const mounted = useMounted();
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState<typeof modal>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (modal) { setShown(modal); const r = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true))); return () => cancelAnimationFrame(r); }
    setVisible(false);
    const t = window.setTimeout(() => setShown(null), 420);
    return () => window.clearTimeout(t);
  }, [modal]);

  useLayer(!!modal, onClose, ref);
  if (!mounted || !shown) return null;
  const o = shown.opts;
  return createPortal(
    <div ref={ref} className={`modal${o.wide ? ' modal--wide' : ''}${o.cls ? ' ' + o.cls : ''}${visible && modal ? ' is-open' : ''}`} aria-hidden={!modal}>
      <div className="modal__backdrop" onClick={onClose} />
      <div className="modal__dialog" role="dialog" aria-modal="true" aria-label={o.label}>
        <button className="modal__close" type="button" onClick={onClose} aria-label="Закрыть"><Icon name="close" /></button>
        <div className="modal__body" key={shown.key}>{shown.node}</div>
      </div>
    </div>,
    document.body
  );
}

/* ---------- toasts ---------- */
function Toasts({ toasts, onAction }: { toasts: Toast[]; onAction: (t: Toast) => void }) {
  const mounted = useMounted();
  if (!mounted) return null;
  return createPortal(
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast${t.out ? ' is-out' : ''}`}>
          {t.art ? <Art className="toast__art" spec={t.art} /> : <div className="toast__icon"><Icon name={t.icon || 'check'} /></div>}
          <div className="toast__body">
            <div className="toast__title">{t.title}</div>
            {t.text && <div className="toast__text">{t.text}</div>}
          </div>
          {t.action && <button className="toast__action" type="button" onClick={() => onAction(t)}>{t.action.label}</button>}
        </div>
      ))}
    </div>,
    document.body
  );
}
