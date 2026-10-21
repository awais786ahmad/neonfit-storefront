import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Boxes,
  Eye,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Package,
  Palette,
  RotateCcw,
  Settings,
  Shapes,
  Tag,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageFade } from "@/components/Reveal";
import { lockAdmin, unlockAdmin, useAdminUnlocked, useOrders, useReturns } from "@/lib/admin";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Store Admin — NeonFitter" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/orders", label: "Orders", icon: Package, exact: false },
  { to: "/admin/catalog", label: "Products & Templates", icon: Shapes, exact: false },
  { to: "/admin/library", label: "Editor Library", icon: Palette, exact: false },
  { to: "/admin/pricing", label: "Pricing Rules", icon: Tag, exact: false },
  { to: "/admin/materials", label: "Materials", icon: Boxes, exact: false },
  { to: "/admin/returns", label: "Returns", icon: RotateCcw, exact: false },
  { to: "/admin/settings", label: "Settings", icon: Settings, exact: false },
] as const;

function LockScreen() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (unlockAdmin(password.trim())) {
      navigate({ to: "/admin" });
    } else {
      setError(true);
    }
  }

  return (
    <PageFade className="mx-auto flex max-w-sm flex-col items-center px-4 py-24 text-center">
      <span className="glow-stage flex h-20 w-20 items-center justify-center rounded-full border border-border shadow-neon">
        <LockKeyhole className="h-9 w-9 text-primary" />
      </span>
      <h1 className="mt-8 text-2xl font-bold text-foreground">Store Admin</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter the admin password to manage the store.
      </p>
      <form onSubmit={submit} className="mt-6 w-full space-y-3">
        <Input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(false);
          }}
          placeholder="Admin password"
          aria-label="Admin password"
          autoFocus
          className={cn(error && "border-destructive")}
        />
        {error && <p className="text-xs text-destructive">Wrong password — try again.</p>}
        <Button variant="hero" className="w-full" type="submit">
          Unlock Admin
        </Button>
        <Button variant="ghost" className="w-full" asChild>
          <Link to="/">Back to store</Link>
        </Button>
      </form>
      <p className="mt-6 text-xs text-muted-foreground">Default password: neon-admin</p>
    </PageFade>
  );
}

function AdminLayout() {
  const unlocked = useAdminUnlocked();
  const orders = useOrders();
  const returns = useReturns();

  if (!unlocked) return <LockScreen />;

  const todo =
    orders.filter((o) => o.paymentStatus !== "paid" || o.artwork === "pending").length +
    returns.filter((r) => r.status === "pending").length;

  return (
    <PageFade className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10">
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* mobile nav */}
        <nav className="scroll-slim -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 lg:hidden" aria-label="Admin sections">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exact }}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors data-[status=active]:border-primary data-[status=active]:bg-primary/10 data-[status=active]:text-primary"
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
              {item.to === "/admin/orders" && todo > 0 && (
                <span className="rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">{todo}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* desktop sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-28 rounded-3xl border border-border bg-card p-4">
            <p className="eyebrow px-2">Store admin</p>
            <nav className="mt-3 flex flex-col gap-1" aria-label="Admin sections">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.exact }}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground data-[status=active]:bg-primary/10 data-[status=active]:text-primary"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  {item.to === "/admin/orders" && todo > 0 && (
                    <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">{todo}</span>
                  )}
                </Link>
              ))}
            </nav>
            <div className="mt-4 flex flex-col gap-1 border-t border-border pt-4">
              <a
                href="/"
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Eye className="h-4 w-4" /> View storefront
              </a>
              <button
                onClick={lockAdmin}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <LogOut className="h-4 w-4" /> Lock admin
              </button>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </PageFade>
  );
}
