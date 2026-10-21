import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

import { NeonCanvas } from "@/components/NeonCanvas";
import { priceDesign, formatPrice } from "@/lib/neon/pricing";
import type { Template } from "@/lib/neon/templates";

export function TemplateCard({ template, delay = 0 }: { template: Template; delay?: number }) {
  const price = priceDesign(template.design).total;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay, ease: [0.21, 0.6, 0.35, 1] }}
    >
      <Link
        to="/shop/$slug"
        params={{ slug: template.slug }}
        className="group block overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-neon"
      >
        <div className="glow-stage relative aspect-[4/3] overflow-hidden">
          <NeonCanvas design={template.design} className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]" />
        </div>
        <div className="flex items-start justify-between gap-3 p-4">
          <div>
            <p className="eyebrow">{template.category}</p>
            <h3 className="mt-1 text-lg font-semibold text-foreground">{template.name}</h3>
          </div>
          <p className="shrink-0 text-sm font-semibold text-primary">
            from {formatPrice(price)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
