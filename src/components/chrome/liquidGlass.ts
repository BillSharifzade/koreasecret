'use client';
import { useEffect, type RefObject } from 'react';

/*
 * Liquid glass, Chromium part: Chromium can run an SVG filter on the backdrop, so the glass gets a
 * real refraction — content bends inward along the rounded edges. The displacement map is drawn
 * on a canvas from the element's own size (signed distance to a rounded rectangle) and refreshed
 * on resize. Other browsers keep the CSS-only glass (blur, saturation, tint and specular rim).
 */

const isChromium = () => {
  const ua = (navigator as Navigator & { userAgentData?: { brands?: { brand: string }[] } }).userAgentData;
  return !!ua?.brands?.some((b) => /Chromium|Google Chrome|Microsoft Edge/.test(b.brand));
};

function displacementMap(w: number, h: number, radius: number, bezel: number) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(w, h);
  const d = img.data;
  const r = Math.min(radius, w / 2, h / 2);
  const bx = w / 2 - r, by = h / 2 - r;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // signed distance to the rounded rectangle (negative inside) and its outward normal
      const px = x + 0.5 - w / 2, py = y + 0.5 - h / 2;
      const qx = Math.abs(px) - bx, qy = Math.abs(py) - by;
      let nx: number, ny: number, sd: number;
      if (qx > 0 && qy > 0) { const l = Math.hypot(qx, qy); sd = l - r; nx = qx / l; ny = qy / l; }
      else if (qx > qy) { sd = qx - r; nx = 1; ny = 0; }
      else { sd = qy - r; nx = 0; ny = 1; }
      nx *= Math.sign(px) || 1; ny *= Math.sign(py) || 1;
      const t = Math.max(0, 1 + sd / bezel); // 1 at the rim → 0 one bezel inside
      const k = t * t * (3 - 2 * t); // smoothstep, so the lens fades in softly
      const i = (y * w + x) * 4;
      // sample from further inside: the rim bends the backdrop like a thick glass edge
      d[i] = 128 - Math.round(nx * k * 127);
      d[i + 1] = 128 - Math.round(ny * k * 127);
      d[i + 2] = 128;
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL();
}

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Adds an SVG refraction filter to the element's backdrop (Chromium only) via the --lg-filter custom property. */
export function useLiquidGlass(ref: RefObject<HTMLElement | null>, { radius = 20, bezel = 14, scale = 26 } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !isChromium() || window.matchMedia('(prefers-reduced-transparency: reduce)').matches) return;
    const id = `lg-${Math.random().toString(36).slice(2, 8)}`;
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.style.position = 'absolute';
    svg.innerHTML = `<filter id="${id}" x="0" y="0" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feImage result="map" preserveAspectRatio="none"/><feDisplacementMap in="SourceGraphic" in2="map" scale="${scale}" xChannelSelector="R" yChannelSelector="G"/></filter>`;
    document.body.appendChild(svg);
    const filter = svg.querySelector('filter')!;
    const image = svg.querySelector('feImage')!;

    let w = 0, h = 0, raf = 0;
    const draw = () => {
      const box = el.getBoundingClientRect();
      const nw = Math.round(box.width), nh = Math.round(box.height);
      if (!nw || !nh || (nw === w && nh === h)) return;
      w = nw; h = nh;
      for (const n of [filter, image]) { n.setAttribute('width', String(w)); n.setAttribute('height', String(h)); }
      image.setAttribute('href', displacementMap(w, h, radius, bezel));
      el.style.setProperty('--lg-filter', `url(#${id})`);
    };
    const ro = new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); });
    ro.observe(el);
    draw();
    return () => { ro.disconnect(); cancelAnimationFrame(raf); svg.remove(); el.style.removeProperty('--lg-filter'); };
  }, [ref, radius, bezel, scale]);
}
