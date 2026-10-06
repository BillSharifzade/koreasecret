import { BASE_PATH } from './site';

/* Pictures in the content are site paths (/uploads/…, /stores/…) or absolute URLs. Uploads that are not published yet
   live in the admin's browser; while editing or previewing, `overrides` maps their future path to a local blob URL. */
const overrides = new Map<string, string>();

export function setAssetOverrides(map: Record<string, string>) {
  overrides.clear();
  for (const [k, v] of Object.entries(map)) overrides.set(k, v);
}

/** Resolves a content picture to a URL the browser can load ('' when it is not a safe image source). */
export function asset(src: string | undefined | null): string {
  if (!src) return '';
  const local = overrides.get(src);
  if (local) return local;
  if (/^(https?:\/\/|data:image\/|blob:)/i.test(src)) return src;
  if (src.startsWith('/')) return BASE_PATH + src;
  return '';
}

/** A link from the content as a plain <a href>: site paths get the base path, unsafe schemes are dropped. */
export function href(link: string): string {
  if (!link) return '#';
  if (/^(https?:\/\/|mailto:|tel:|#)/i.test(link)) return link;
  if (link.startsWith('/')) return BASE_PATH + link;
  return '#';
}
