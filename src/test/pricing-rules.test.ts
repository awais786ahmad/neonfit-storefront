import { beforeEach, describe, expect, it } from "vitest";

import { DEFAULT_PRICING, pricingStore } from "@/lib/admin-catalog";
import { couponPercent, formatPrice, shippingFor } from "@/lib/neon/pricing";

describe("Pricing rules (admin-managed)", () => {
  beforeEach(() => {
    pricingStore.write({ ...DEFAULT_PRICING, coupons: { ...DEFAULT_PRICING.coupons } });
  });

  it("applies the NEON15 coupon as 15% off", () => {
    expect(couponPercent("NEON15")).toBe(0.15);
  });

  it("gives unknown or empty coupons no discount", () => {
    expect(couponPercent("NOPE")).toBe(0);
    expect(couponPercent(null)).toBe(0);
  });

  it("charges flat shipping below the free-shipping threshold", () => {
    expect(shippingFor(DEFAULT_PRICING.freeShippingThreshold - 1)).toBe(DEFAULT_PRICING.shippingFlat);
  });

  it("ships free at or above the free-shipping threshold", () => {
    expect(shippingFor(DEFAULT_PRICING.freeShippingThreshold)).toBe(0);
  });

  it("lets the admin change coupon rules without a developer", () => {
    pricingStore.write({ ...pricingStore.read(), coupons: { SUMMER25: 0.25 } });
    expect(couponPercent("summer25")).toBe(0.25);
    expect(couponPercent("NEON15")).toBe(0);
  });

  it("formats prices in rupees", () => {
    expect(formatPrice(12345.6)).toBe("Rs 12,346");
  });
});
