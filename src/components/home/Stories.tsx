'use client';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Art } from '../Art';
import { Butterfly } from '../Brand';
import { Icon } from '../Icon';
import { useLayer, useMounted } from '../layer';
import { useI18n } from '../providers';
import { Carousel } from '../ui/Carousel';
import { STORIES } from '@/lib/data';
import { href } from '@/lib/i18n';
import { getProduct, price, productPath } from '@/lib/shop';

const FRAME = 5000;

function StoryViewer({ start, onClose }: { start: number; onClose: () => void }) {
  const tr = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(start);
  const [f, setF] = useState(0);
  const [open, setOpen] = useState(false);
  const [held, setHeld] = useState(false);
  const remain = useRef(FRAME);
  const startedAt = useRef(0);
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

  useEffect(() => { remain.current = FRAME; }, [s, f]);
  useEffect(() => {
    if (held) return;
    startedAt.current = Date.now();
    const t = window.setTimeout(() => step(1), remain.current);
    return () => { window.clearTimeout(t); remain.current = Math.max(300, remain.current - (Date.now() - startedAt.current)); };
  }, [s, f, held, step]);

  const story = STORIES[s];
  const p = getProduct(story.products[0]);
  return (
    <div ref={ref} className={`sv${open ? ' is-open' : ''}${held ? ' is-paused' : ''}`} role="dialog" aria-modal="true" aria-label={tr.t('story.label')}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onKeyDown={(e) => { if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); }}>
      <button className="sv__side sv__side--prev" type="button" onClick={() => step(-1)} aria-label={tr.t('common.prev')}><Icon name="arrow-left" /></button>
      <div className="sv__stage" onPointerDown={(e) => { if (!(e.target as HTMLElement).closest('a, .sv__x')) setHeld(true); }} onPointerUp={() => setHeld(false)} onPointerLeave={() => setHeld(false)}>
        <div className="sv__bars">
          {story.frames.map((_, k) => (
            <div key={`${s}-${k}-${k === f ? 'a' : 'b'}`} className={`sv__bar${k < f ? ' is-done' : k === f ? ' is-active' : ''}`} style={{ '--sv-d': `${FRAME}ms` } as CSSProperties}><i /></div>
          ))}
        </div>
        <div className="sv__top">
          <span className="sv__avatar"><Butterfly /></span>
          <span>Korea Secret · {tr.L(story.title)}</span>
          <button className="sv__x" type="button" onClick={onClose} aria-label={tr.t('common.close')}><Icon name="close" /></button>
        </div>
        {story.frames.map((fr, k) => (
          <div key={`${s}-${k}`} className={`sv__frame${k === f ? ' is-active' : ''}`}>
            <Art as="div" style={{ height: '100%' }} spec={{ kind: 'story', index: s, frame: k }} />
            <div className="sv__frame-text">{tr.L(fr)}</div>
          </div>
        ))}
        <button className="sv__tap sv__tap--prev" type="button" onClick={() => step(-1)} aria-label={tr.t('common.prev')} />
        <button className="sv__tap sv__tap--next" type="button" onClick={() => step(1)} aria-label={tr.t('common.next')} />
        {p && <div className="sv__cta"><Link className="btn btn--white" href={href(tr.lang, productPath(p))} onClick={onClose}>{tr.t('story.cta')} · {price(p.price)}</Link></div>}
      </div>
      <button className="sv__side sv__side--next" type="button" onClick={() => step(1)} aria-label={tr.t('common.next')}><Icon name="arrow-right" /></button>
    </div>
  );
}

export function Stories({ title }: { title: string }) {
  const tr = useI18n();
  const mounted = useMounted();
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="container reveal">
      <div className="section__head">
        <h2 className="section__title">{title}</h2>
        <div className="section__nav">
          <button className="arrow-btn" type="button" data-dir="prev" aria-label={tr.t('common.prev')}><Icon name="arrow-left" /></button>
          <button className="arrow-btn" type="button" data-dir="next" aria-label={tr.t('common.next')}><Icon name="arrow-right" /></button>
        </div>
      </div>
      <Carousel className="stories">
        {STORIES.map((s, i) => (
          <button key={s.id} className="story-card" type="button" aria-label={tr.L(s.title)} onClick={() => setOpen(i)}>
            <Art className="story-card__art" spec={{ kind: 'story', index: i, frame: 0 }} />
            <span className="story-card__play"><Icon name="play" />{s.dur}</span>
            <span className="story-card__caption">{tr.L(s.title)}</span>
            <span className="story-card__ring" />
          </button>
        ))}
      </Carousel>
      {mounted && open !== null && createPortal(<StoryViewer start={open} onClose={() => setOpen(null)} />, document.body)}
    </div>
  );
}
