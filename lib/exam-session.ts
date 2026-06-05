import { ApiError } from "@/lib/api";
import type { AuthResponse } from "@/lib/auth";
import { refreshSession, restoreSessionFromStorage } from "@/lib/auth";
import { isAuthEnabled } from "@/lib/flags";
import {
  accessTokenExpired,
  EXAM_ACCESS_REFRESH_MARGIN_SEC,
} from "@/lib/jwt-expiry";
import {
  clearAccessToken,
  getAccessToken,
} from "@/lib/session";

export const EXAM_SESSION_EXPIRED_MESSAGE =
  "Session expired. Please sign in again, then retry.";

/** Background refresh cadence during an active exam (covers 30–60 min windows). */
export const EXAM_GUARD_INTERVAL_MS = 4 * 60 * 1000;

export class ExamSessionError extends ApiError {
  constructor(message = EXAM_SESSION_EXPIRED_MESSAGE) {
    super(message, 401);
    this.name = "ExamSessionError";
  }
}

/** Drop expired access mirror so it is never sent as Authorization. */
export function purgeExpiredAccessMirror(): void {
  if (!isAuthEnabled()) return;
  const access = getAccessToken();
  if (access && accessTokenExpired(access)) {
    clearAccessToken();
  }
}

/** True when access mirror is missing, expired, or expiring soon (proactive long-exam refresh). */
export function accessNeedsExamRefresh(access: string | null): boolean {
  if (!access) return true;
  return accessTokenExpired(access, EXAM_ACCESS_REFRESH_MARGIN_SEC);
}

export function needsProactiveExamRefresh(): boolean {
  if (!isAuthEnabled()) return false;
  return accessNeedsExamRefresh(getAccessToken());
}

/**
 * @deprecated Use needsProactiveExamRefresh
 */
export function isExamAccessStale(): boolean {
  if (!isAuthEnabled()) return false;
  const access = getAccessToken();
  if (!access) return false;
  return accessTokenExpired(access);
}

/**
 * @deprecated Use needsProactiveExamRefresh
 */
export function needsExamAccessMirrorSync(): boolean {
  return needsProactiveExamRefresh();
}

let guestSession: AuthResponse | null = null;

function guestAuthResponse(): AuthResponse {
  if (!guestSession) {
    guestSession = {
      user: {
        id: "00000000-0000-0000-0000-000000000000",
        email: null,
        full_name: "Guest",
        phone: null,
        email_verified: false,
        phone_verified: false,
      },
      access_token: "",
      token_type: "bearer",
      expires_in: 0,
    };
  }
  return guestSession;
}

function freshAccessResponse(access: string): AuthResponse {
  return {
    user: {
      id: "",
      email: null,
      full_name: null,
      phone: null,
      email_verified: false,
      phone_verified: false,
    },
    access_token: access,
    token_type: "bearer",
    expires_in: 0,
  };
}

async function refreshExamSession(): Promise<AuthResponse> {
  purgeExpiredAccessMirror();
  try {
    return await refreshSession();
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) {
      const restored = await restoreSessionFromStorage();
      if (restored) return restored;
      throw new ExamSessionError();
    }
    throw e;
  }
}

async function refreshExamSessionQuietly(): Promise<void> {
  try {
    await refreshExamSession();
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) {
      await restoreSessionFromStorage().catch(() => undefined);
    }
  }
}

/**
 * Background maintenance for long exams (30–60 min). Refreshes before access expires.
 * Never throws — valid httpOnly cookies can still authenticate until submit retry.
 */
export async function maintainExamSession(): Promise<void> {
  if (!needsProactiveExamRefresh()) return;
  purgeExpiredAccessMirror();
  await refreshExamSessionQuietly();
}

/** @deprecated Use maintainExamSession */
export const syncExamAccessMirror = maintainExamSession;

/**
 * Ensures a valid access token before exam API calls.
 * Throws ExamSessionError when refresh cannot restore the session.
 */
export async function ensureExamSession(): Promise<AuthResponse> {
  if (!isAuthEnabled()) {
    return guestAuthResponse();
  }

  purgeExpiredAccessMirror();

  const access = getAccessToken();
  if (access && !accessNeedsExamRefresh(access)) {
    return freshAccessResponse(access);
  }

  return refreshExamSession();
}

/** Proactive refresh before access expires (autosave / API preflight). */
export async function ensureExamSessionIfStale(): Promise<void> {
  if (!isAuthEnabled() || !needsProactiveExamRefresh()) return;
  await refreshExamSessionQuietly();
}

/** Before submit: sync mirror and fail fast only when session cannot be restored. */
export async function ensureExamSessionForSubmit(): Promise<AuthResponse> {
  return ensureExamSession();
}
