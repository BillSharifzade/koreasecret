/* Korea Secret — procedural artwork (packshots, icons, scenes) as SVG strings.
   Every call runs inside an id scope so gradient ids are unique per component (see components/Art.tsx). */
import { BLOGGERS, BRANDS, COLLECTIONS, INGREDIENTS, PRODUCTS, STORIES } from './data';
import type { ArtSpec, Blogger, Glyph, IngredientKey, Product, Story } from './types';

/* Brand marks traced from the KS logo */
export const MARK_D = 'M75 1.5C73.1 2.3 63.2 5.9 53 9.5C23.5 20.1 1.5 28.2 1.1 28.5C0.9 28.7 1.1 30.5 1.4 32.5C1.8 34.7 2.7 36 3.6 36C4.8 36 25.9 29.5 31.8 27.3C32.8 26.9 33 62.9 32.8 206.6L32.5 386.5 16.3 386.8L0 387.1 0 391L0 395 58 395L116 395 116 391L116 387 99.5 387C87.2 387 82.8 386.7 82.5 385.8C82.2 385.1 82.1 354.8 82.2 318.6L82.5 252.7 97 270.6C114 291.6 127.7 308.4 164.9 354.5C180 373.2 193.5 389.9 194.9 391.7L197.5 394.9 228.3 394.9L259.1 395 252.9 387.3C249.4 383 241.7 373.6 235.8 366.4C229.9 359.1 225 353 225 352.6C225 352.3 227.7 354.1 231 356.6C234.3 359.1 241.1 363.1 246.2 365.5C254.9 369.6 281.2 378.8 294.5 382.5C303.7 385.1 317.7 390.7 326 395.2C348.6 407.5 357.7 420.8 355 437.6C351.3 460.4 331.5 471.9 296 472.1C281.2 472.1 272.3 471 263.9 468.1C240.2 460 227.6 442.6 226.2 416.2C225.7 406.6 225.6 405.9 223.4 405.4C222.1 405.1 220.6 405.1 220 405.5C218.9 406.2 218.6 461.7 219.7 464.5C220 465.4 221.5 466 223.1 466C225.5 466 226 465.6 226 463.6L226 461.1 234.3 465C251.6 473.1 267 476.8 286.1 477.7C321.5 479.2 349.4 470 367.6 450.7C374.8 443.2 380.1 433.9 381.9 425.9C383.4 419.4 383.2 404.3 381.5 397.8C379.2 388.7 375 381 368.5 374.2C356.2 360.9 337.2 351.3 306 342.5C263.8 330.7 255.9 327.4 245 317.3C240 312.7 237.1 309 234.8 304.2C231.8 298.1 231.5 296.8 231.5 288C231.5 279.5 231.8 278 234.2 273.9C240.3 263.6 251.6 256.1 267.5 251.9C278.3 249.1 301.3 248.8 311 251.4C338.4 258.8 354 278 355.9 306.5L356.5 316.5 359.5 316.5L362.5 316.5 362.8 286.3L363 256 359.5 256C356.4 256 356 256.3 356 258.5C356 261.8 355 261.7 348.1 257.6C340.8 253.4 331.1 249.5 320.7 246.7C313.5 244.8 310.1 244.5 292 244.6C274.4 244.7 270.4 245 263.8 246.8C241 253 225.8 262.9 214.8 278.4C204.6 293 202.2 314.6 209.1 330.8C210.1 333.1 210.8 335 210.6 335C210.3 335 203.9 327.4 183.5 302.5C181.7 300.3 171.1 287.3 159.9 273.7C126.9 233.4 116 219.9 116 219C116 218.5 117.3 217.1 118.9 215.8C124.6 211.2 222 116.9 222 115.9C222 115.4 219.6 115 216.6 115C211.6 115 210.9 115.3 206.7 119.3C202.6 123.1 176.5 148.3 145 178.5C138.1 185.2 127.1 195.7 120.5 202C113.9 208.3 102.6 219.1 95.5 226L82.5 238.5 82.2 119.3C82 6.5 81.9 0 80.2 0.1C79.3 0.1 76.9 0.7 75 1.5M357.9 115.9C317.8 146.2 312.6 199.8 346.2 236.4C349.5 240 352.5 243 353 243C353.4 243 352.5 239.1 351 234.3C347.8 224.2 346 213.1 346 202.6C346 195.9 348.4 178.9 349.9 174.8C350.2 173.9 350.5 181.5 350.5 191.8C350.5 212.8 351.7 219.1 358.8 236.4C362.1 244.4 363 245.7 366.1 247.2C372.6 250.3 385.6 252.3 394.9 251.7C405 251.1 403.7 252.4 392.5 254.2C385 255.4 373 254.5 367.6 252.4C364 251 367 254.1 373.3 258.1C382.6 264.1 391 266.3 402.8 265.8C418.9 265 429 259.6 439.9 246C442.7 242.4 445 239 445 238.3C445 237.4 443.4 237 440.3 237C432.8 237 423.7 234.4 414.9 229.8L406.7 225.5 395.1 225.5L383.4 225.6 386.7 220.1C392.3 210.8 394 205 394 195C394 179.6 390.9 170.2 381.8 157.7C378.9 153.7 375.1 147.5 373.3 143.9C369.5 136.2 366 122.7 366 115.8C366 113.1 365.6 111 365.1 111C364.7 111 361.4 113.2 357.9 115.9M293.2 146.4C289.5 149.8 289.5 149.9 289.7 157.2C290.2 175.9 299.4 201.2 311.6 217.6C319.9 228.7 334.1 241.9 344.5 248C349.4 250.8 348.5 249.9 339.8 243.1C317 225.4 301.8 199.7 296.6 170.3L296.1 167 300.6 167C306.6 167 310.6 164.5 312.5 159.7C315.8 151.6 310.1 143 301.4 143C297.7 143 296.3 143.6 293.2 146.4';
export const BFLY_D = 'M67.9 4.9C27.8 35.2 22.6 88.8 56.2 125.4C59.5 129 62.5 132 63 132C63.4 132 62.5 128.1 61 123.3C57.8 113.2 56 102.1 56 91.6C56 84.9 58.4 67.9 59.9 63.8C60.2 62.9 60.5 70.5 60.5 80.8C60.5 101.8 61.7 108.1 68.8 125.4C72.1 133.4 73 134.7 76.1 136.2C82.6 139.3 95.6 141.3 104.9 140.7C115 140.1 113.7 141.4 102.5 143.2C95 144.4 83 143.5 77.6 141.4C74 140 77 143.1 83.3 147.1C92.6 153.1 101 155.3 112.8 154.8C128.9 154 139 148.6 149.9 135C152.7 131.4 155 128 155 127.3C155 126.4 153.4 126 150.3 126C142.8 126 133.7 123.4 124.9 118.8L116.7 114.5 105.1 114.5L93.4 114.6 96.7 109.1C102.3 99.8 104 94 104 84C104 68.6 100.9 59.2 91.8 46.7C88.9 42.7 85.1 36.5 83.3 32.9C79.5 25.2 76 11.7 76 4.8C76 2.1 75.6 0 75.1 0C74.7 0 71.4 2.2 67.9 4.9M3.2 35.4C-0.5 38.8 -0.5 38.9 -0.3 46.2C0.2 64.9 9.4 90.2 21.6 106.6C29.9 117.7 44.1 130.9 54.5 137C59.4 139.8 58.5 138.9 49.8 132.1C27 114.4 11.8 88.7 6.6 59.3L6.1 56 10.6 56C16.6 56 20.6 53.5 22.5 48.7C25.8 40.6 20.1 32 11.4 32C7.7 32 6.3 32.6 3.2 35.4';

/* ---------- id scope ---------- */
let scopePrefix = 'k';
let scopeN = 0;
const uid = (p = 'g') => `${scopePrefix}${p}${(scopeN++).toString(36)}`;
function scoped<T>(prefix: string, fn: () => T): T {
  const pp = scopePrefix, pn = scopeN;
  scopePrefix = 'k' + prefix.replace(/[^a-zA-Z0-9]/g, '');
  scopeN = 0;
  try { return fn(); } finally { scopePrefix = pp; scopeN = pn; }
}

