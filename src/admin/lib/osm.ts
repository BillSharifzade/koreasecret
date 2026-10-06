/* OpenStreetMap helpers for the stores editor: address search (Nominatim) and a small static map composed from the
   standard tiles in the browser. Both run only on an explicit click, which keeps within the OSM usage policies. */

export interface GeoResult { lat: number; lon: number; label: string; type: string }

/** Address → candidates (Tajikistan first, in Russian). */
export async function geocode(q: string): Promise<GeoResult[]> {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=tj&accept-language=ru&q=${encodeURIComponent(q)}`;
  let res: Response;
  try { res = await fetch(url, { headers: { Accept: 'application/json' } }); }
  catch { throw new Error('Нет связи с сервисом карт'); }
  if (!res.ok) throw new Error(`Сервис карт ответил ${res.status}`);
  const list = (await res.json()) as { lat: string; lon: string; display_name: string; type?: string; addresstype?: string }[];
  return list.map((x) => ({ lat: Number(x.lat), lon: Number(x.lon), label: x.display_name, type: x.addresstype || x.type || '' }));
}

export const TILE = 256;

/** Web-Mercator world pixel of a point at a zoom level. */
export function worldPx(lat: number, lon: number, z: number) {
  const n = 2 ** z;
  const r = (Math.max(-85.05112878, Math.min(85.05112878, lat)) * Math.PI) / 180;
  return { x: ((lon + 180) / 360) * n * TILE, y: ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n * TILE };
}

/** Which tiles cover a w×h image centred on a point, and where each one goes on the canvas. */
export function tilePlan(lat: number, lon: number, z: number, w: number, h: number) {
  const c = worldPx(lat, lon, z);
  const x0 = c.x - w / 2, y0 = c.y - h / 2;
  const n = 2 ** z;
  const tiles: { x: number; y: number; dx: number; dy: number }[] = [];
  for (let ty = Math.floor(y0 / TILE); ty <= Math.floor((y0 + h - 1) / TILE); ty++) {
    if (ty < 0 || ty >= n) continue;
    for (let tx = Math.floor(x0 / TILE); tx <= Math.floor((x0 + w - 1) / TILE); tx++) {
      tiles.push({ x: ((tx % n) + n) % n, y: ty, dx: Math.round(tx * TILE - x0), dy: Math.round(ty * TILE - y0) });
    }
  }
  return tiles;
}

const loadTile = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => resolve(img);
  img.onerror = () => reject(new Error('Не загрузился фрагмент карты'));
  img.src = src;
});

/**
 * A 720×560 map centred on the shop, toned like the shipped maps (soft grey with a hint of the brand pink).
 * The store card draws the pin in the middle and the «© OpenStreetMap» credit over it; `attribution` also burns
 * the credit into the picture for use elsewhere. Returns a WebP (or PNG) blob.
 */
export async function renderMap(lat: number, lon: number, opts: { zoom?: number; w?: number; h?: number; attribution?: boolean } = {}): Promise<Blob> {
  const z = opts.zoom ?? 16, w = opts.w ?? 720, h = opts.h ?? 560;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#f2efe9';
  ctx.fillRect(0, 0, w, h);
  const plan = tilePlan(lat, lon, z, w, h);
  const imgs = await Promise.all(plan.map((t) => loadTile(`https://tile.openstreetmap.org/${z}/${t.x}/${t.y}.png`)));
  ctx.filter = 'grayscale(1) contrast(.92) brightness(1.04)';
  imgs.forEach((img, i) => ctx.drawImage(img, plan[i].dx, plan[i].dy, TILE, TILE));
  ctx.filter = 'none';
  // the pinkish-grey tone of the shipped maps, so the brand pin stands out
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = 'rgba(214, 196, 206, .55)';
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';
  if (opts.attribution) {
    const text = '© OpenStreetMap';
    ctx.font = '500 11px Arial, sans-serif';
    const tw = ctx.measureText(text).width;
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.fillRect(w - tw - 14, h - 20, tw + 10, 16);
    ctx.fillStyle = 'rgba(22,18,21,.7)';
    ctx.fillText(text, w - tw - 9, h - 8);
  }
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.86));
  if (blob) return blob;
  const png = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!png) throw new Error('Не удалось сохранить карту');
  return png;
}
