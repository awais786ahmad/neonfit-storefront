import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Palette, PencilRuler, PackageCheck, ShieldCheck, Truck, Headset } from "lucide-react";

import heroRoom from "@/assets/hero-room.jpg";
import { Button } from "@/components/ui/button";
import { NeonCanvas } from "@/components/NeonCanvas";
import { TemplateCard } from "@/components/TemplateCard";
import { Reveal } from "@/components/Reveal";
import { allTemplates } from "@/lib/neon/templates";
import { NEON_COLORS } from "@/lib/neon/catalog";
import { priceDesign, formatPrice } from "@/lib/neon/pricing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NeonFitter — Custom LED Neon Signs, Designed by You" },
      { name: "description", content: "Design your own custom LED neon sign in minutes — pick your text, font and colors, preview it live and order online. Free shipping over Rs 15,000." },
      { property: "og:title", content: "NeonFitter — Create Your Own Custom Neon Sign" },
      { property: "og:description", content: "Design it. Preview it. Order it. Custom LED neon signs with a live editor and instant pricing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const FEATURES = [
  { icon: Truck, title: "Free Shipping", desc: "On all orders over Rs 15,000" },
  { icon: PencilRuler, title: "Handcrafted", desc: "Cut, bent and tested by hand" },
  { icon: ShieldCheck, title: "Secure Payments", desc: "Cash on delivery or bank transfer" },
  { icon: Headset, title: "Support 24/7", desc: "Ready to help with your design" },
];

const STEPS = [
  { n: "01", title: "Design it", desc: "Type your text, pick a font, neon color and shapes. Drag anything to move it." },
  { n: "02", title: "Preview it", desc: "See your sign glow live on a wall, bedroom, café or gaming room — with the price updating as you go." },
  { n: "03", title: "Order it", desc: "We handcraft your sign, quality-check it and ship it to your door. Track every stage." },
];

function Home() {
  const popular = allTemplates().slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <img src={heroRoom} alt="Custom neon sign glowing in a living room" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-center px-4 py-28 sm:px-6 md:py-40">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="eyebrow"
          >
            Your idea. Your neon.
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-hero mt-4 max-w-2xl text-4xl text-foreground sm:text-6xl md:text-7xl"
          >
            Create your own{" "}
            <span className="animate-flicker text-primary" style={{ textShadow: "0 0 18px color-mix(in oklab, var(--primary) 70%, transparent), 0 0 60px color-mix(in oklab, var(--primary) 40%, transparent)" }}>
              custom neon
            </span>{" "}
            sign
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg"
          >
            Design your own sign in minutes. Choose your text, colors and shapes, preview it live, and order online.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Button variant="hero" size="lg" asChild>
              <Link to="/editor">
                Create Your Neon Sign <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/shop">Explore ready-made designs</Link>
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-10 flex gap-6 text-sm font-medium text-muted-foreground"
          >
            <span className="flex items-center gap-2"><Palette className="h-4 w-4 text-primary" /> 9 neon colors</span>
            <span className="flex items-center gap-2"><PackageCheck className="h-4 w-4 text-primary" /> Made to order</span>
            <span className="hidden items-center gap-2 sm:flex"><Truck className="h-4 w-4 text-primary" /> Delivered to your door</span>
          </motion.div>
        </div>
      </section>

      {/* Features strip */}
      <section className="border-y border-border/70 bg-card/50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4">
          {FEATURES.map((f) => (
            <Reveal key={f.title} className="flex items-start gap-3">
              <f.icon className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">{f.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Popular designs */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Ready-made designs</p>
            <h2 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">Popular right now</h2>
          </div>
          <Link to="/shop" className="group inline-flex items-center gap-1 text-sm font-semibold text-primary">
            View all designs
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((t, i) => (
            <TemplateCard key={t.slug} template={t} delay={(i % 3) * 0.08} />
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="border-y border-border/70 bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
          <Reveal>
            <p className="eyebrow">Make it yours</p>
            <h2 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">Design it. Preview it. Order it.</h2>
          </Reveal>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.1}>
                <div className="relative rounded-3xl border border-border bg-background p-8">
                  <span className="wordmark absolute -top-5 left-6 text-6xl text-primary/70">{s.n}</span>
                  <h3 className="mt-4 text-xl font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Live preview teaser + colors */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow">Live neon preview</p>
            <h2 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">See it glow before you buy</h2>
            <p className="mt-4 max-w-md text-muted-foreground">
              Every sign is rendered with a realistic neon glow, backboard and room scene — so what you see is what arrives.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {NEON_COLORS.map((c) => (
                <span
                  key={c.id}
                  title={c.name}
                  className="h-8 w-8 rounded-full border border-border"
                  style={{ background: c.hex, boxShadow: `0 0 12px ${c.hex}` }}
                />
              ))}
            </div>
            <Button variant="hero" size="lg" className="mt-8" asChild>
              <Link to="/editor">Start designing <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="glow-stage overflow-hidden rounded-3xl border border-border shadow-neon">
              <NeonCanvas design={allTemplates()[0]!.design} className="aspect-[4/3] w-full" />
            </div>
            <p className="mt-3 text-center text-sm text-muted-foreground">
              From {formatPrice(priceDesign(allTemplates()[0]!.design).total)} · customize everything
            </p>
          </Reveal>
        </div>
      </section>

      {/* CTA banner */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <Reveal>
          <div className="glow-stage relative overflow-hidden rounded-4xl border border-primary/30 px-8 py-16 text-center shadow-neon">
            <h2 className="text-hero text-3xl text-foreground sm:text-5xl">
              Your name in <span className="text-primary">lights</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Most orders are designed, previewed and placed in under two minutes.
            </p>
            <Button variant="hero" size="lg" className="mt-8" asChild>
              <Link to="/editor">Create Your Neon Sign</Link>
            </Button>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
