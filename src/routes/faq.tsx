import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PageFade } from "@/components/Reveal";
import { formatPrice, freeShippingThreshold, shippingFlat } from "@/lib/neon/pricing";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Help & FAQs — NeonFitter" },
      { name: "description", content: "Answers about designing, ordering, shipping, payment and caring for your custom LED neon sign." },
      { property: "og:title", content: "Help & FAQs — NeonFitter" },
      { property: "og:description", content: "Everything you need to know about ordering a custom neon sign." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Faq,
});

const FAQ_GROUPS: { title: string; items: { q: string; a: string }[] }[] = [
  {
    title: "Designing your sign",
    items: [
      {
        q: "Do I need design experience to create a sign?",
        a: "Not at all. The editor is built for first-timers: type your text, pick a font and neon color, drag elements into place and watch the preview update live. You can also start from a ready-made design and customize it.",
      },
      {
        q: "Can I use my own font or upload my sketch or logo?",
        a: "You can attach a sketch, photo or logo to your design in the editor. A member of our design team reviews every upload before production — complex artwork may receive a custom quote first, and we'll confirm everything with you before making the sign.",
      },
      {
        q: "Is my design saved if I leave the page?",
        a: "Yes. Your work-in-progress design is saved automatically in this browser, and you can also press Save in the editor to keep named copies. Cart contents are preserved too.",
      },
      {
        q: "What sizes are available?",
        a: "Signs come in four standard width tiers — 20, 30, 40 and 60 inches wide. The price updates instantly when you change size, and larger sizes cost more because they use more neon and acrylic.",
      },
    ],
  },
  {
    title: "Ordering & payment",
    items: [
      {
        q: "Do I need an account to order?",
        a: "No — checkout is fully guest-based. We only ask for your name, phone number and delivery address so we can deliver your sign.",
      },
      {
        q: "What payment methods do you accept?",
        a: "Cash on Delivery and Bank Transfer are available at checkout. Your order is confirmed immediately and payment details appear on your confirmation page.",
      },
      {
        q: "How is the price calculated?",
        a: "Price is calculated from your design: the size tier, the amount of neon each text line and shape uses, backboard type, backing finish, accessories and whether you choose an outdoor weatherproof build. The price you see in the editor is the price you pay.",
      },
      {
        q: "Can I cancel or change my order?",
        a: "Because every sign is made to order, we can accept changes or cancellations only while the order is still in Artwork Review — before production starts. Contact us as soon as possible and we'll do our best.",
      },
    ],
  },
  {
    title: "Shipping & delivery",
    items: [
      {
        q: "How much does shipping cost?",
        a: `Shipping is a flat ${formatPrice(shippingFlat())} and free on orders over ${formatPrice(freeShippingThreshold())}. Every sign ships in protective foam packaging with a mounting kit included.`,
      },
      {
        q: "How long does production take?",
        a: "Each sign is handcrafted in 5–7 working days after artwork approval, then handed to a tracked courier. You can follow every stage — artwork review, production, quality check and shipping — from the Track Order page.",
      },
      {
        q: "How do I track my order?",
        a: "Enter your order number (it starts with NF-) on the Track Order page. You'll see the current production stage and delivery status.",
      },
    ],
  },
  {
    title: "Your sign & aftercare",
    items: [
      {
        q: "Are LED neon signs safe?",
        a: "Yes. Our signs use flexible LED neon — cool to the touch, low voltage and far more durable and energy efficient than glass neon. They are safe around children and pets and can run for hours.",
      },
      {
        q: "Can my sign be used outdoors?",
        a: "Choose the outdoor weatherproof build in the editor — sealed, brighter tubes rated for outdoor use. Indoor signs should stay away from rain and direct moisture.",
      },
      {
        q: "What if my sign arrives damaged?",
        a: "Contact us within 7 days with photos of the damage. If it's a manufacturing or shipping fault we repair or replace the sign — custom signs are covered against defects, though change-of-mind returns are handled case by case since each sign is made just for you.",
      },
      {
        q: "How do I mount my sign?",
        a: "Every order includes screws, standoffs and a paper mounting template. Most signs hang on a wall in 15–20 minutes with basic tools.",
      },
    ],
  },
];

function Faq() {
  return (
    <PageFade className="mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-16">
      <p className="eyebrow">Help & FAQs</p>
      <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-5xl">
        How can we <span className="text-primary">help?</span>
      </h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Quick answers about designing, ordering and caring for your custom neon sign. Can't find what
        you're looking for? Our team is one message away.
      </p>

      <div className="mt-10 space-y-10">
        {FAQ_GROUPS.map((group) => (
          <section key={group.title}>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">{group.title}</h2>
            <Accordion type="single" collapsible className="mt-3">
              {group.items.map((item) => (
                <AccordionItem key={item.q} value={item.q}>
                  <AccordionTrigger className="text-left text-base font-medium text-foreground">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}
      </div>

      <div className="glow-stage mt-12 rounded-3xl border border-primary/30 p-8 text-center shadow-neon">
        <h2 className="text-2xl font-bold text-foreground">Still have a question?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Start a design and attach your question — or explore how the whole process works, from design
          to delivery.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button variant="hero" size="lg" asChild>
            <Link to="/editor">Create Your Neon Sign</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/how-it-works">How It Works <ChevronRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </PageFade>
  );
}