/* ---------- colour helpers ---------- */
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
const hex = (h: string): [number, number, number] => { let x = h.replace('#', ''); if (x.length === 3) x = x.split('').map((c) => c + c).join(''); const n = parseInt(x, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const toHex = (r: number, g: number, b: number) => '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mix = (a: string, b: string, t: number) => { const x = hex(a), y = hex(b); return toHex(x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t); };
const light = (c: string, t: number) => mix(c, '#ffffff', t);
const dark = (c: string, t: number) => mix(c, '#1a0f16', t);
const lum = (c: string) => { const [r, g, b] = hex(c).map((v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const rng = (seed: string) => { let s = 0; for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };

const FONT_SANS = 'var(--font,Arial,sans-serif)';
const FONT_SERIF = 'var(--serif,Georgia,serif)';

interface TxtOpts { size: number; max?: number; min?: number; weight?: number; ls?: number; fill: string; family?: 'sans' | 'serif'; anchor?: 'start' | 'middle' | 'end'; italic?: boolean; opacity?: number; tf?: string }
function txt(str: string, x: number | string, y: number | string, o: TxtOpts) {
  const serif = o.family === 'serif';
  const upper = str === str.toUpperCase() && /[A-ZА-Я]/.test(str);
  const k = (serif ? 0.5 : upper ? 0.66 : 0.56) + (o.ls || 0);
  let fs = o.size;
  if (o.max) fs = Math.min(fs, o.max / Math.max(1, str.length * k));
  fs = Math.max(fs, o.min || 5);
  const est = str.length * k * fs;
  const fit = o.max && est > o.max ? ` textLength="${o.max.toFixed(1)}" lengthAdjust="spacingAndGlyphs"` : '';
  return `<text x="${x}" y="${y}" style="font-family:${serif ? FONT_SERIF : FONT_SANS}" font-size="${fs.toFixed(1)}" font-weight="${o.weight || 500}"${o.ls ? ` letter-spacing="${(o.ls * fs).toFixed(2)}"` : ''} text-anchor="${o.anchor || 'middle'}" fill="${o.fill}"${o.italic ? ' font-style="italic"' : ''}${o.opacity != null ? ` opacity="${o.opacity}"` : ''}${o.tf ? ` transform="${o.tf}"` : ''}${fit}>${esc(str)}</text>`;
}

function cyl(id: string, c: string, hl = 0.55) {
  const d = lum(c) < 0.08;
  const hi = d ? light(c, 0.32) : light(c, hl * 0.62);
  return `<linearGradient id="${id}" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${dark(c, 0.26)}"/><stop offset=".07" stop-color="${dark(c, 0.1)}"/><stop offset=".26" stop-color="${hi}"/><stop offset=".38" stop-color="${light(c, hl * 0.3)}"/><stop offset=".68" stop-color="${c}"/><stop offset=".9" stop-color="${dark(c, 0.1)}"/><stop offset="1" stop-color="${dark(c, 0.3)}"/></linearGradient>`;
}
const hlGrad = (id: string) => `<linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset=".45" stop-color="#fff" stop-opacity=".25"/><stop offset=".8" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity=".1"/></linearGradient>`;
const vGrad = (id: string, a: string, b: string) => `<linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
const rGrad = (id: string, stops: [number, string, number?][], cx = '.5', cy = '.5', r = '.5') => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c, op = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${op}"/>`).join('')}</radialGradient>`;

const brandName = (id: string) => (BRANDS.find((b) => b.id === id) || { name: id }).name;
const volLabel = (v: string) => String(v || '').replace('мл', 'ml').replace(/(\d) г\b/, '$1 g').replace('шт', 'pcs').replace('г ×', 'g ×').replace('средства', 'items').replace('миниатюр', 'minis');
const P = (id: string) => PRODUCTS.find((x) => x.id === id);

interface LabelOpts { brand?: number; big?: number; bigDy?: number; sub?: number; subDy?: number; vol?: boolean; volDy?: number; volSize?: number }
function label(p: Product, a: ArtSpec, cx: number, y0: number, w: number, o: LabelOpts = {}) {
  const ink = a.ink;
  const serif = !!a.serif;
  const bn = brandName(p.brand);
  let s = txt(serif ? bn : bn.toUpperCase(), cx, y0, { size: o.brand || 12, max: w * 0.92, weight: serif ? 600 : 700, ls: serif ? 0.02 : 0.16, fill: ink, family: serif ? 'serif' : 'sans' });
  if (a.big) s += txt(a.big, cx, y0 + (o.bigDy || 46), { size: o.big || 32, max: w * 0.94, weight: serif ? 500 : 800, ls: serif ? 0 : -0.02, fill: ink, family: serif ? 'serif' : 'sans', italic: serif });
  if (a.sub) s += txt(a.sub, cx, y0 + (o.subDy || 64), { size: o.sub || 8, max: w * 0.9, weight: 600, ls: 0.12, fill: ink, opacity: 0.82 });
  if (p.volume && o.vol !== false) s += txt(volLabel(p.volume), cx, y0 + (o.volDy || 108), { size: o.volSize || 7.5, weight: 500, ls: 0.1, fill: ink, opacity: 0.6 });
  return s;
}

/* ---------- packaging shapes (400×400 box, floor at y≈352) ---------- */
interface ShapeOut { defs: string; b: string; rx: number }
export interface ProductOpts { variant?: string; amount?: string; shadow?: boolean; x?: number; y?: number; size?: number; decorative?: boolean; cls?: string }
type ShapeFn = (p: Product, a: ArtSpec, o: ProductOpts) => ShapeOut;

const S: Record<ArtSpec['shape'], ShapeFn> = {
  toner: (p, a) => {
    const g = uid(), gc = uid(), gh = uid(), gl = uid();
    const cap = a.cap || '#fff';
    let defs = cyl(g, a.c, 0.62) + cyl(gc, cap) + hlGrad(gh);
    let b = `<rect x="158" y="48" width="84" height="84" rx="13" fill="url(#${gc})"/><rect x="162" y="50" width="76" height="9" rx="4.5" fill="#fff" opacity=".35"/><rect x="163" y="124" width="74" height="10" rx="3" fill="${dark(cap, 0.18)}"/>`;
    if (a.glass) {
      defs += cyl(gl, a.liquid || a.c, 0.4);
      b += `<rect x="130" y="130" width="140" height="222" rx="22" fill="url(#${g})" opacity=".72"/><rect x="137" y="162" width="126" height="183" rx="16" fill="url(#${gl})" opacity=".92"/><ellipse cx="200" cy="163" rx="62" ry="4" fill="#fff" opacity=".45"/><rect x="130.5" y="130.5" width="139" height="221" rx="21.5" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2"/>`;
    } else b += `<rect x="130" y="130" width="140" height="222" rx="22" fill="url(#${g})"/>`;
    if (a.label) b += `<rect x="142" y="178" width="116" height="152" rx="6" fill="${a.label}" opacity=".96"/>`;
    b += label(p, a, 200, 208, 108, { big: 36, bigDy: 50, subDy: 70, volDy: 112 });
    b += `<rect x="145" y="140" width="11" height="200" rx="5.5" fill="url(#${gh})" opacity=".8"/><rect x="256" y="146" width="4" height="184" rx="2" fill="#fff" opacity=".22"/>`;
    return { defs, b, rx: 96 };
  },
  tube: (p, a) => {
    const W = a.slim ? 0.72 : 1;
    const X = (x: number) => (200 + (x - 200) * W).toFixed(1);
    const g = uid(), gc = uid(), gh = uid();
    const cap = a.cap || '#fff';
    const defs = cyl(g, a.c, 0.6) + cyl(gc, cap) + hlGrad(gh);
    let b = `<rect x="${X(150)}" y="290" width="${(100 * W).toFixed(1)}" height="62" rx="12" fill="url(#${gc})"/><rect x="${X(156)}" y="282" width="${(88 * W).toFixed(1)}" height="12" rx="4" fill="${dark(cap, 0.14)}"/>`;
    b += `<path d="M${X(122)} 84 L${X(278)} 84 C${X(278)} 160 ${X(262)} 230 ${X(250)} 286 L${X(150)} 286 C${X(138)} 230 ${X(122)} 160 ${X(122)} 84 Z" fill="url(#${g})"/>`;
    b += `<rect x="${X(116)}" y="54" width="${(168 * W).toFixed(1)}" height="32" rx="4" fill="${dark(a.c, 0.07)}"/>`;
    let ridges = '';
    for (let x = 121; x <= 279; x += 6) ridges += `M${X(x)} 58V82`;
    b += `<path d="${ridges}" stroke="${dark(a.c, 0.3)}" stroke-opacity=".16" stroke-width="1.4"/><rect x="${X(116)}" y="54" width="${(168 * W).toFixed(1)}" height="5" rx="2.5" fill="#fff" opacity=".35"/>`;
    if (a.label) b += `<rect x="${X(140)}" y="106" width="${(120 * W).toFixed(1)}" height="160" rx="8" fill="${a.label}"/>`;
    b += label(p, a, 200, a.slim ? 128 : 132, 132 * W, { brand: a.slim ? 10 : 13, big: a.slim ? 22 : 32, bigDy: a.slim ? 40 : 50, subDy: a.slim ? 58 : 72, sub: a.slim ? 6.5 : 8.5, volDy: 128, volSize: a.slim ? 6.5 : 7.5 });
    b += `<path d="M${X(140)} 96 C${X(141)} 160 ${X(150)} 226 ${X(160)} 278" fill="none" stroke="url(#${gh})" stroke-width="${(9 * W).toFixed(1)}" stroke-linecap="round" opacity=".75"/>`;
    return { defs, b, rx: a.slim ? 60 : 84 };
  },
  pump: (p, a) => {
    const top = a.big2 ? 118 : 150;
    const g = uid(), gc = uid(), gh = uid(), gl = uid();
    const cap = a.cap || '#fff';
    let defs = cyl(g, a.c, 0.6) + cyl(gc, cap) + hlGrad(gh);
    let b = `<rect x="192" y="${top - 58}" width="16" height="34" fill="${dark(cap, 0.12)}"/><rect x="228" y="${top - 71}" width="42" height="11" rx="5" fill="url(#${gc})"/><rect x="264" y="${top - 74}" width="8" height="17" rx="3" fill="${dark(cap, 0.2)}"/>`;
    b += `<rect x="166" y="${top - 78}" width="68" height="25" rx="8" fill="url(#${gc})"/><rect x="168" y="${top - 30}" width="64" height="36" rx="7" fill="url(#${gc})"/><rect x="168" y="${top - 30}" width="64" height="6" rx="3" fill="#fff" opacity=".3"/>`;
    const h = 352 - top;
    if (a.glass) {
      defs += cyl(gl, a.liquid || a.c, 0.4);
      b += `<rect x="128" y="${top}" width="144" height="${h}" rx="24" fill="url(#${g})" opacity=".72"/><rect x="135" y="${top + 26}" width="130" height="${h - 33}" rx="18" fill="url(#${gl})" opacity=".92"/><rect x="198" y="${top}" width="4" height="${h - 14}" rx="2" fill="#fff" opacity=".4"/><rect x="128.5" y="${top + 0.5}" width="143" height="${h - 1}" rx="23.5" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2"/>`;
    } else b += `<rect x="128" y="${top}" width="144" height="${h}" rx="24" fill="url(#${g})"/>`;
    const ly = top + (a.big2 ? 70 : 52);
    if (a.label) b += `<rect x="142" y="${ly - 26}" width="116" height="140" rx="6" fill="${a.label}" opacity=".96"/>`;
    b += label(p, a, 200, ly, 110, { big: a.big2 ? 42 : 30, bigDy: a.big2 ? 58 : 48, subDy: a.big2 ? 82 : 68, volDy: 352 - ly - 18 });
    b += `<rect x="142" y="${top + 12}" width="11" height="${h - 30}" rx="5.5" fill="url(#${gh})" opacity=".8"/>`;
    return { defs, b, rx: 98 };
  },
  dropper: (p, a) => {
    const g = uid(), gc = uid(), gb = uid(), gh = uid(), gl = uid();
    const cap = a.cap || '#fff';
    const bulb = a.bulb || (lum(cap) > 0.8 ? '#ffffff' : cap);
    const defs = cyl(g, a.c, 0.5) + cyl(gc, cap) + cyl(gb, bulb, 0.5) + hlGrad(gh) + cyl(gl, a.liquid || a.c, 0.35);
    let b = `<path d="M179 112 L179 78 C179 52 221 52 221 78 L221 112 Z" fill="url(#${gb})"/><ellipse cx="192" cy="72" rx="5" ry="10" fill="#fff" opacity=".45"/><rect x="176" y="150" width="48" height="20" fill="${a.c}" opacity=".7"/>`;
    const body = 'M134 198 C134 176 150 166 172 164 L228 164 C250 166 266 176 266 198 L266 334 Q266 352 248 352 L152 352 Q134 352 134 334 Z';
    b += `<path d="${body}" fill="url(#${g})" opacity="${a.glass ? 0.7 : 1}"/>`;
    if (a.glass) b += `<path d="M141 214 L259 214 L259 333 Q259 345 246 345 L154 345 Q141 345 141 333 Z" fill="url(#${gl})" opacity=".94"/><ellipse cx="200" cy="214" rx="59" ry="4" fill="#fff" opacity=".4"/><rect x="195" y="156" width="10" height="176" rx="5" fill="#fff" opacity=".32"/><path d="${body}" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2"/>`;
    b += `<rect x="166" y="106" width="68" height="50" rx="6" fill="url(#${gc})"/><path d="M168 118H232M168 126H232M168 134H232M168 142H232" stroke="${dark(cap, 0.3)}" stroke-opacity=".14" stroke-width="1.5"/><rect x="168" y="107" width="64" height="5" rx="2.5" fill="#fff" opacity=".35"/>`;
    if (a.label) b += `<rect x="150" y="232" width="100" height="98" rx="4" fill="${a.label}" opacity=".97"/>`;
    b += label(p, a, 200, 254, 92, { brand: 10, big: 24, bigDy: 36, sub: 6.4, subDy: 52, volDy: 68, volSize: 6.4 });
    b += `<rect x="143" y="182" width="9" height="150" rx="4.5" fill="url(#${gh})" opacity=".85"/>`;
    return { defs, b, rx: 88 };
  },
  jar: (p, a) => {
    const tall = !!a.tall;
    const bodyTop = tall ? 204 : 244;
    const lidTop = bodyTop - 66;
    const g = uid(), gc = uid(), gh = uid();
    const cap = a.cap || '#fff';
    const defs = cyl(g, a.c, 0.55) + cyl(gc, cap, 0.6) + hlGrad(gh);
    let b = `<rect x="100" y="${bodyTop}" width="200" height="${352 - bodyTop}" rx="20" fill="url(#${g})"/><rect x="90" y="${lidTop}" width="220" height="70" rx="14" fill="url(#${gc})"/>`;
    let ridges = '';
    for (let x = 96; x <= 304; x += 5) ridges += `M${x} ${lidTop + 12}V${lidTop + 62}`;
    b += `<path d="${ridges}" stroke="${dark(cap, 0.35)}" stroke-opacity=".07" stroke-width="1.2"/><rect x="94" y="${lidTop + 1}" width="212" height="8" rx="4" fill="#fff" opacity=".4"/><rect x="104" y="${bodyTop + 2}" width="192" height="5" fill="${dark(a.c, 0.3)}" opacity=".35"/>`;
    b += label(p, a, 200, bodyTop + (tall ? 36 : 30), 170, { brand: 12, big: tall ? 40 : 30, bigDy: tall ? 50 : 38, subDy: tall ? 72 : 56, sub: 8, vol: tall, volDy: 106 });
    b += `<rect x="112" y="${bodyTop + 12}" width="10" height="${352 - bodyTop - 26}" rx="5" fill="url(#${gh})" opacity=".75"/><rect x="104" y="${lidTop + 12}" width="8" height="48" rx="4" fill="#fff" opacity=".35"/>`;
    return { defs, b, rx: 118 };
  },
  minijar: (p, a) => {
    const g = uid(), gc = uid();
    const defs = cyl(g, a.c, 0.5) + cyl(gc, a.cap || a.c, 0.55);
    let b = `<rect x="132" y="272" width="136" height="80" rx="18" fill="url(#${g})"/><rect x="124" y="218" width="152" height="60" rx="16" fill="url(#${gc})"/><rect x="128" y="219" width="144" height="7" rx="3.5" fill="#fff" opacity=".4"/>`;
    b += txt(a.big || 'LIP', 200, 258, { size: 26, weight: 800, ls: 0.12, fill: a.ink, max: 120 });
    b += txt(brandName(p.brand).toUpperCase(), 200, 302, { size: 10, weight: 700, ls: 0.22, fill: a.ink, max: 110 });
    b += txt(a.sub || '', 200, 320, { size: 7, weight: 600, ls: 0.14, fill: a.ink, opacity: 0.85, max: 110 });
    b += `<rect x="140" y="280" width="8" height="62" rx="4" fill="#fff" opacity=".35"/>`;
    return { defs, b, rx: 90 };
  },
  cushion: (p, a, o) => {
    const g = uid(), gt = uid(), gr = uid();
    const shade = o.variant || p.variants?.[0]?.color || '#ecc9b0';
    const defs = cyl(g, a.c, 0.4) + rGrad(gt, [[0, light(a.c, lum(a.c) < 0.1 ? 0.28 : 0.35)], [0.6, a.c], [1, dark(a.c, 0.15)]], '.38', '.3', '.75') + cyl(gr, a.cap || '#ddd', 0.6);
    let b = `<path d="M58 250 L58 300 A142 46 0 0 0 342 300 L342 250 Z" fill="url(#${g})"/><path d="M58 276 A142 46 0 0 0 342 276" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="1.5"/><path d="M58 278 A142 46 0 0 0 342 278" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="1.2"/>`;
    b += `<ellipse cx="200" cy="250" rx="142" ry="46" fill="url(#${gt})"/><ellipse cx="200" cy="250" rx="126" ry="39" fill="none" stroke="url(#${gr})" stroke-width="3"/><ellipse cx="160" cy="236" rx="60" ry="10" fill="#fff" opacity=".12"/>`;
    b += txt(a.big || brandName(p.brand).toUpperCase(), 200, 262, { size: 40, weight: 800, ls: 0.18, fill: a.ink, max: 180, tf: 'translate(200 262) scale(1 .38) translate(-200 -262)' });
    b += `<circle cx="306" cy="318" r="12" fill="${shade}" stroke="#fff" stroke-width="3"/>`;
    return { defs, b, rx: 150 };
  },
  lip: (p, a, o) => {
    const color = o.variant || a.c;
    const g = uid(), gc = uid(), gs = uid();
    const defs = cyl(g, color, 0.5) + cyl(gc, a.cap || '#eee', 0.55) + `<linearGradient id="${gs}" x1="0" x2="1"><stop offset="0" stop-color="${dark(color, 0.1)}"/><stop offset=".5" stop-color="${light(color, 0.25)}"/><stop offset="1" stop-color="${color}"/></linearGradient>`;
    let b = `<path d="M236 344 C250 326 300 322 330 334 C348 342 330 356 296 356 C262 356 226 356 236 344 Z" fill="url(#${gs})" opacity=".92"/><ellipse cx="290" cy="336" rx="22" ry="3" fill="#fff" opacity=".5"/>`;
    b += `<rect x="176" y="152" width="48" height="200" rx="8" fill="url(#${g})"/><rect x="176.5" y="152.5" width="47" height="199" rx="7.5" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.5"/><rect x="183" y="160" width="7" height="184" rx="3.5" fill="#fff" opacity=".45"/>`;
    b += `<rect x="176" y="36" width="48" height="122" rx="8" fill="url(#${gc})"/><rect x="178" y="37" width="44" height="6" rx="3" fill="#fff" opacity=".35"/>`;
    b += txt(brandName(p.brand), 200, 104, { size: 13, weight: 700, ls: 0.14, fill: a.ink, max: 100, family: 'serif', tf: 'rotate(-90 200 100)' });
    return { defs, b, rx: 80 };
  },
  pads: (p, a) => {
    const g = uid(), gc = uid();
    const defs = cyl(g, a.c, 0.5) + cyl(gc, a.cap || '#fff', 0.55);
    let b = `<rect x="102" y="244" width="196" height="108" rx="20" fill="url(#${g})" opacity=".92"/>`;
    for (let i = 0; i < 10; i++) b += `<rect x="112" y="${254 + i * 9}" width="176" height="5" rx="2.5" fill="#fff" opacity=".45"/>`;
    b += `<rect x="94" y="196" width="212" height="54" rx="13" fill="url(#${gc})"/><rect x="98" y="197" width="204" height="7" rx="3.5" fill="#fff" opacity=".45"/><rect x="128" y="266" width="144" height="66" rx="8" fill="#fff" opacity=".94"/>`;
    b += txt(brandName(p.brand).toUpperCase(), 200, 284, { size: 10, weight: 700, ls: 0.18, fill: a.ink, max: 124 });
    b += txt(a.big || '', 200, 312, { size: 24, weight: 800, fill: a.ink, max: 124 });
    b += txt(a.sub || '', 200, 325, { size: 6.5, weight: 600, ls: 0.12, fill: a.ink, opacity: 0.8, max: 124 });
    b += `<rect x="110" y="252" width="8" height="88" rx="4" fill="#fff" opacity=".35"/>`;
    return { defs, b, rx: 112 };
  },
  mask: (p, a) => {
    const g = uid(), g2 = uid(), gs = uid();
    const defs = `<linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${light(a.c, 0.4)}"/><stop offset=".5" stop-color="${a.c}"/><stop offset="1" stop-color="${dark(a.c, 0.08)}"/></linearGradient>` +
      `<linearGradient id="${g2}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${dark(a.c, 0.05)}"/><stop offset="1" stop-color="${dark(a.c, 0.18)}"/></linearGradient>` +
      `<linearGradient id="${gs}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
    const sachet = (fill: string) => `<rect x="114" y="68" width="172" height="280" rx="12" fill="${fill}"/><path d="M114 80h172" stroke="#000" stroke-opacity=".08" stroke-width="16" stroke-dasharray="2 4"/>`;
    let b = `<g transform="rotate(8 200 210) translate(26 -6)">${sachet(`url(#${g2})`)}</g><g transform="rotate(-5 200 210)">${sachet(`url(#${g})`)}`;
    b += `<path d="M114 150 L286 96 L286 150 L114 214 Z" fill="url(#${gs})" opacity=".6"/>`;
    b += txt(brandName(p.brand).toUpperCase(), 200, 118, { size: 12, weight: 700, ls: 0.2, fill: a.ink, max: 140 });
    b += `<g transform="translate(200 186)" fill="none" stroke="${a.ink}" stroke-opacity=".55" stroke-width="2"><ellipse rx="34" ry="44"/><ellipse cx="-13" cy="-8" rx="7" ry="3.5"/><ellipse cx="13" cy="-8" rx="7" ry="3.5"/><path d="M-9 20 Q0 26 9 20"/><path d="M0 -2 V10"/></g>`;
    b += txt(a.big || '', 200, 268, { size: 28, weight: 500, fill: a.ink, max: 150, family: 'serif', italic: true });
    b += txt(a.sub || '', 200, 290, { size: 8, weight: 600, ls: 0.16, fill: a.ink, opacity: 0.8, max: 140 });
    b += txt('1 SHEET · 25 ML', 200, 326, { size: 7, weight: 500, ls: 0.14, fill: a.ink, opacity: 0.6 }) + `</g>`;
    return { defs, b, rx: 110 };
  },
  box: (_p, a) => {
    const front = a.c, rib = a.cap || '#fff';
    const gf = uid(), gt = uid(), gsd = uid();
    const defs = vGrad(gf, light(front, 0.12), dark(front, 0.06)) + vGrad(gt, light(front, 0.3), light(front, 0.1)) + vGrad(gsd, dark(front, 0.16), dark(front, 0.26));
    let b = '';
    const pa = P('torriden-dive-in-serum'), pb = P('anua-heartleaf-toner');
    if (pa && pb) b += `<g transform="translate(118 58) scale(.5)">${inner(pb)}</g><g transform="translate(176 76) scale(.46)">${inner(pa)}</g>`;
    b += `<path d="M104 196 L140 172 L332 172 L296 196 Z" fill="url(#${gt})"/><path d="M296 196 L332 172 L332 322 L296 346 Z" fill="url(#${gsd})"/><rect x="104" y="196" width="192" height="150" fill="url(#${gf})"/>`;
    b += `<rect x="188" y="196" width="24" height="150" fill="${rib}"/><path d="M188 196 L224 172 L248 172 L212 196 Z" fill="${light(rib, 0.1)}"/><path d="M104 254 H296 V276 H104 Z" fill="${rib}"/><path d="M296 254 L332 230 L332 252 L296 276 Z" fill="${dark(rib, 0.12)}"/>`;
    b += `<g fill="${rib}" stroke="${dark(rib, 0.15)}" stroke-width="1.5"><path d="M218 172 C190 140 176 176 214 176 Z"/><path d="M222 172 C252 142 266 178 226 176 Z"/><circle cx="220" cy="174" r="7"/></g>`;
    b += `<path d="${BFLY_D}" fill="${a.ink}" opacity=".95" transform="translate(126 212) scale(.2)"/>`;
    b += txt('KOREA SECRET', 150, 318, { size: 9, weight: 600, ls: 0.26, fill: a.ink, max: 80 }) + `<rect x="104" y="196" width="192" height="3" fill="#fff" opacity=".3"/>`;
    return { defs, b, rx: 130 };
  },
  giftcard: (_p, _a, o) => {
    const amount = o.amount || '500 смн';
    const g1 = uid(), g2 = uid(), gs = uid();
    const defs = `<linearGradient id="${g1}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f07db4"/><stop offset=".55" stop-color="#dd4487"/><stop offset="1" stop-color="#a83b8b"/></linearGradient><linearGradient id="${g2}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b893ef"/><stop offset="1" stop-color="#7e46b4"/></linearGradient><linearGradient id="${gs}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
    const card = (fill: string, big: string) => `<rect x="-130" y="-82" width="260" height="164" rx="18" fill="${fill}"/><path d="M-130 -30 L40 -82 L100 -82 L-130 -4 Z" fill="url(#${gs})" opacity=".5"/><g fill="#fff" transform="translate(-110 -64) scale(.075)"><path d="${MARK_D}"/></g>` +
      txt(big, 112, 62, { size: 34, weight: 500, fill: '#fff', family: 'serif', anchor: 'end', max: 180 }) + txt('KOREA SECRET · GIFT CARD', -110, 26, { size: 7.5, weight: 600, ls: 0.16, fill: '#fff', anchor: 'start', opacity: 0.85 });
    return { defs, b: `<g transform="translate(222 176) rotate(10)">${card(`url(#${g2})`, '1 000 смн')}</g><g transform="translate(186 236) rotate(-9)">${card(`url(#${g1})`, amount)}</g>`, rx: 130 };
  }
};

const draw = (p: Product, o: ProductOpts = {}) => (S[p.art.shape] || S.toner)(p, p.art, o);
function inner(p: Product, o: ProductOpts = {}) { const s = draw(p, o); return `<defs>${s.defs}</defs>${s.b}`; }
function floor(rx: number, y = 354, op = 0.24) { const id = uid('s'); return { defs: rGrad(id, [[0, '#3a1730', op], [1, '#3a1730', 0]]), el: `<ellipse cx="200" cy="${y}" rx="${rx}" ry="13" fill="url(#${id})"/>` }; }
const titleOf = (p: Product) => `${brandName(p.brand)} ${p.name}`;

function productSvgRaw(p: Product, o: ProductOpts = {}) {
  const s = draw(p, o);
  const sh = o.shadow === false ? { defs: '', el: '' } : floor(s.rx);
  const pos = o.size != null ? ` x="${o.x || 0}" y="${o.y || 0}" width="${o.size}" height="${o.size}"` : '';
  const role = o.decorative ? 'aria-hidden="true"' : `role="img" aria-label="${esc(titleOf(p))}"`;
  return `<svg${pos} viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" ${role}${o.cls ? ` class="${o.cls}"` : ''}><defs>${sh.defs}${s.defs}</defs>${sh.el}${s.b}</svg>`;
}

/* ---------- textures & glyphs ---------- */
type TextureKind = 'cream' | 'gel' | 'smear' | 'powder' | 'pad' | 'sheet' | 'drop';
const textureKind = (p: Product): TextureKind => ({ cream: 'cream', sleeping_mask: 'cream', cleansing_balm: 'cream', body_cream: 'cream', hair_mask: 'cream', lip_mask: 'cream', eye: 'cream', sunscreen: 'cream', cleanser: 'gel', body_gel: 'gel', shampoo: 'gel', lip_tint: 'smear', cushion: 'powder', pads: 'pad', sheet_mask: 'sheet' } as Partial<Record<Product['type'], TextureKind>>)[p.type] || 'drop';

function texture(kind: TextureKind, color: string, cx: number, cy: number, s = 1) {
  const g = uid(), h = uid();
  let defs = rGrad(g, [[0, light(color, 0.55)], [0.55, color], [1, dark(color, 0.12)]], '.35', '.3', '.8');
  const T = `transform="translate(${cx} ${cy}) scale(${s})"`;
  let el: string;
  if (kind === 'cream') el = `<g ${T}><path d="M-86 22 C-90 -6 -58 -22 -30 -18 C-18 -44 26 -46 38 -20 C66 -24 92 -4 86 22 C82 40 -82 42 -86 22 Z" fill="url(#${g})"/><path d="M-40 -8 C-10 -30 30 -24 34 -6 C12 -16 -14 -14 -40 -8 Z" fill="#fff" opacity=".7"/><path d="M-60 18 C-30 8 20 8 60 16" stroke="#fff" stroke-opacity=".5" stroke-width="3" fill="none" stroke-linecap="round"/></g>`;
  else if (kind === 'gel') el = `<g ${T}><path d="M-80 20 C-84 -16 -40 -36 0 -34 C44 -36 86 -14 80 20 C76 42 -76 44 -80 20 Z" fill="${color}" opacity=".55"/><path d="M-80 20 C-84 -16 -40 -36 0 -34 C44 -36 86 -14 80 20" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2"/><circle cx="-30" cy="-8" r="6" fill="#fff" opacity=".7"/><circle cx="18" cy="4" r="4" fill="#fff" opacity=".6"/><circle cx="40" cy="-14" r="3" fill="#fff" opacity=".6"/><ellipse cx="-20" cy="-20" rx="26" ry="6" fill="#fff" opacity=".45"/></g>`;
  else if (kind === 'smear') {
    defs += `<linearGradient id="${h}" x1="0" x2="1"><stop offset="0" stop-color="${dark(color, 0.1)}"/><stop offset=".6" stop-color="${light(color, 0.2)}"/><stop offset="1" stop-color="${color}" stop-opacity=".2"/></linearGradient>`;
    el = `<g ${T}><path d="M-90 10 C-60 -30 40 -34 96 -6 C60 6 20 30 -30 34 C-60 36 -96 26 -90 10 Z" fill="url(#${h})"/><path d="M-60 -2 C-20 -18 30 -18 70 -6" stroke="#fff" stroke-opacity=".6" stroke-width="4" fill="none" stroke-linecap="round"/></g>`;
  } else if (kind === 'powder') el = `<g ${T}><circle r="58" fill="url(#${g})"/><circle r="58" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2"/><ellipse cx="-18" cy="-20" rx="22" ry="10" fill="#fff" opacity=".35"/></g>`;
  else if (kind === 'pad') el = `<g ${T}><ellipse rx="70" ry="22" fill="#fff"/><ellipse rx="70" ry="22" fill="${color}" opacity=".35"/><path d="M-60 -4 H60 M-64 4 H64" stroke="#fff" stroke-opacity=".8" stroke-width="2"/></g>`;
  else if (kind === 'sheet') el = `<g ${T}><path d="M-60 -70 C-20 -86 20 -86 60 -70 C76 -30 70 40 40 70 C10 86 -10 86 -40 70 C-70 40 -76 -30 -60 -70 Z" fill="${light(color, 0.45)}" stroke="#fff" stroke-width="2"/><ellipse cx="-24" cy="-14" rx="12" ry="6" fill="#fff"/><ellipse cx="24" cy="-14" rx="12" ry="6" fill="#fff"/><path d="M-16 34 Q0 44 16 34" stroke="#fff" stroke-width="6" stroke-linecap="round" fill="none"/></g>`;
  else el = `<g ${T}><path d="M0 -70 C18 -40 46 -12 46 16 C46 44 24 62 0 62 C-24 62 -46 44 -46 16 C-46 -12 -18 -40 0 -70 Z" fill="url(#${g})" opacity=".92"/><path d="M-22 4 C-22 -14 -12 -30 -4 -40" stroke="#fff" stroke-opacity=".75" stroke-width="7" stroke-linecap="round" fill="none"/><circle cx="16" cy="30" r="6" fill="#fff" opacity=".45"/></g>`;
  return { defs, el };
}

function glyph(kind: Glyph, color: string, s = 1, cx = 0, cy = 0) {
  const g = uid();
  const defs = rGrad(g, [[0, light(color, 0.6)], [0.5, color], [1, dark(color, 0.18)]], '.35', '.3', '.8');
  const f = `url(#${g})`;
  const T = `transform="translate(${cx} ${cy}) scale(${s})"`;
  const arc = (d: number, r: number) => (r * Math.cos((d * Math.PI) / 180)).toFixed(1) + ' ' + (r * Math.sin((d * Math.PI) / 180)).toFixed(1);
  const shapes: Record<Glyph, string> = {
    drop: `<path d="M0 -44 C12 -24 30 -6 30 12 C30 30 16 42 0 42 C-16 42 -30 30 -30 12 C-30 -6 -12 -24 0 -44 Z" fill="${f}"/><path d="M-14 6 C-14 -6 -8 -16 -3 -22" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity=".75"/>`,
    leaf: `<path d="M-36 34 C-40 -10 -6 -40 38 -40 C40 4 12 38 -36 34 Z" fill="${f}"/><path d="M-30 28 C-8 6 10 -12 28 -30" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none" opacity=".7"/>`,
    molecule: `<g stroke="${dark(color, 0.25)}" stroke-width="4" opacity=".55"><path d="M-22 -18 L10 -4 L-10 26 M10 -4 L32 -26"/></g><circle cx="-22" cy="-18" r="13" fill="${f}"/><circle cx="10" cy="-4" r="16" fill="${f}"/><circle cx="-10" cy="26" r="11" fill="${f}"/><circle cx="32" cy="-26" r="9" fill="${f}"/><circle cx="6" cy="-10" r="4" fill="#fff" opacity=".8"/>`,
    grain: `<g fill="${f}"><ellipse cx="-16" cy="-8" rx="10" ry="22" transform="rotate(-20 -16 -8)"/><ellipse cx="14" cy="-2" rx="10" ry="22" transform="rotate(16 14 -2)"/><ellipse cx="-2" cy="22" rx="10" ry="20" transform="rotate(80 -2 22)"/></g><ellipse cx="-20" cy="-16" rx="3" ry="8" fill="#fff" opacity=".7" transform="rotate(-20 -20 -16)"/>`,
    honey: `<path d="M0 -36 L31 -18 L31 18 L0 36 L-31 18 L-31 -18 Z" fill="${f}"/><path d="M0 -20 L17 -10 L17 10 L0 20 L-17 10 L-17 -10 Z" fill="#fff" opacity=".3"/><path d="M-20 -16 L-6 -24" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>`,
    citrus: `<circle r="36" fill="${f}"/><circle r="28" fill="${light(color, 0.55)}"/>${[0, 60, 120, 180, 240, 300].map((d) => `<path d="M0 0 L${arc(d - 22, 26)} A26 26 0 0 1 ${arc(d + 22, 26)} Z" fill="${color}" opacity=".75"/>`).join('')}<circle cx="-12" cy="-14" r="6" fill="#fff" opacity=".6"/>`,
    swirl: `<path d="M0 0 C0 -8 10 -10 14 -2 C20 10 4 22 -10 16 C-28 8 -24 -20 -2 -26 C22 -32 40 -8 32 14 C24 36 -6 44 -28 30" stroke="${f}" stroke-width="12" stroke-linecap="round" fill="none"/>`,
    capsule: `<g transform="rotate(-35)"><rect x="-16" y="-38" width="32" height="76" rx="16" fill="${f}"/><rect x="-16" y="0" width="32" height="38" fill="${dark(color, 0.12)}" opacity=".5"/><rect x="-10" y="-30" width="7" height="30" rx="3.5" fill="#fff" opacity=".7"/></g>`,
    helix: [...Array(7)].map((_, i) => { const y = -36 + i * 12, x = 20 * Math.sin(i * 0.9); return `<line x1="${x.toFixed(1)}" y1="${y}" x2="${(-x).toFixed(1)}" y2="${y}" stroke="${dark(color, 0.2)}" stroke-opacity=".35" stroke-width="3"/><circle cx="${x.toFixed(1)}" cy="${y}" r="7" fill="${f}"/><circle cx="${(-x).toFixed(1)}" cy="${y}" r="7" fill="${f}"/>`; }).join(''),
    dots: `<circle cx="-14" cy="-12" r="16" fill="${f}"/><circle cx="16" cy="-4" r="12" fill="${f}"/><circle cx="-4" cy="20" r="14" fill="${f}"/><circle cx="24" cy="24" r="7" fill="${f}"/><circle cx="-18" cy="-18" r="4" fill="#fff" opacity=".8"/>`,
    root: `<path d="M-6 -40 C10 -30 14 -8 8 10 C4 24 18 30 22 40 M8 10 C0 22 -16 26 -22 38 M4 -10 C-10 -6 -20 -14 -28 -8" stroke="${f}" stroke-width="10" stroke-linecap="round" fill="none"/>`,
    sun: `<circle r="22" fill="${f}"/>${[...Array(8)].map((_, i) => `<rect x="-4" y="-44" width="8" height="14" rx="4" fill="${f}" transform="rotate(${i * 45})"/>`).join('')}<circle cx="-7" cy="-8" r="6" fill="#fff" opacity=".6"/>`
  };
  return { defs, el: `<g ${T}>${shapes[kind] || shapes.drop}</g>` };
}

export type GalleryView = 'front' | 'texture' | 'ingredients' | 'box' | 'duo';
function galleryRaw(p: Product, view: GalleryView, o: ProductOpts = {}) {
  if (view === 'front') return productSvgRaw(p, o);
  let defs = '', el = '';
  const col = p.art.liquid || (p.art.shape === 'lip' ? o.variant || p.art.c : p.art.shape === 'cushion' ? o.variant || p.variants?.[0]?.color || p.art.c : p.art.c);
  if (view === 'texture') {
    const t = texture(textureKind(p), col, 272, 300, 0.95);
    defs += t.defs;
    el += `<g transform="translate(-60 10) scale(.86)">${inner(p, o)}</g>` + t.el;
  } else if (view === 'ingredients') {
    const spots: [number, number, number][] = [[300, 110, 0.9], [330, 250, 0.7], [90, 120, 0.75]];
    p.ingr.slice(0, 3).forEach((k, i) => { const ing = INGREDIENTS[k]; const [x, y, s] = spots[i]; const gl = glyph(ing.glyph, dark(ing.tint, 0.25), s, x, y); defs += gl.defs; el += `<circle cx="${x}" cy="${y}" r="${54 * s}" fill="${ing.tint}" opacity=".7"/>` + gl.el; });
    const f = floor(90);
    defs += f.defs;
    el = f.el + el + `<g transform="translate(40 30) scale(.8)">${inner(p, o)}</g>`;
  } else if (view === 'box') {
    const gb = uid(), gs = uid();
    const c = p.art.cap && lum(p.art.cap) < 0.9 ? p.art.cap : p.art.c;
    defs += vGrad(gb, light(c, 0.25), c) + vGrad(gs, dark(c, 0.12), dark(c, 0.22));
    const f = floor(150, 356, 0.2);
    defs += f.defs;
    el += f.el + `<path d="M170 110 L200 92 L322 92 L292 110 Z" fill="${light(c, 0.4)}"/><path d="M292 110 L322 92 L322 332 L292 350 Z" fill="url(#${gs})"/><rect x="170" y="110" width="122" height="240" fill="url(#${gb})"/>`;
    el += txt(brandName(p.brand).toUpperCase(), 231, 150, { size: 11, weight: 700, ls: 0.16, fill: p.art.ink, max: 104, opacity: 0.85 });
    el += txt(p.art.big || '', 231, 214, { size: 30, weight: p.art.serif ? 500 : 800, fill: p.art.ink, max: 104, family: p.art.serif ? 'serif' : 'sans', italic: !!p.art.serif });
    el += `<g transform="translate(-54 22) scale(.86)">${inner(p, o)}</g>`;
  } else {
    const f = floor(150);
    defs += f.defs;
    el += f.el + `<g transform="translate(82 -8) scale(.82) rotate(6 200 200)" opacity=".92">${inner(p, o)}</g><g transform="translate(-22 22) scale(.9)">${inner(p, o)}</g>`;
  }
  return `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(titleOf(p))}"><defs>${defs}</defs>${el}</svg>`;
}

/* ---------- 3D glossy category icons ---------- */
function iconRaw(name: string) {
  const g = uid(), gd = uid(), gl = uid(), sh = uid(), fb = uid();
  const defs = `<radialGradient id="${g}" cx=".32" cy=".24" r=".95"><stop offset="0" stop-color="#ffe8f2"/><stop offset=".26" stop-color="#fbb1d1"/><stop offset=".6" stop-color="#ea66a4"/><stop offset="1" stop-color="#b93079"/></radialGradient><linearGradient id="${gd}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e2579a"/><stop offset="1" stop-color="#9e2767"/></linearGradient><linearGradient id="${gl}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>` +
    rGrad(sh, [[0, '#b93079', 0.35], [1, '#b93079', 0]]) + `<filter id="${fb}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>`;
  const F = `url(#${g})`, D = `url(#${gd})`, L = `url(#${gl})`;
  const rim = 'stroke="#fff" stroke-opacity=".45" stroke-width="1.5"';
  const blob = (x: number, y: number, r: number) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#f7a8cb" opacity=".55" filter="url(#${fb})"/>`;
  const art: Record<string, string> = {
    sale: `${blob(38, 38, 16)}<g transform="rotate(-16 80 80)"><path d="M52 46 H116 Q128 46 128 58 V102 Q128 114 116 114 H52 Q46 114 42 109 L26 86 Q22 80 26 74 L42 51 Q46 46 52 46 Z" fill="${F}" ${rim}/><circle cx="46" cy="80" r="7.5" fill="#f1eaf3"/><circle cx="46" cy="80" r="7.5" fill="none" stroke="#b93079" stroke-opacity=".4" stroke-width="2"/><text x="90" y="97" text-anchor="middle" style="font-family:${FONT_SANS}" font-size="46" font-weight="800" fill="#fff" opacity=".95">%</text><path d="M58 52 H112 Q120 52 121 58" stroke="${L}" stroke-width="5" stroke-linecap="round" fill="none"/></g>`,
    bag: `<path d="M60 66 C60 30 100 30 100 66" stroke="${D}" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M38 62 H122 L130 128 Q131 138 121 138 H39 Q29 138 30 128 Z" fill="${F}" ${rim}/><path d="M40 64 H120" stroke="#fff" stroke-opacity=".6" stroke-width="3"/><g fill="#fff" opacity=".92" transform="translate(64 84) scale(.2)"><path d="${BFLY_D}"/></g><path d="M44 72 L40 120" stroke="${L}" stroke-width="6" stroke-linecap="round"/>`,
    dropper: `<path d="M69 26 Q69 12 80 12 Q91 12 91 26 V46 H69 Z" fill="${D}"/><rect x="62" y="44" width="36" height="22" rx="5" fill="${F}"/><path d="M52 80 Q52 66 66 66 H94 Q108 66 108 80 V132 Q108 144 96 144 H64 Q52 144 52 132 Z" fill="#f7b9d4" opacity=".85" ${rim}/><path d="M56 96 H104 V132 Q104 140 96 140 H64 Q56 140 56 132 Z" fill="${F}"/><rect x="77" y="64" width="6" height="66" rx="3" fill="#fff" opacity=".55"/><path d="M60 78 V128" stroke="${L}" stroke-width="6" stroke-linecap="round"/><path d="M124 58 C130 68 134 74 134 80 C134 86 129 90 124 90 C119 90 114 86 114 80 C114 74 118 68 124 58 Z" fill="${F}"/>`,
    sun: `${[...Array(10)].map((_, i) => `<rect x="75" y="16" width="10" height="24" rx="5" fill="${F}" transform="rotate(${i * 36} 80 80)"/>`).join('')}<circle cx="80" cy="80" r="34" fill="${F}" ${rim}/><ellipse cx="68" cy="64" rx="14" ry="8" fill="${L}" transform="rotate(-30 68 64)"/>`,
    jar: `${blob(126, 44, 12)}<rect x="40" y="84" width="80" height="54" rx="14" fill="${F}" ${rim}/><rect x="34" y="56" width="92" height="32" rx="10" fill="${D}"/><rect x="38" y="58" width="84" height="7" rx="3.5" fill="#fff" opacity=".45"/><g fill="#fff" opacity=".9" transform="translate(68 96) scale(.16)"><path d="${BFLY_D}"/></g><path d="M48 92 V128" stroke="${L}" stroke-width="6" stroke-linecap="round"/>`,
    mask: `<g transform="rotate(-10 80 82)"><path d="M80 26 C112 26 124 54 122 84 C120 114 102 138 80 138 C58 138 40 114 38 84 C36 54 48 26 80 26 Z" fill="${F}" ${rim}/><ellipse cx="64" cy="72" rx="11" ry="5.5" fill="#f1eaf3"/><ellipse cx="96" cy="72" rx="11" ry="5.5" fill="#f1eaf3"/><path d="M72 88 Q80 94 88 88" stroke="#fff" stroke-opacity=".7" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M68 110 Q80 118 92 110" stroke="#f1eaf3" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M52 44 C60 34 70 32 78 32" stroke="${L}" stroke-width="6" stroke-linecap="round" fill="none"/></g>`,
    lipstick: `${blob(36, 120, 14)}<g transform="rotate(-14 80 84)"><rect x="58" y="92" width="44" height="50" rx="7" fill="${D}"/><rect x="60" y="82" width="40" height="13" rx="3" fill="#f9c6dc"/><path d="M64 84 V52 Q64 44 70 40 L94 28 Q97 27 96 33 V84 Z" fill="${F}" ${rim}/><path d="M69 80 V52" stroke="${L}" stroke-width="5" stroke-linecap="round"/><path d="M62 98 V136" stroke="#fff" stroke-opacity=".35" stroke-width="4" stroke-linecap="round"/></g>`,
    gift: `<rect x="40" y="76" width="80" height="62" rx="9" fill="${F}" ${rim}/><rect x="34" y="60" width="92" height="22" rx="7" fill="${D}"/><rect x="74" y="60" width="12" height="78" fill="#fff" opacity=".85"/><path d="M80 60 C62 36 44 52 62 60 Z M80 60 C98 36 116 52 98 60 Z" fill="${F}" stroke="#fff" stroke-opacity=".6" stroke-width="2"/><circle cx="80" cy="60" r="6" fill="#fff"/><path d="M46 84 V128" stroke="${L}" stroke-width="6" stroke-linecap="round"/>`
  };
  return `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${defs}</defs><ellipse cx="80" cy="144" rx="46" ry="7" fill="url(#${sh})"/>${art[name] || art.gift}</svg>`;
}

/* ---------- decorative atoms ---------- */
const sparkle = (x: number, y: number, s: number, fill = '#fff', op = 0.9) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -10 C1.2 -1.2 1.2 -1.2 10 0 C1.2 1.2 1.2 1.2 0 10 C-1.2 1.2 -1.2 1.2 -10 0 C-1.2 -1.2 -1.2 -1.2 0 -10 Z" fill="${fill}" opacity="${op}"/>`;
const bfly = (x: number, y: number, s: number, fill = '#fff', op = 1, rot = 0) => `<path d="${BFLY_D}" fill="${fill}" opacity="${op}" transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"/>`;
const orb = (id: string, x: number | string, y: number | string, r: number | string, op = 0.9) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id})" opacity="${op}"/>`;
const orbGrad = (id: string, c: string) => rGrad(id, [[0, '#ffffff', 0.95], [0.25, light(c, 0.5), 0.8], [0.7, c, 0.55], [1, dark(c, 0.2), 0.3]], '.35', '.3', '.7');
const nest = (id: string, x: number, y: number, size: number, o: ProductOpts = {}) => { const p = P(id); return p ? productSvgRaw(p, { x, y, size, shadow: o.shadow !== false, decorative: true, ...o }) : ''; };

