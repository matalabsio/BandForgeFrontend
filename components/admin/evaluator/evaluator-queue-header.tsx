"use client";

import { adminFilterPill, adminFilterPillActive, adminMeta, adminHeading } from "@/components/admin/admin-ui";
import { cn } from "@/lib/utils";

type Props = {
  pendingCount: number;
  title?: string;
};

export function EvaluatorQueueHeader({
  pendingCount,
  title = "Evaluator portal",
}: Props) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={cn(adminFilterPill, adminFilterPillActive)}>
          Speaking
        </button>
        <button type="button" className={adminFilterPill} disabled>
          Writing (soon)
        </button>
      </div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={adminMeta}>Speaking review</p>
          <h2 className={cn(adminHeading, "text-2xl")}>{title}</h2>
        </div>
        {pendingCount > 0 ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-cyan-soft px-3 py-1.5 text-xs font-bold text-teal">
            <span className="size-2 rounded-full bg-cyan" aria-hidden />
            {pendingCount} in queue
          </span>
        ) : null}
      </div>
    </div>
  );
}
