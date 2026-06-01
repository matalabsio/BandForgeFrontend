import { cn } from "@/lib/utils";

type TestProgressProps = {
  current: number;
  total: number;
  label?: string;
  className?: string;
};

export function TestProgress({
  current,
  total,
  label,
  className,
}: TestProgressProps) {
  const pct = total > 0 ? Math.min(100, (current / total) * 100) : 0;

  return (
    <div
      className={cn("border-b border-border bg-white px-4 py-2 md:px-6", className)}
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={label ?? "Test progress"}
    >
      <div className="flex items-center justify-between gap-2 text-meta text-ink/60">
        <span>{label}</span>
        <span className="tabular-nums">
          {current} / {total}
        </span>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface">
        <div
          className="h-full rounded-full bg-teal transition-[width] duration-300 motion-reduce:transition-none"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
