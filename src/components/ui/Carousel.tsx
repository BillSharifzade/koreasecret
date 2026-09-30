'use client';
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

/**
 * Horizontal scroll-snap carousel. Arrow buttons ([data-dir="prev|next"]) are looked up in the closest [data-scope],
 * so section headers rendered on the server can drive it. Supports mouse drag and a centred "current slide" mode.
 */
export function Carousel({ children, className = '', center = false, start, per }: { children: ReactNode; className?: string; center?: boolean; start?: number; per?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const track = c.firstElementChild as HTMLElement;
    const scope = c.closest('[data-scope]') || c.parentElement;
    const prev = scope?.querySelector<HTMLButtonElement>('[data-dir="prev"]') ?? null;
    const next = scope?.querySelector<HTMLButtonElement>('[data-dir="next"]') ?? null;

    const step = () => {
      const it = track.children[0] as HTMLElement | undefined;
      if (!it) return track.clientWidth;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      const w = it.getBoundingClientRect().width + gap;
      return center ? w : Math.max(1, Math.floor((track.clientWidth + gap) / w)) * w;
    };
    const update = () => {
      const max = track.scrollWidth - track.clientWidth - 2;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max;
      if (center) {
        const box = track.getBoundingClientRect();
        const mid = box.left + box.width / 2;
        let best: Element | null = null, bd = Infinity;
        for (const ch of Array.from(track.children)) { const r = ch.getBoundingClientRect(); const d = Math.abs(r.left + r.width / 2 - mid); if (d < bd) { bd = d; best = ch; } }
        for (const ch of Array.from(track.children)) ch.classList.toggle('is-current', ch === best);
      }
    };
    const goPrev = () => track.scrollBy({ left: -step(), behavior: 'smooth' });
    const goNext = () => track.scrollBy({ left: step(), behavior: 'smooth' });
    prev?.addEventListener('click', goPrev);
    next?.addEventListener('click', goNext);

    let raf = 0;
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
    track.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    const mo = new MutationObserver(onScroll);
    mo.observe(track, { childList: true });

    // mouse drag
    let down = false, moved = false, sx = 0, sl = 0, justDragged = false;
    const onDown = (e: PointerEvent) => { if (e.pointerType !== 'mouse' || e.button !== 0) return; down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (!moved && Math.abs(dx) > 6) { moved = true; c.classList.add('is-dragging'); }
      if (moved) track.scrollLeft = sl - dx;
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      if (moved) { justDragged = true; const left = track.scrollLeft; c.classList.remove('is-dragging'); track.scrollLeft = left; window.setTimeout(() => { justDragged = false; }, 60); }
    };
    const onClickCapture = (e: MouseEvent) => { if (justDragged) { e.preventDefault(); e.stopPropagation(); justDragged = false; } };
    const noDrag = (e: DragEvent) => e.preventDefault();
    track.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    track.addEventListener('click', onClickCapture, true);
    track.addEventListener('dragstart', noDrag);

    if (center && start != null && track.children[start]) {
      const ch = track.children[start] as HTMLElement;
      track.style.scrollBehavior = 'auto';
      track.scrollLeft = ch.offsetLeft - (track.clientWidth - ch.offsetWidth) / 2;
      track.style.scrollBehavior = '';
    }
    update();

    return () => {
      prev?.removeEventListener('click', goPrev);
      next?.removeEventListener('click', goNext);
      track.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      mo.disconnect();
      track.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      track.removeEventListener('click', onClickCapture, true);
      track.removeEventListener('dragstart', noDrag);
      cancelAnimationFrame(raf);
    };
  }, [center, start]);

  return (
    <div ref={ref} className={`carousel${center ? ' carousel--center' : ''}${className ? ' ' + className : ''}`} style={per ? ({ '--per': per } as CSSProperties) : undefined}>
      <div className="carousel__track">{children}</div>
    </div>
  );
}
