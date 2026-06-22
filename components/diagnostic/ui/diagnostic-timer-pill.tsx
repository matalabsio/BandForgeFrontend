"use client";

import { Clock } from "lucide-react";
import { DiagnosticModuleTimer } from "@/components/diagnostic/diagnostic-module-timer";
import { formatTimer } from "@/lib/utils";

type Props = {
  durationSeconds?: number;
  active?: boolean;
  onExpire?: () => void;
  /** When set, show static time instead of countdown */
  remainingSeconds?: number;
};

export function DiagnosticTimerPill({
  durationSeconds = 0,
  active = true,
  onExpire,
  remainingSeconds,
}: Props) {
  if (remainingSeconds != null) {
    return (
      <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-cyan/25 bg-cyan/12 px-3 py-1.5">
        <Clock className="size-3.5 text-cyan" aria-hidden />
        <span className="font-mono text-sm font-medium tracking-wide text-teal">
          {formatTimer(remainingSeconds)}
        </span>
      </div>
    );
  }

  return (
    <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-cyan/25 bg-cyan/12 px-3 py-1.5">
      <Clock className="size-3.5 text-cyan" aria-hidden />
      <span className="font-mono text-sm font-medium tracking-wide text-teal">
        <DiagnosticModuleTimer
          durationSeconds={durationSeconds}
          active={active}
          onExpire={onExpire}
          className="!text-teal"
        />
      </span>
    </div>
  );
}
