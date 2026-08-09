"use client";

import { useEffect, useRef, useState } from "react";

export type ComputeRemainingArgs = {
  startedAtIso: string | null;
  durationSeconds: number;
  nowMs?: number;
  /**
   * Frozen skew: `serverNowMs - clientNowMs` captured once at sync.
   * Do not recompute from a stale `server_time` snapshot each tick.
   */
  clockOffsetMs?: number;
  /**
   * @deprecated Prefer `clockOffsetMs`. Kept for call-site compatibility;
   * if provided without `clockOffsetMs`, treated as a one-shot sync using `nowMs`.
   */
  serverTimeIso?: string | null;
};

function parseTimeMs(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime();
  return Number.isFinite(ms) ? ms : null;
}

/**
 * Resolve a frozen clock offset from an optional sync snapshot.
 * When only `serverTimeIso` is given, offset is `serverMs - nowMs` for that instant.
 */
export function resolveClockOffsetMs({
  serverTimeIso,
  nowMs = Date.now(),
  clockOffsetMs,
}: {
  serverTimeIso?: string | null;
  nowMs?: number;
  clockOffsetMs?: number;
}): number {
  if (typeof clockOffsetMs === "number" && Number.isFinite(clockOffsetMs)) {
    return clockOffsetMs;
  }
  const serverMs = parseTimeMs(serverTimeIso ?? null);
  if (serverMs == null) return 0;
  return serverMs - nowMs;
}

/** Pure deadline math — remaining seconds from server-anchored start + duration. */
export function computeRemainingSeconds({
  startedAtIso,
  durationSeconds,
  nowMs = Date.now(),
  clockOffsetMs,
  serverTimeIso = null,
}: ComputeRemainingArgs): number {
  if (!startedAtIso) return Math.max(0, durationSeconds);
  const startedMs = parseTimeMs(startedAtIso);
  if (startedMs == null) return Math.max(0, durationSeconds);

  const offset = resolveClockOffsetMs({
    serverTimeIso,
    nowMs,
    clockOffsetMs,
  });
  const endMs = startedMs + durationSeconds * 1000;
  const clientNow = nowMs + offset;
  const left = Math.round((endMs - clientNow) / 1000);
  return Number.isFinite(left) ? Math.max(0, left) : Math.max(0, durationSeconds);
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
 * - Freezes server-client offset once when `serverTimeIso` / start change.
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
  const clockOffsetMsRef = useRef(0);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    expireFiredRef.current = false;
  }, [startedAtIso]);

  useEffect(() => {
    const syncNow = Date.now();
    clockOffsetMsRef.current = resolveClockOffsetMs({
      serverTimeIso,
      nowMs: syncNow,
    });
  }, [startedAtIso, serverTimeIso]);

  useEffect(() => {
    activeRef.current = active;

    if (!startedAtIso) {
      setRemaining(durationSeconds);
      return;
    }

    const tick = () => {
      const left = computeRemainingSeconds({
        startedAtIso,
        durationSeconds,
        nowMs: Date.now(),
        clockOffsetMs: clockOffsetMsRef.current,
      });
      setRemaining(left);
      if (left <= 0 && !expireFiredRef.current && activeRef.current) {
        expireFiredRef.current = true;
        onExpireRef.current?.();
      }
    };

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
