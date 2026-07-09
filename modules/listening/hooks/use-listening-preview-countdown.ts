"use client";

import { useEffect, useRef } from "react";
import { useCountdown } from "@/hooks/use-countdown";
import {
  LISTENING_QUESTION_PREVIEW_SEC,
  type ListeningPartAudioPhase,
} from "@/modules/listening/lib/listening-part-intro";

type Options = {
  phase: ListeningPartAudioPhase;
  onPreviewComplete: () => void;
  /** Bump when part changes to reset the one-shot guard. */
  resetKey?: string | number;
};

/**
 * Counts down during the preview phase; calls onPreviewComplete once at 0.
 */
export function useListeningPreviewCountdown({
  phase,
  onPreviewComplete,
  resetKey,
}: Options) {
  const active = phase === "preview";
  const remaining = useCountdown(LISTENING_QUESTION_PREVIEW_SEC, active);
  const completedRef = useRef(false);

  useEffect(() => {
    completedRef.current = false;
  }, [resetKey]);

  useEffect(() => {
    if (!active) {
      completedRef.current = false;
      return;
    }
    if (remaining !== 0 || completedRef.current) return;
    completedRef.current = true;
    onPreviewComplete();
  }, [active, remaining, onPreviewComplete]);

  const progressPct =
    ((LISTENING_QUESTION_PREVIEW_SEC - remaining) / LISTENING_QUESTION_PREVIEW_SEC) *
    100;

  return { remaining, progressPct, active };
}