const THEMES: Record<string, [string, string, string]> = {
  pink: ['#f7a6c8', '#e0558f', '#b73f86'], peach: ['#ffc7a6', '#f99185', '#ea5f8a'], mint: ['#d9f0e2', '#a8d9c3', '#6fb99f'], lilac: ['#e5d3fb', '#c7a3ef', '#9d6fd6'],
  rose: ['#fde2ec', '#f7c0d6', '#ec94ba'], cream: ['#fbf1e6', '#f4e0cc', '#e9c9ab'], blue: ['#e1eefb', '#bcd8f4', '#8fb8e6'], plum: ['#3e1636', '#6b2156', '#a2346f']
};
function sceneBg(w: number, h: number, key: string, seed: string) {
  const [a, b, c] = THEMES[key] || THEMES.pink;
  const g = uid(), r1 = uid(), r2 = uid();
  const rand = rng(seed);
  const defs = `<linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".55" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>` + rGrad(r1, [[0, '#ffffff', 0.7], [1, '#ffffff', 0]]) + rGrad(r2, [[0, c, 0.6], [1, c, 0]]);
  let el = `<rect width="${w}" height="${h}" fill="url(#${g})"/><circle cx="${w * 0.72}" cy="${h * 0.38}" r="${h * 0.55}" fill="url(#${r1})"/><circle cx="${w * 0.08}" cy="${h * 0.95}" r="${h * 0.5}" fill="url(#${r2})"/>`;
  for (let i = 0; i < 5; i++) {
    const x = w * (0.1 + rand() * 0.85), y = h * (0.08 + rand() * 0.84), s = 0.6 + rand() * 1.1;
    el += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${(46 * s).toFixed(0)}" height="${(46 * s).toFixed(0)}" rx="${(12 * s).toFixed(0)}" fill="#fff" opacity="${(0.06 + rand() * 0.1).toFixed(2)}" transform="rotate(${(rand() * 60 - 30).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`;
  }
  return { defs, el };
}
const svgWrap = (w: number, h: number, defs: string, el: string, par = 'xMidYMid slice') => `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="${par}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${defs}</defs>${el}</svg>`;

