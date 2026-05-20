"use client";

import { formatRemaining } from "@/modules/listening/hooks/use-listening-timer";

type Props = {
  remainingSeconds: number;
  active: boolean;
};

export function ListeningTimer({ remainingSeconds, active }: Props) {
  const warning = remainingSeconds <= 300 && active;
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-meta tabular-nums ${
        warning
          ? "border-danger/40 bg-danger/10 text-danger"
          : "border-border bg-white text-navy"
      }`}
      aria-live={warning ? "polite" : "off"}
    >
      <span
        className={`inline-block h-2 w-2 rounded-full ${
          active ? "bg-teal" : "bg-ink/30"
        }`}
        aria-hidden
      />
      <span className="font-semibold">{formatRemaining(remainingSeconds)}</span>
      <span className="text-ink/60">remaining</span>
    </div>
  );
}
