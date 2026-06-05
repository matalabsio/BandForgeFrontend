"use client";

import { useEffect, useRef, useState } from "react";

export type ComputeRemainingArgs = {
  startedAtIso: string | null;
  serverTimeIso: string | null;
  durationSeconds: number;
  nowMs?: number;
};

/** Pure deadline math — remaining seconds from server-anchored start + duration. */
export function computeRemainingSeconds({
  startedAtIso,
  serverTimeIso,
  durationSeconds,
  nowMs = Date.now(),
}: ComputeRemainingArgs): number {
  if (!startedAtIso) return durationSeconds;
  const startedMs = new Date(startedAtIso).getTime();
  const serverMs = serverTimeIso
    ? new Date(serverTimeIso).getTime()
    : nowMs;
  const offset = serverMs - nowMs;
  const endMs = startedMs + durationSeconds * 1000;
  const clientNow = nowMs + offset;
  return Math.max(0, Math.round((endMs - clientNow) / 1000));
}

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
 * - Re-ticks on tab visible and when `active` becomes true (catch-up).
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
  const activeRef = useRef(active);
  const onExpireRef = useRef(onExpire);
  const tickRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    expireFiredRef.current = false;
  }, [startedAtIso]);

  useEffect(() => {
    activeRef.current = active;

    if (!startedAtIso) {
      setRemaining(durationSeconds);
      tickRef.current = null;
      return;
    }

    const tick = () => {
      const left = computeRemainingSeconds({
        startedAtIso,
        serverTimeIso,
        durationSeconds,
      });
      setRemaining(left);
      if (
        left <= 0 &&
        !expireFiredRef.current &&
        activeRef.current
      ) {
        expireFiredRef.current = true;
        onExpireRef.current?.();
      }
    };

    tickRef.current = tick;
    tick();

    if (!active) return;

    const id = window.setInterval(tick, 1000);

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        tick();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [startedAtIso, serverTimeIso, durationSeconds, active]);

  return remaining;
}

export function formatRemaining(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