/* hero compositions (HTML, positioned in % of .hero__art) */
const place = (html: string, l: number, t: number, w: number, r = 0, cls = '', z = 1) => `<div class="${cls}" style="left:${l}%;top:${t}%;width:${w}%;z-index:${z};${r ? `transform:rotate(${r}deg);` : ''}">${html}</div>`;
const pill = (big: string, small: string, cls = '') => `<div class="glass-pill ${cls}"><span class="glass-pill__big">${big}</span><span class="glass-pill__small">${small}</span></div>`;
const prodEl = (id: string, o: ProductOpts = {}) => { const p = P(id); return p ? productSvgRaw(p, { shadow: false, decorative: true, ...o }) : ''; };
const bflyEl = (cls = 'bfly-deco flap') => `<svg class="${cls}" viewBox="-1 0 157 156" aria-hidden="true"><path d="${BFLY_D}"/></svg>`;
const glow = (c: string, op = 0.8) => `<div class="orb" style="aspect-ratio:1;background:radial-gradient(circle at 35% 30%, #fff 0%, ${c} 38%, transparent 70%);opacity:${op};filter:blur(2px)"></div>`;
const bubble = '<div class="orb" style="aspect-ratio:1;background:radial-gradient(circle at 32% 28%,#fff 0,rgba(255,255,255,.4) 22%,rgba(255,180,220,.15) 60%,transparent 70%);border:1px solid rgba(255,255,255,.35)"></div>';

