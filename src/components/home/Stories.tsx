'use client';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Art } from '../Art';
import { Butterfly } from '../Brand';
import { Icon } from '../Icon';
import { useLayer, useMounted } from '../layer';
import GlassSurface, { GLASS } from '../ui/GlassSurface';
import { SectionHead } from '../ui/bits';
import { Slider, SliderScope } from '../ui/Slider';
import { STORIES } from '@/lib/data';
import { getProduct, price, productPath } from '@/lib/shop';

const FRAME = 5000;

function StoryViewer({ start, onClose }: { start: number; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(start);
  const [f, setF] = useState(0);
  const [open, setOpen] = useState(false);
  const [held, setHeld] = useState(false);
  const fills = useRef<(HTMLElement | null)[]>([]);
  const anim = useRef<Animation | null>(null);
  const heldRef = useRef(false);
  useLayer(true, onClose, ref, '.sv__x');
  useEffect(() => { const r = requestAnimationFrame(() => setOpen(true)); return () => cancelAnimationFrame(r); }, []);

  const step = useCallback((d: number) => {
    const story = STORIES[s];
    const nf = f + d;
    if (nf >= 0 && nf < story.frames.length) { setF(nf); return; }
    const ns = s + d;
    if (ns < 0) { setF(0); return; }
    if (ns >= STORIES.length) { onClose(); return; }
    setS(ns);
    setF(d > 0 ? 0 : STORIES[ns].frames.length - 1);
  }, [s, f, onClose]);

  // the progress bar's own animation is the frame timer: holding the story pauses both at once
  const stepRef = useRef(step);
  useEffect(() => { stepRef.current = step; });
  useEffect(() => {
    const el = fills.current[f];
    if (!el) return;
    const a = el.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: FRAME, easing: 'linear', fill: 'forwards' });
    anim.current = a;
    if (heldRef.current) a.pause();
    a.onfinish = () => stepRef.current(1);
    return () => { a.onfinish = null; a.cancel(); anim.current = null; };
  }, [s, f]);
  useEffect(() => {
    heldRef.current = held;
    const a = anim.current;
    if (!a) return;
    if (held) a.pause();
    else if (a.playState === 'paused') a.play();
  }, [held]);

  const story = STORIES[s];
  const p = getProduct(story.products[0]);
  return (
    <div ref={ref} className={`sv${open ? ' is-open' : ''}`} role="dialog" aria-modal="true" aria-label="Истории Korea Secret"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onKeyDown={(e) => { if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); }}>
      <button className="sv__side sv__side--prev" type="button" onClick={() => step(-1)} aria-label="Назад"><GlassSurface {...GLASS} as="span" width={52} height={52} tone="dark"><Icon name="arrow-left" /></GlassSurface></button>
      <div className="sv__stage" onPointerDown={(e) => { if (!(e.target as HTMLElement).closest('a, .sv__x')) setHeld(true); }} onPointerUp={() => setHeld(false)} onPointerLeave={() => setHeld(false)}>
        <div className="sv__bars">
          {story.frames.map((_, k) => (
            <div key={`${s}-${k}`} className={`sv__bar${k < f ? ' is-done' : ''}`}><i ref={(el) => { fills.current[k] = el; }} /></div>
          ))}
        </div>
        <div className="sv__top">
          <span className="sv__avatar"><Butterfly /></span>
          <span>Korea Secret · {story.title}</span>
          <button className="sv__x" type="button" onClick={onClose} aria-label="Закрыть"><GlassSurface {...GLASS} as="span" width={36} height={36} tone="dark"><Icon name="close" /></GlassSurface></button>
        </div>
        {story.frames.map((fr, k) => (
          <div key={`${s}-${k}`} className={`sv__frame${k === f ? ' is-active' : ''}`}>
            <Art as="div" style={{ height: '100%' }} spec={{ kind: 'story', index: s, frame: k }} />
            <div className="sv__frame-text">{fr}</div>
          </div>
        ))}
        <button className="sv__tap sv__tap--prev" type="button" onClick={() => step(-1)} aria-label="Назад" />
        <button className="sv__tap sv__tap--next" type="button" onClick={() => step(1)} aria-label="Вперёд" />
        {p && <div className="sv__cta"><Link className="btn btn--white" href={productPath(p)} onClick={onClose}>Смотреть товар · {price(p.price)}</Link></div>}
      </div>
      <button className="sv__side sv__side--next" type="button" onClick={() => step(1)} aria-label="Вперёд"><GlassSurface {...GLASS} as="span" width={52} height={52} tone="dark"><Icon name="arrow-right" /></GlassSurface></button>
    </div>
  );
}

/** Short videos: a finite row of story cards; a click opens the full-screen viewer. */
export function Stories() {
  const mounted = useMounted();
  const [open, setOpen] = useState<number | null>(null);
  return (
    <SliderScope>
      <section className="section" id="stories">
        <div className="container reveal">
          <SectionHead title="Короткие видео" nav />
          <Slider className="stories" label="Короткие видео">
            {STORIES.map((s, i) => (
              <button key={s.id} className="story-card" type="button" aria-label={s.title} onClick={() => setOpen(i)} data-surface="dark">
                <span className="story-card__media"><Art className="story-card__art" spec={{ kind: 'story', index: i, frame: 0 }} /></span>
                <GlassSurface {...GLASS} as="span" className="story-card__play" width="auto" height={32} tone="dark"><Icon name="play" />{s.dur}</GlassSurface>
                <span className="story-card__caption">{s.title}</span>
              </button>
            ))}
          </Slider>
          {mounted && open !== null && createPortal(<StoryViewer start={open} onClose={() => setOpen(null)} />, document.body)}
        </div>
      </section>
    </SliderScope>
  );
}
