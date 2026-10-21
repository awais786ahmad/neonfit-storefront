import {
  ACCESSORIES,
  getBackingColor,
  getBackboard,
  getColor,
  getFont,
  getShape,
  getTier,
} from "./catalog";
import { getPricingConfig } from "../admin";
import type { DesignPrice, NeonDesign, PriceLine } from "./types";

/**
 * Client-side pricing engine. Every rule (per-character tube cost, outdoor
 * uplift, shipping, coupons) reads from the admin-managed pricing config,
 * so the store owner can change prices without a developer.
 */
export function priceDesign(design: NeonDesign): DesignPrice {
  const config = getPricingConfig();
  const tier = getTier(design.tierId);
  const lines: PriceLine[] = [
    { label: `${tier.name} sign · ${tier.widthIn}" wide`, amount: tier.base },
  ];

  let elementsCost = 0;
  for (const el of design.elements) {
    if (el.type === "text") {
      const font = getFont(el.fontId ?? "dancing");
      const chars = Math.max((el.text ?? "").replace(/\s/g, "").length, 1);
      const scale = Math.max(0.35, el.scale);
      elementsCost += Math.round(config.perChar * font.factor * chars * scale * scale ** 0.3);
    } else {
      const shape = getShape(el.shapeId ?? "heart");
      const scale = Math.max(0.4, el.scale);
      elementsCost += Math.round(shape.base * scale * scale ** 0.3);
    }
  }
  if (elementsCost > 0) {
    lines.push({ label: `Neon tube · ${design.elements.length} element${design.elements.length > 1 ? "s" : ""}`, amount: elementsCost });
  }

  const board = getBackboard(design.backboardId);
  if (board.cost > 0) {
    lines.push({ label: `Backboard · ${board.name}`, amount: board.cost });
  }

  const backing = getBackingColor(design.backingColorId);
  if (backing.surcharge > 0) {
    lines.push({ label: `Backing finish · ${backing.name}`, amount: backing.surcharge });
  }

  for (const id of design.accessories) {
    const acc = ACCESSORIES.find((a) => a.id === id);
    if (acc && acc.cost > 0) {
      lines.push({ label: acc.name, amount: acc.cost });
    }
  }

  let total = lines.reduce((sum, l) => sum + l.amount, 0);

  if (design.outdoor) {
    const uplift = Math.round((total * config.outdoorUpliftPct) / 100);
    lines.push({ label: "Weatherproof (outdoor) build", amount: uplift });
    total += uplift;
  }

  // color surcharges are folded in for transparency
  const usedColors = new Set(design.elements.map((e) => e.color));
  for (const id of usedColors) {
    const c = getColor(id);
    if (c.surcharge > 0) {
      lines.push({ label: `Premium color · ${c.name}`, amount: c.surcharge });
      total += c.surcharge;
    }
  }

  return { total, lines };
}

export function formatPrice(amount: number): string {
  return "Rs " + Math.round(amount).toLocaleString("en-US");
}

/** Fraction discount for a coupon code (0 when unknown), from admin config. */
export function couponPercent(code: string | null): number {
  if (!code) return 0;
  return getPricingConfig().coupons[code.toUpperCase()] ?? 0;
}

export function shippingFor(subtotal: number): number {
  const config = getPricingConfig();
  return subtotal >= config.freeShippingThreshold ? 0 : config.shippingFlat;
}

export function shippingFlat(): number {
  return getPricingConfig().shippingFlat;
}

export function freeShippingThreshold(): number {
  return getPricingConfig().freeShippingThreshold;
}
