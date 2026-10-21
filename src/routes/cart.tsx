import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Minus, Plus, ShoppingBag, Tag, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { NeonCanvas } from "@/components/NeonCanvas";
import { PageFade } from "@/components/Reveal";
import { getTier } from "@/lib/neon/catalog";
import { couponPercent, formatPrice, shippingFor } from "@/lib/neon/pricing";
import { clearCart, removeFromCart, setCoupon, updateCartQty, useCart, useCoupon } from "@/lib/store";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — NeonFitter" },
      { name: "description", content: "Review your custom neon sign designs, apply a coupon and head to checkout." },
      { property: "og:title", content: "Your Cart — NeonFitter" },
      { property: "og:description", content: "Review your custom neon sign designs and check out." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Cart,
});

function Cart() {
  const items = useCart();
  const coupon = useCoupon();
  const [code, setCode] = useState("");

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const discountPct = couponPercent(coupon);
  const discount = Math.round(subtotal * discountPct);
  const shipping = shippingFor(subtotal - discount);
  const total = subtotal - discount + shipping;

  function applyCoupon() {
    const normalized = code.trim().toUpperCase();
    if (!normalized) return;
    const pct = couponPercent(normalized);
    if (!pct) {
      toast.error("Invalid coupon code");
      return;
    }
    setCoupon(normalized);
    toast.success(`Coupon ${normalized} applied — ${Math.round(pct * 100)}% off`);
    setCode("");
  }

  if (items.length === 0) {
    return (
      <PageFade className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
        <span className="glow-stage flex h-24 w-24 items-center justify-center rounded-full border border-border shadow-neon">
          <ShoppingBag className="h-10 w-10 text-primary" />
        </span>
        <h1 className="mt-8 text-3xl font-bold text-foreground">Your cart is empty</h1>
        <p className="mt-3 text-muted-foreground">
          Design a sign from scratch or customize a ready-made design — it only takes a couple of minutes.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button variant="hero" size="lg" asChild>
            <Link to="/editor">Create Your Neon Sign</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/shop">Shop Designs</Link>
          </Button>
        </div>
      </PageFade>
    );
  }

  return (
    <PageFade className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14">
      <p className="eyebrow">Cart</p>
      <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">Review your signs</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {items.map((item) => {
            const tier = getTier(item.design.tierId);
            return (
              <div key={item.id} className="grid gap-4 rounded-3xl border border-border bg-card p-4 sm:grid-cols-[200px_1fr]">
                <div className="glow-stage relative overflow-hidden rounded-2xl border border-border">
                  {item.design.uploadedImage && (
                    <img
                      src={item.design.uploadedImage}
                      alt="Customer reference artwork"
                      className="absolute right-2 top-2 z-10 h-10 w-10 rounded-lg border border-border object-cover"
                    />
                  )}
                  <NeonCanvas design={item.design} className="aspect-[4/3] w-full" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-lg font-semibold text-foreground">{item.name}</h2>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {tier.widthIn}" wide · {Math.round(tier.widthIn * tier.ratio)}" tall · {item.design.elements.length} element{item.design.elements.length > 1 ? "s" : ""}{item.design.outdoor ? " · weatherproof" : ""}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove ${item.name}`}
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <div className="flex items-center rounded-full border border-border">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label="Decrease quantity" onClick={() => updateCartQty(item.id, item.qty - 1)}>
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <span className="w-8 text-center text-sm font-semibold text-foreground">{item.qty}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label="Increase quantity" onClick={() => updateCartQty(item.id, item.qty + 1)}>
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="text-primary">
                      <Link to="/editor" search={{ item: item.id }}>Edit design</Link>
                    </Button>
                    {item.design.uploadedImage && (
                      <Badge variant="secondary" className="rounded-full"><Tag className="mr-1 h-3 w-3" /> Artwork review</Badge>
                    )}
                  </div>

                  <p className="mt-auto pt-3 text-right text-lg font-bold text-primary sm:text-left">
                    {formatPrice(item.price * item.qty)}
                  </p>
                </div>
              </div>
            );
          })}
          <button
            onClick={clearCart}
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-destructive"
          >
            <X className="h-4 w-4" /> Clear cart
          </button>
        </div>

        {/* summary */}
        <aside className="h-fit rounded-3xl border border-primary/40 bg-card p-6 shadow-neon lg:sticky lg:top-28">
          <h2 className="font-display text-lg font-semibold text-foreground">Order summary</h2>

          <div className="mt-4 flex gap-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
              placeholder="Coupon code"
              aria-label="Coupon code"
              className="uppercase"
            />
            <Button variant="secondary" onClick={applyCoupon}>Apply</Button>
          </div>
          {coupon && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-primary">
              <Tag className="h-3 w-3" /> {coupon} applied
              <button onClick={() => setCoupon(null)} className="ml-1 underline-offset-2 hover:underline" aria-label="Remove coupon">
                <X className="h-3 w-3" />
              </button>
            </p>
          )}

          <ul className="mt-5 space-y-2.5 text-sm">
            <li className="flex justify-between text-muted-foreground"><span>Subtotal</span><span className="text-foreground">{formatPrice(subtotal)}</span></li>
            {discount > 0 && (
              <li className="flex justify-between text-muted-foreground"><span>Coupon {coupon}</span><span className="text-primary">−{formatPrice(discount)}</span></li>
            )}
            <li className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span className="text-foreground">{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </li>
            <li className="flex justify-between border-t border-border pt-3 text-base font-semibold text-foreground">
              <span>Total</span><span>{formatPrice(total)}</span>
            </li>
          </ul>

          {subtotal < 15000 && (
            <p className="mt-3 text-xs text-muted-foreground">
              Add {formatPrice(15000 - subtotal + discount)} more for free shipping.
            </p>
          )}

          <Button variant="hero" size="lg" className="mt-5 w-full" asChild>
            <Link to="/checkout">Continue to Checkout <ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Guest checkout · no account needed · cash on delivery available
          </p>
        </aside>
      </div>
    </PageFade>
  );
}
