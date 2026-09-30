'use client';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Art } from '../Art';
import { Butterfly } from '../Brand';
import { Icon } from '../Icon';
import { useI18n, useUI } from '../providers';
import { CONFIG, HERO_SLIDES } from '@/lib/data';
import { href } from '@/lib/i18n';

const DELAY = 6500;

export function Hero() {
  const tr = useI18n();
  const ui = useUI();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cycle, setCycle] = useState(0);
  const sx = useRef<{ x: number; y: number } | null>(null);
  const n = HERO_SLIDES.length;

  const go = useCallback((k: number) => { setI(((k % n) + n) % n); setCycle((c) => c + 1); }, [n]);

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setTimeout(() => go(i + 1), DELAY);
    return () => window.clearTimeout(t);
  }, [i, paused, cycle, go]);

  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  return (
    <section
      className={`hero${paused ? ' is-paused' : ''}`}
      aria-roledescription="carousel"
      aria-label={tr.t('home.heroLabel')}
      style={{ '--hero-delay': `${DELAY}ms` } as CSSProperties}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => { setPaused(false); setCycle((c) => c + 1); }}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(e) => { if (e.key === 'ArrowRight') go(i + 1); if (e.key === 'ArrowLeft') go(i - 1); }}
      onPointerDown={(e) => { if (e.pointerType !== 'mouse') sx.current = { x: e.clientX, y: e.clientY }; }}
      onPointerUp={(e) => {
        if (!sx.current) return;
        const dx = e.clientX - sx.current.x, dy = e.clientY - sx.current.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(i + (dx < 0 ? 1 : -1));
        sx.current = null;
      }}
    >
      <div className="hero__slides">
        {HERO_SLIDES.map((s, k) => (
          <div key={s.id} className={`hero__slide${k === i ? ' is-active' : ''}`} role="group" aria-roledescription="slide" aria-label={`${k + 1} / ${n}`} aria-hidden={k !== i}>
            <div className="hero__bg" style={{ background: s.bg }} />
            <div className="hero__grain" />
            <div className="hero__hline" />
            <div className="hero__vline" />
            <div className="hero__inner container">
              <div className="hero__content">
                <div className="hero__kicker"><Butterfly />{tr.L(s.kicker)}</div>
                <h2 className="hero__title" dangerouslySetInnerHTML={{ __html: tr.L(s.title) }} />
                <p className="hero__text">{tr.L(s.text)}</p>
              </div>
              <div className="hero__cta">
                {s.action === 'copy'
                  ? <button className="btn btn--primary" type="button" tabIndex={k === i ? 0 : -1} onClick={() => ui.copyPromo(CONFIG.promo.code)}>{tr.L(s.cta)} <Icon name="copy" /></button>
                  : <Link className="btn btn--primary" href={href(tr.lang, s.link)} tabIndex={k === i ? 0 : -1}>{tr.L(s.cta)} <Icon name="arrow-right" /></Link>}
              </div>
              <Art className="hero__art" as="div" spec={{ kind: 'hero', id: s.id, lang: tr.lang }} />
            </div>
          </div>
        ))}
      </div>
      <div className="hero__dots" role="tablist" aria-label={tr.t('home.heroLabel')}>
        {HERO_SLIDES.map((s, k) => (
          <button key={`${s.id}-${k === i ? cycle : 'x'}`} className={`hero__dot${k === i ? ' is-active' : ''}`} type="button" role="tab" aria-selected={k === i} aria-label={tr.t('home.slide', { n: k + 1 })} onClick={() => go(k)} />
        ))}
      </div>
    </section>
  );
}
