'use client';
/*
 * GlassSurface — React Bits (https://reactbits.dev/components/glass-surface), © 2026 David Haz,
 * MIT + Commons Clause (see GlassSurface.LICENSE.md).
 *
 * Ported to TypeScript and slimmed down for speed. Two tiers share one look (frost, rims, soft shadow):
 *  - refract: the real lens. A single feDisplacementMap bends the backdrop along the edges (the original runs three
 *    for an RGB split, plus colour matrices, blends and a blur — roughly five times the work every frame). Used only
 *    where it is worth it (`refract`) and only on Chromium desktops with a fine pointer and a capable CPU/GPU.
 *  - frosted: plain backdrop blur + saturation. Everything else, and the fallback on Safari, Firefox and phones.
 * Local additions: `as` (span/nav/header roots, e.g. inside buttons and links), `tone` (the original's light-dark()
 * pair, chosen by what is behind the glass — see GlassSurface.css), HTML props, ref, and a debounced map redraw.
 */
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import './GlassSurface.css';

type Channel = 'R' | 'G' | 'B';

export interface GlassSurfaceProps extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'style' | 'className'> {
  children?: ReactNode;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  /** lens rim width, as a share of the shorter side */
  borderWidth?: number;
  brightness?: number;
  opacity?: number;
  /** softness of the lens rim in the displacement map */
  blur?: number;
  backgroundOpacity?: number;
  saturation?: number;
  distortionScale?: number;
  xChannel?: Channel;
  yChannel?: Channel;
  mixBlendMode?: CSSProperties['mixBlendMode'];
  /** bend the backdrop (desktop Chromium only); otherwise the surface is frosted */
  refract?: boolean;
  className?: string;
  style?: CSSProperties;
  as?: 'div' | 'span' | 'nav' | 'header';
  tone?: 'light' | 'dark';
  ref?: Ref<HTMLElement>;
}

/** The Korea Secret glass (React Bits customiser: radius 50, frost 0.1, rim 0.07, brightness 50, opacity 0.93, blur 11). */
export const GLASS = {
  borderRadius: 50,
  backgroundOpacity: 0.1,
  borderWidth: 0.07,
  brightness: 50,
  opacity: 0.93,
  blur: 11,
  distortionScale: -150
} as const;

const DESKTOP = '(hover: hover) and (pointer: fine) and (min-width: 1024px)';

/** Refraction costs a filter pass over the element every frame its backdrop changes: keep it to machines that won't notice. */
function canRefract() {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  if ((/Safari/.test(ua) && !/Chrome/.test(ua)) || /Firefox/.test(ua)) return false;
  if (!matchMedia(DESKTOP).matches || matchMedia('(prefers-reduced-transparency: reduce)').matches) return false;
  const nav = navigator as Navigator & { deviceMemory?: number };
  if ((nav.hardwareConcurrency ?? 8) < 4 || (nav.deviceMemory ?? 8) < 4) return false;
  const probe = document.createElement('div');
  probe.style.backdropFilter = 'url(#probe)';
  return probe.style.backdropFilter !== '';
}

export default function GlassSurface({
  children,
  width = 200,
  height = 80,
  borderRadius = 20,
  borderWidth = 0.07,
  brightness = 50,
  opacity = 0.93,
  blur = 11,
  backgroundOpacity = 0,
  saturation = 1,
  distortionScale = -150,
  xChannel = 'R',
  yChannel = 'G',
  mixBlendMode = 'difference',
  refract = false,
  className = '',
  style = {},
  as: Tag = 'div',
  tone,
  ref,
  ...rest
}: GlassSurfaceProps) {
  const uniqueId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const filterId = `glass-filter-${uniqueId}`;
  const [lens, setLens] = useState(false);

  const containerRef = useRef<HTMLElement | null>(null);
  const feImageRef = useRef<SVGFEImageElement>(null);

  const setRefs = useCallback((el: HTMLElement | null) => {
    containerRef.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) (ref as { current: HTMLElement | null }).current = el;
  }, [ref]);

  useEffect(() => {
    if (!refract) return;
    const mq = matchMedia(DESKTOP);
    const sync = () => setLens(canRefract());
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [refract]);

  // the displacement map: red rises to the left, blue down the height, a soft grey core leaves the middle untouched
  const drawMap = useCallback(() => {
    const el = containerRef.current;
    if (!el || !feImageRef.current) return;
    const w = el.offsetWidth || 400, h = el.offsetHeight || 200;
    const edge = Math.min(w, h) * (borderWidth * 0.5);
    const svg = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><defs>` +
      `<linearGradient id="r" x1="100%" y1="0%" x2="0%" y2="0%"><stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="red"/></linearGradient>` +
      `<linearGradient id="b" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="blue"/></linearGradient></defs>` +
      `<rect width="${w}" height="${h}" fill="black"/>` +
      `<rect width="${w}" height="${h}" rx="${borderRadius}" fill="url(#r)"/>` +
      `<rect width="${w}" height="${h}" rx="${borderRadius}" fill="url(#b)" style="mix-blend-mode:${mixBlendMode}"/>` +
      `<rect x="${edge}" y="${edge}" width="${w - edge * 2}" height="${h - edge * 2}" rx="${borderRadius}" fill="hsl(0 0% ${brightness}% / ${opacity})" style="filter:blur(${blur}px)"/></svg>`;
    feImageRef.current.setAttribute('href', `data:image/svg+xml,${encodeURIComponent(svg)}`);
  }, [borderRadius, borderWidth, brightness, opacity, blur, mixBlendMode]);

  // drawn once, then again only after a resize has settled (an animated fold stretches the old map meanwhile)
  useEffect(() => {
    const el = containerRef.current;
    if (!lens || !el) return;
    drawMap();
    let t = 0;
    const ro = new ResizeObserver(() => { window.clearTimeout(t); t = window.setTimeout(drawMap, 160); });
    ro.observe(el);
    return () => { ro.disconnect(); window.clearTimeout(t); };
  }, [lens, drawMap, width, height]);

  const containerStyle = {
    ...style,
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: `${borderRadius}px`,
    '--glass-frost': backgroundOpacity,
    '--glass-saturation': saturation,
    ...(lens ? { '--filter-id': `url(#${filterId})` } : null)
  } as CSSProperties;

  const Inner = Tag === 'span' ? 'span' : 'div';
  return (
    <Tag ref={setRefs} className={`glass-surface ${lens ? 'glass-surface--svg' : 'glass-surface--frost'} ${className}`} style={containerStyle} data-glass-tone={tone ?? 'light'} {...rest}>
      {lens && (
        <svg className="glass-surface__filter" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
          <defs>
            <filter id={filterId} colorInterpolationFilters="sRGB" x="0%" y="0%" width="100%" height="100%">
              <feImage ref={feImageRef} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />
              <feDisplacementMap in="SourceGraphic" in2="map" scale={distortionScale} xChannelSelector={xChannel} yChannelSelector={yChannel} />
            </filter>
          </defs>
        </svg>
      )}
      <Inner className="glass-surface__content">{children}</Inner>
    </Tag>
  );
}
