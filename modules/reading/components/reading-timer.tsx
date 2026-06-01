"use client";

import { formatRemaining } from "@/modules/listening/hooks/use-listening-timer";

type Props = {
  remainingSeconds: number;
  active: boolean;
};

export function ReadingTimer({ remainingSeconds, active }: Props) {
  const warning = remainingSeconds <= 300 && active;
  const critical = remainingSeconds <= 60 && active;

  return (
    <div
      className={`inline-flex items-center gap-2 font-mono text-[13px] tabular-nums ${
        critical
          ? "text-[#b91c1c]"
          : warning
            ? "text-[#a16207]"
            : "text-[#18181b]"
      }`}
      aria-live={warning ? "polite" : "off"}
    >
      <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-[#a1a1aa]">
        Time
      </span>
      <span className="font-semibold">{formatRemaining(remainingSeconds)}</span>
    </div>
  );
}
