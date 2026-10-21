import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, PackageCheck, Phone, ReceiptText, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NeonCanvas } from "@/components/NeonCanvas";
import { OrderTimeline } from "@/components/OrderTimeline";
import { PageFade } from "@/components/Reveal";
import { getTier } from "@/lib/neon/catalog";
import { formatPrice } from "@/lib/neon/pricing";
import { useOrders } from "@/lib/store";

export const Route = createFileRoute("/order/$orderId")({
  head: () => ({
    meta: [
      { title: "Order Confirmation — NeonFitter" },
      { name: "description", content: "Your NeonFitter order confirmation with production timeline." },
      { property: "og:title", content: "Order Confirmation — NeonFitter" },
      { property: "og:description", content: "Your custom neon sign order is confirmed." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrderPage,
});

function OrderPage() {
  const { orderId: id } = Route.useParams();
  const orders = useOrders();
  const order = orders.find((o) => o.id === id);

  if (!order) throw notFound();

  return (
    <PageFade className="mx-auto max-w-5xl px-4 py-10 sm:px-6 md:py-14">
      {/* hero confirmation */}
      <div className="text-center">
        <motion.span
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 14 }}
          className="glow-stage mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-primary/50 shadow-neon"
        >
          <PackageCheck className="h-11 w-11 text-primary" />
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-6 text-3xl font-bold text-foreground sm:text-4xl"
        >
          Thank you, {order.customer.fullName.split(" ")[0]}!
        </motion.h1>
        <p className="mt-3 text-muted-foreground">
          Your order <span className="font-semibold text-foreground">{order.id}</span> is confirmed. We'll start
          reviewing the artwork right away — follow every stage below.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* items */}
        <div className="space-y-4">
          {order.items.map((item) => {
            const tier = getTier(item.design.tierId);
            return (
              <div key={item.id} className="grid gap-4 rounded-3xl border border-border bg-card p-4 sm:grid-cols-[200px_1fr]">
                <div className="glow-stage overflow-hidden rounded-2xl border border-border">
                  <NeonCanvas design={item.design} className="aspect-[4/3] w-full" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-display text-lg font-semibold text-foreground">{item.name}</h2>
                    <p className="text-lg font-bold text-primary">{formatPrice(item.price * item.qty)}</p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {tier.widthIn}" wide · {Math.round(tier.widthIn * tier.ratio)}" tall · qty {item.qty}
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    A snapshot of this design is saved with your order — reference it any time.
                  </p>
                </div>
              </div>
            );
          })}

          {/* production timeline */}
          <div className="rounded-3xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold text-foreground">Production status</h2>
            <OrderTimeline placedAt={order.placedAt} className="mt-5" />
          </div>
        </div>

        {/* summary */}
        <aside className="h-fit space-y-6 rounded-3xl border border-primary/40 bg-card p-6 shadow-neon lg:sticky lg:top-28">
          <div>
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
              <ReceiptText className="h-4 w-4 text-primary" /> Order summary
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex justify-between text-muted-foreground"><span>Subtotal</span><span className="text-foreground">{formatPrice(order.subtotal)}</span></li>
              {order.discount > 0 && <li className="flex justify-between text-muted-foreground"><span>Coupon {order.couponCode}</span><span className="text-primary">−{formatPrice(order.discount)}</span></li>}
              <li className="flex justify-between text-muted-foreground"><span>Shipping</span><span className="text-foreground">{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</span></li>
              <li className="flex justify-between border-t border-border pt-3 text-base font-semibold text-foreground"><span>Total</span><span>{formatPrice(order.total)}</span></li>
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              Payment: {order.customer.paymentMethod === "cod" ? "Cash on Delivery" : "Bank Transfer"}
            </p>
          </div>

          <div>
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
              <MapPin className="h-4 w-4 text-primary" /> Delivering to
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><User className="h-4 w-4 shrink-0" /> {order.customer.fullName}</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0" /> {order.customer.phone}</li>
              <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {order.customer.address}, {order.customer.city}</li>
            </ul>
          </div>

          <Button variant="hero" size="lg" className="w-full" asChild>
            <Link to="/track-order">Track this order <ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link to="/shop">Continue shopping</Link>
          </Button>
        </aside>
      </div>
    </PageFade>
  );
}
