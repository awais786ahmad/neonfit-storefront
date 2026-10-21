import { uid } from "./neon/catalog";
import { allTemplates } from "./neon/templates";
import { createStore, orderStore, useOrders } from "./store";
import type { Order, PaymentStatus } from "./neon/types";

// Admin pages read the order list through this module
export { useOrders };

/* Admin-managed catalog, pricing and template stores live in ./admin-catalog
 * so the neon engine modules can use them without an import cycle through
 * this file. Everything is re-exported here for app code. */
export {
  adminCatalogStore,
  pricingStore,
  lookupFont,
  lookupColor,
  lookupShape,
  lookupTier,
  lookupBackboard,
  lookupBackingColor,
  lookupAccessory,
  useAdminCatalog,
  useFonts,
  useColors,
  useShapes,
  useTiers,
  useBackboards,
  useBackingColors,
  useAccessories,
  usePricingConfig,
  getPricingConfig,
  couponPercent,
  adminTemplateStore,
  useAdminTemplates,
  builtinDisabledStore,
  setBuiltinTemplateEnabled,
} from "./admin-catalog";
export type {
  AdminAccessory,
  AdminBackboard,
  AdminBacking,
  AdminCatalogState,
  AdminColor,
  AdminFont,
  AdminShape,
  AdminTier,
  PricingConfig,
  AdminTemplateEntry,
} from "./admin-catalog";

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
