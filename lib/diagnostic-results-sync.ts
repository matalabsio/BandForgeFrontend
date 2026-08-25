import type { DiagnosticLatest } from "@/lib/diagnostic-latest-types";
import type { DiagnosticResultsSnapshot } from "@/lib/diagnostic-session";
import { persistDiagnosticResults } from "@/lib/diagnostic-session";
import { syncDiagnosticToServer } from "@/lib/diagnostic-sync";
import { readDiagnosticProgress } from "@/lib/diagnostic-storage";
import {
  mergeServerLatestIntoLocal,
  shouldAcceptServerLatest,
} from "@/lib/diagnostic-results-reconcile";

export {
  mergeServerLatestIntoLocal,
  shouldAcceptServerLatest,
} from "@/lib/diagnostic-results-reconcile";

/** Client BFF read of GET /api/diagnostic/latest. */
export async function fetchDiagnosticLatestClient(): Promise<DiagnosticLatest | null> {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch("/api/diagnostic/latest", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as DiagnosticLatest;
  } catch {
    return null;
  }
}

/**
 * Idempotent retry of POST /complete for the current local snapshot,
 * then reconcile with /latest only when client_attempt_id matches.
 */
export async function retryDiagnosticCompleteSyncAndReconcile(
  local: DiagnosticResultsSnapshot,
): Promise<DiagnosticResultsSnapshot> {
  const progress = readDiagnosticProgress();
  await syncDiagnosticToServer(local, progress?.startedAt).catch(() => false);

  const latest = await fetchDiagnosticLatestClient();
  if (!latest || !shouldAcceptServerLatest(local, latest)) {
    return local;
  }

  const merged = mergeServerLatestIntoLocal(local, latest);
  persistDiagnosticResults(merged);
  return merged;
}
