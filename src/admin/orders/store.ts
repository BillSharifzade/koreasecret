'use client';
import { useSyncExternalStore } from 'react';
import { publishedContent } from '@/lib/data';
import { readSiteOrders, SITE_ORDERS_KEY, type Order, type OrderStatus } from '@/lib/orders';
import { generateDemoOrders } from './demo';

/*
 * Orders = checkouts made on the storefront in this browser (localStorage) + an optional demo history.
 * Status changes and manager notes are kept per order in localStorage too; nothing here is published to the
 * repository (orders hold personal data). With a real order API this module is the one place to swap.
 */

export const STATUS: Record<OrderStatus, { label: string; tone: 'blue' | 'brand' | 'amber' | 'green' | 'red' | undefined; icon: string }> = {
  new: { label: 'Новый', tone: 'brand', icon: 'bell' },
  confirmed: { label: 'Подтверждён', tone: 'blue', icon: 'check' },
  packed: { label: 'Собран', tone: 'amber', icon: 'box' },
  shipped: { label: 'В пути', tone: 'amber', icon: 'truck' },
  delivered: { label: 'Выполнен', tone: 'green', icon: 'check-circle' },
  cancelled: { label: 'Отменён', tone: 'red', icon: 'x-circle' }
};
export const FLOW: OrderStatus[] = ['new', 'confirmed', 'packed', 'shipped', 'delivered'];

export interface OrderMeta { status?: OrderStatus; note?: string; history?: { status: OrderStatus; at: string }[] }
export interface OrderView extends Order { note?: string; history: { status: OrderStatus; at: string }[] }

const META_KEY = 'ks.admin.orders.v1';
const DEMO_KEY = 'ks.admin.demo';

let version = 0;
const listeners = new Set<() => void>();
const emit = () => { version++; cache = null; listeners.forEach((l) => l()); };

function readMeta(): Record<string, OrderMeta> {
  try { return JSON.parse(localStorage.getItem(META_KEY) || '{}'); } catch { return {}; }
}
function writeMeta(m: Record<string, OrderMeta>) {
  try { localStorage.setItem(META_KEY, JSON.stringify(m)); } catch { /* full */ }
}
export function demoEnabled() {
  try { return localStorage.getItem(DEMO_KEY) !== 'off'; } catch { return true; }
}
export function setDemoEnabled(on: boolean) {
  try { localStorage.setItem(DEMO_KEY, on ? 'on' : 'off'); } catch { /* ignore */ }
  emit();
}

let demo: { day: string; list: Order[] } | null = null;
let cache: OrderView[] | null = null;

/** All orders, newest first, with manager changes applied. */
export function allOrders(): OrderView[] {
  if (cache) return cache;
  const day = new Date().toDateString();
  if (demoEnabled() && demo?.day !== day) demo = { day, list: generateDemoOrders(publishedContent()) };
  const meta = readMeta();
  const list = [...readSiteOrders(), ...(demoEnabled() ? demo!.list : [])];
  cache = list.map((o) => {
    const m = meta[o.id];
    return { ...o, status: m?.status || o.status, note: m?.note, history: m?.history || [{ status: 'new' as OrderStatus, at: o.createdAt }] };
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return cache;
}

export function subscribeOrders(fn: () => void) {
  listeners.add(fn);
  const onStorage = (e: StorageEvent) => { if (e.key === SITE_ORDERS_KEY || e.key === META_KEY) emit(); };
  window.addEventListener('storage', onStorage);
  return () => { listeners.delete(fn); window.removeEventListener('storage', onStorage); };
}

export function useOrders(): OrderView[] {
  useSyncExternalStore(subscribeOrders, () => version, () => 0);
  return typeof window === 'undefined' ? [] : allOrders();
}

export function setStatus(ids: string[], status: OrderStatus) {
  const meta = readMeta();
  const now = new Date().toISOString();
  const byId = new Map(allOrders().map((o) => [o.id, o]));
  for (const id of ids) {
    const o = byId.get(id);
    if (!o || o.status === status) continue;
    const m = meta[id] || {};
    meta[id] = { ...m, status, history: [...(m.history || o.history), { status, at: now }] };
  }
  writeMeta(meta);
  emit();
}

export function setNote(id: string, note: string) {
  const meta = readMeta();
  meta[id] = { ...meta[id], note };
  writeMeta(meta);
  emit();
}

export const PAYMENT_NAMES: Record<string, string> = { card: 'Картой онлайн', qr: 'QR-код', cash: 'При получении' };
export const DELIVERY_NAMES: Record<string, string> = { courier: 'Курьер', pickup: 'Пункт выдачи', store: 'Из магазина' };
