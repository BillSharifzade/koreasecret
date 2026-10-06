'use client';
import { addPendingUpload } from './store';
import { slugify } from './schema';

/* Pictures are resized and converted in the browser before they are stored, so the repository and the site stay
   light: WebP, at most `max` px on the long side. They wait in IndexedDB until the next publish commits them to
   public/uploads/, and are shown from the local copy until then. */

export interface ImageOpts { max?: number; quality?: number; removeWhite?: boolean; folder?: string }

function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Не получилось прочитать картинку')); };
    img.src = url;
  });
}

/** White (or near-white) background connected to the edges becomes transparent: cut-outs for packshots. */
function knockOutWhite(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const seen = new Uint8Array(w * h);
  const white = (i: number) => d[i * 4 + 3] > 0 && d[i * 4] > 238 && d[i * 4 + 1] > 238 && d[i * 4 + 2] > 238;
  const stack: number[] = [];
  for (let x = 0; x < w; x++) { stack.push(x, (h - 1) * w + x); }
  for (let y = 0; y < h; y++) { stack.push(y * w, y * w + w - 1); }
  while (stack.length) {
    const i = stack.pop()!;
    if (seen[i] || !white(i)) continue;
    seen[i] = 1;
    d[i * 4 + 3] = 0;
    const x = i % w, y = (i / w) | 0;
    if (x > 0) stack.push(i - 1);
    if (x < w - 1) stack.push(i + 1);
    if (y > 0) stack.push(i - w);
    if (y < h - 1) stack.push(i + w);
  }
  // soften the edge: pixels next to the removed area fade a little
  for (let i = 0; i < w * h; i++) {
    if (seen[i]) continue;
    const x = i % w;
    const n = (x > 0 && seen[i - 1]) || (x < w - 1 && seen[i + 1]) || (i >= w && seen[i - w]) || (i < w * h - w && seen[i + w]);
    if (n && d[i * 4] > 220 && d[i * 4 + 1] > 220 && d[i * 4 + 2] > 220) d[i * 4 + 3] = Math.min(d[i * 4 + 3], 120);
  }
  ctx.putImageData(img, 0, 0);
}

export async function processImage(file: Blob, opts: ImageOpts = {}): Promise<{ blob: Blob; width: number; height: number }> {
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    const img = await loadImage(file);
    return { blob: file, width: img.naturalWidth, height: img.naturalHeight };
  }
  const img = await loadImage(file);
  const max = opts.max ?? 1600;
  const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * k)), h = Math.max(1, Math.round(img.naturalHeight * k));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: !!opts.removeWhite })!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, w, h);
  if (opts.removeWhite) knockOutWhite(ctx, w, h);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', opts.quality ?? 0.86));
  if (!blob || blob.type !== 'image/webp') {
    const png = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!png) throw new Error('Браузер не смог сохранить картинку');
    return { blob: png, width: w, height: h };
  }
  return { blob, width: w, height: h };
}

const hash = async (b: Blob) => {
  const buf = await crypto.subtle.digest('SHA-1', await b.arrayBuffer());
  return [...new Uint8Array(buf)].slice(0, 4).map((x) => x.toString(16).padStart(2, '0')).join('');
};

/** Process a picture and queue it for the next publish; returns its future site path (/uploads/…). */
export async function uploadImage(file: File | Blob, name: string, opts: ImageOpts = {}): Promise<string> {
  if (file.size > 25 * 1024 * 1024) throw new Error('Файл больше 25 МБ');
  if (file.type && !file.type.startsWith('image/')) throw new Error('Это не картинка');
  const { blob } = await processImage(file, opts);
  const ext = blob.type === 'image/webp' ? 'webp' : blob.type === 'image/svg+xml' ? 'svg' : blob.type === 'image/gif' ? 'gif' : 'png';
  const base = slugify(name.replace(/\.[a-z0-9]+$/i, ''), 40) || 'image';
  const path = `/uploads/${opts.folder ? opts.folder + '/' : ''}${base}-${await hash(blob)}.${ext}`;
  await addPendingUpload({ path, blob, name, size: blob.size, type: blob.type, addedAt: Date.now() });
  return path;
}

export const fmtBytes = (n: number) => (n < 1024 ? `${n} Б` : n < 1024 * 1024 ? `${(n / 1024).toFixed(0)} КБ` : `${(n / 1024 / 1024).toFixed(1)} МБ`);

/** Every picture path the content uses, with where it is used. */
export function contentImages(c: import('@/lib/types').SiteContent): { path: string; where: string; href: string }[] {
  const out: { path: string; where: string; href: string }[] = [];
  const add = (path: string | undefined, where: string, href: string) => { if (path) out.push({ path, where, href }); };
  c.products.forEach((p) => p.images?.forEach((i) => add(i, `Товар: ${p.name}`, `/admin/products/edit/?id=${p.id}`)));
  c.brands.forEach((b) => add(b.logo, `Бренд: ${b.name}`, `/admin/brands/?id=${b.id}`));
  c.heroSlides.forEach((s) => add(s.image, `Баннер: ${s.kicker}`, `/admin/banners/?id=${s.id}`));
  c.homeCats.forEach((h) => add(h.image, `Плитка: ${h.name}`, '/admin/navigation/?tab=tiles'));
  c.promos.forEach((p) => add(p.image, `Акция: ${p.title}`, `/admin/promos/?id=${p.id}`));
  c.collections.forEach((p) => add(p.image, `Подборка: ${p.title}`, `/admin/collections/?id=${p.id}`));
  c.bloggers.forEach((b) => add(b.avatar, `Блогер: ${b.name}`, `/admin/bloggers/?id=${b.id}`));
  c.articles.forEach((a) => add(a.image, `Статья: ${a.title}`, `/admin/journal/?id=${a.id}`));
  c.stores.forEach((s) => { add(s.photo, `Магазин: ${s.addr}`, `/admin/stores/?id=${s.id}`); add(s.map, `Карта: ${s.addr}`, `/admin/stores/?id=${s.id}`); });
  c.nav.megaPromos.forEach((m) => add(m.image, `Меню: ${m.title}`, '/admin/navigation/?tab=mega'));
  c.home.sections.forEach((s) => { if ('image' in s) add(s.image, 'Главная', `/admin/home/?id=${s.id}`); });
  return out;
}
