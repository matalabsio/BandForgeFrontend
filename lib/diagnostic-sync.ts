import { getMe, refreshSession } from "@/lib/auth";
import type { DiagnosticResultsSnapshot } from "@/lib/diagnostic-session";
import { hasSessionHintCookie } from "@/lib/session";

type DiagnosticCompleteBody = {
  client_attempt_id: string;
  listening_band: number | null;
  reading_band: number | null;
  writing_band: number | null;
  speaking_band: number | null;
  aggregate_band: number | null;
  review?: DiagnosticResultsSnapshot["review"];
  started_at?: string;
  completed_at?: string | null;
};

/** In-flight + success memo so remounts do not spam POST /diagnostic/complete. */
const completeInFlight = new Map<string, Promise<boolean>>();
const completeSucceeded = new Set<string>();

function isFullAccountRole(role: string | undefined): boolean {
  return Boolean(role && role !== "guest");
}

/** Cookie-only — BFF forwards bf_access; never send a browser-readable Bearer. */
function authHeaders(): HeadersInit {
  return { "Content-Type": "application/json" };
}

async function postComplete(body: DiagnosticCompleteBody): Promise<Response> {
  return fetch("/api/diagnostic/complete", {
    method: "POST",
    credentials: "include",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
}

async function resolveFullAccountUser(): Promise<boolean> {
  if (!hasSessionHintCookie()) return false;
  try {
    let user = await getMe().catch(() => null);
    if (!user) {
      await refreshSession();
      user = await getMe().catch(() => null);
    }
    return isFullAccountRole(user?.role);
  } catch {
    return false;
  }
}

async function syncDiagnosticToServerOnce(
  snapshot: DiagnosticResultsSnapshot,
  startedAt?: string,
): Promise<boolean> {
  if (!(await resolveFullAccountUser())) return false;

  const body: DiagnosticCompleteBody = {
    client_attempt_id: snapshot.mock_attempt_id,
    listening_band: snapshot.listening_band,
    reading_band: snapshot.reading_band,
    writing_band: snapshot.writing_band,
    speaking_band: snapshot.speaking_band,
    aggregate_band: snapshot.aggregate_band,
    review: snapshot.review,
    started_at: startedAt,
    completed_at: snapshot.completed_at ?? null,
  };

  try {
    let res = await postComplete(body);
    if (res.status === 401) {
      try {
        await refreshSession();
      } catch {
        return false;
      }
      if (!(await resolveFullAccountUser())) return false;
      res = await postComplete(body);
    }
    // Backend returns 400 for guest role — treat as non-fatal skip.
    if (res.status === 400) return false;
    return res.ok;
  } catch {
    /* non-blocking — local results remain in localStorage */
    return false;
  }
}

/**
 * Sync diagnostic bands when a logged-in student completes the funnel.
 * Skips guests (backend rejects them). Retries once after refresh on 401.
 * Dedupes concurrent / remount callers by client_attempt_id.
 */
export async function syncDiagnosticToServer(
  snapshot: DiagnosticResultsSnapshot,
  startedAt?: string,
): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const attemptId = snapshot.mock_attempt_id?.trim();
  if (!attemptId) return false;

  if (completeSucceeded.has(attemptId)) return true;

  const existing = completeInFlight.get(attemptId);
  if (existing) return existing;

  const pending = syncDiagnosticToServerOnce(snapshot, startedAt).then(
    (ok) => {
      completeInFlight.delete(attemptId);
      if (ok) completeSucceeded.add(attemptId);
      return ok;
    },
    (err) => {
      completeInFlight.delete(attemptId);
      throw err;
    },
  );
  completeInFlight.set(attemptId, pending);
  return pending;
}

/** Test-only: clear complete dedupe memo. */
export function resetDiagnosticCompleteDedupeForTests(): void {
  completeInFlight.clear();
  completeSucceeded.clear();
}
