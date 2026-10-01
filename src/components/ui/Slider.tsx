'use client';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';
import type { EmblaCarouselType, EmblaOptionsType, EmblaPluginType } from 'embla-carousel';
import { Children, createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Icon } from '../Icon';

/*
 * Carousels are Embla: the track moves with a GPU transform instead of native overflow scrolling,
 * so heavy SVG cards don't repaint while sliding. A <SliderScope> lets arrows rendered elsewhere
 * (section heads, card corners) drive the slider inside it.
 */

type Kind = 'row' | 'loop' | 'center';
const PRESETS: Record<Kind, EmblaOptionsType> = {
  /** finite rows of cards: page by page, trimmed at both ends */
  row: { align: 'start', containScroll: 'trimSnaps', slidesToScroll: 'auto', duration: 30 },
  /** endless, centred big panels */
  loop: { loop: true, align: 'center', duration: 34 },
  /** finite, centred big panels */
  center: { align: 'center', containScroll: false, duration: 34 }
};

interface Nav { prev: () => void; next: () => void; to: (i: number) => void; canPrev: boolean; canNext: boolean; selected: number; count: number }
const NONE: Nav = { prev: () => {}, next: () => {}, to: () => {}, canPrev: false, canNext: false, selected: 0, count: 0 };
const Scope = createContext<{ api: EmblaCarouselType | undefined; setApi: (a: EmblaCarouselType | undefined) => void } | null>(null);

export function SliderScope({ children }: { children: ReactNode }) {
  const [api, setApi] = useState<EmblaCarouselType>();
  const value = useMemo(() => ({ api, setApi }), [api]);
  return <Scope.Provider value={value}>{children}</Scope.Provider>;
}

function useNav(api: EmblaCarouselType | undefined): Nav {
  const [st, setSt] = useState({ canPrev: false, canNext: false, selected: 0, count: 0 });
  useEffect(() => {
    if (!api) return;
    const sync = () => setSt({ canPrev: api.canScrollPrev(), canNext: api.canScrollNext(), selected: api.selectedScrollSnap(), count: api.scrollSnapList().length });
    sync();
    api.on('select', sync).on('reInit', sync);
    return () => { api.off('select', sync).off('reInit', sync); };
  }, [api]);
  return useMemo(() => (api ? { ...st, prev: () => api.scrollPrev(), next: () => api.scrollNext(), to: (i: number) => api.scrollTo(i) } : NONE), [api, st]);
}

/** Navigation of the slider in the nearest <SliderScope>. */
export function useSliderNav() {
  return useNav(useContext(Scope)?.api);
}

export function SliderArrows({ className = 'section__nav', small }: { className?: string; small?: boolean }) {
  const nav = useSliderNav();
  const cls = `arrow-btn${small ? ' arrow-btn--sm' : ''}`;
  return (
    <div className={className}>
      <button className={cls} type="button" aria-label="Назад" disabled={!nav.canPrev} onClick={nav.prev}><Icon name="arrow-left" /></button>
      <button className={cls} type="button" aria-label="Вперёд" disabled={!nav.canNext} onClick={nav.next}><Icon name="arrow-right" /></button>
    </div>
  );
}

export interface SliderProps {
  children: ReactNode;
  kind?: Kind;
  /** sizing hooks: slides per view (--per) and panel width (--slide-w) are set per slider class in CSS */
  className?: string;
  /** autoplay delay in ms (loop sliders) */
  autoplay?: number;
  /** horizontal trackpad / shift+wheel scrolling */
  wheel?: boolean;
  /** this slider sits inside another one: the outer slider ignores drags that start here */
  nested?: boolean;
  label?: string;
}

export function Slider({ children, kind = 'row', className = '', autoplay, wheel = true, nested, label }: SliderProps) {
  const scope = useContext(Scope);
  const plugins = useMemo(() => {
    const list: EmblaPluginType[] = [];
    if (wheel) list.push(WheelGesturesPlugin({ forceWheelAxis: 'x' }));
    if (autoplay) list.push(Autoplay({ delay: autoplay, stopOnInteraction: false, stopOnMouseEnter: true, stopOnFocusIn: true }));
    return list;
  }, [wheel, autoplay]);
  const opts = useMemo<EmblaOptionsType>(() => ({
    ...PRESETS[kind],
    // a drag that starts inside a nested slider belongs to that slider
    watchDrag: (_api, evt) => !(evt.target as Element | null)?.closest?.('.slider--nested') || nested === true
  }), [kind, nested]);
  const [ref, api] = useEmblaCarousel(opts, plugins);

  // publish to the nearest scope so arrows outside the viewport can drive this slider
  const setApi = scope?.setApi;
  useEffect(() => {
    if (!setApi) return;
    setApi(api);
    return () => setApi(undefined);
  }, [api, setApi]);

  // centred sliders: each panel's fade and scale follow its live distance from the centre (--t, 1 = centred),
  // so the neighbours dim continuously with the movement instead of switching when a slide is selected
  useEffect(() => {
    if (!api || kind === 'row') return;
    const tween = (a: EmblaCarouselType, evt?: string) => {
      const engine = a.internalEngine();
      const progress = a.scrollProgress();
      const inView = a.slidesInView();
      const nodes = a.slideNodes();
      const factor = 0.5 * a.scrollSnapList().length;
      a.scrollSnapList().forEach((snap, snapIndex) => {
        engine.slideRegistry[snapIndex].forEach((slide) => {
          if (evt === 'scroll' && !inView.includes(slide)) return;
          let diff = snap - progress;
          if (engine.options.loop) {
            engine.slideLooper.loopPoints.forEach((lp) => {
              const target = lp.target();
              if (slide === lp.index && target !== 0) diff = Math.sign(target) === -1 ? snap - (1 + progress) : snap + (1 - progress);
            });
          }
          nodes[slide].style.setProperty('--t', String(Math.max(0, Math.min(1, 1 - Math.abs(diff * factor))).toFixed(3)));
        });
      });
    };
    const onScroll = (a: EmblaCarouselType) => tween(a, 'scroll');
    const onAll = (a: EmblaCarouselType) => tween(a);
    tween(api);
    api.on('scroll', onScroll).on('reInit', onAll).on('slideFocus', onAll);
    return () => { api.off('scroll', onScroll).off('reInit', onAll).off('slideFocus', onAll); };
  }, [api, kind]);

  return (
    <div className={`slider slider--${kind}${nested ? ' slider--nested' : ''}${className ? ' ' + className : ''}`} aria-roledescription="carousel" aria-label={label}>
      <div className="slider__viewport" ref={ref}>
        <div className="slider__container">
          {Children.map(children, (child, i) => (
            <div className="slider__slide" role="group" aria-roledescription="slide">{child}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
