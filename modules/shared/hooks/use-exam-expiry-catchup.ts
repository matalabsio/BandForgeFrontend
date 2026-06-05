"use client";

import { useEffect, useRef } from "react";

type Args = {
  remaining: number;
  canSubmit: boolean;
  onExpire?: () => void;
  /** Reset catch-up when a new attempt starts (e.g. started_at / attempt id). */
  resetKey?: string | null;
};

/**
 * Fires `onExpire` once when the deadline has passed and the module is ready
 * to submit. Covers return-after-browser-close when timer expiry ran before
 * questions hydrated or while intro UI blocked `active`.
 */
export function useExamExpiryCatchUp({
  remaining,
  canSubmit,
  onExpire,
  resetKey,
}: Args): void {
  const firedRef = useRef(false);

  useEffect(() => {
    firedRef.current = false;
  }, [resetKey]);

  useEffect(() => {
    if (remaining > 0) return;
    if (!canSubmit) return;
    if (firedRef.current) return;
    firedRef.current = true;
    onExpire?.();
  }, [remaining, canSubmit, onExpire, resetKey]);
}
