"use client";

import { useEffect, useRef } from "react";
import { TestTimer } from "@/modules/shared";
import { useListeningTimer } from "@/modules/shared/hooks/use-exam-timer";

type Props = {
  durationSeconds: number;
  active?: boolean;
  onExpire?: () => void;
  className?: string;
};

export function DiagnosticModuleTimer({
  durationSeconds,
  active = true,
  onExpire,
  className,
}: Props) {
  const startedAtRef = useRef<string | null>(null);

  if (!startedAtRef.current) {
    startedAtRef.current = new Date().toISOString();
  }

  const remainingSeconds = useListeningTimer({
    startedAtIso: startedAtRef.current,
    serverTimeIso: null,
    durationSeconds,
    active,
    onExpire,
  });

  useEffect(() => {
    if (!active) {
      startedAtRef.current = new Date().toISOString();
    }
  }, [active]);

  return (
    <TestTimer
      remainingSeconds={remainingSeconds}
      className={className ?? "shrink-0"}
    />
  );
}
