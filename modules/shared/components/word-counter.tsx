"use client";

import { getWordCountStatus } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

type WordCounterProps = {
  count: number;
  min: number;
  max?: number;
  className?: string;
};

export function WordCounter({ count, min, max, className }: WordCounterProps) {
  const status = getWordCountStatus(count, min, max);

  return (
    <p
      className={cn(
        "text-meta font-medium tabular-nums",
        status === "low" && "text-warning",
        status === "ok" && "text-ink/70",
        status === "good" && "text-success",
        className,
      )}
      aria-live="polite"
    >
      {count} words
      {min > 0 ? (
        <span className="text-ink/45">
          {" "}
          · target {min}
          {max ? `–${max}` : "+"}
        </span>
      ) : null}
    </p>
  );
}
