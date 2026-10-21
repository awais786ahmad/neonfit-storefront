import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrderTimeline } from "@/components/OrderTimeline";
import { PageFade } from "@/components/Reveal";
import { formatPrice } from "@/lib/neon/pricing";
import { useOrders } from "@/lib/store";

export const Route = createFileRoute("/track-order")({
  head: () => ({
    meta: [
      { title: "Track Order — NeonFitter" },
      { name: "description", content: "Track your NeonFitter order — follow artwork review, production, quality check and shipping." },
      { property: "og:title", content: "Track Order — NeonFitter" },
      { property: "og:description", content: "Follow your custom neon sign through production and delivery." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrackOrder,
});

function TrackOrder() {
  const orders = useOrders();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<"idle" | "notfound">("idle");

  const found = query.trim() ? orders.find((o) => o.id.toLowerCase() === query.trim().toLowerCase()) : undefined;
  const recent = orders.slice(0, 3);

  function search() {
    setResult(orders.some((o) => o.id.toLowerCase() === query.trim().toLowerCase()) ? "idle" : "notfound");
  }

  return (
    <PageFade className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
      <p className="eyebrow">Order tracking</p>
      <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">Where's my sign?</h1>
      <p className="mt-3 text-muted-foreground">
        Enter your order number (starts with NF-) to see the live production and delivery status.
      </p>

      <div className="mt-6 flex gap-2">
        <Input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setResult("idle"); }}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="NF-XXXXXX"
          className="uppercase"
          aria-label="Order number"
        />
        <Button variant="hero" onClick={search}>
          <Search className="h-4 w-4" /> Track
        </Button>
      </div>

      {result === "notfound" && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
          <SearchX className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <p className="text-muted-foreground">
            We couldn't find order <span className="font-semibold text-foreground">{query.trim().toUpperCase()}</span>.
            Check the number on your confirmation page or <Link to="/faq" className="text-primary underline">contact support</Link>.
          </p>
        </div>
      )}

      {found && (
        <div className="mt-8 rounded-3xl border border-primary/40 bg-card p-6 shadow-neon">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="eyebrow">Order</p>
              <h2 className="mt-1 font-display text-xl font-semibold text-foreground">{found.id}</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {found.items.length} sign{found.items.length > 1 ? "s" : ""} · {formatPrice(found.total)}
            </p>
          </div>
          <OrderTimeline placedAt={found.placedAt} className="mt-6" />
          <Button variant="outline" size="sm" className="mt-2" asChild>
            <Link to="/order/$orderId" params={{ orderId: found.id }}>View full order</Link>
          </Button>
        </div>
      )}

      {recent.length > 0 && !found && (
        <div className="mt-10">
          <p className="eyebrow">Your recent orders</p>
          <div className="mt-3 space-y-2">
            {recent.map((o) => (
              <Link
                key={o.id}
                to="/order/$orderId"
                params={{ orderId: o.id }}
                className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-sm transition-colors hover:border-primary/50"
              >
                <span className="font-medium text-foreground">{o.id}</span>
                <span className="text-muted-foreground">{new Date(o.placedAt).toLocaleDateString()} · {formatPrice(o.total)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </PageFade>
  );
}
