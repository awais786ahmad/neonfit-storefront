import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Boxes, Check, ImageCheck, PackageCheck, Save, Truck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NeonCanvas } from "@/components/NeonCanvas";
import { PageFade } from "@/components/Reveal";
import {
  PRODUCTION_STAGES,
  patchOrder,
  releaseReservation,
  reserveMaterial,
  reservedQty,
  setArtworkStatus,
  setOrderStatus,
  setPaymentStatus,
  useMaterials,
  useOrder,
  useReservations,
} from "@/lib/admin";
import { formatPrice } from "@/lib/neon/pricing";

export const Route = createFileRoute("/admin/orders/$orderId")({
  head: () => ({ meta: [{ title: "Order — NeonFitter Admin" }] }),
  component: OrderDetail,
});

function OrderDetail() {
  const { orderId } = Route.useParams();
  const order = useOrder(orderId);
  const materials = useMaterials();
  const reservations = useReservations();

  const [tracking, setTracking] = useState(order?.tracking ?? "");
  const [notes, setNotes] = useState(order?.adminNotes ?? "");
  const [reserveQty, setReserveQty] = useState<Record<string, number>>({});

  if (!order) throw notFound();

  const stageIdx = PRODUCTION_STAGES.indexOf(order.status as (typeof PRODUCTION_STAGES)[number]);
  const nextStage = stageIdx >= 0 ? PRODUCTION_STAGES[stageIdx + 1] : undefined;
  const orderReservations = reservations.filter((r) => r.orderId === order.id);

  if (order.tracking !== undefined && tracking === "" ) setTracking(order.tracking);

  return (
    <PageFade className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Button variant="ghost" size="sm" className="-ml-2 mb-1" asChild>
            <Link to="/admin/orders"><ArrowLeft className="h-4 w-4" /> All orders</Link>
          </Button>
          <p className="eyebrow">Order</p>
          <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">{order.id}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed {new Date(order.placedAt).toLocaleString()} · {order.customer.paymentMethod === "cod" ? "Cash on delivery" : "Bank transfer"}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant="outline" className="rounded-full">{order.status}</Badge>
          <span className="text-xl font-bold text-primary">{formatPrice(order.total)}</span>
        </div>
      </div>

      {/* production pipeline */}
      <section className="rounded-3xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <PackageCheck className="h-4 w-4 text-primary" /> Production
          </p>
          {nextStage && (
            <Button variant="hero" size="sm" onClick={() => setOrderStatus(order.id, nextStage)}>
              Advance to “{nextStage}” <Check className="h-3.5 w-3.5" />
            </Button>
          )}
          {order.status === "Delivered" && (
            <Badge className="rounded-full">Delivered</Badge>
          )}
        </div>
        <ol className="scroll-slim mt-4 flex gap-2 overflow-x-auto pb-1">
          {PRODUCTION_STAGES.map((s, i) => {
            const done = stageIdx >= i;
            return (
              <li key={s} className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => setOrderStatus(order.id, s)}
                  className={
                    done
                      ? "rounded-full border border-primary bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
                      : "rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/50"
                  }
                >
                  {s}
                </button>
                {i < PRODUCTION_STAGES.length - 1 && <span className="h-px w-4 bg-border" />}
              </li>
            );
          })}
        </ol>
        {tracking && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Truck className="h-3.5 w-3.5" /> Tracking: <span className="font-medium text-foreground">{tracking}</span>
          </p>
        )}
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* artwork + payment */}
        <section className="space-y-4">
          <div className="rounded-3xl border border-border bg-card p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ImageCheck className="h-4 w-4 text-primary" /> Artwork review
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {order.items.some((i) => i.design.uploadedImage)
                ? "This order includes customer-uploaded artwork — review the reference image before approving."
                : "Designs built in the editor use supported fonts and shapes and can be approved directly."}
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                variant={order.artwork === "approved" ? "secondary" : "hero"}
                size="sm"
                onClick={() => {
                  setArtworkStatus(order.id, "approved");
                  toast.success("Artwork approved");
                }}
              >
                Approve artwork
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setArtworkStatus(order.id, "changes_requested");
                  toast.success("Change request sent to customer");
                }}
              >
                Request changes
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5">
            <p className="text-sm font-semibold text-foreground">Payment</p>
            <div className="mt-3 flex items-center gap-3">
              <Select
                value={order.paymentStatus ?? "unpaid"}
                onValueChange={(v) => setPaymentStatus(order.id, v as "unpaid" | "paid" | "refunded")}
              >
                <SelectTrigger className="w-40" aria-label="Payment status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              {order.couponCode && (
                <Badge variant="secondary" className="rounded-full">Coupon {order.couponCode}</Badge>
              )}
            </div>
            <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
              <li className="flex justify-between"><span>Subtotal</span><span className="text-foreground">{formatPrice(order.subtotal)}</span></li>
              {order.discount > 0 && <li className="flex justify-between"><span>Discount</span><span className="text-primary">−{formatPrice(order.discount)}</span></li>}
              <li className="flex justify-between"><span>Shipping</span><span className="text-foreground">{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</span></li>
            </ul>
          </div>

          {/* shipping + notes */}
          <div className="rounded-3xl border border-border bg-card p-5">
            <p className="text-sm font-semibold text-foreground">Dispatch & notes</p>
            <div className="mt-3 space-y-3">
              <div>
                <Label htmlFor="nf-tracking" className="text-xs text-muted-foreground">Courier tracking number</Label>
                <div className="mt-1.5 flex gap-2">
                  <Input
                    id="nf-tracking"
                    value={tracking}
                    onChange={(e) => setTracking(e.target.value)}
                    placeholder="e.g. TCS-123456789"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      patchOrder(order.id, { tracking: tracking.trim() || undefined });
                      if (tracking.trim() && order.status === "Ready to Ship") setOrderStatus(order.id, "Shipped");
                      toast.success("Tracking saved");
                    }}
                  >
                    <Save className="h-3.5 w-3.5" /> Save
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="nf-notes" className="text-xs text-muted-foreground">Internal notes</Label>
                <Textarea
                  id="nf-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Production notes, customer requests…"
                  className="mt-1.5"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    patchOrder(order.id, { adminNotes: notes.trim() || undefined });
                    toast.success("Notes saved");
                  }}
                >
                  <Save className="h-3.5 w-3.5" /> Save notes
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* items + customer + materials */}
        <section className="space-y-4">
          <div className="rounded-3xl border border-border bg-card p-5">
            <p className="text-sm font-semibold text-foreground">Items</p>
            <div className="mt-4 space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="grid gap-3 sm:grid-cols-[180px_1fr]">
                  <div className="glow-stage relative overflow-hidden rounded-2xl border border-border">
                    {item.design.uploadedImage && (
                      <img src={item.design.uploadedImage} alt="Customer reference artwork" className="absolute right-2 top-2 z-10 h-12 w-12 rounded-lg border border-border object-cover" />
                    )}
                    <NeonCanvas design={item.design} className="aspect-[4/3] w-full" />
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-foreground">{item.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Qty {item.qty} · {item.design.elements.length} element{item.design.elements.length > 1 ? "s" : ""}
                      {item.design.outdoor ? " · weatherproof" : ""}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-primary">{formatPrice(item.price * item.qty)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5">
            <p className="text-sm font-semibold text-foreground">Customer</p>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              <li><span className="text-foreground">{order.customer.fullName}</span></li>
              <li>{order.customer.phone}</li>
              <li>{order.customer.address}, {order.customer.city}</li>
            </ul>
          </div>

          {/* material reservations */}
          <div className="rounded-3xl border border-border bg-card p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Boxes className="h-4 w-4 text-primary" /> Material reservations
            </p>
            {orderReservations.length > 0 && (
              <ul className="mt-3 space-y-2">
                {orderReservations.map((r) => {
                  const mat = materials.find((m) => m.id === r.materialId);
                  return (
                    <li key={r.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-foreground">{mat?.name ?? r.materialId}</span>
                      <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        {r.qty} {mat?.unit}
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => releaseReservation(r.id)}>
                          Release
                        </Button>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="mt-4 grid gap-2">
              {materials.slice(0, 4).map((m) => (
                <div key={m.id} className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{m.name}</span>
                  <Input
                    type="number"
                    min={1}
                    value={reserveQty[m.id] ?? ""}
                    onChange={(e) => setReserveQty((q) => ({ ...q, [m.id]: Number(e.target.value) }))}
                    className="h-8 w-20"
                    aria-label={`Quantity of ${m.name} to reserve`}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 shrink-0"
                    onClick={() => {
                      const qty = reserveQty[m.id] ?? 0;
                      if (qty <= 0) {
                        toast.error("Enter a quantity first");
                        return;
                      }
                      if (reservedQty(m.id) + qty > m.stock) {
                        toast.error("Not enough stock", { description: `Only ${m.stock - reservedQty(m.id)} ${m.unit} unreserved.` });
                        return;
                      }
                      reserveMaterial(order.id, m.id, qty);
                      setReserveQty((q) => ({ ...q, [m.id]: 0 }));
                      toast.success("Material reserved");
                    }}
                  >
                    Reserve
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* event timeline */}
      <section className="rounded-3xl border border-border bg-card p-5">
        <p className="text-sm font-semibold text-foreground">Timeline</p>
        <ul className="mt-3 space-y-2.5">
          {order.events.map((e, i) => (
            <li key={i} className="flex items-center gap-3 text-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-foreground">{e.status}</span>
              <span className="text-xs text-muted-foreground">{new Date(e.at).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </section>
    </PageFade>
  );
}
