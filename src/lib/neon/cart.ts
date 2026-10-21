import { uid } from "./catalog";
import { priceDesign } from "./pricing";
import type { CartItem, NeonDesign, Order } from "./types";

/** Build a cart item from a design, pricing it with the engine (never the visual). */
export function designToCartItem(design: NeonDesign): CartItem {
  return {
    id: uid(),
    name: design.name,
    design,
    price: priceDesign(design).total,
    qty: 1,
    createdAt: Date.now(),
  };
}

/** Production stages shown on tracking; demo progression advances one stage every 2 minutes. */
export const ORDER_STAGES = [
  "Order Placed",
  "Artwork Review",
  "In Production",
  "Quality Check",
  "Ready to Ship",
  "Shipped",
  "Delivered",
] as const;

export function demoStageIndex(placedAt: number): number {
  const minutes = (Date.now() - placedAt) / 60_000;
  return Math.min(Math.floor(minutes / 2), ORDER_STAGES.length - 1);
}

export function orderId(): string {
  return "NF-" + Math.random().toString(36).slice(2, 7).toUpperCase() + Math.floor(Math.random() * 90 + 10);
}
