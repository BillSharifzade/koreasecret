/* Brand colour → the --brand scale of globals.css. The stylesheet's own values are the default (#dd4487);
   another colour from the admin is mixed into the same tints and shades. */
export const DEFAULT_BRAND = '#dd4487';

const hex = (h: string): [number, number, number] => {
  let x = h.replace('#', '');
  if (x.length === 3) x = x.split('').map((c) => c + c).join('');
  const n = parseInt(x, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const mix = (a: string, b: string, t: number) => {
  const x = hex(a), y = hex(b);
  return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('');
};
export const isHex = (s: string) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s || '');

export function brandScale(brand: string): Record<string, string> {
  const b = isHex(brand) ? brand : DEFAULT_BRAND;
  const [r, g, bl] = hex(b);
  return {
    '--brand': b,
    '--brand-600': mix(b, '#000000', 0.08),
    '--brand-700': mix(b, '#000000', 0.19),
    '--brand-50': mix(b, '#ffffff', 0.955),
    '--brand-100': mix(b, '#ffffff', 0.9),
    '--brand-200': mix(b, '#ffffff', 0.78),
    '--brand-300': mix(b, '#ffffff', 0.55),
    '--brand-rgb': `${r}, ${g}, ${bl}`
  };
}

/** CSS for the <head>; empty for the default colour so the stylesheet stays the single source of truth. */
export function themeCss(brand: string) {
  if (!isHex(brand) || brand.toLowerCase() === DEFAULT_BRAND) return '';
  return `:root{${Object.entries(brandScale(brand)).map(([k, v]) => `${k}:${v}`).join(';')}}`;
}

/** Applies (or resets) the brand colour at runtime: admin preview and storefront preview mode. */
export function applyTheme(brand: string) {
  const root = document.documentElement;
  const scale = brandScale(brand);
  for (const k of Object.keys(scale)) {
    if (!isHex(brand) || brand.toLowerCase() === DEFAULT_BRAND) root.style.removeProperty(k);
    else root.style.setProperty(k, scale[k]);
  }
}