function heroRaw(id: string) {
  if (id === 'promo') {
    return place(glow('rgba(255,210,230,.9)', 0.55), 30, -10, 60) + place(prodEl('banila-clean-it-zero'), 30, 22, 34, -6, 'prod float-b', 2) + place(prodEl('medicube-pdrn-serum'), 52, -6, 32, 4, 'prod float-a', 3) +
      place(prodEl('medicube-collagen-mask'), 70, 16, 30, 14, 'prod float-c', 2) + place(pill('−10%', 'от 350 смн', 'glass-pill--sm'), 6, 4, 0, -8, 'float-c', 4) + place(pill('−15%', 'от 700 смн'), 0, 46, 0, 7, 'float-a', 4) +
      place(pill('−20%', 'от 1 200 смн'), 46, 70, 0, -5, 'float-b', 5) + place(bflyEl(), 26, 8, 7, -12, '', 6) + place(bflyEl(), 90, 4, 5, 18, '', 6);
  }
  if (id === 'glass') {
    return place(glow('rgba(236,110,175,.9)', 0.5), 22, -14, 70) + place(prodEl('numbuzin-no3'), 18, 18, 30, -8, 'prod float-b', 2) + place(prodEl('medicube-pdrn-serum'), 38, 0, 38, 0, 'prod float-a', 3) +
      place(prodEl('torriden-dive-in-serum'), 64, 16, 30, 9, 'prod float-c', 2) + place(bubble, 8, 58, 10, 0, 'float-a', 4) + place(bubble, 88, 8, 7, 0, 'float-c', 4) +
      place(pill('PDRN', 'новые сыворотки', 'glass-pill--sm'), 60, 72, 0, -6, 'float-b', 5) + place(bflyEl(), 30, 70, 6, -10, '', 6);
  }
  if (id === 'spf') {
    return place('<div class="orb" style="aspect-ratio:1;background:radial-gradient(circle at 50% 50%,#fffdf4 0,#ffeccb 38%,rgba(255,214,170,.55) 62%,transparent 72%)"></div>', 34, -18, 58) +
      place(prodEl('boj-relief-sun'), 24, 12, 32, -10, 'prod float-a', 3) + place(prodEl('skin1004-sun-serum'), 46, 4, 30, 6, 'prod float-b', 2) + place(prodEl('isntree-sun-gel'), 66, 20, 28, 16, 'prod float-c', 3) +
      place(pill('SPF 50+', 'без белого следа'), 4, 58, 0, -7, 'float-b', 5) + place(bflyEl('bfly-deco bfly-deco--brand flap'), 84, 70, 6, 12, '', 6);
  }
  return place(glow('rgba(255,255,255,.95)', 0.55), 26, -12, 64) + place(prodEl('ks-glass-skin-set'), 28, 8, 40, -4, 'prod float-a', 3) + place(prodEl('ks-mini-routine'), 62, 30, 30, 8, 'prod float-b', 2) +
    place(prodEl('ks-giftcard', { amount: '500 смн' }), 2, 44, 34, -8, 'prod float-c', 4) + place(bflyEl('bfly-deco bfly-deco--brand flap'), 70, 4, 8, 14, '', 6) + place(bflyEl('bfly-deco bfly-deco--brand flap'), 18, 10, 5, -16, '', 6);
}

