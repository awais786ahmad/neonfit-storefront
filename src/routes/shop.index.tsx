import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";

import { TemplateCard } from "@/components/TemplateCard";
import { Reveal } from "@/components/Reveal";
import { allTemplates, TEMPLATE_CATEGORIES } from "@/lib/neon/templates";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shop/")({
  head: () => ({
    meta: [
      { title: "Shop Ready-Made Neon Designs — NeonFitter" },
      { name: "description", content: "Browse ready-made neon sign designs — names, weddings, gaming, business and quotes. Customize any design and order online." },
      { property: "og:title", content: "Shop Ready-Made Neon Designs — NeonFitter" },
      { property: "og:description", content: "Names, weddings, gaming, business signs and quotes — customize any design before ordering." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Shop,
});

function Shop() {
  const [category, setCategory] = useState("All");
  const templates = allTemplates();
  const filtered = category === "All" ? templates : templates.filter((t) => t.category === category);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16">
      <Reveal>
        <p className="eyebrow">Shop designs</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-5xl">Ready-made neon signs</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Every design is fully customizable — open one in the editor to change the text, color, size and options.
        </p>
      </Reveal>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-8 flex flex-wrap gap-2"
      >
        {TEMPLATE_CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              "rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:border-primary/60 hover:text-foreground",
              category === c && "border-primary bg-primary text-primary-foreground shadow-neon",
            )}
          >
            {c}
          </button>
        ))}
      </motion.div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t, i) => (
          <TemplateCard key={t.slug} template={t} delay={(i % 3) * 0.06} />
        ))}
      </div>
    </div>
  );
}
