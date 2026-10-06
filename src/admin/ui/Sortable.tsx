'use client';
import { useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent, type ReactNode } from 'react';

/* Drag-to-reorder with pointer events (mouse, touch, pen): the dragged row follows the pointer, the others slide
   aside, and the move is committed on release. The handle also answers ↑/↓ for keyboard users. */

export interface HandleProps {
  onPointerDown: (e: RPointerEvent<HTMLElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
  tabIndex: number;
  role: string;
  'aria-label': string;
  'aria-roledescription': string;
  'data-handle': string;
}

export function SortableList<T>({ items, getKey, onMove, render, className = 'a-list', gap = 8 }: {
  items: T[];
  getKey: (t: T, i: number) => string;
  onMove: (from: number, to: number) => void;
  render: (item: T, i: number, handle: HandleProps, dragging: boolean) => ReactNode;
  className?: string;
  gap?: number;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<number | null>(null);

  const start = (index: number) => (e: RPointerEvent<HTMLElement>) => {
    if (e.button !== 0 || !box.current) return;
    e.preventDefault();
    const rows = Array.from(box.current.children) as HTMLElement[];
    const rects = rows.map((r) => r.getBoundingClientRect());
    const me = rows[index];
    const h = rects[index].height + gap;
    const y0 = e.clientY;
    let target = index;
    setDragging(index);
    rows.forEach((r, i) => { if (i !== index) r.style.transition = 'transform .22s cubic-bezier(.22,.61,.36,1)'; });
    me.style.zIndex = '5';
    me.style.position = 'relative';

    const move = (ev: PointerEvent) => {
      const dy = ev.clientY - y0;
      me.style.transform = `translate3d(0, ${dy}px, 0)`;
      const center = rects[index].top + rects[index].height / 2 + dy;
      target = index;
      for (let i = 0; i < rects.length; i++) {
        const mid = rects[i].top + rects[i].height / 2;
        if (i < index && center < mid) { target = Math.min(target, i); }
        if (i > index && center > mid) { target = Math.max(target, i); }
      }
      rows.forEach((r, i) => {
        if (i === index) return;
        const shift = index < target && i > index && i <= target ? -h : index > target && i < index && i >= target ? h : 0;
        r.style.transform = shift ? `translate3d(0, ${shift}px, 0)` : '';
      });
      // keep the dragged row in view
      if (ev.clientY < 90) window.scrollBy(0, -12);
      else if (ev.clientY > window.innerHeight - 60) window.scrollBy(0, 12);
    };
    const end = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      rows.forEach((r) => { r.style.transition = ''; r.style.transform = ''; r.style.zIndex = ''; r.style.position = ''; });
      setDragging(null);
      if (target !== index) onMove(index, target);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
  };

  const key = (index: number) => (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'ArrowUp' && index > 0) { e.preventDefault(); onMove(index, index - 1); requestAnimationFrame(() => focusHandle(index - 1)); }
    if (e.key === 'ArrowDown' && index < items.length - 1) { e.preventDefault(); onMove(index, index + 1); requestAnimationFrame(() => focusHandle(index + 1)); }
  };
  const focusHandle = (i: number) => (box.current?.children[i]?.querySelector('[data-handle]') as HTMLElement | null)?.focus();

  return (
    <div ref={box} className={className} style={{ gap }}>
      {items.map((it, i) => (
        <div key={getKey(it, i)} style={{ touchAction: dragging === null ? undefined : 'none' }}>
          {render(it, i, { onPointerDown: start(i), onKeyDown: key(i), tabIndex: 0, role: 'button', 'aria-label': 'Перетащите, чтобы изменить порядок (или ↑/↓)', 'aria-roledescription': 'перетаскиваемый элемент', 'data-handle': '' }, dragging === i)}
        </div>
      ))}
    </div>
  );
}

/** array move helper for edit() recipes */
export function moveItem<T>(list: T[], from: number, to: number) {
  const [x] = list.splice(from, 1);
  list.splice(to, 0, x);
}
