import type { AuthResponse } from "@/lib/auth";
import { DIAGNOSTIC_MOCK_TEST_ID } from "@/lib/diagnostic-catalog";
import { persistAuthTokens } from "@/lib/session";
import { parseApiError, parseJsonResponse, type ApiErrorBody } from "@/lib/api";
import { ApiError } from "@/lib/api";
import { mockAttemptStorageKey } from "@/modules/mock/lib/mock-session-storage";

import type { ModuleReviewQuestion } from "@/lib/module-review-types";
import type { DiagnosticWritingEvaluation } from "@/lib/diagnostic-evaluate-writing";

/** Persist diagnostic band snapshot for /plan upsell. */
export const DIAGNOSTIC_RESULTS_STORAGE_KEY = "bf-diagnostic-results";
const DIAGNOSTIC_RESULTS_LOCAL_KEY = "bf-diagnostic-results-local";
const DIAGNOSTIC_ATTEMPT_LOCAL_KEY = "bf-diagnostic-mock-attempt-id";

export type DiagnosticReviewItem = {
  id: string;
  number: number;
  prompt: string;
  userAnswer: string;
  correctAnswer: string;
  skill: string;
};

export type DiagnosticModuleReview = {
  wrong: DiagnosticReviewItem[];
  bySkill: Record<string, { correct: number; total: number }>;
  /** Full per-question review for SectionAnswerReview UI. */
  questions?: ModuleReviewQuestion[];
};

export type DiagnosticResultsSnapshot = {
  mock_attempt_id: string;
  aggregate_band: number | null;
  listening_band: number | null;
  reading_band: number | null;
  writing_band: number | null;
  speaking_band: number | null;
  completed_at?: string | null;
  review_status?: "instant" | "pending_human";
  review?: {
    listening?: DiagnosticModuleReview;
    reading?: DiagnosticModuleReview;
  };
  writingEvaluation?: DiagnosticWritingEvaluation;
};

export function persistDiagnosticAttemptId(mockAttemptId: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      mockAttemptStorageKey(DIAGNOSTIC_MOCK_TEST_ID),
      mockAttemptId,
    );
    localStorage.setItem(DIAGNOSTIC_ATTEMPT_LOCAL_KEY, mockAttemptId);
  } catch {
    /* ignore */
  }
}

export function readDiagnosticAttemptId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return (
      sessionStorage.getItem(mockAttemptStorageKey(DIAGNOSTIC_MOCK_TEST_ID)) ??
      localStorage.getItem(DIAGNOSTIC_ATTEMPT_LOCAL_KEY)
    );
  } catch {
    return null;
  }
}

export function persistDiagnosticResults(snapshot: DiagnosticResultsSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    const json = JSON.stringify(snapshot);
    sessionStorage.setItem(DIAGNOSTIC_RESULTS_STORAGE_KEY, json);
    localStorage.setItem(DIAGNOSTIC_RESULTS_LOCAL_KEY, json);
    persistDiagnosticAttemptId(snapshot.mock_attempt_id);
  } catch {
    /* ignore */
  }
}

export function readDiagnosticResults(): DiagnosticResultsSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      sessionStorage.getItem(DIAGNOSTIC_RESULTS_STORAGE_KEY) ??
      localStorage.getItem(DIAGNOSTIC_RESULTS_LOCAL_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DiagnosticResultsSnapshot;
  } catch {
    return null;
  }
}

let guestSessionPromise: Promise<AuthResponse> | null = null;

/** Mint or refresh a diagnostic guest JWT (httpOnly cookies via BFF). */
export async function ensureDiagnosticGuestSession(): Promise<AuthResponse> {
  if (guestSessionPromise) return guestSessionPromise;
  guestSessionPromise = (async () => {
    try {
      const res = await fetch("/api/diagnostic/guest-session", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const body = await parseJsonResponse<AuthResponse | ApiErrorBody>(res);
      if (!res.ok) {
        throw new ApiError(parseApiError(body as ApiErrorBody, res.status), res.status);
      }
      const auth = body as AuthResponse;
      if (auth.access_token) {
        persistAuthTokens(auth.access_token);
      }
      return auth;
    } finally {
      guestSessionPromise = null;
    }
  })();
  return guestSessionPromise;
}
