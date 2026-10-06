/* Orders. The storefront has no backend yet: a checkout is kept in this browser's localStorage, where the admin panel
   (same origin) picks it up next to its demo order history. Swap recordOrder() for an API call when a backend exists. */

export type OrderStatus = 'new' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
export interface OrderItem { id: string; v: number; q: number; name: string; variant?: string; price: number; old?: number; brand: string; type: string }
export interface Order {
  id: string;
  createdAt: string;
  source: 'site' | 'demo';
  status: OrderStatus;
  customer: { name: string; phone: string; email?: string };
  city: string;
  address?: string;
  delivery: string;
  payment: string;
  comment?: string;
  promo?: string;
  items: OrderItem[];
  totals: { sub: number; full: number; savings: number; promo: number; delivery: number; total: number; count: number };
}

export const SITE_ORDERS_KEY = 'ks.orders.v1';

export function readSiteOrders(): Order[] {
  try { return JSON.parse(window.localStorage.getItem(SITE_ORDERS_KEY) || '[]') as Order[]; } catch { return []; }
}

export function recordOrder(order: Order) {
  try {
    const list = readSiteOrders();
    list.unshift(order);
    window.localStorage.setItem(SITE_ORDERS_KEY, JSON.stringify(list.slice(0, 300)));
  } catch { /* storage unavailable */ }
}
