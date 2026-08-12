"use client";

import { getTimerVariant } from "@/lib/design-tokens";
import { cn, formatTimer } from "@/lib/utils";

type TestTimerProps = {
  remainingSeconds: number;
  className?: string;
};

/**
 * Countdown for timed modules — red at 2:00 and below.
 */
export function TestTimer({ remainingSeconds, className }: TestTimerProps) {
  const variant = getTimerVariant(remainingSeconds);
  const label = formatTimer(remainingSeconds);

  return (
    <time
      dateTime={`PT${Math.max(0, remainingSeconds)}S`}
      className={cn(
        "text-body font-semibold tabular-nums",
        variant === "default" && "text-navy",
        variant === "warning" && "text-warning",
        variant === "critical" && "text-danger",
        className,
      )}
      aria-live="polite"
      aria-label={`Time remaining: ${label}`}
    >
      {label}
    </time>
  );
}
