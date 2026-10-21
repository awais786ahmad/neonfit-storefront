import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Calculator, Plus, Save, Tag, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageFade } from "@/components/Reveal";
import { pricingStore, usePricingConfig } from "@/lib/admin";
import { formatPrice } from "@/lib/neon/pricing";

export const Route = createFileRoute("/admin/pricing")({
  head: () => ({
    meta: [{ title: "Pricing Rules — NeonFitter Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: PricingRules,
});

function num(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function PricingRules() {
  const config = usePricingConfig();
  const [form, setForm] = useState({
    perChar: String(config.perChar),
    outdoorUpliftPct: String(config.outdoorUpliftPct),
    shippingFlat: String(config.shippingFlat),
    freeShippingThreshold: String(config.freeShippingThreshold),
    costRatio: String(config.costRatio),
  });
  const [couponCode, setCouponCode] = useState("");
  const [couponPct, setCouponPct] = useState("10");

  function save() {
    pricingStore.write({
      perChar: num(form.perChar) || config.perChar,
      outdoorUpliftPct: num(form.outdoorUpliftPct),
      shippingFlat: num(form.shippingFlat),
      freeShippingThreshold: num(form.freeShippingThreshold),
      coupons: config.coupons,
      costRatio: Math.min(0.95, num(form.costRatio) || config.costRatio),
    });
    toast.success("Pricing rules saved — prices update everywhere instantly");
  }

  function addCoupon() {
    const code = couponCode.trim().toUpperCase();
    const pct = num(couponPct);
    if (!code || pct <= 0 || pct >= 100) {
      toast.error("Coupon needs a code and a discount between 1 and 99 percent");
      return;
    }
    if (config.coupons[code] !== undefined) {
      toast.error("That coupon code already exists");
      return;
    }
    pricingStore.write({ ...config, coupons: { ...config.coupons, [code]: pct / 100 } });
    setCouponCode("");
    setCouponPct("10");
    toast.success(`Coupon ${code} added`);
  }

  function removeCoupon(code: string) {
    const coupons = { ...config.coupons };
    delete coupons[code];
    pricingStore.write({ ...config, coupons });
    toast.success(`Coupon ${code} removed`);
  }

  return (
    <PageFade className="space-y-6">
      <div>
        <p className="eyebrow">Pricing rules</p>
        <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">Pricing Rules</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          These rules drive every price in the editor, cart and checkout. Customers always see the
          updated price — no developer needed.
        </p>
      </div>

      {/* live quote simulator */}
      <section className="rounded-3xl border border-primary/40 bg-primary/5 p-5">
        <Simulator config={config} />
      </section>

      <section className="rounded-3xl border border-border bg-card p-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Tag className="h-4 w-4 text-primary" /> Core rules
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Tube cost per text character (Rs)">
            <Input type="number" value={form.perChar} onChange={(e) => setForm({ ...form, perChar: e.target.value })} />
          </Field>
          <Field label="Weatherproof uplift (%)">
            <Input type="number" value={form.outdoorUpliftPct} onChange={(e) => setForm({ ...form, outdoorUpliftPct: e.target.value })} />
          </Field>
          <Field label="Flat shipping (Rs)">
            <Input type="number" value={form.shippingFlat} onChange={(e) => setForm({ ...form, shippingFlat: e.target.value })} />
          </Field>
          <Field label="Free shipping threshold (Rs)">
            <Input type="number" value={form.freeShippingThreshold} onChange={(e) => setForm({ ...form, freeShippingThreshold: e.target.value })} />
          </Field>
          <Field label="Estimated material cost (fraction of price)">
            <Input type="number" step="0.05" value={form.costRatio} onChange={(e) => setForm({ ...form, costRatio: e.target.value })} />
          </Field>
        </div>
        <Button variant="hero" size="sm" className="mt-4" onClick={save}>
          <Save className="h-3.5 w-3.5" /> Save pricing rules
        </Button>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5">
        <p className="text-sm font-semibold text-foreground">Coupon codes</p>
        <ul className="mt-3 space-y-2">
          {Object.entries(config.coupons).length === 0 && (
            <li className="text-sm text-muted-foreground">No active coupons.</li>
          )}
          {Object.entries(config.coupons).map(([code, pct]) => (
            <li key={code} className="flex items-center justify-between gap-3 rounded-2xl border border-border px-4 py-2.5">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="rounded-full font-mono text-xs">{code}</Badge>
                <span className="text-sm text-muted-foreground">{Math.round(pct * 100)}% off the subtotal</span>
              </div>
              <Button variant="ghost" size="sm" className="h-8 text-xs text-destructive" onClick={() => removeCoupon(code)}>
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </Button>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <Field label="New coupon code">
            <Input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="SUMMER10"
              className="w-44 font-mono uppercase"
            />
          </Field>
          <Field label="Discount (%)">
            <Input type="number" value={couponPct} onChange={(e) => setCouponPct(e.target.value)} className="w-28" />
          </Field>
          <Button variant="secondary" size="sm" onClick={addCoupon}>
            <Plus className="h-3.5 w-3.5" /> Add coupon
          </Button>
        </div>
      </section>
    </PageFade>
  );
}

function Simulator({ config }: { config: ReturnType<typeof usePricingConfig> }) {
  const [subtotal, setSubtotal] = useState("12000");
  const [coupon, setCoupon] = useState("");
  const value = num(subtotal);
  const pct = coupon.trim() ? (config.coupons[coupon.trim().toUpperCase()] ?? 0) : 0;
  const discount = Math.round(value * pct);
  const shipping = value - discount >= config.freeShippingThreshold ? 0 : config.shippingFlat;
  const total = value - discount + shipping;
  const margin = 1 - config.costRatio;

  return (
    <div>
      <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Calculator className="h-4 w-4 text-primary" /> Quick quote simulator
      </p>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <Field label="Subtotal (Rs)">
          <Input type="number" value={subtotal} onChange={(e) => setSubtotal(e.target.value)} className="w-40" />
        </Field>
        <Field label="Coupon code">
          <Input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="NEON15" className="w-40 font-mono uppercase" />
        </Field>
      </div>
      <div className="mt-4 grid gap-2 text-sm sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Shipping</p>
          <p className="mt-0.5 font-semibold text-foreground">{shipping === 0 ? "Free" : formatPrice(shipping)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Discount</p>
          <p className="mt-0.5 font-semibold text-primary">{discount > 0 ? `−${formatPrice(discount)}` : "—"}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Customer pays</p>
          <p className="mt-0.5 font-semibold text-foreground">{formatPrice(total)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Est. margin</p>
          <p className="mt-0.5 font-semibold text-primary">{Math.round(margin * 100)}%</p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
