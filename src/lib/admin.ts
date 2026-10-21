import { useSyncExternalStore } from "react";

import {
  ACCESSORIES,
  BACKBOARDS,
  BACKING_COLORS,
  NEON_COLORS,
  NEON_FONTS,
  NEON_SHAPES,
  SIZE_TIERS,
  uid,
  type Accessory,
  type Backboard,
  type BackingColor,
  type NeonColor,
  type NeonFont,
  type NeonShape,
  type SizeTier,
} from "./neon/catalog";
import { allTemplates } from "./neon/templates";
import { useOrders } from "./store";
import type { NeonDesign, Order, PaymentStatus } from "./neon/types";
import { createStore, designStore, orderStore } from "./store";

// Admin pages read the order list through this module
export { useOrders };

/* ================= Admin-managed catalog =================
 * The admin panel owns the options customers see in the editor (Story F).
 * Everything is stored in localStorage on top of the built-in defaults;
 * catalog lookups read from here so routine additions need no code changes.
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

/** SSR-safe read (falls back to defaults when window is unavailable). */
function readCatalog(): AdminCatalogState {
  if (typeof window === "undefined") return adminCatalogStore.read();
  return adminCatalogStore.read();
}

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

/** Production stages an order moves through (Story H). */
export const PRODUCTION_STAGES = [
  "Order Placed",
  "Artwork Review",
  "Awaiting Approval",
  "In Production",
  "Quality Check",
  "Ready to Ship",
  "Shipped",
  "Delivered",
] as const;

/* ================= Materials & inventory (Story G) ================= */

export interface Material {
  id: string;
  name: string;
  unit: string;
  stock: number;
  lowThreshold: number;
  supplier: string;
  unitCost: number;
  costHistory: { at: number; cost: number }[];
}

export interface StockMovement {
  id: string;
  materialId: string;
  type: "purchase" | "usage" | "adjustment" | "damage";
  qty: number;
  at: number;
  note: string;
}

export interface Reservation {
  id: string;
  orderId: string;
  materialId: string;
  qty: number;
  at: number;
}

export const materialStore = createStore<Material[]>("nf_materials", []);
export const movementStore = createStore<StockMovement[]>("nf_movements", []);
export const reservationStore = createStore<Reservation[]>("nf_reservations", []);

export function useMaterials(): Material[] {
  return materialStore.useStore();
}
export function useMovements(): StockMovement[] {
  return movementStore.useStore();
}
export function useReservations(): Reservation[] {
  return reservationStore.useStore();
}

export function reservedQty(materialId: string, reservations?: Reservation[]): number {
  const list = reservations ?? reservationStore.read();
  return list.filter((r) => r.materialId === materialId).reduce((sum, r) => sum + r.qty, 0);
}

export function addMaterial(m: Omit<Material, "id" | "costHistory">) {
  materialStore.write([...materialStore.read(), { ...m, id: uid(), costHistory: [{ at: Date.now(), cost: m.unitCost }] }]);
}

export function updateMaterial(id: string, patch: Partial<Material>) {
  materialStore.write(
    materialStore.read().map((m) => {
      if (m.id !== id) return m;
      const next = { ...m, ...patch };
      if (patch.unitCost !== undefined && patch.unitCost !== m.unitCost) {
        next.costHistory = [...m.costHistory, { at: Date.now(), cost: patch.unitCost }];
      }
      return next;
    }),
  );
}

export function deleteMaterial(id: string) {
  materialStore.write(materialStore.read().filter((m) => m.id !== id));
  movementStore.write(movementStore.read().filter((mv) => mv.materialId !== id));
}

/** Record a stock movement and apply its effect on the material's stock. */
export function recordMovement(materialId: string, type: StockMovement["type"], qty: number, note = "") {
  const delta = type === "purchase" ? qty : -qty;
  materialStore.write(
    materialStore.read().map((m) => (m.id === materialId ? { ...m, stock: Math.max(0, m.stock + delta) } : m)),
  );
  movementStore.write([{ id: uid(), materialId, type, qty, at: Date.now(), note }, ...movementStore.read()]);
}

