import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Check, HeartHandshake, RotateCcw, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageFade } from "@/components/Reveal";
import { updateReturn, useReturns, type ReturnRequest } from "@/lib/admin";

export const Route = createFileRoute("/admin/returns")({
  head: () => ({
    meta: [{ title: "Returns — NeonFitter Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: ReturnsPage,
});

const KIND_LABEL: Record<ReturnRequest["kind"], string> = {
  return: "Return",
  defect: "Defect",
  warranty: "Warranty",
};

function ReturnsPage() {
  const returns = useReturns();

  const byStatus = (status: ReturnRequest["status"] | "all") =>
    status === "all" ? returns : returns.filter((r) => r.status === status);

  return (
    <PageFade className="space-y-6">
      <div>
        <p className="eyebrow">Returns &amp; complaints</p>
        <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">Returns &amp; Complaints</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Review customer return, defect and warranty requests against the order, then approve,
          reject and record the resolution.
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="scroll-slim flex w-full justify-start gap-1 overflow-x-auto">
          {(["pending", "approved", "rejected", "resolved"] as const).map((s) => (
            <TabsTrigger key={s} value={s} className="shrink-0 capitalize">
              {s} ({byStatus(s).length})
            </TabsTrigger>
          ))}
        </TabsList>

        {(["pending", "approved", "rejected", "resolved"] as const).map((s) => (
          <TabsContent key={s} value={s} className="mt-4">
            {byStatus(s).length === 0 ? (
              <p className="rounded-3xl border border-dashed border-border bg-card/50 px-4 py-10 text-center text-sm text-muted-foreground">
                No {s} requests.
              </p>
            ) : (
              <div className="space-y-3">
                {byStatus(s).map((r) => (
                  <ReturnCard key={r.id} req={r} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {returns.length === 0 && (
        <div className="flex items-center gap-3 rounded-3xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
          <HeartHandshake className="h-4 w-4 text-primary" />
          When a customer reports a problem with an order from the order tracking page, the request
          lands here for review.
        </div>
      )}
    </PageFade>
  );
}

function ReturnCard({ req }: { req: ReturnRequest }) {
  const [resolution, setResolution] = useState("");

  function setStatus(status: ReturnRequest["status"]) {
    const note = resolution.trim();
    updateReturn(req.id, note ? { status, resolution: note } : { status });
    setResolution("");
    toast.success(`Request ${req.id} marked ${status}`);
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-full font-mono text-[10px]">{req.id}</Badge>
            <Badge variant="secondary" className="rounded-full text-[10px]">{KIND_LABEL[req.kind]}</Badge>
            <Badge
              variant={req.status === "pending" ? "outline" : "default"}
              className="rounded-full text-[10px] capitalize"
            >
              {req.status}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-foreground">{req.reason}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Order{" "}
            <Link
              to="/admin/orders/$orderId"
              params={{ orderId: req.orderId }}
              className="font-medium text-primary hover:underline"
            >
              {req.orderId}
            </Link>{" "}
            · {new Date(req.at).toLocaleString()}
          </p>
        </div>
        {req.photo && (
          <img src={req.photo} alt="Customer photo" className="h-20 w-20 rounded-2xl border border-border object-cover" />
        )}
      </div>

      {req.resolution && (
        <p className="mt-3 rounded-2xl bg-secondary px-3 py-2 text-xs text-muted-foreground">
          Resolution: <span className="text-foreground">{req.resolution}</span>
        </p>
      )}

      {req.status === "pending" && (
        <div className="mt-4 space-y-2">
          <Textarea
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            rows={2}
            placeholder="Resolution note (optional) — replacement shipped, partial refund…"
          />
          <div className="flex gap-2">
            <Button variant="hero" size="sm" onClick={() => setStatus("approved")}>
              <Check className="h-3.5 w-3.5" /> Approve
            </Button>
            <Button variant="outline" size="sm" onClick={() => setStatus("rejected")}>
              <X className="h-3.5 w-3.5" /> Reject
            </Button>
          </div>
        </div>
      )}

      {req.status === "approved" && (
        <div className="mt-4 space-y-2">
          <Textarea
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            rows={2}
            placeholder="How was it resolved? (replacement, repair, refund…)"
          />
          <Button variant="secondary" size="sm" onClick={() => setStatus("resolved")}>
            <RotateCcw className="h-3.5 w-3.5" /> Mark resolved
          </Button>
        </div>
      )}
    </div>
  );
}
