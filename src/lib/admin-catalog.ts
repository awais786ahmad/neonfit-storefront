import {
  ACCESSORIES,
  BACKBOARDS,
  BACKING_COLORS,
  NEON_COLORS,
  NEON_FONTS,
  NEON_SHAPES,
  SIZE_TIERS,
  registerAdminLookups,
  type Accessory,
  type Backboard,
  type BackingColor,
  type NeonColor,
  type NeonFont,
  type NeonShape,
  type SizeTier,
} from "./neon/catalog";
import { createStore } from "./store";
import type { NeonDesign } from "./neon/types";

/* ================= Admin-managed catalog =================
 * The admin panel owns the options customers see in the editor (Story F).
 * Everything is stored in localStorage on top of the built-in defaults;
 * catalog lookups read from here so routine additions need no code changes.
 *
 * This module is separate from ./admin so the neon engine (catalog, pricing,
 * templates) can depend on it without an import cycle through admin.ts.
 */

export interface AdminFont extends NeonFont {
  enabled: boolean;
}
export interface AdminColor extends NeonColor {
  enabled: boolean;
}
export interface AdminShape extends NeonShape {
  enabled: boolean;
}
export interface AdminTier extends SizeTier {
  enabled: boolean;
}
export interface AdminBackboard extends Backboard {
  enabled: boolean;
}
export interface AdminBacking extends BackingColor {
  enabled: boolean;
}
export interface AdminAccessory extends Accessory {
  enabled: boolean;
}

export interface AdminCatalogState {
  fonts: AdminFont[];
  colors: AdminColor[];
  shapes: AdminShape[];
  tiers: AdminTier[];
  backboards: AdminBackboard[];
  backingColors: AdminBacking[];
  accessories: AdminAccessory[];
}

export interface PricingConfig {
  /** tube cost per text character at scale 1 */
  perChar: number;
  /** percentage uplift for weatherproof outdoor builds */
  outdoorUpliftPct: number;
  shippingFlat: number;
  freeShippingThreshold: number;
  /** coupon code -> discount fraction */
  coupons: Record<string, number>;
  /** estimated material cost as a fraction of item price (profitability) */
  costRatio: number;
}

export const DEFAULT_PRICING: PricingConfig = {
  perChar: 190,
  outdoorUpliftPct: 12,
  shippingFlat: 900,
  freeShippingThreshold: 15000,
  coupons: { NEON15: 0.15 },
  costRatio: 0.45,
};

function defaultCatalog(): AdminCatalogState {
  return {
    fonts: NEON_FONTS.map((f) => ({ ...f, enabled: true })),
    colors: NEON_COLORS.map((c) => ({ ...c, enabled: true })),
    shapes: NEON_SHAPES.map((s) => ({ ...s, enabled: true })),
    tiers: SIZE_TIERS.map((t) => ({ ...t, enabled: true })),
    backboards: BACKBOARDS.map((b) => ({ ...b, enabled: true })),
    backingColors: BACKING_COLORS.map((b) => ({ ...b, enabled: true })),
    accessories: ACCESSORIES.map((a) => ({ ...a, enabled: true })),
  };
}

export const adminCatalogStore = createStore<AdminCatalogState>("nf_admin_catalog", defaultCatalog());
export const pricingStore = createStore<PricingConfig>("nf_admin_pricing", DEFAULT_PRICING);

/* ---- lookups used by the catalog getters (enabled entries only) ---- */

function lookup<T extends { id: string; enabled: boolean }>(list: T[], id: string): T | undefined {
  return list.find((item) => item.id === id && item.enabled);
}

export function lookupFont(id: string): NeonFont | undefined {
  return lookup(readCatalog().fonts, id);
}
export function lookupColor(id: string): NeonColor | undefined {
  return lookup(readCatalog().colors, id);
}
export function lookupShape(id: string): NeonShape | undefined {
  return lookup(readCatalog().shapes, id);
}
export function lookupTier(id: string): SizeTier | undefined {
  return lookup(readCatalog().tiers, id);
}
export function lookupBackboard(id: string): Backboard | undefined {
  return lookup(readCatalog().backboards, id);
}
export function lookupBackingColor(id: string): BackingColor | undefined {
  return lookup(readCatalog().backingColors, id);
}
export function lookupAccessory(id: string): Accessory | undefined {
  return lookup(readCatalog().accessories, id);
}

function readCatalog(): AdminCatalogState {
  return adminCatalogStore.read();
}

/** Wire the admin-managed catalog into the built-in catalog getters. */
registerAdminLookups({
  color: lookupColor,
  font: lookupFont,
  shape: lookupShape,
  tier: lookupTier,
  backboard: lookupBackboard,
  backingColor: lookupBackingColor,
  accessory: lookupAccessory,
});

/* ---- reactive list hooks for the editor, shop and admin pages ---- */

export function useAdminCatalog(): AdminCatalogState {
  return adminCatalogStore.useStore();
}
export function useFonts(): AdminFont[] {
  return useAdminCatalog().fonts;
}
export function useColors(): AdminColor[] {
  return useAdminCatalog().colors;
}
export function useShapes(): AdminShape[] {
  return useAdminCatalog().shapes;
}
export function useTiers(): AdminTier[] {
  return useAdminCatalog().tiers;
}
export function useBackboards(): AdminBackboard[] {
  return useAdminCatalog().backboards;
}
export function useBackingColors(): AdminBacking[] {
  return useAdminCatalog().backingColors;
}
export function useAccessories(): AdminAccessory[] {
  return useAdminCatalog().accessories;
}

export function usePricingConfig(): PricingConfig {
  return pricingStore.useStore();
}

export function getPricingConfig(): PricingConfig {
  return pricingStore.read();
}

export function couponPercent(code: string | null): number {
  if (!code) return 0;
  return getPricingConfig().coupons[code.toUpperCase()] ?? 0;
}

/* ================= Admin templates =================
 * Custom ready-made designs created in the admin panel, merged with the
 * built-in template list (disabled built-ins are hidden from customers).
 */

export interface AdminTemplateEntry {
  id: string;
  slug: string;
  name: string;
  category: string;
  blurb: string;
  design: NeonDesign;
  enabled: boolean;
}

export const adminTemplateStore = createStore<AdminTemplateEntry[]>("nf_admin_templates", []);

export function useAdminTemplates(): AdminTemplateEntry[] {
  return adminTemplateStore.useStore();
}

/** Slugs of built-in templates hidden from customers by the admin. */
export const builtinDisabledStore = createStore<string[]>("nf_admin_disabled_templates", []);

export function setBuiltinTemplateEnabled(slug: string, enabled: boolean) {
  const disabled = builtinDisabledStore.read();
  builtinDisabledStore.write(
    enabled ? disabled.filter((s) => s !== slug) : disabled.includes(slug) ? disabled : [...disabled, slug],
  );
}
