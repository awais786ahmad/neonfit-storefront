import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, ShoppingBag, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home", exact: true },
  { to: "/shop", label: "Shop Designs", exact: false },
  { to: "/how-it-works", label: "How It Works", exact: false },
  { to: "/faq", label: "Help & FAQs", exact: false },
] as const;

export function Header() {
  const cart = useCart();
  const count = cart.reduce((sum, i) => sum + i.qty, 0);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<string>("");

  return (
    <header className="sticky top-0 z-50">
      {/* promo bar */}
      <div className="flex items-center justify-center gap-2 bg-primary px-4 py-2 text-center text-xs font-semibold tracking-wide text-primary-foreground">
        <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>Use code NEON15 for 15% off your first sign · Free shipping over Rs 15,000</span>
      </div>

      <div className="border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            to="/"
            className="wordmark shrink-0 text-3xl leading-none text-foreground transition-colors hover:text-primary"
          >
            NeonFitter
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setCurrent(item.to)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                  current === item.to && "bg-secondary text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="hero" size="sm" className="hidden sm:inline-flex" asChild>
              <Link to="/editor">Create Your Sign</Link>
            </Button>

            <Link
              to="/cart"
              aria-label="Cart"
              className="relative rounded-full p-2.5 text-foreground transition-colors hover:bg-secondary"
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-neon">
                  {count}
                </span>
              )}
            </Link>

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 border-border bg-background">
                <SheetTitle className="font-[Dancing_Script] text-2xl">NeonFitter</SheetTitle>
                <div className="mt-6 flex flex-col gap-1">
                  {NAV.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="rounded-xl px-4 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Button variant="hero" className="mt-4" asChild>
                    <Link to="/editor" onClick={() => setOpen(false)}>
                      Create Your Sign
                    </Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
}
