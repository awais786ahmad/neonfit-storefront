import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Palette,
  PackageCheck,
  PencilRuler,
  Ruler,
  SearchCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  Upload,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { NeonCanvas } from "@/components/NeonCanvas";
import { PageFade, Reveal } from "@/components/Reveal";
import { allTemplates } from "@/lib/neon/templates";
import { BACKBOARDS, NEON_COLORS, NEON_FONTS, NEON_SHAPES, SIZE_TIERS } from "@/lib/neon/catalog";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — NeonFitter" },
      { name: "description", content: "From your idea to a glowing custom neon sign on your wall: design, preview, order, production and delivery explained." },
      { property: "og:title", content: "How It Works — NeonFitter" },
      { property: "og:description", content: "Design, preview and order your custom neon sign in minutes — here's the full journey." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HowItWorks,
});

const JOURNEY = [
  {
    icon: PencilRuler,
    step: "01 · You design",
    title: "Add your text and shapes",
    desc: "Type a name or quote, choose from 8 fonts and 9 neon colors, and add icons like hearts, stars and crowns. Drag anything to move it, resize or rotate it — the preview updates instantly.",
  },
  {
    icon: Upload,
    step: "02 · Optional",
    title: "Or upload your sketch",
    desc: "Have a logo or a napkin sketch? Attach it to your design. Our design team reviews every upload and confirms the artwork with you before production.",
  },
  {
    icon: Ruler,
    step: "03 · You choose",
    title: "Pick size, backboard and extras",
    desc: "Four width sizes from 20\" to 60\", cut-to-shape or panel backboards, mounting kits, dimmers and remotes — with the price updating live after every change.",
  },
  {
    icon: ShoppingBag,
    step: "04 · You order",
    title: "Checkout in under two minutes",
    desc: "No account needed. Enter your name, phone and address, pay by cash on delivery or bank transfer, and place the order. Most customers are done in about two minutes.",
  },
  {
    icon: SearchCheck,
    step: "05 · We review",
    title: "Artwork review & proof",
    desc: "We check that your design is manufacturable — readable text, supported fonts, sensible spacing. If anything needs adjusting we contact you before starting.",
  },
  {
    icon: Wrench,
    step: "06 · We craft",
    title: "Handcrafted and quality checked",
    desc: "Your sign is cut, bent and assembled by hand, then tested — lighting, brightness and electrical safety — before it's approved for shipping.",
  },
  {
    icon: Truck,
    step: "07 · Delivered",
    title: "Tracked delivery to your door",
    desc: "Your sign ships in protective foam packaging with a mounting kit and template. Follow every stage live from the Track Order page.",
  },
];

function HowItWorks() {
  return (
    <div>
      <PageFade className="mx-auto max-w-4xl px-4 pt-12 text-center sm:px-6 md:pt-16">
        <p className="eyebrow">How it works</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-5xl">
          From idea to <span className="text-primary">glowing sign</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          NeonFitter makes custom neon simple: you design, we handcraft and deliver. Here's the whole
          journey — most customers finish their design in under two minutes.
        </p>
        <Button variant="hero" size="lg" className="mt-8" asChild>
          <Link to="/editor">Create Your Neon Sign <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </PageFade>

      {/* live preview */}
      <Reveal className="mx-auto mt-10 max-w-4xl px-4 sm:px-6">
        <div className="glow-stage overflow-hidden rounded-3xl border border-border shadow-neon">
          <NeonCanvas design={allTemplates()[0]!.design} className="aspect-[4/3] w-full" />
        </div>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          A real NeonFitter preview — this is what the editor shows as you design.
        </p>
      </Reveal>

      {/* journey steps */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20">
        <div className="grid gap-6 md:grid-cols-2">
          {JOURNEY.map((s, i) => (
            <Reveal key={s.title} delay={(i % 2) * 0.1}>
              <div className="h-full rounded-3xl border border-border bg-card p-7 transition-colors hover:border-primary/40">
                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/40 shadow-neon">
                    <s.icon className="h-5 w-5 text-primary" />
                  </span>
                  <p className="eyebrow">{s.step}</p>
                </div>
                <h2 className="mt-4 text-xl font-semibold text-foreground">{s.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* what goes into a sign */}
      <section className="border-y border-border/70 bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20">
          <Reveal>
            <p className="eyebrow">Built to last</p>
            <h2 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">What every sign includes</h2>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Sparkles, title: "LED neon flex", desc: "Cool-touch, low voltage and energy efficient — safe around kids and pets." },
              { icon: Palette, title: `${NEON_COLORS.length} neon colors · ${NEON_FONTS.length} fonts`, desc: "Mix colors across text and shapes for a multi-tone sign." },
              { icon: Ruler, title: `${SIZE_TIERS[0]!.widthIn}"–${SIZE_TIERS.at(-1)!.widthIn}" sizes`, desc: `With ${BACKBOARDS.length} backboard styles and four backing finishes.` },
              { icon: PackageCheck, title: "Mounting kit included", desc: "Screws, standoffs and a paper template — plus dimmer and remote options." },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 0.08}>
                <div className="h-full rounded-3xl border border-border bg-background p-6">
                  <f.icon className="h-6 w-6 text-primary" />
                  <p className="mt-3 text-sm font-semibold text-foreground">{f.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-8">
            <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-border bg-background p-6">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{NEON_SHAPES.length} shapes and icons</span> — hearts, stars, moons, crowns, music notes, gamepads and more:
              </p>
              <div className="flex flex-wrap gap-2">
                {NEON_SHAPES.slice(0, 8).map((s) => (
                  <span key={s.id} title={s.name} className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <g stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                        {s.d.map((p, j) => <path key={j} d={p} />)}
                        {s.circles?.map((c, j) => <circle key={`c${j}`} cx={c.cx} cy={c.cy} r={c.r} />)}
                      </g>
                    </svg>
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20"
      >
        <div className="glow-stage rounded-4xl border border-primary/30 px-8 py-16 text-center shadow-neon">
          <h2 className="text-hero text-3xl text-foreground sm:text-5xl">Ready to see your name glow?</h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Start from scratch or pick a ready-made design — the editor does the rest.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button variant="hero" size="lg" asChild>
              <Link to="/editor">Create Your Neon Sign</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/shop">Shop Designs</Link>
            </Button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
