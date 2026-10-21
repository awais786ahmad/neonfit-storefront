import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Twitter } from "lucide-react";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "Shop Designs", to: "/shop" },
      { label: "Create Your Sign", to: "/editor" },
      { label: "How It Works", to: "/how-it-works" },
      { label: "Track Order", to: "/track-order" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Help & FAQs", to: "/faq" },
      { label: "Shipping Info", to: "/faq" },
      { label: "Track Order", to: "/track-order" },
      { label: "Contact Support", to: "/faq" },
    ],
  },
  {
    title: "Designs",
    links: [
      { label: "Names", to: "/shop" },
      { label: "Love & Wedding", to: "/shop" },
      { label: "Gaming", to: "/shop" },
      { label: "Business Signs", to: "/shop" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/70 bg-card/60">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link to="/" className="wordmark text-4xl text-foreground">
            NeonFitter
          </Link>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Custom LED neon signs, designed by you. Design it, preview it live, order it — no design
            experience needed.
          </p>
          <div className="mt-6 flex gap-3">
            {[Instagram, Facebook, Twitter].map((Icon, i) => (
              <span
                key={i}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Icon className="h-4 w-4" />
              </span>
            ))}
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-foreground">{col.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l, i) => (
                <li key={i}>
                  <Link to={l.to} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border/70 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} NeonFitter · Handcrafted custom neon · Secure payments · Support 24/7
      </div>
    </footer>
  );
}