export function reserveMaterial(orderId: string, materialId: string, qty: number) {
  reservationStore.write([...reservationStore.read(), { id: uid(), orderId, materialId, qty, at: Date.now() }]);
}

export function releaseReservation(reservationId: string) {
  reservationStore.write(reservationStore.read().filter((r) => r.id !== reservationId));
}

/* ================= Returns & complaints (Story I) ================= */

export interface ReturnRequest {
  id: string;
  orderId: string;
  kind: "return" | "defect" | "warranty";
  reason: string;
  photo?: string;
  status: "pending" | "approved" | "rejected" | "resolved";
  resolution?: string;
  at: number;
}

export const returnStore = createStore<ReturnRequest[]>("nf_returns", []);

export function useReturns(): ReturnRequest[] {
  return returnStore.useStore();
}

export function createReturn(req: Omit<ReturnRequest, "id" | "at" | "status">) {
  returnStore.write([
    { ...req, id: "RT-" + uid().toUpperCase().slice(0, 8), at: Date.now(), status: "pending" },
    ...returnStore.read(),
  ]);
}

export function updateReturn(id: string, patch: Partial<Pick<ReturnRequest, "status" | "resolution">>) {
  returnStore.write(returnStore.read().map((r) => (r.id === id ? { ...r, ...patch } : r)));
}

/* ================= Orders: admin operations (Story H) ================= */

export function useOrder(id: string): Order | undefined {
  return orderStore.useStore().find((o) => o.id === id);
}

export function patchOrder(id: string, patch: Partial<Order>) {
  orderStore.write(orderStore.read().map((o) => (o.id === id ? { ...o, ...patch } : o)));
}

/** Move an order to a production stage and append a tracking event. */
export function setOrderStatus(id: string, status: string) {
  const order = orderStore.read().find((o) => o.id === id);
  if (!order || order.status === status) return;
  patchOrder(id, {
    status,
    events: [...order.events, { status, at: Date.now() }],
  });
}

export function setPaymentStatus(id: string, paymentStatus: PaymentStatus) {
  const order = orderStore.read().find((o) => o.id === id);
  if (!order) return;
  patchOrder(id, {
    paymentStatus,
    events: [...order.events, { status: paymentStatus === "paid" ? "Payment Received" : `Payment marked ${paymentStatus}`, at: Date.now() }],
  });
}

export function setArtworkStatus(id: string, artwork: "approved" | "changes_requested") {
  const order = orderStore.read().find((o) => o.id === id);
  if (!order) return;
  patchOrder(id, {
    artwork,
    events: [...order.events, { status: artwork === "approved" ? "Artwork Approved" : "Changes Requested from Customer", at: Date.now() }],
  });
}

/* ================= Admin access & settings ================= */

export const adminSessionStore = createStore<boolean>("nf_admin_unlocked", false);
export const adminPasswordStore = createStore<string>("nf_admin_password", "neon-admin");

export function useAdminUnlocked(): boolean {
  return adminSessionStore.useStore();
}

export function unlockAdmin(password: string): boolean {
  const ok = password === adminPasswordStore.read();
  if (ok) adminSessionStore.write(true);
  return ok;
}

export function lockAdmin() {
  adminSessionStore.write(false);
}

export function setAdminPassword(password: string) {
  adminPasswordStore.write(password);
}

/* ================= Demo data =================
 * Optional sample data so the admin panel can be explored before real
 * orders arrive. Loaded explicitly from Admin → Settings.
 */

