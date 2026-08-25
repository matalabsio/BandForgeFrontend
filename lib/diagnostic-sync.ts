import { refreshSession } from "@/lib/auth";
import type { DiagnosticResultsSnapshot } from "@/lib/diagnostic-session";
import { getAccessToken, hasSessionHintCookie } from "@/lib/session";

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

type JwtPayload = {
  email?: string | null;
  phone?: string | null;
  role?: string;
};

/** In-flight + success memo so remounts do not spam POST /diagnostic/complete. */
const completeInFlight = new Map<string, Promise<boolean>>();
const completeSucceeded = new Set<string>();

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const padded = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(
      typeof atob !== "undefined"
        ? atob(padded)
        : Buffer.from(padded, "base64").toString("utf8"),
    ) as JwtPayload;
    return json;
  } catch {
    return null;
  }
}

/**
 * Access tokens don't carry role. Diagnostic guests are minted with null
 * email + phone; full accounts have at least one identity claim.
 */
function isLikelyFullAccountToken(token: string | null): boolean {
  if (!token) return false;
  const payload = decodeJwtPayload(token);
  if (!payload) return false;
  if (payload.role === "guest") return false;
  if (payload.role && payload.role !== "guest") return true;
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const phone = typeof payload.phone === "string" ? payload.phone.trim() : "";
  return Boolean(email || phone);
}

function authHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function postComplete(body: DiagnosticCompleteBody): Promise<Response> {
  return fetch("/api/diagnostic/complete", {
    method: "POST",
    credentials: "include",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
}

async function syncDiagnosticToServerOnce(
  snapshot: DiagnosticResultsSnapshot,
  startedAt?: string,
): Promise<boolean> {
  let access = getAccessToken();
  if (!isLikelyFullAccountToken(access)) {
    // Stale/missing access — try cookie refresh before deciding guest.
    if (!hasSessionHintCookie() && !access) return false;
    try {
      await refreshSession();
    } catch {
      return false;
    }
    access = getAccessToken();
    if (!isLikelyFullAccountToken(access)) return false;
  }

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
      if (!isLikelyFullAccountToken(getAccessToken())) return false;
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
