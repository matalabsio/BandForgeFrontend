import type { DiagnosticLatest } from "./diagnostic-latest-types";

/** Minimal local snapshot shape for reconcile (avoids @/ test import graph). */
export type DiagnosticResultsSnapshotLike = {
  mock_attempt_id: string;
  aggregate_band: number | null;
  listening_band: number | null;
  reading_band: number | null;
  writing_band: number | null;
  speaking_band: number | null;
  completed_at?: string | null;
  review_status?: "instant" | "pending_human";
  review?: unknown;
  writingEvaluation?: unknown;
};

/**
 * Accept /latest only when it is the same client attempt as local results.
 * Never overwrite local X with a different attempt.
 */
export function shouldAcceptServerLatest(
  local: DiagnosticResultsSnapshotLike,
  latest: DiagnosticLatest,
): boolean {
  const serverAttempt = latest.client_attempt_id?.trim();
  if (!serverAttempt) return false;
  return serverAttempt === local.mock_attempt_id;
}

/** Merge matching server bands into local snapshot; keep local review/eval. */
export function mergeServerLatestIntoLocal<T extends DiagnosticResultsSnapshotLike>(
  local: T,
  latest: DiagnosticLatest,
): T {
  return {
    ...local,
    mock_attempt_id: latest.client_attempt_id ?? local.mock_attempt_id,
    listening_band: latest.listening_band ?? local.listening_band,
    reading_band: latest.reading_band ?? local.reading_band,
    writing_band: latest.writing_band ?? local.writing_band,
    speaking_band: latest.speaking_band ?? local.speaking_band,
    aggregate_band: latest.aggregate_band ?? local.aggregate_band,
    completed_at: latest.completed_at ?? local.completed_at,
  };
}
