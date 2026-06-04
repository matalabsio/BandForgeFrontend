"use client";

import { useEffect } from "react";
import { refreshSession } from "@/lib/auth";
import { isAuthEnabled } from "@/lib/flags";

const EXAM_REFRESH_INTERVAL_MS = 10 * 60 * 1000;

/** Keep auth cookies fresh during long exam sessions (access token default: 15 min). */
export function useExamSessionRefresh(active: boolean): void {
  useEffect(() => {
    if (!active || !isAuthEnabled()) return;

    const tick = () => {
      void refreshSession().catch(() => undefined);
    };

    const id = window.setInterval(tick, EXAM_REFRESH_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [active]);
}
