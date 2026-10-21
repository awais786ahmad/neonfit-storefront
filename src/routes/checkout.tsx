import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Banknote, CheckCircle2, Landmark, Loader2, Lock, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NeonCanvas } from "@/components/NeonCanvas";
import { PageFade } from "@/components/Reveal";
import { getTier } from "@/lib/neon/catalog";
import { orderId } from "@/lib/neon/cart";
import { couponPercent, formatPrice, shippingFor } from "@/lib/neon/pricing";
import { cartStore, clearCart, couponStore, getCoupon, placeOrder, useCart, useCoupon } from "@/lib/store";
import type { Order, OrderCustomer } from "@/lib/neon/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — NeonFitter" },
      { name: "description", content: "Guest checkout for your custom neon sign — delivery details, cash on delivery or bank transfer." },
      { property: "og:title", content: "Checkout — NeonFitter" },
      { property: "og:description", content: "Complete your custom neon sign order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Checkout,
});

const PAYMENTS = [
  { id: "cod", name: "Cash on Delivery", desc: "Pay when your sign arrives", icon: Banknote },
  { id: "bank", name: "Bank Transfer", desc: "Transfer details shown after ordering", icon: Landmark },
];

interface FormErrors {
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
}

function Checkout() {
  const items = useCart();
  const coupon = useCoupon();
  const navigate = useNavigate();

  const [form, setForm] = useState<OrderCustomer>({ fullName: "", phone: "", address: "", city: "", paymentMethod: "cod" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const placedRef = useRef(false);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const discountPct = couponPercent(coupon);
  const discount = Math.round(subtotal * discountPct);
  const shipping = shippingFor(subtotal - discount);
  const total = subtotal - discount + shipping;

  // Empty carts go back to the cart page (skipped right after placing an order)
  useEffect(() => {
    if (items.length === 0 && !placedRef.current) {
      navigate({ to: "/cart", replace: true });
    }
  }, [items.length, navigate]);

  function validate(): boolean {
    const e: FormErrors = {};
    if (form.fullName.trim().length < 3) e.fullName = "Please enter your full name";
    if (!/^[0-9+\-\s]{7,15}$/.test(form.phone.trim())) e.phone = "Please enter a valid phone number";
    if (form.address.trim().length < 10) e.address = "Please enter your complete delivery address";
    if (form.city.trim().length < 2) e.city = "Please enter your city";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function set<K extends keyof OrderCustomer>(key: K, value: OrderCustomer[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || items.length === 0) return;
    if (!validate()) {
      toast.error("Please check the highlighted fields");
      return;
    }
    // duplicate-submit guard: freeze the form before any async work
    setSubmitting(true);
    const now = Date.now();
    const order: Order = {
      id: orderId(),
      items,
      customer: { ...form, fullName: form.fullName.trim(), address: form.address.trim(), city: form.city.trim() },
      subtotal,
      discount,
      ...(discount > 0 && coupon ? { couponCode: coupon } : {}),
      shipping,
      total,
      status: "Order Placed",
      placedAt: now,
      events: [{ status: "Order Placed", at: now }],
    };
    placedRef.current = true;
    placeOrder(order);
    clearCart();
    couponStore.write(null);
    void cartStore.read(); // keep snapshot warm for the redirect effect
    toast.success("Order placed!", { description: `Order ${order.id} is confirmed.` });
    navigate({ to: "/order/$orderId", params: { orderId: order.id } });
  }

  if (items.length === 0) return null;

  return (
    <PageFade className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14">
      <p className="eyebrow">Checkout</p>
      <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">Almost glowing</h1>

      <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* details */}
        <div className="space-y-8">
          <section>
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
              <Lock className="h-4 w-4 text-primary" /> Delivery details
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="co-name">Full name</Label>
                <Input id="co-name" className="mt-1.5" placeholder="Enter your name" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} aria-invalid={!!errors.fullName} />
                {errors.fullName && <p className="mt-1 text-xs text-destructive">{errors.fullName}</p>}
              </div>
              <div>
                <Label htmlFor="co-phone">Phone number</Label>
                <Input id="co-phone" className="mt-1.5" placeholder="03xx-xxxxxxx" value={form.phone} onChange={(e) => set("phone", e.target.value)} aria-invalid={!!errors.phone} />
                {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
              </div>
              <div>
                <Label htmlFor="co-city">City</Label>
                <Input id="co-city" className="mt-1.5" placeholder="Lahore" value={form.city} onChange={(e) => set("city", e.target.value)} aria-invalid={!!errors.city} />
                {errors.city && <p className="mt-1 text-xs text-destructive">{errors.city}</p>}
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="co-address">Delivery address</Label>
                <Input id="co-address" className="mt-1.5" placeholder="House, street, area" value={form.address} onChange={(e) => set("address", e.target.value)} aria-invalid={!!errors.address} />
                {errors.address && <p className="mt-1 text-xs text-destructive">{errors.address}</p>}
              </div>
            </div>
          </section>

          <section>
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" /> Payment method
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {PAYMENTS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => set("paymentMethod", p.id)}
                  className={cn(
                    "flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-all hover:border-primary/60",
                    form.paymentMethod === p.id && "border-primary shadow-neon",
                  )}
                >
                  <p.icon className="mt-0.5 h-5 w-5 text-primary" />
                  <span>
                    <span className="block text-sm font-semibold text-foreground">{p.name}</span>
                    <span className="block text-xs text-muted-foreground">{p.desc}</span>
                  </span>
                  {form.paymentMethod === p.id && <CheckCircle2 className="ml-auto h-5 w-5 text-primary" />}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* summary */}
        <aside className="h-fit space-y-4 rounded-3xl border border-primary/40 bg-card p-6 shadow-neon lg:sticky lg:top-28">
          <h2 className="font-display text-lg font-semibold text-foreground">Your order</h2>
          <div className="space-y-3">
            {items.map((item) => {
              const tier = getTier(item.design.tierId);
              return (
                <div key={item.id} className="flex gap-3">
                  <div className="glow-stage h-16 w-20 shrink-0 overflow-hidden rounded-xl border border-border">
                    <NeonCanvas design={item.design} className="h-full w-full" />
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{tier.widthIn}" · qty {item.qty}</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{formatPrice(item.price * item.qty)}</p>
                </div>
              );
            })}
          </div>
          <ul className="space-y-2 border-t border-border pt-4 text-sm">
            <li className="flex justify-between text-muted-foreground"><span>Subtotal</span><span className="text-foreground">{formatPrice(subtotal)}</span></li>
            {discount > 0 && <li className="flex justify-between text-muted-foreground"><span>Coupon {coupon}</span><span className="text-primary">−{formatPrice(discount)}</span></li>}
            <li className="flex justify-between text-muted-foreground"><span>Shipping</span><span className="text-foreground">{shipping === 0 ? "Free" : formatPrice(shipping)}</span></li>
            <li className="flex justify-between border-t border-border pt-3 text-base font-semibold text-foreground"><span>Total</span><span>{formatPrice(total)}</span></li>
          </ul>
          <p className="text-xs text-muted-foreground">
            Production takes 5–7 working days, then tracked delivery. Every uploaded design is reviewed by our team before production starts.
          </p>
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button variant="hero" size="lg" type="submit" className="w-full" disabled={submitting}>
              {submitting ? (<><Loader2 className="h-4 w-4 animate-spin" /> Placing order…</>) : (`Place Order · ${formatPrice(total)}`)}
            </Button>
          </motion.div>
          <p className="text-center text-xs text-muted-foreground">Guest checkout — no account needed.</p>
        </aside>
      </form>
    </PageFade>
  );
}
