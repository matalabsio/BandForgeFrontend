"use client";

import { useState } from "react";
import { TestTimer } from "@/modules/shared";
import { useListeningTimer } from "@/modules/shared/hooks/use-exam-timer";

type Props = {
  durationSeconds: number;
  active?: boolean;
  onExpire?: () => void;
  className?: string;
};

/**
 * Client-local module countdown for diagnostic sections.
 * Start is fixed at mount; `active` only pauses ticking (does not reset the clock).
 */
export function DiagnosticModuleTimer({
  durationSeconds,
  active = true,
  onExpire,
  className,
}: Props) {
  const [startedAtIso] = useState(() => new Date().toISOString());

  const remainingSeconds = useListeningTimer({
    startedAtIso,
    serverTimeIso: null,
    durationSeconds,
    active,
    onExpire,
  });

  return (
    <TestTimer
      remainingSeconds={remainingSeconds}
      className={className ?? "shrink-0"}
    />
  );
}
