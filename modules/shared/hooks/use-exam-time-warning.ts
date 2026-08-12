"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EXAM_TIME_WARNING_SECONDS } from "@/lib/design-tokens";

type Args = {
  remaining: number;
  durationSeconds: number;
  /** New attempt / part start. */
  resetKey?: string | null;
  active?: boolean;
};

/**
 * One-shot 2-minute warning. Skips sections shorter than 2 minutes so the
 * popup does not appear immediately. Does not pause the timer.
 */
export function useExamTimeWarning({
  remaining,
  durationSeconds,
  resetKey,
  active = true,
}: Args): { open: boolean; dismiss: () => void } {
  const [open, setOpen] = useState(false);
  const shownRef = useRef(false);

  useEffect(() => {
    shownRef.current = false;
    setOpen(false);
  }, [resetKey]);

  useEffect(() => {
    if (!active) return;
    if (shownRef.current) return;
    if (durationSeconds <= EXAM_TIME_WARNING_SECONDS) return;
    if (remaining <= 0) return;
    if (remaining > EXAM_TIME_WARNING_SECONDS) return;
    shownRef.current = true;
    setOpen(true);
  }, [active, durationSeconds, remaining]);

  const dismiss = useCallback(() => setOpen(false), []);
  return { open, dismiss };
}
