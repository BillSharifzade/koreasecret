'use client';
import { useSyncExternalStore } from 'react';
import { getProduct } from './shop';
import type { CartItem } from './types';

/* Client-side shop state persisted to localStorage. Server renders always see EMPTY. */
export interface ShopState {
  cart: CartItem[];
  fav: string[];
  promo: string;
  city: string;
  cookie: boolean;
  recent: string[];
}

const EMPTY: ShopState = { cart: [], fav: [], promo: '', city: '', cookie: true, recent: [] };
const KEY = 'ks.state.v2';

let state: ShopState = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function read(): ShopState {
  try {
    const raw = window.localStorage.getItem(KEY);
    const s = raw ? (JSON.parse(raw) as Partial<ShopState>) : {};
    return {
      cart: (s.cart || []).filter((it) => getProduct(it.id) && it.q > 0),
      fav: (s.fav || []).filter((id) => getProduct(id)),
      promo: s.promo || '',
      city: s.city || '',
      cookie: !!s.cookie,
      recent: (s.recent || []).filter((id) => getProduct(id))
    };
  } catch {
    return { ...EMPTY, cookie: false };
  }
}
function ensure() {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  state = read();
  window.addEventListener('storage', (e) => { if (e.key === KEY) { state = read(); emit(); } });
}
function emit() { listeners.forEach((l) => l()); }
function persist() { try { window.localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage unavailable */ } }
function set(patch: Partial<ShopState>) { ensure(); state = { ...state, ...patch }; persist(); emit(); }

export const shop = {
  get: () => { ensure(); return state; },
  subscribe(fn: () => void) { ensure(); listeners.add(fn); return () => { listeners.delete(fn); }; },
  qty: (id: string, v = 0) => shop.get().cart.find((x) => x.id === id && x.v === v)?.q ?? 0,
  add(id: string, v = 0, q = 1) {
    const cart = shop.get().cart.slice();
    const i = cart.findIndex((x) => x.id === id && x.v === v);
    if (i >= 0) cart[i] = { ...cart[i], q: Math.min(99, cart[i].q + q) };
    else cart.push({ id, v, q });
    set({ cart });
  },
  setQty(id: string, v: number, q: number) {
    let cart = shop.get().cart.slice();
    const i = cart.findIndex((x) => x.id === id && x.v === v);
    if (i < 0) { if (q > 0) cart.push({ id, v, q }); }
    else if (q <= 0) cart = cart.filter((_, k) => k !== i);
    else cart[i] = { ...cart[i], q: Math.min(99, q) };
    set({ cart });
  },
  remove(id: string, v: number) { set({ cart: shop.get().cart.filter((x) => !(x.id === id && x.v === v)) }); },
  clearCart() { set({ cart: [], promo: '' }); },
  toggleFav(id: string) { const f = shop.get().fav; const on = !f.includes(id); set({ fav: on ? [...f, id] : f.filter((x) => x !== id) }); return on; },
  setPromo(promo: string) { set({ promo }); },
  setCity(city: string) { set({ city }); },
  acceptCookies() { set({ cookie: true }); },
  viewed(id: string) { set({ recent: [id, ...shop.get().recent.filter((x) => x !== id)].slice(0, 12) }); }
};

export function useShop<T>(select: (s: ShopState) => T): T {
  return useSyncExternalStore(shop.subscribe, () => select(shop.get()), () => select(EMPTY));
}
