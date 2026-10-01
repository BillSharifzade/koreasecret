'use client';
import { useEffect, useState, type RefObject } from 'react';

export type Tone = 'light' | 'dark';

/*
 * What sits behind a floating glass element: 'dark' when most of it is a dark surface, otherwise 'light'.
 * Dark surfaces mark themselves with data-surface="dark" (the hero follows its current banner); everything else is
 * the white page. Three hit tests at most every 120 ms while scrolling, plus a slow tick for carousels that slide
 * other cards underneath — and nothing at all while `media` doesn't match (e.g. the phone tab bar on desktop).
 */
export function useBackdropTone(ref: RefObject<HTMLElement | null>, { force, media }: { force?: Tone; media?: string } = {}): Tone {
  const [tone, setTone] = useState<Tone>('light');
  const [active, setActive] = useState(!media);

  useEffect(() => {
    if (!media) return;
    const mq = window.matchMedia(media);
    const sync = () => setActive(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [media]);

  useEffect(() => {
    const el = ref.current;
    if (force || !active || !el) return;
    let pending = false, timer = 0, last = 0;
    const sample = () => {
      pending = false;
      last = performance.now();
      const r = el.getBoundingClientRect();
      if (!r.width) return;
      const y = r.top + r.height / 2;
      let dark = 0;
      for (const fx of [0.18, 0.5, 0.82]) {
        // the first element under the point that is neither the glass nor one of its ancestors
        const under = document.elementsFromPoint(r.left + r.width * fx, y).find((n) => !el.contains(n) && !n.contains(el));
        if (under?.closest<HTMLElement>('[data-surface]')?.dataset.surface === 'dark') dark++;
      }
      setTone(dark >= 2 ? 'dark' : 'light');
    };
    const schedule = () => {
      if (pending) return;
      pending = true;
      timer = window.setTimeout(() => requestAnimationFrame(sample), Math.max(0, 120 - (performance.now() - last)));
    };
    sample();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    // banners change their tone in place
    const mo = new MutationObserver(schedule);
    mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['data-surface'] });
    const tick = window.setInterval(() => { if (!document.hidden) schedule(); }, 1000);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      mo.disconnect();
      window.clearInterval(tick);
      window.clearTimeout(timer);
    };
  }, [ref, force, active]);

  return force ?? tone;
}
