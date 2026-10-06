'use client';
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { Art } from '../Art';
import { Butterfly } from '../Brand';
import { Icon } from '../Icon';
import { useUI } from '../providers';
import GlassSurface, { GLASS } from '../ui/GlassSurface';
import { heroTone } from '@/lib/color';
import { CONFIG, HERO_SLIDES, TEXTS } from '@/lib/data';
import { mdInline } from '@/lib/md';
import type { HeroSlide, Tone } from '@/lib/types';
import { GiftCardModal } from '../chrome/modals';
import { SmartLink } from '../ui/SmartLink';

const DELAY = 6500;
const INTERACTIVE = 'a, button, input, .hero__dots';

/** One banner. The admin renders it on its own as the live preview of the slide being edited. */
export function HeroSlideView({ s, tone, state = 'active', label }: { s: HeroSlide; tone: Tone; state?: 'active' | 'leaving' | 'idle'; label?: string }) {
  const ui = useUI();
  const on = state === 'active';
  return (
    <div className={`hero__slide${on ? ' is-active' : state === 'leaving' ? ' is-leaving' : ''}`} data-tone={tone} role="group" aria-roledescription="slide" aria-label={label} aria-hidden={!on}>
      <div className="hero__bg" style={{ background: s.bg }} />
      <div className="hero__grain" />
      <div className="hero__hline" />
      <div className="hero__vline" />
      <div className="hero__inner container">
        <div className="hero__content">
          <div className="hero__kicker"><Butterfly />{s.kicker}</div>
          <h2 className="hero__title" dangerouslySetInnerHTML={{ __html: mdInline(s.title) }} />
          <p className="hero__text">{s.text}</p>
        </div>
        <div className="hero__cta">
          {s.action === 'copy'
            ? <button className="btn btn--primary" type="button" tabIndex={on ? 0 : -1} onClick={() => ui.copyPromo(CONFIG.promo.code)}>{s.cta} <Icon name="copy" /></button>
            : s.action === 'giftcard'
              ? <button className="btn btn--primary" type="button" tabIndex={on ? 0 : -1} onClick={() => ui.openModal(<GiftCardModal />, { label: TEXTS.giftcard.title })}>{s.cta} <Icon name="gift" /></button>
              : <SmartLink className="btn btn--primary" href={s.link} tabIndex={on ? 0 : -1}>{s.cta} <Icon name="arrow-right" /></SmartLink>}
        </div>
        <Art className="hero__art" as="div" spec={{ kind: 'hero', id: s.id }} />
      </div>
    </div>
  );
}

