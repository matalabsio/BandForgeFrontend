"use client";

import { useEffect, useRef, useState } from "react";

type TimerArgs = {
  startedAtIso: string | null;
  serverTimeIso: string | null;
  durationSeconds: number;
  active: boolean;
  onExpire?: () => void;
};

/**
 * Compute remaining seconds from server `started_at + duration`.
 * - Anchored to absolute end timestamp (no drift on tab background).
 * - Uses server-client offset to correct local clock skew.
 */
export function useListeningTimer({
  startedAtIso,
  serverTimeIso,
  durationSeconds,
  active,
  onExpire,
}: TimerArgs): number {
  const [remaining, setRemaining] = useState<number>(durationSeconds);
  const expireFiredRef = useRef(false);

  useEffect(() => {
    expireFiredRef.current = false;
  }, [startedAtIso]);

  useEffect(() => {
    if (!startedAtIso) {
      setRemaining(durationSeconds);
      return;
    }
    const startedMs = new Date(startedAtIso).getTime();
    const serverMs = serverTimeIso ? new Date(serverTimeIso).getTime() : Date.now();
    const offset = serverMs - Date.now();
    const endMs = startedMs + durationSeconds * 1000;

    const tick = () => {
      const clientNow = Date.now() + offset;
      const left = Math.max(0, Math.round((endMs - clientNow) / 1000));
      setRemaining(left);
      if (left <= 0 && !expireFiredRef.current && active) {
        expireFiredRef.current = true;
        onExpire?.();
      }
    };

    tick();
    if (!active) return;
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [startedAtIso, serverTimeIso, durationSeconds, active, onExpire]);

  return remaining;
}

export function formatRemaining(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