function promoRaw(id: string) {
  const W = 1020, H = 540;
  const key = ({ p1: 'pink', p2: 'peach', p3: 'mint', p4: 'lilac', p5: 'cream', p6: 'blue' } as Record<string, string>)[id] || 'pink';
  const bg = sceneBg(W, H, key, id);
  let defs = bg.defs, el = bg.el;
  const og = uid();
  defs += orbGrad(og, THEMES[key][1]);
  if (id === 'p1') el += orb(og, 690, 170, 120, 0.8) + nest('medicube-pdrn-serum', 600, 60, 300) + nest('banila-clean-it-zero', 520, 210, 250) + nest('medicube-collagen-mask', 760, 150, 250) + bfly(840, 60, 0.42, '#fff', 0.95, 14) + sparkle(560, 90, 1.6) + sparkle(930, 330, 1.2);
  else if (id === 'p2') { const sg = uid(); defs += rGrad(sg, [[0, '#fffbe8', 1], [0.5, '#ffe2a8', 0.9], [1, '#ffcf99', 0]]); el += `<circle cx="760" cy="200" r="190" fill="url(#${sg})"/>` + nest('skin1004-sun-serum', 560, 110, 280) + nest('roundlab-birch-sun', 700, 140, 290) + nest('isntree-sun-gel', 820, 210, 220) + sparkle(600, 80, 1.4) + sparkle(950, 110, 1); }
  else if (id === 'p3') { const m = P('abib-heartleaf-mask'); el += (m ? `<g transform="translate(590 60)">${inner(m)}</g>` : '') + nest('mediheal-teatree-mask', 740, 90, 330) + bfly(900, 70, 0.34, '#fff', 0.9, -10) + sparkle(610, 420, 1.4); }
  else if (id === 'p4') el += nest('ks-mini-routine', 560, 100, 330) + nest('ks-glass-skin-set', 730, 70, 330) + bfly(610, 70, 0.4, '#fff', 0.95, -12) + bfly(930, 360, 0.28, '#fff', 0.9, 20) + sparkle(900, 80, 1.5);
  else if (id === 'p5') {
    const rand = rng('p5');
    for (let i = 0; i < 22; i++) { const x = 520 + rand() * 480, y = 430 + rand() * 90; el += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="4" ry="9" fill="#fffaf0" opacity=".9" transform="rotate(${(rand() * 180).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`; }
    el += orb(og, 640, 140, 70, 0.6) + nest('boj-ginseng-water', 540, 80, 290) + nest('boj-dynasty-cream', 700, 190, 250) + nest('boj-glow-serum', 800, 60, 270) + sparkle(600, 70, 1.4) + bfly(930, 330, 0.3, '#fff', 0.9, 16);
  } else el += orb(og, 600, 120, 46, 0.8) + orb(og, 930, 380, 34, 0.8) + orb(og, 560, 400, 22, 0.8) + nest('laneige-water-bank', 540, 170, 260) + nest('torriden-dive-in-serum', 670, 50, 320) + nest('torriden-soothing-cream', 810, 170, 250) + sparkle(900, 90, 1.5) + bfly(570, 60, 0.32, '#fff', 0.95, -10);
  return svgWrap(W, H, defs, el);
}

function storyRaw(story: Story, frame = 0) {
  const W = 300, H = 450;
  const [c1, c2] = story.palette;
  const g = uid(), r = uid(), og = uid();
  let defs = `<linearGradient id="${g}" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="${light(c1, 0.2)}"/><stop offset=".6" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>` + rGrad(r, [[0, '#fff', 0.8], [1, '#fff', 0]]) + orbGrad(og, c2);
  let el = `<rect width="${W}" height="${H}" fill="url(#${g})"/><circle cx="${frame === 1 ? 90 : 190}" cy="170" r="170" fill="url(#${r})"/>`;
  const rand = rng(story.id + frame);
  for (let i = 0; i < 6; i++) el += orb(og, (rand() * W).toFixed(0), (rand() * H * 0.8).toFixed(0), (8 + rand() * 22).toFixed(0), 0.55);
  const ids = story.products;
  if (ids.length > 1) el += nest(ids[0], 10, 90, 210, { shadow: false }) + nest(ids[1], 100, 140, 200, { shadow: false });
  else {
    const p = P(ids[0]);
    const vi = p?.variants ? Math.min(frame * 2, p.variants.length - 1) : -1;
    const variant = p && vi >= 0 ? p.variants![vi].color : undefined;
    el += `<g transform="rotate(${frame === 1 ? -8 : 0} 150 220)">${nest(ids[0], frame === 1 ? 60 : 15, 70, frame === 2 ? 250 : 270, { shadow: false, variant })}</g>`;
    if (frame === 1 && p) { const t = texture(textureKind(p), p.art.liquid || variant || p.art.c, 90, 330, 0.7); defs += t.defs; el += t.el; }
  }
  el += bfly(220, 40, 0.24, '#fff', 0.9, 16) + sparkle(40, 60, 1.2) + sparkle(260, 300, 0.9);
  return svgWrap(W, H, defs, el);
}

function journalRaw(theme: string, w = 1340, h = 470) {
  let defs = '', el = '';
  const podium = (x: number, y: number, rw: number, c: string) => { const gg = uid(); defs += cyl(gg, c, 0.4); return `<rect x="${x - rw}" y="${y}" width="${rw * 2}" height="${h - y}" fill="url(#${gg})"/><ellipse cx="${x}" cy="${y}" rx="${rw}" ry="${rw * 0.18}" fill="${light(c, 0.35)}"/>`; };
  if (theme === 'routine') {
    const bg = sceneBg(w, h, 'pink', 'routine');
    defs += bg.defs;
    el += bg.el + `<path d="M${w * 0.55} ${h} V${h * 0.35} A${h * 0.3} ${h * 0.3} 0 0 1 ${w * 0.55 + h * 0.6} ${h * 0.35} V${h} Z" fill="#fff" opacity=".35"/>`;
    el += podium(w * 0.62, h * 0.74, h * 0.16, '#f7d3e2') + podium(w * 0.78, h * 0.66, h * 0.18, '#fbe4ee') + podium(w * 0.92, h * 0.8, h * 0.14, '#f3c3d8');
    el += nest('anua-heartleaf-toner', w * 0.62 - h * 0.25, h * 0.26, h * 0.5) + nest('torriden-dive-in-serum', w * 0.78 - h * 0.27, h * 0.14, h * 0.54) + nest('cosrx-snail-cream', w * 0.92 - h * 0.22, h * 0.38, h * 0.44) + bfly(w * 0.5, h * 0.12, h * 0.0019, '#fff', 0.9, -10);
  } else if (theme === 'pdrn') {
    const bg = sceneBg(w, h, 'pink', 'pdrn');
    const og = uid();
    defs += bg.defs + orbGrad(og, '#e0558f');
    el += bg.el;
    for (let i = 0; i < 9; i++) { const y = h * 0.1 + i * h * 0.1, x = w * 0.3 + Math.sin(i * 0.8) * h * 0.14; el += `<line x1="${x}" y1="${y}" x2="${w * 0.6 - (x - w * 0.3)}" y2="${y}" stroke="#fff" stroke-opacity=".35" stroke-width="3"/>` + orb(og, x, y, h * 0.035, 0.95) + orb(og, w * 0.6 - (x - w * 0.3), y, h * 0.035, 0.95); }
    el += nest('medicube-pdrn-serum', w * 0.55, h * 0.1, h * 0.85);
  } else if (theme === 'spf') {
    const bg = sceneBg(w, h, 'peach', 'spf');
    const sg = uid();
    defs += bg.defs + rGrad(sg, [[0, '#fffbe8', 1], [0.5, '#ffe2a8', 0.9], [1, '#ffcf99', 0]]);
    el += bg.el + `<circle cx="${w * 0.72}" cy="${h * 0.3}" r="${h * 0.4}" fill="url(#${sg})"/><g opacity=".16" fill="#7a2a3a">${[0, 1, 2, 3, 4].map((i) => `<path d="M${w * 0.1 + i * 40} ${h} C${w * 0.18 + i * 30} ${h * 0.6} ${w * 0.3} ${h * 0.4} ${w * 0.42 + i * 12} ${h * 0.3} C${w * 0.3} ${h * 0.5} ${w * 0.22} ${h * 0.7} ${w * 0.16 + i * 40} ${h} Z"/>`).join('')}</g>`;
    el += nest('boj-relief-sun', w * 0.52, h * 0.16, h * 0.78) + nest('isntree-sun-gel', w * 0.68, h * 0.24, h * 0.7);
  } else if (theme === 'oil') {
    const bg = sceneBg(w, h, 'cream', 'oil');
    const og = uid();
    defs += bg.defs + orbGrad(og, '#e9b949');
    el += bg.el;
    const rand = rng('oil');
    for (let i = 0; i < 14; i++) el += orb(og, w * (0.3 + rand() * 0.65), h * rand(), h * (0.02 + rand() * 0.07), 0.85);
    el += nest('anua-cleansing-oil', w * 0.56, h * 0.08, h * 0.86) + nest('heimish-clean-balm', w * 0.74, h * 0.32, h * 0.62);
  } else {
    const g = uid();
    defs += `<linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f9cfe0"/><stop offset=".5" stop-color="#e86aa3"/><stop offset="1" stop-color="#9c3a8f"/></linearGradient>`;
    el += `<rect width="${w}" height="${h}" fill="url(#${g})"/><path d="M${w * 0.42} ${h} V${h * 0.3} A${h * 0.35} ${h * 0.35} 0 0 1 ${w * 0.42 + h * 0.7} ${h * 0.3} V${h} Z" fill="#fff" opacity=".22"/>`;
    const rand = rng('store');
    const cols = ['#fff', '#fde2ec', '#f9b8d3', '#f3e6d4', '#d9e8f7', '#e5d3fb'];
    for (let s = 0; s < 4; s++) {
      const y = h * (0.22 + s * 0.2);
      el += `<rect x="${w * 0.62}" y="${y}" width="${w * 0.36}" height="${h * 0.02}" rx="4" fill="#fff" opacity=".65"/>`;
      for (let i = 0; i < 14; i++) { const bw = w * (0.012 + rand() * 0.01), bh = h * (0.06 + rand() * 0.08); el += `<rect x="${w * 0.63 + i * w * 0.025}" y="${y - bh}" width="${bw}" height="${bh}" rx="3" fill="${cols[Math.floor(rand() * 6)]}" opacity=".95"/>`; }
    }
    el += `<path d="${BFLY_D}" fill="none" stroke="#fff" stroke-width="5" opacity=".95" transform="translate(${w * 0.42 + h * 0.2} ${h * 0.34}) scale(${h * 0.0019})" style="filter:drop-shadow(0 0 12px #fff)"/>`;
  }
  return svgWrap(w, h, defs, el);
}

function collectionRaw(id: string) {
  const c = COLLECTIONS.find((x) => x.id === id) || COLLECTIONS[0];
  const W = 1000, H = 560;
  const bg = sceneBg(W, H, c.theme, c.id);
  const og = uid();
  let defs = bg.defs + orbGrad(og, THEMES[c.theme]?.[1] || '#e0558f'), el = bg.el;
  const podium = (x: number, y: number, rw: number, col: string) => { const gg = uid(); defs += cyl(gg, col, 0.4); return `<rect x="${x - rw}" y="${y}" width="${rw * 2}" height="${H - y}" fill="url(#${gg})"/><ellipse cx="${x}" cy="${y}" rx="${rw}" ry="${rw * 0.2}" fill="${light(col, 0.4)}"/>`; };
  const [a, b, d] = c.art;
  const tint = THEMES[c.theme]?.[0] || '#fde2ec';
  el += podium(560, 430, 104, light(tint, 0.35)) + podium(760, 380, 116, light(tint, 0.55)) + podium(920, 456, 86, light(tint, 0.2));
  el += orb(og, 470, 160, 30, 0.7) + orb(og, 930, 120, 22, 0.7);
  el += nest(b, 590, 34, 340) + nest(a, 404, 156, 300) + nest(d, 812, 196, 270) + bfly(470, 70, 0.34, '#fff', 0.95, -12) + sparkle(940, 290, 1.4) + sparkle(380, 400, 1.1);
  return svgWrap(W, H, defs, el, 'xMaxYMid slice');
}

/* Bloggers are drawn as silhouettes in their own palette: no real person's face is attached to placeholder picks. */
const HAIR: Record<Blogger['look']['style'], { back: string; extra?: string }> = {
  long: { back: 'M168 240 C158 150 214 116 262 116 C318 116 364 156 352 248 C348 330 372 420 400 500 C352 522 318 472 312 424 L208 424 C200 472 168 522 120 500 C148 420 172 330 168 240 Z' },
  bun: { back: 'M176 248 C168 168 214 128 262 128 C312 128 354 168 344 248 C336 214 312 186 262 184 C212 186 186 214 176 248 Z', extra: '<circle cx="262" cy="104" r="44"/>' },
  wavy: { back: 'M160 250 C140 170 200 106 264 108 C334 110 388 170 366 252 C386 300 360 340 382 382 C398 422 370 462 340 474 C344 432 322 412 318 384 L204 384 C200 412 178 432 182 474 C150 462 124 422 140 382 C160 340 136 300 160 250 Z' },
  bob: { back: 'M168 254 C158 168 214 122 262 122 C312 122 366 168 354 254 C352 300 360 332 368 354 C332 364 312 344 306 322 L218 322 C212 344 192 364 154 354 C162 332 170 300 168 254 Z' }
};

function bloggerRaw(id: string) {
  const b = BLOGGERS.find((x) => x.id === id) || BLOGGERS[0];
  const { style, outfit, bg: [b1, b2], accent } = b.look;
  const W = 520, H = 640;
  const gb = uid(), gs = uid(), gg = uid();
  const ink = mix(dark(outfit, 0.45), '#24121f', 0.45);
  const defs = `<linearGradient id="${gb}" x1="0" y1="0" x2=".7" y2="1"><stop offset="0" stop-color="${b1}"/><stop offset="1" stop-color="${b2}"/></linearGradient>` +
    `<linearGradient id="${gs}" gradientUnits="userSpaceOnUse" x1="0" y1="90" x2="0" y2="${H}"><stop offset="0" stop-color="${mix(ink, b2, 0.3)}"/><stop offset=".55" stop-color="${ink}"/><stop offset="1" stop-color="${dark(ink, 0.25)}"/></linearGradient>` +
    rGrad(gg, [[0, '#fff', 0.9], [1, '#fff', 0]]);
  const hs = HAIR[style];
  let el = `<rect width="${W}" height="${H}" fill="url(#${gb})"/><circle cx="262" cy="250" r="210" fill="url(#${gg})" opacity=".8"/>`;
  el += `<circle cx="262" cy="250" r="176" fill="none" stroke="${accent === '#ffffff' ? '#fff' : accent}" stroke-opacity=".45" stroke-width="1.5"/>`;
  // one shape: hair, head, neck and shoulders
  el += `<g fill="url(#${gs})">${hs.extra || ''}<path d="${hs.back}"/>` +
    `<ellipse cx="181" cy="262" rx="13" ry="21"/><ellipse cx="339" cy="262" rx="13" ry="21"/>` +
    `<path d="M260 150 C313 150 341 192 341 246 C341 302 312 348 260 354 C208 348 179 302 179 246 C179 192 207 150 260 150 Z"/>` +
    `<path d="M233 318 L287 318 Q289 394 326 448 L194 448 Q231 394 233 318 Z"/>` +
    `<path d="M58 ${H} C62 540 110 474 190 452 C214 446 230 432 236 418 L284 418 C290 432 306 446 330 452 C410 474 458 540 462 ${H} Z"/></g>`;
  el += bfly(398, 92, 0.3, '#fff', 0.9, 14) + sparkle(112, 150, 1.3) + sparkle(430, 300, 0.9);
  return svgWrap(W, H, defs, el);
}

function spotlightRaw() {
  const W = 720, H = 420;
  const g = uid(), sg = uid();
  const defs = `<linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7e9d7"/><stop offset=".6" stop-color="#eed2bd"/><stop offset="1" stop-color="#d9a98e"/></linearGradient>` + rGrad(sg, [[0, '#fff3dc', 1], [0.6, '#f6d7a9', 0.8], [1, '#f6d7a9', 0]]);
  let el = `<rect width="${W}" height="${H}" fill="url(#${g})"/><circle cx="${W * 0.62}" cy="${H * 0.36}" r="${H * 0.4}" fill="url(#${sg})"/><path d="M0 ${H * 0.78} C${W * 0.3} ${H * 0.7} ${W * 0.7} ${H * 0.72} ${W} ${H * 0.66} V${H} H0 Z" fill="#fff" opacity=".35"/>`;
  const rand = rng('rice');
  for (let i = 0; i < 26; i++) { const x = W * rand(), y = H * (0.8 + rand() * 0.18); el += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="3" ry="7" fill="#fffaf0" transform="rotate(${(rand() * 180).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`; }
  el += nest('boj-ginseng-water', 110, 40, 300) + nest('boj-glow-serum', 280, 90, 260) + nest('boj-relief-sun', 420, 60, 290) + bfly(90, 60, 0.3, '#fff', 0.9, -14);
  return svgWrap(W, H, defs, el);
}

function stripRaw() {
  const og = uid();
  const el = orb(og, 70, 130, 60, 0.6) + orb(og, 400, 40, 34, 0.7) + nest('medicube-pdrn-serum', 70, -10, 200, { shadow: false }) + nest('medicube-collagen-mask', 210, 0, 190, { shadow: false }) + nest('medicube-zero-pad', 300, 20, 170, { shadow: false }) + bfly(40, 20, 0.2, '#fff', 0.95, -12);
  return svgWrap(460, 180, orbGrad(og, '#e0558f'), el, 'xMidYMid meet');
}

function giftcardsRaw() {
  const gc = P('ks-giftcard');
  const cubes = uid();
  const defs = `<linearGradient id="${cubes}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity=".05"/></linearGradient>`;
  let el = `<rect x="470" y="30" width="120" height="120" rx="22" fill="url(#${cubes})" stroke="#fff" stroke-opacity=".5" transform="rotate(18 530 90)"/><rect x="60" y="330" width="80" height="80" rx="16" fill="url(#${cubes})" stroke="#fff" stroke-opacity=".4" transform="rotate(-14 100 370)"/>`;
  if (gc) el += productSvgRaw(gc, { x: 70, y: 20, size: 560, shadow: false, decorative: true, amount: '1 000 смн' });
  el += bfly(560, 330, 0.5, '#fff', 0.95, 16) + sparkle(120, 90, 2);
  return svgWrap(670, 470, defs, el, 'xMidYMid meet');
}

function giftcardPreviewRaw(amount: string) {
  const W = 480, H = 300;
  const g = uid(), gs = uid();
  const defs = `<linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f07db4"/><stop offset=".55" stop-color="#dd4487"/><stop offset="1" stop-color="#a83b8b"/></linearGradient><linearGradient id="${gs}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".4"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
  const el = `<rect width="${W}" height="${H}" fill="url(#${g})"/><path d="M0 90 L300 0 L400 0 L0 140 Z" fill="url(#${gs})" opacity=".5"/><g fill="#fff" transform="translate(34 30) scale(.13)"><path d="${MARK_D}"/></g>` + bfly(380, 30, 0.42, '#fff', 0.9, 12) +
    txt(amount, W - 34, H - 40, { size: 64, weight: 500, fill: '#fff', family: 'serif', anchor: 'end', max: 360 }) + txt('KOREA SECRET · GIFT CARD', 34, 122, { size: 11, weight: 600, ls: 0.16, fill: '#fff', anchor: 'start', opacity: 0.85 });
  return svgWrap(W, H, defs, el);
}

function ingredientRaw(key: IngredientKey) {
  const ing = INGREDIENTS[key];
  const bgG = uid();
  const gl = glyph(ing.glyph, dark(ing.tint, 0.28), 1.25, 80, 80);
  const defs = rGrad(bgG, [[0, light(ing.tint, 0.6)], [1, ing.tint]], '.4', '.3', '.9') + gl.defs;
  return `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${defs}</defs><rect width="160" height="160" fill="url(#${bgG})"/>${sparkle(128, 32, 1.1, '#fff', 0.9)}${gl.el}</svg>`;
}

function megaPromoRaw(i: number) {
  const bg = sceneBg(640, 360, i === 0 ? 'peach' : 'pink', 'mega' + i);
  const el = bg.el + (i === 0 ? nest('isntree-sun-gel', 150, 40, 300) + nest('boj-relief-sun', 330, 30, 310) : nest('medicube-pdrn-serum', 160, 20, 330) + nest('medicube-collagen-mask', 340, 40, 300));
  return svgWrap(640, 360, bg.defs, el);
}

function pageHeroRaw(ids: string[]) {
  const W = 720, H = 420;
  const og = uid(), r = uid();
  const defs = orbGrad(og, '#f1a8c9') + rGrad(r, [[0, '#fff', 0.9], [1, '#fff', 0]]);
  let el = `<circle cx="${W * 0.55}" cy="${H * 0.5}" r="${H * 0.46}" fill="url(#${r})"/>` + orb(og, W * 0.2, H * 0.3, 24, 0.6) + orb(og, W * 0.88, H * 0.2, 16, 0.6) + orb(og, W * 0.8, H * 0.8, 30, 0.5);
  const pos: [number, number, number][] = [[W * 0.42, 70, 290], [W * 0.62, 30, 330], [W * 0.82, 90, 270]];
  ids.slice(0, 3).forEach((id, k) => { const [x, y, s] = pos[k]; el += nest(id, x - s / 2, y, s); });
  el += bfly(W * 0.28, 40, 0.3, '#dd4487', 0.85, -12);
  return svgWrap(W, H, defs, el, 'xMaxYMid meet');
}

function seoRaw() {
  const W = 460, H = 520;
  const og = uid(), g = uid();
  const defs = orbGrad(og, '#f1a8c9') + `<linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fdf2f7"/><stop offset="1" stop-color="#f8d3e4"/></linearGradient>`;
  const el = `<rect width="${W}" height="${H}" fill="url(#${g})"/><g fill="#dd4487" transform="translate(120 110) scale(.5)"><path d="${MARK_D}"/></g>` + orb(og, 90, 420, 40, 0.7) + orb(og, 380, 120, 28, 0.7) + sparkle(380, 420, 2, '#fff');
  return svgWrap(W, H, defs, el);
}

function emptyRaw(kind: 'bag' | 'heart' | 'search') {
  const bodies = {
    bag: '<path d="M44 58 H116 L122 128 Q123 138 113 138 H47 Q37 138 38 128 Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M62 60 C62 36 98 36 98 60" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
    heart: '<path d="M80 134 C40 106 26 84 26 64 C26 46 40 34 56 34 C66 34 75 40 80 48 C85 40 94 34 104 34 C120 34 134 46 134 64 C134 84 120 106 80 134 Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>',
    search: '<circle cx="72" cy="72" r="34" fill="none" stroke="currentColor" stroke-width="3"/><path d="M98 98 L126 126" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>'
  };
  return `<svg viewBox="0 0 160 160" aria-hidden="true">${bodies[kind]}<path d="${BFLY_D}" fill="currentColor" transform="translate(104 12) scale(.26) rotate(10)"/></svg>`;
}

/* ---------- public API (each call gets its own id scope) ---------- */
export type ArtSpecInput =
  | { kind: 'product'; id: string; variant?: string; amount?: string; shadow?: boolean; decorative?: boolean }
  | { kind: 'gallery'; id: string; view: GalleryView; variant?: string; amount?: string }
  | { kind: 'icon'; name: string }
  | { kind: 'hero'; id: string }
  | { kind: 'promo'; id: string }
  | { kind: 'story'; index: number; frame: number }
  | { kind: 'journal'; theme: string; w?: number; h?: number }
  | { kind: 'collection'; id: string }
  | { kind: 'blogger'; id: string }
  | { kind: 'spotlight' } | { kind: 'strip' } | { kind: 'giftcards' } | { kind: 'seo' }
  | { kind: 'giftcardPreview'; amount: string }
  | { kind: 'ingredient'; key: IngredientKey }
  | { kind: 'megaPromo'; index: number }
  | { kind: 'pageHero'; ids: string[] }
  | { kind: 'empty'; type: 'bag' | 'heart' | 'search' };

export function renderArt(spec: ArtSpecInput, prefix: string): string {
  return scoped(prefix, () => {
    switch (spec.kind) {
      case 'product': { const p = P(spec.id); return p ? productSvgRaw(p, { variant: spec.variant, amount: spec.amount, shadow: spec.shadow, decorative: spec.decorative ?? true }) : ''; }
      case 'gallery': { const p = P(spec.id); return p ? galleryRaw(p, spec.view, { variant: spec.variant, amount: spec.amount }) : ''; }
      case 'icon': return iconRaw(spec.name);
      case 'hero': return heroRaw(spec.id);
      case 'promo': return promoRaw(spec.id);
      case 'story': return STORIES[spec.index] ? storyRaw(STORIES[spec.index], spec.frame) : '';
      case 'journal': return journalRaw(spec.theme, spec.w, spec.h);
      case 'collection': return collectionRaw(spec.id);
      case 'blogger': return bloggerRaw(spec.id);
      case 'spotlight': return spotlightRaw();
      case 'strip': return stripRaw();
      case 'giftcards': return giftcardsRaw();
      case 'seo': return seoRaw();
      case 'giftcardPreview': return giftcardPreviewRaw(spec.amount);
      case 'ingredient': return ingredientRaw(spec.key);
      case 'megaPromo': return megaPromoRaw(spec.index);
      case 'pageHero': return pageHeroRaw(spec.ids);
      case 'empty': return emptyRaw(spec.type);
    }
  });
}
