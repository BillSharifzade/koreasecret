import type { HeroSlide, Tone } from './types';

const hex = (h: string): [number, number, number] => {
  let x = h.replace('#', '');
  if (x.length === 3) x = x.split('').map((c) => c + c).join('');
  const n = parseInt(x, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/** WCAG relative luminance, 0 (black) … 1 (white) */
export const luminance = (c: string) => {
  const [r, g, b] = hex(c).map((v) => { const s = v / 255; return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/**
 * Ink for a banner: averages the colour stops of its base gradient (the last layer of `bg`).
 * Above ~66 L* the background reads as bright → dark ink ('light' tone); below → white ink ('dark' tone).
 */
export function heroTone(s: HeroSlide): Tone {
  if (s.tone) return s.tone;
  const base = s.bg.slice(s.bg.lastIndexOf('linear-gradient'));
  const stops = base.match(/#[0-9a-f]{3,6}\b/gi) || [];
  if (!stops.length) return 'dark';
  const avg = stops.reduce((sum, c) => sum + luminance(c), 0) / stops.length;
  return avg > 0.36 ? 'light' : 'dark';
}
