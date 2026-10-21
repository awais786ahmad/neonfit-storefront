import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Boxes,
  Flame,
  HeartHandshake,
  Package,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { PageFade } from "@/components/Reveal";
import { reservedQty, useMaterials, useMovements, useOrders, useReturns } from "@/lib/admin";
import { formatPrice } from "@/lib/neon/pricing";
import type { Order } from "@/lib/neon/types";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — NeonFitter Admin" }] }),
  component: Dashboard,
});

function StatCard({ icon: Icon, label, value, sub }: { icon: typeof Package; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold uppercase tracking-widest">{label}</span>
      </div>
      <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function statusBadge(status: string) {
  const tone =
    status === "Delivered"
      ? "default"
      : status === "Shipped" || status === "Ready to Ship"
        ? "secondary"
        : "outline";
  return <Badge variant={tone} className="rounded-full">{status}</Badge>;
}

function Dashboard() {
  const orders = useOrders();
  const materials = useMaterials();
  const movements = useMovements();
  const returns = useReturns();

  const active = orders.filter((o) => o.status !== "Cancelled");
  const revenue = active.reduce((s, o) => s + o.total, 0);
  const pendingPayment = active.filter((o) => o.paymentStatus !== "paid").length;
  const inProduction = active.filter((o) => ["Artwork Review", "Awaiting Approval", "In Production", "Quality Check"].includes(o.status)).length;
  const aov = active.length ? Math.round(revenue / active.length) : 0;

  // revenue trend, last 14 days
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (13 - i));
    return d;
  });
  const trend = days.map((d) => {
    const next = d.getTime() + 86_400_000;
    const sum = active.filter((o) => o.placedAt >= d.getTime() && o.placedAt < next).reduce((s, o) => s + o.total, 0);
    return { day: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), revenue: sum };
  });

  // best sellers by item name
  const counts = new Map<string, { qty: number; revenue: number }>();
  for (const o of active) {
    for (const item of o.items) {
      const entry = counts.get(item.name) ?? { qty: 0, revenue: 0 };
      entry.qty += item.qty;
      entry.revenue += item.price * item.qty;
      counts.set(item.name, entry);
    }
  }
  const topDesigns = [...counts.entries()].sort((a, b) => b[1].qty - a[1].qty).slice(0, 5);

  // most-used fonts & colors across ordered designs
  const fontTally = new Map<string, number>();
  const colorTally = new Map<string, number>();
  for (const o of orders) {
    for (const item of o.items) {
      for (const el of item.design.elements) {
        if (el.type === "text" && el.fontId) fontTally.set(el.fontId, (fontTally.get(el.fontId) ?? 0) + 1);
        colorTally.set(el.color, (colorTally.get(el.color) ?? 0) + 1);
      }
    }
  }
  const topColors = [...colorTally.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);

  const lowStock = materials.filter((m) => m.stock - reservedQty(m.id) <= m.lowThreshold);
  const pendingReturns = returns.filter((r) => r.status === "pending");
  const recent = orders.slice(0, 6);

  return (
    <PageFade className="space-y-6">
      <div>
        <p className="eyebrow">Dashboard</p>
        <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">Store overview</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Wallet} label="Revenue" value={formatPrice(revenue)} sub={`${active.length} active orders`} />
        <StatCard icon={Package} label="In production" value={String(inProduction)} sub="artwork to quality check" />
        <StatCard icon={Banknote} label="Pending payment" value={String(pendingPayment)} sub="unpaid or refunded" />
        <StatCard icon={Flame} label="Avg. order value" value={formatPrice(aov)} sub="across active orders" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        {/* revenue trend */}
        <div className="rounded-3xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-foreground">Revenue · last 14 days</p>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} interval={2} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} width={54} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
                <Tooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                  labelStyle={{ color: "var(--foreground)" }}
                  formatter={(v) => [formatPrice(Number(v)), "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2} fill="url(#revFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* low stock */}
        <div className="rounded-3xl border border-border bg-card p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <AlertTriangle className="h-4 w-4 text-primary" /> Low stock alerts
          </p>
          {lowStock.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">All materials are above their thresholds.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {lowStock.slice(0, 5).map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-foreground">{m.name}</span>
                  <Badge variant="outline" className="rounded-full text-destructive">
                    {m.stock - reservedQty(m.id)} / {m.lowThreshold} {m.unit}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Boxes className="h-3.5 w-3.5" /> {movements.length} stock movements recorded
          </p>
          {pendingReturns.length > 0 && (
            <Link to="/admin/returns" className="mt-4 flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/5 px-3 py-2.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10">
              <HeartHandshake className="h-4 w-4" />
              {pendingReturns.length} return request{pendingReturns.length > 1 ? "s" : ""} awaiting review
              <ArrowRight className="ml-auto h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        {/* recent orders */}
        <div className="rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Recent orders</p>
            <Link to="/admin/orders" className="flex items-center gap-1 text-xs font-semibold text-primary">
              All orders <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No orders yet. Load the demo dataset from Settings to explore the admin panel.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {recent.map((o) => (
                <li key={o.id}>
                  <Link to="/admin/orders/$orderId" params={{ orderId: o.id }} className="flex items-center gap-3 py-3 transition-colors hover:opacity-80">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {o.id} · {o.customer.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(o.placedAt).toLocaleDateString()} · {o.items[0]?.name}
                        {o.items.length > 1 && ` +${o.items.length - 1}`}
                      </p>
                    </div>
                    {statusBadge(o.status)}
                    <span className="text-sm font-semibold text-primary">{formatPrice(o.total)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* best sellers + colors */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-border bg-card p-5">
            <p className="text-sm font-semibold text-foreground">Best-selling designs</p>
            {topDesigns.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">No sales yet.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {topDesigns.map(([name, s]) => (
                  <li key={name} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate text-foreground">{name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {s.qty} sold · {formatPrice(s.revenue)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-3xl border border-border bg-card p-5">
            <p className="text-sm font-semibold text-foreground">Popular neon colors</p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {topColors.map(([id, n]) => (
                <span key={id} title={`${n} uses`} className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
                  <span className="h-3 w-3 rounded-full" style={{ background: `var(--color-${id}, var(--primary))` }} />
                  {id} · {n}
                </span>
              ))}
              {topColors.length === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </PageFade>
  );
}
