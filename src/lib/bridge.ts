/* The admin panel and the storefront share one origin, so the storefront can preview the admin's unpublished draft:
   the draft and pending uploads sit in IndexedDB, and edits are broadcast to open preview tabs as they happen. */
import type { SiteContent } from './types';

const DB = 'ks-admin';
const STORE = 'kv';
export const CHANNEL = 'ks-admin-draft';
export const PREVIEW_FLAG = 'ks.preview';

export interface PendingUpload { path: string; blob: Blob; name: string; size: number; type: string; addedAt: number }
export type BridgeMessage = { type: 'draft'; content: SiteContent } | { type: 'uploads' } | { type: 'reset' };

let dbp: Promise<IDBDatabase> | null = null;
function db() {
  if (!dbp) {
    dbp = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbp;
}

export async function idbGet<T>(key: string): Promise<T | undefined> {
  try {
    const d = await db();
    return await new Promise<T | undefined>((resolve, reject) => {
      const req = d.transaction(STORE, 'readonly').objectStore(STORE).get(key);
      req.onsuccess = () => resolve(req.result as T | undefined);
      req.onerror = () => reject(req.error);
    });
  } catch { return undefined; }
}

export async function idbSet(key: string, value: unknown): Promise<void> {
  try {
    const d = await db();
    await new Promise<void>((resolve, reject) => {
      const tx = d.transaction(STORE, 'readwrite');
      if (value === undefined) tx.objectStore(STORE).delete(key); else tx.objectStore(STORE).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch { /* private mode: drafts just won't survive a reload */ }
}

export function broadcast(msg: BridgeMessage) {
  try { const ch = new BroadcastChannel(CHANNEL); ch.postMessage(msg); ch.close(); } catch { /* old browsers */ }
}

/** Object URLs for pending uploads, keyed by their future site path. */
export async function uploadUrls(): Promise<Record<string, string>> {
  const list = (await idbGet<PendingUpload[]>('uploads')) || [];
  const out: Record<string, string> = {};
  for (const u of list) out[u.path] = URL.createObjectURL(u.blob);
  return out;
}
