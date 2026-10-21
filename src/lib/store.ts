import { useSyncExternalStore } from "react";
import type { CartItem, NeonDesign, Order } from "./neon/types";

/**
 * localStorage-backed stores (frontend-only "db").
 * Each store keeps a cached snapshot so useSyncExternalStore stays stable.
 */

type Listener = () => void;

export function createStore<T>(key: string, fallback: T) {
  let snapshot: T | null = null;
  const listeners = new Set<Listener>();

  function read(): T {
    if (snapshot !== null) return snapshot;
    try {
      const raw = window.localStorage.getItem(key);
      snapshot = raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      snapshot = fallback;
    }
    return snapshot;
  }

  function write(value: T) {
    snapshot = value;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage full or unavailable — keep in-memory copy
    }
    listeners.forEach((l) => l());
  }

  function subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  function getServerSnapshot(): T {
    return fallback;
  }

  return {
    read,
    write,
    subscribe,
    useStore: () => useSyncExternalStore(subscribe, read, getServerSnapshot),
  };
}

/* ---------------- Cart ---------------- */

export const cartStore = createStore<CartItem[]>("nf_cart", []);

export function useCart(): CartItem[] {
  return cartStore.useStore();
}

export function addToCart(item: CartItem) {
  const items = [...cartStore.read()];
  const existing = items.find((i) => i.id === item.id);
  if (existing) {
    existing.qty += item.qty;
    cartStore.write(items);
  } else {
    cartStore.write([...items, item]);
  }
}

export function updateCartQty(id: string, qty: number) {
  const items = cartStore.read().map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i));
  cartStore.write(items);
}

export function removeFromCart(id: string) {
  cartStore.write(cartStore.read().filter((i) => i.id !== id));
}

export function clearCart() {
  cartStore.write([]);
}

/* ---------------- Orders ---------------- */

export const orderStore = createStore<Order[]>("nf_orders", []);

export function useOrders(): Order[] {
  return orderStore.useStore();
}

export function placeOrder(order: Order) {
  // normalize admin-managed fields so the admin panel always has a state to act on
  const normalized: Order = {
    ...order,
    paymentStatus: order.paymentStatus ?? "unpaid",
    artwork: order.artwork ?? "pending",
  };
  orderStore.write([normalized, ...orderStore.read()]);
}

export function getOrder(id: string): Order | undefined {
  return orderStore.read().find((o) => o.id === id);
}

/* ---------------- Saved designs ---------------- */

export interface SavedDesign {
  id: string;
  design: NeonDesign;
  price: number;
  savedAt: number;
}

export const designStore = createStore<SavedDesign[]>("nf_designs", []);

export function useSavedDesigns(): SavedDesign[] {
  return designStore.useStore();
}

export function saveDesign(entry: SavedDesign) {
  const rest = designStore.read().filter((d) => d.id !== entry.id);
  designStore.write([entry, ...rest]);
}

/* ---------------- Editor draft (autosave) ---------------- */

export const draftStore = createStore<NeonDesign | null>("nf_draft", null);

/* ---------------- Coupon ---------------- */

export const couponStore = createStore<string | null>("nf_coupon", null);

export function useCoupon(): string | null {
  return couponStore.useStore();
}

export function getCoupon(): string | null {
  return couponStore.read();
}

export function setCoupon(code: string | null) {
  couponStore.write(code);
}
