"use client";

import { EXAM_TIME_WARNING_SECONDS } from "@/lib/design-tokens";
import { formatRemaining } from "@/modules/listening/hooks/use-listening-timer";

type Props = {
  remainingSeconds: number;
  active: boolean;
};

export function ReadingTimer({ remainingSeconds, active }: Props) {
  const critical =
    remainingSeconds <= EXAM_TIME_WARNING_SECONDS && active;

  return (
    <div
      className={`inline-flex items-center gap-2 font-mono text-[13px] tabular-nums ${
        critical ? "text-[#b91c1c]" : "text-[#18181b]"
      }`}
      aria-live={critical ? "polite" : "off"}
    >
      <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-[#a1a1aa]">
        Time
      </span>
      <span className="font-semibold">{formatRemaining(remainingSeconds)}</span>
    </div>
  );
}
