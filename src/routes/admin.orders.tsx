import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageFade } from "@/components/Reveal";
import { PRODUCTION_STAGES, useOrders } from "@/lib/admin";
import { formatPrice } from "@/lib/neon/pricing";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({ meta: [{ title: "Orders — NeonFitter Admin" }] }),
  component: AdminOrders,
});

function paymentBadge(status: string | undefined) {
  if (status === "paid") return <Badge className="rounded-full">Paid</Badge>;
  if (status === "refunded") return <Badge variant="destructive" className="rounded-full">Refunded</Badge>;
  return <Badge variant="outline" className="rounded-full">Unpaid</Badge>;
}

function AdminOrders() {
  const orders = useOrders();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [payment, setPayment] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (status !== "all" && o.status !== status) return false;
      if (payment !== "all" && (o.paymentStatus ?? "unpaid") !== payment) return false;
      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q) ||
        o.customer.fullName.toLowerCase().includes(q) ||
        o.customer.phone.includes(q) ||
        o.customer.city.toLowerCase().includes(q) ||
        o.items.some((i) => i.name.toLowerCase().includes(q))
      );
    });
  }, [orders, query, status, payment]);

  return (
    <PageFade className="space-y-6">
      <div>
        <p className="eyebrow">Orders & production</p>
        <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">Orders</h1>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search id, customer, phone, city…"
            aria-label="Search orders"
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {PRODUCTION_STAGES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={payment} onValueChange={setPayment}>
          <SelectTrigger className="w-36" aria-label="Filter by payment">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payments</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            {orders.length === 0
              ? "No orders yet. Load the demo dataset from Settings to explore."
              : "No orders match these filters."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">Customer</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell">Payment</th>
                <th className="px-4 py-3 text-right font-semibold">Total</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((o) => (
                <tr key={o.id} className="transition-colors hover:bg-secondary/40">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground">{o.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.placedAt).toLocaleDateString()} · {o.items[0]?.name}
                      {o.items.length > 1 && ` +${o.items.length - 1}`}
                    </p>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <p className="text-foreground">{o.customer.fullName}</p>
                    <p className="text-xs text-muted-foreground">{o.customer.city} · {o.customer.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="rounded-full">{o.status}</Badge>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">{paymentBadge(o.paymentStatus)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-primary">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/admin/orders/$orderId" params={{ orderId: o.id }}>Manage</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageFade>
  );
}
