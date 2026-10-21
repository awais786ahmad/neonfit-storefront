import { useEffect, useState } from "react";
import { Check } from "lucide-react";

import { demoStageIndex, ORDER_STAGES } from "@/lib/neon/cart";
import { cn } from "@/lib/utils";

/**
 * Production timeline for an order. Stages advance automatically in this
 * frontend-only demo (one stage every 2 minutes) via demoStageIndex.
 */
export function OrderTimeline({ placedAt, className }: { placedAt: number; className?: string }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  const current = demoStageIndex(placedAt);

  return (
    <ol className={cn("relative space-y-0", className)}>
      {ORDER_STAGES.map((stage, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={stage} className="relative flex gap-4 pb-6 last:pb-0">
            {i < ORDER_STAGES.length - 1 && (
              <span
                className={cn(
                  "absolute left-[11px] top-6 h-[calc(100%-1.5rem)] w-0.5",
                  done ? "bg-primary" : "bg-border",
                )}
              />
            )}
            <span
              className={cn(
                "z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                done && "border-primary bg-primary text-primary-foreground",
                active && "border-primary bg-background shadow-neon",
                !done && !active && "border-border bg-background",
              )}
            >
              {done && <Check className="h-3.5 w-3.5" />}
              {active && <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />}
            </span>
            <div>
              <p className={cn("text-sm font-medium", done || active ? "text-foreground" : "text-muted-foreground")}>
                {stage}
              </p>
              {active && <p className="text-xs text-primary">In progress</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