export function loadDemoData() {
  // materials
  const materials: Material[] = [
    { id: "mat-led", name: "LED Neon Flex (10m roll)", unit: "roll", stock: 14, lowThreshold: 4, supplier: "GlowSource Ltd", unitCost: 4200, costHistory: [{ at: Date.now() - 86_400_000 * 20, cost: 4200 }] },
    { id: "mat-acrylic", name: "Acrylic Sheet 3mm (60x40cm)", unit: "sheet", stock: 26, lowThreshold: 8, supplier: "ClearCut Plastics", unitCost: 950, costHistory: [{ at: Date.now() - 86_400_000 * 15, cost: 950 }] },
    { id: "mat-power", name: "Power Supply 12V 5A", unit: "unit", stock: 9, lowThreshold: 5, supplier: "VoltLine Traders", unitCost: 1800, costHistory: [{ at: Date.now() - 86_400_000 * 10, cost: 1900 }, { at: Date.now() - 86_400_000 * 3, cost: 1800 }] },
    { id: "mat-cable", name: "DC Cable 2m", unit: "unit", stock: 3, lowThreshold: 6, supplier: "VoltLine Traders", unitCost: 350, costHistory: [{ at: Date.now() - 86_400_000 * 10, cost: 350 }] },
    { id: "mat-kit", name: "Mounting Kit", unit: "unit", stock: 40, lowThreshold: 10, supplier: "FixIt Supplies", unitCost: 150, costHistory: [{ at: Date.now() - 86_400_000 * 25, cost: 150 }] },
  ];
  materialStore.write(materials);

  const movements: StockMovement[] = [
    { id: uid(), materialId: "mat-led", type: "purchase", qty: 10, at: Date.now() - 86_400_000 * 20, note: "Monthly restock" },
    { id: uid(), materialId: "mat-led", type: "usage", qty: 4, at: Date.now() - 86_400_000 * 6, note: "Production batch" },
    { id: uid(), materialId: "mat-cable", type: "damage", qty: 2, at: Date.now() - 86_400_000 * 4, note: "Connectors bent in transit" },
  ];
  movementStore.write(movements);

  // demo orders spread over the past 3 weeks
  const names = ["Ayesha K.", "Bilal R.", "Sana M.", "Omar F.", "Zara T.", "Hamza A.", "Maryam S.", "Usman Q."];
  const cities = ["Lahore", "Karachi", "Islamabad", "Faisalabad", "Multan"];
  const stages = ["Order Placed", "Artwork Review", "In Production", "Quality Check", "Ready to Ship", "Shipped", "Delivered"];
  const templates = allTemplates();
  const orders: Order[] = [];
  for (let i = 0; i < 8; i++) {
    const t = templates[i % templates.length]!;
    const at = Date.now() - 86_400_000 * (20 - i * 2.4);
    const stage = stages[Math.min(i, stages.length - 1)]!;
    const subtotal = 7500 + ((i * 1370) % 9000);
    const discount = i % 3 === 0 ? Math.round(subtotal * 0.15) : 0;
    const shipping = subtotal - discount >= 15000 ? 0 : 900;
    const events = stages.slice(0, stages.indexOf(stage) + 1).map((s, j) => ({ status: s, at: at + j * 36_00_000 }));
    orders.push({
      id: "NF-" + String(1000 + i * 137) .slice(0, 4) + String.fromCharCode(65 + i),
      items: [{ id: "item-" + i, name: t.name, design: { ...t.design, name: t.name }, price: subtotal, qty: 1, createdAt: at }],
      customer: { fullName: names[i]!, phone: "0300-44" + String(10000 + i * 911).slice(0, 5), address: "House " + (10 + i) + ", Street 4", city: cities[i % cities.length]!, paymentMethod: i % 2 === 0 ? "cod" : "bank" },
      subtotal,
      discount,
      ...(discount > 0 ? { couponCode: "NEON15" } : {}),
      shipping,
      total: subtotal - discount + shipping,
      status: stage,
      placedAt: at,
      events,
      paymentStatus: stage === "Delivered" ? "paid" : i % 3 === 1 ? "paid" : "unpaid",
      artwork: stages.indexOf(stage) >= 2 ? "approved" : "pending",
    });
  }
  orderStore.write(orders);

  returnStore.write([
    {
      id: "RT-" + uid().toUpperCase().slice(0, 8),
      orderId: orders[7]!.id,
      kind: "defect",
      reason: "One section of the sign flickers when plugged in.",
      status: "pending",
      at: Date.now() - 86_400_000 * 2,
    },
  ]);
}

export function resetAllData() {
  const keys = [
    "nf_cart", "nf_orders", "nf_designs", "nf_draft", "nf_coupon",
    "nf_admin_catalog", "nf_admin_pricing", "nf_admin_templates",
    "nf_materials", "nf_movements", "nf_reservations", "nf_returns",
  ];
  for (const k of keys) {
    try {
      window.localStorage.removeItem(k);
    } catch {
      // ignore
    }
  }
}
