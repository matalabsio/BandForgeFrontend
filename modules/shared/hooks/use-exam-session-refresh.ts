"use client";

import { useEffect } from "react";
import {
  EXAM_GUARD_INTERVAL_MS,
  maintainExamSession,
} from "@/lib/exam-session";
import { isAuthEnabled } from "@/lib/flags";

/**
 * Keeps auth valid for full exam windows (30–60 min): proactive refresh before
 * access expiry, on mount, every 4 min, and when the tab regains focus.
 */
export function useExamSessionGuard(active: boolean): void {
  useEffect(() => {
    if (!active || !isAuthEnabled()) return;

    const tick = () => {
      void maintainExamSession();
    };

    void tick();

    const intervalId = window.setInterval(tick, EXAM_GUARD_INTERVAL_MS);

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void tick();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [active]);
}

/** @deprecated Use useExamSessionGuard */
export const useExamSessionRefresh = useExamSessionGuard;
