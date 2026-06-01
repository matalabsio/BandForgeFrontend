"use client";

import { useCallback, useEffect, useRef } from "react";
import type { RecoverySnapshot } from "@/modules/listening/types";

const PREFIX = "bf-listening-";

function key(attemptId: string): string {
  return `${PREFIX}${attemptId}`;
}

export function readSnapshot(attemptId: string): RecoverySnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key(attemptId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RecoverySnapshot;
    if (parsed.attempt_id !== attemptId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearSnapshot(attemptId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key(attemptId));
  } catch {
    // ignore
  }
}

type Args = {
  attemptId: string | null;
  startedAtIso: string | null;
  answers: Record<string, string>;
  played: Record<string, true>;
  playedParts: Record<number, true>;
  remainingSeconds: number;
  enabled: boolean;
};

/**
 * Persist a recovery snapshot of the current attempt to localStorage.
 * Writes are throttled to once per second.
 */
export function useAttemptRecovery({
  attemptId,
  startedAtIso,
  answers,
  played,
  playedParts,
  remainingSeconds,
  enabled,
}: Args): void {
  const lastWriteRef = useRef(0);

  const write = useCallback(() => {
    if (!attemptId || !startedAtIso || typeof window === "undefined") return;
    const snapshot: RecoverySnapshot = {
      attempt_id: attemptId,
      started_at: startedAtIso,
      answers,
      played,
      played_parts: playedParts,
      remaining_time: remainingSeconds,
      saved_at: new Date().toISOString(),
    };
    try {
      window.localStorage.setItem(key(attemptId), JSON.stringify(snapshot));
    } catch {
      // localStorage full or unavailable; ignore
    }
  }, [attemptId, startedAtIso, answers, played, playedParts, remainingSeconds]);

  useEffect(() => {
    if (!enabled) return;
    const now = Date.now();
    if (now - lastWriteRef.current < 1000) return;
    lastWriteRef.current = now;
    write();
  }, [enabled, write]);
}
