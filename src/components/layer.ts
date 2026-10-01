'use client';
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';

/* One global stack of open layers (drawers, modals, menus): body scroll lock, Esc to close the top one, focus trap. */
interface Entry { ref: RefObject<HTMLElement | null>; close: () => void }
const stack: Entry[] = [];
let installed = false;

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([type="hidden"]):not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

function install() {
  if (installed) return;
  installed = true;
  document.addEventListener('keydown', (e) => {
    const top = stack[stack.length - 1];
    if (!top) return;
    if (e.key === 'Escape') { e.preventDefault(); top.close(); return; }
    if (e.key !== 'Tab' || !top.ref.current) return;
    const items = Array.from(top.ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((x) => x.offsetParent !== null);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
}

// scrollbars are hidden site-wide, so locking needs no width compensation
const lock = () => document.body.classList.add('is-locked');
const unlock = () => document.body.classList.remove('is-locked');

export function useLayer(open: boolean, close: () => void, ref: RefObject<HTMLElement | null>, focus?: string) {
  const closeRef = useRef(close);
  useEffect(() => { closeRef.current = close; });
  useEffect(() => {
    if (!open) return;
    install();
    const entry: Entry = { ref, close: () => closeRef.current() };
    stack.push(entry);
    lock();
    const prev = document.activeElement as HTMLElement | null;
    const timer = window.setTimeout(() => {
      const el = ref.current;
      const target = (focus && el?.querySelector<HTMLElement>(focus)) || el?.querySelector<HTMLElement>('[autofocus]') || el?.querySelector<HTMLElement>(FOCUSABLE);
      target?.focus({ preventScroll: true });
    }, 60);
    return () => {
      window.clearTimeout(timer);
      const i = stack.indexOf(entry);
      if (i >= 0) stack.splice(i, 1);
      if (!stack.length) unlock();
      if (prev && document.contains(prev)) prev.focus({ preventScroll: true });
    };
  }, [open, ref, focus]);
}

export const isTopLayer = (ref: RefObject<HTMLElement | null>) => stack.length > 0 && stack[stack.length - 1].ref === ref;

/** true after hydration — guards portals and browser-only rendering */
export function useMounted() {
  const [m, setM] = useState(false);
  useIsoLayoutEffect(() => setM(true), []);
  return m;
}
export const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