export function Hero({ id }: { id?: string }) {
  const n = HERO_SLIDES.length;
  const tones = useMemo(() => HERO_SLIDES.map(heroTone), []);
  const [i, setI] = useState(0);
  const [prev, setPrev] = useState(-1); // the banner on its way out: its copy clears before the next one rises
  const cur = useRef(0);
  const go = useCallback((k: number) => {
    const next = ((k % n) + n) % n;
    if (next === cur.current) return;
    setPrev(cur.current);
    cur.current = next;
    setI(next);
  }, [n]);

  const heroRef = useRef<HTMLElement>(null);
  const fills = useRef<(HTMLSpanElement | null)[]>([]);
  const anim = useRef<Animation | null>(null);
  const hold = useRef({ hidden: false, offscreen: false, focus: false });
  const swipe = useRef<{ x: number; y: number } | null>(null);

  /* ---------- autoplay: the progress fill's own animation is the timer, so they never drift ---------- */
  const sync = useCallback(() => {
    const a = anim.current;
    if (!a) return;
    const held = hold.current.hidden || hold.current.offscreen || hold.current.focus;
    if (held && a.playState === 'running') a.pause();
    else if (!held && a.playState === 'paused') a.play();
  }, []);

  useEffect(() => {
    const el = fills.current[i];
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const a = el.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: DELAY, easing: 'linear', fill: 'forwards' });
    anim.current = a;
    sync();
    a.onfinish = () => go(i + 1);
    return () => { a.onfinish = null; a.cancel(); anim.current = null; };
  }, [i, go, sync]);

  useEffect(() => {
    const hero = heroRef.current!;
    const onVis = () => { hold.current.hidden = document.hidden; sync(); };
    const io = new IntersectionObserver(([en]) => {
      hold.current.offscreen = !en.isIntersecting;
      hero.classList.toggle('is-offscreen', !en.isIntersecting); // also freezes the floating art
      sync();
    });
    io.observe(hero);
    document.addEventListener('visibilitychange', onVis);
    return () => { io.disconnect(); document.removeEventListener('visibilitychange', onVis); };
  }, [sync]);

  /* ---------- the header and the dots follow the banner's ink ---------- */
  useEffect(() => { document.documentElement.dataset.heroTone = tones[i]; }, [i, tones]);
  useEffect(() => () => { delete document.documentElement.dataset.heroTone; }, []);

  /* ---------- side-aware arrow cursor ---------- */
  const cursor = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0, tx: 0, ty: 0, raf: 0, side: 1, shown: false });
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const on = () => setFine(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => { mq.removeEventListener('change', on); cancelAnimationFrame(pos.current.raf); };
  }, []);

  const loop = () => {
    const p = pos.current, el = cursor.current;
    if (!el) return;
    p.x += (p.tx - p.x) * 0.24;
    p.y += (p.ty - p.y) * 0.24;
    el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`;
    p.raf = Math.abs(p.tx - p.x) + Math.abs(p.ty - p.y) > 0.2 ? requestAnimationFrame(loop) : 0;
  };
  const show = (on: boolean) => {
    const p = pos.current;
    if (p.shown === on) return;
    p.shown = on;
    cursor.current?.classList.toggle('is-visible', on);
  };
  const onMove = (e: RPointerEvent<HTMLElement>) => {
    if (!fine || e.pointerType !== 'mouse') return;
    const box = e.currentTarget.getBoundingClientRect();
    const p = pos.current;
    p.tx = e.clientX - box.left;
    p.ty = e.clientY - box.top;
    if (!p.shown) { p.x = p.tx; p.y = p.ty; }
    const side = p.tx < box.width / 2 ? -1 : 1;
    if (side !== p.side) { p.side = side; cursor.current?.classList.toggle('is-prev', side < 0); }
    show(!(e.target as Element).closest(INTERACTIVE));
    if (!p.raf) p.raf = requestAnimationFrame(loop);
  };

  return (
    <section
      ref={heroRef}
      id={id}
      className={`hero${fine ? ' has-cursor' : ''}`}
      data-tone={tones[i]}
      data-surface={tones[i]}
      aria-roledescription="carousel"
      aria-label="Акции и новости"
      onPointerMove={onMove}
      onPointerLeave={() => show(false)}
      onClick={(e) => { if (fine && !(e.target as Element).closest(INTERACTIVE)) go(i + pos.current.side); }}
      onFocus={(e) => { hold.current.focus = (e.target as Element).matches(':focus-visible'); sync(); }}
      onBlur={() => { hold.current.focus = false; sync(); }}
      onKeyDown={(e) => { if (e.key === 'ArrowRight') go(i + 1); if (e.key === 'ArrowLeft') go(i - 1); }}
      onPointerDown={(e) => { if (e.pointerType !== 'mouse') swipe.current = { x: e.clientX, y: e.clientY }; }}
      onPointerUp={(e) => {
        const s = swipe.current;
        swipe.current = null;
        if (!s) return;
        const dx = e.clientX - s.x, dy = e.clientY - s.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(i + (dx < 0 ? 1 : -1));
      }}
    >
      <div className="hero__slides">
        {HERO_SLIDES.map((s, k) => <HeroSlideView key={s.id} s={s} tone={tones[k]} state={k === i ? 'active' : k === prev ? 'leaving' : 'idle'} label={`${k + 1} из ${n}`} />)}
      </div>
      <GlassSurface {...GLASS} className="hero__dots" width="auto" height="auto" tone={tones[i]} role="tablist" aria-label="Слайды">
        {HERO_SLIDES.map((s, k) => (
          <button key={s.id} className={`hero__dot${k === i ? ' is-active' : ''}`} type="button" role="tab" aria-selected={k === i} aria-label={`Слайд ${k + 1}`} onClick={() => go(k)}>
            <span className="hero__dot-track"><span className="hero__dot-fill" ref={(el) => { fills.current[k] = el; }} /></span>
          </button>
        ))}
      </GlassSurface>
      <div ref={cursor} className="hero__cursor" aria-hidden="true">
        <GlassSurface {...GLASS} className="hero__cursor-glass" width={92} height={92} tone={tones[i]}><Icon name="arrow-right" /></GlassSurface>
      </div>
    </section>
  );
}
