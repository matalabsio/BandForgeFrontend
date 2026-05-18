import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: ReactNode;
  hint?: string;
  trend?: ReactNode;
  className?: string;
};

export function StatCard({
  label,
  value,
  hint,
  trend,
  className,
}: StatCardProps) {
  return (
    <div className={cn("card-premium p-4 sm:p-5", className)}>
      <p className="text-meta font-medium text-ink/55">{label}</p>
      <p className="mt-1 text-h2 font-bold tabular-nums text-navy">{value}</p>
      {hint ? <p className="mt-1 text-meta text-ink/50">{hint}</p> : null}
      {trend ? <div className="mt-3">{trend}</div> : null}
    </div>
  );
}
