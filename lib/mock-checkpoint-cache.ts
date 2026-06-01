/** Cached submit payload so checkpoint can paint instantly before one API round trip. */

export type CheckpointSubmitCache = {
  band: number;
  raw_score: number;
  total_questions: number;
  skill_breakdown: Record<
    string,
    { correct: number; total: number; pct: number }
  >;
};

const key = (attemptId: string) => `bf-mock-checkpoint-${attemptId}`;

export function cacheCheckpointSubmit(
  attemptId: string,
  payload: CheckpointSubmitCache,
): void {
  try {
    sessionStorage.setItem(key(attemptId), JSON.stringify(payload));
  } catch {
    /* ignore quota / private mode */
  }
}

export function readCheckpointSubmit(
  attemptId: string,
): CheckpointSubmitCache | null {
  try {
    const raw = sessionStorage.getItem(key(attemptId));
    if (!raw) return null;
    return JSON.parse(raw) as CheckpointSubmitCache;
  } catch {
    return null;
  }
}

export function clearCheckpointSubmit(attemptId: string): void {
  try {
    sessionStorage.removeItem(key(attemptId));
  } catch {
    /* ignore */
  }
}

const ADVANCE_KEY = "bf-mock-section-advance";

export type SectionAdvanceNotice = {
  from: "reading" | "listening";
  band: number;
  raw_score: number;
  total_questions: number;
};

export function cacheSectionAdvance(notice: SectionAdvanceNotice): void {
  try {
    sessionStorage.setItem(ADVANCE_KEY, JSON.stringify(notice));
  } catch {
    /* ignore */
  }
}

export function consumeSectionAdvance(): SectionAdvanceNotice | null {
  try {
    const raw = sessionStorage.getItem(ADVANCE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(ADVANCE_KEY);
    return JSON.parse(raw) as SectionAdvanceNotice;
  } catch {
    return null;
  }
}
