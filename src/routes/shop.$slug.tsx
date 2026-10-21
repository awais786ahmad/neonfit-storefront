import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, ChevronRight, PencilRuler, ShoppingBag, Sparkles, Truck } from "lucide-react";

import { NeonCanvas } from "@/components/NeonCanvas";
import { cloneDesign, getTier } from "@/lib/neon/catalog";
import { useBackboards, useTiers } from "@/lib/admin";
import { designToCartItem } from "@/lib/neon/cart";
import { formatPrice, priceDesign } from "@/lib/neon/pricing";
import { getTemplate, instantiateTemplate } from "@/lib/neon/templates";
import { addToCart } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { NeonDesign } from "@/lib/neon/types";

const SCENES: { id: string; name: string }[] = [
  { id: "studio", name: "Studio Wall" },
  { id: "bedroom", name: "Bedroom" },
  { id: "cafe", name: "Café" },
  { id: "gaming", name: "Gaming Room" },
];

export const Route = createFileRoute("/shop/$slug")({
  head: ({ loaderData }) => {
    const data = loaderData as unknown as { title: string; blurb: string };
    const title = data?.title ? `${data.title} — NeonFitter` : "Design — NeonFitter";
    const desc = data?.blurb ?? "Custom LED neon sign from NeonFitter.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  loader: ({ params }): { title: string; blurb: string } => {
    const template = getTemplate(params.slug);
    if (!template) throw notFound();
    return { title: template.name, blurb: template.blurb };
  },
  component: ProductDetail,
});

function ProductDetail() {
  const { slug } = Route.useParams();
  const template = getTemplate(slug);
  if (!template) throw notFound();

  const [design, setDesign] = useState<NeonDesign>(() => instantiateTemplate(template));
  const price = priceDesign(design);
  const tier = getTier(design.tierId);
  const tiers = useTiers();
  const boards = useBackboards();

  // If the URL changes to another design, reset the working copy
  useEffect(() => {
    const fresh = getTemplate(slug);
    if (fresh) setDesign(instantiateTemplate(fresh));
  }, [slug]);

  function quickAdd() {
    addToCart(designToCartItem(design));
    toast.success("Added to cart", { description: design.name });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14">
      {/* breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/" className="transition-colors hover:text-foreground">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/shop" className="transition-colors hover:text-foreground">Shop Designs</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{template.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        {/* preview */}
        <div>
          <div className="glow-stage overflow-hidden rounded-3xl border border-border shadow-neon">
            <NeonCanvas design={design} className="aspect-[4/3] w-full" />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Preview in:</span>
            {SCENES.map((s) => (
              <button
                key={s.id}
                onClick={() => setDesign((d) => ({ ...d, sceneId: s.id }))}
                className={cn(
                  "rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-primary/60 hover:text-foreground",
                  design.sceneId === s.id && "border-primary bg-primary/10 text-primary",
                )}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* details */}
        <div>
          <Badge variant="secondary" className="rounded-full">{template.category}</Badge>
          <h1 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">{template.name}</h1>
          <p className="mt-3 text-muted-foreground">{template.blurb}</p>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-4xl font-bold text-primary">{formatPrice(price.total)}</span>
            <span className="text-sm text-muted-foreground">
              {tier.widthIn}" wide · {Math.round(tier.widthIn * tier.ratio)}" tall
            </span>
          </div>

          {/* size selector */}
          <div className="mt-8">
            <p className="text-sm font-semibold text-foreground">Size</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {tiers.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setDesign((d) => ({ ...d, tierId: t.id }))}
                  className={cn(
                    "rounded-2xl border border-border px-3 py-3 text-center transition-all hover:border-primary/60",
                    design.tierId === t.id && "border-primary bg-primary/10 shadow-neon",
                  )}
                >
                  <span className="block text-sm font-semibold text-foreground">{t.name}</span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">{t.widthIn}" wide</span>
                </button>
              ))}
            </div>
          </div>

          {/* backboard selector */}
          <div className="mt-6">
            <p className="text-sm font-semibold text-foreground">Backboard</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {boards.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setDesign((d) => ({ ...d, backboardId: b.id }))}
                  className={cn(
                    "rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-all hover:border-primary/60 hover:text-foreground",
                    design.backboardId === b.id && "border-primary bg-primary/10 text-primary",
                  )}
                >
                  {b.name}
                  {b.cost > 0 && <span className="ml-1.5 text-xs">+{formatPrice(b.cost)}</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button variant="hero" size="lg" className="flex-1" asChild>
              <Link to="/editor" search={{ template: template.slug }}>
                <PencilRuler className="h-4 w-4" /> Customize This Design
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="flex-1" onClick={quickAdd}>
              <ShoppingBag className="h-4 w-4" /> Add to Cart
            </Button>
          </div>

          {/* price breakdown */}
          <div className="mt-6 rounded-2xl border border-border bg-card p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-primary" /> What's included
            </p>
            <ul className="mt-3 space-y-1.5">
              {price.lines.map((l, i) => (
                <li key={i} className="flex justify-between text-sm text-muted-foreground">
                  <span>{l.label}</span>
                  <span className="text-foreground">{formatPrice(l.amount)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* assurances */}
          <ul className="mt-6 grid gap-2 text-sm text-muted-foreground">
            {[
              "Handcrafted LED neon flex — safe, cool-touch and energy efficient",
              "Mounting kit, screws and template included free",
              "Production in 5–7 days, tracked delivery to your door",
            ].map((line) => (
              <li key={line} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {line}
              </li>
            ))}
          </ul>

          {/* accordion details */}
          <Accordion type="single" collapsible className="mt-8">
            <AccordionItem value="production">
              <AccordionTrigger>Production & delivery</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Your sign is made to order. Production takes 5–7 working days plus delivery time. You can follow every
                stage — artwork review, production, quality check and shipping — from the{" "}
                <Link to="/track-order" className="text-primary underline">Track Order</Link> page.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping">
              <AccordionTrigger>Shipping</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Flat Rs 900 shipping, free on orders over {formatPrice(15000)}. Every sign ships in protective
                foam packaging with a mounting kit.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="custom">
              <AccordionTrigger>Custom changes</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Open this design in the editor to change the text, font, neon colors, size, backboard and accessories —
                the price updates live as you edit.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
