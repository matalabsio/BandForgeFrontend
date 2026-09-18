export const ACCESS_COOKIE = "bf_access";
export const REFRESH_COOKIE = "bf_refresh";
/** Readable by JS — signals httpOnly auth cookies may exist (no token value). */
export const SESSION_HINT_COOKIE = "bf_has_session";

/**
 * Legacy localStorage key — never write; only clear on cleanup.
 * Access JWTs live in httpOnly bf_access (and optional page-lifetime memory).
 */
export const LS_ACCESS_TOKEN = "bf_access_token";
export const LS_REFRESH_TOKEN = "bf_refresh_token";

/** Page-lifetime access JWT for exam refresh scheduling only — never persisted. */
let accessTokenMemory: string | null = null;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/** Remove legacy bf_access_token if an older build left it behind. */
export function clearLegacyAccessToken(): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(LS_ACCESS_TOKEN);
  } catch {
    /* private mode / blocked */
  }
}

/**
 * Set in-memory access for this page lifetime only.
 * Never writes bf_access_token; always scrubs any legacy LS value.
 */
export function setAccessToken(token: string | null): void {
  accessTokenMemory = token;
  clearLegacyAccessToken();
}

/** In-memory access only — never reads or trusts localStorage. */
export function getAccessToken(): string | null {
  clearLegacyAccessToken();
  return accessTokenMemory;
}

export function setRefreshToken(token: string | null): void {
  // Refresh JWTs must not live in localStorage (XSS). Only allow clear for migration.
  if (!canUseStorage()) return;
  if (token) return;
  window.localStorage.removeItem(LS_REFRESH_TOKEN);
}

/** Legacy LS refresh — read for one-shot cookie restore migration only. */
export function getRefreshToken(): string | null {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(LS_REFRESH_TOKEN);
}

export function clearLegacyRefreshToken(): void {
  setRefreshToken(null);
}

/**
 * After login/refresh/OTP: keep access in memory for this tab only.
 * httpOnly bf_access / bf_refresh are set by the BFF; do not persist access to LS.
 */
export function persistAuthTokens(
  accessToken: string,
  _refreshToken?: string | null,
): void {
  setAccessToken(accessToken);
  clearLegacyRefreshToken();
}

export function clearAccessToken(): void {
  accessTokenMemory = null;
  clearLegacyAccessToken();
}

export function clearAuthStorage(): void {
  clearAccessToken();
  clearLegacyRefreshToken();
}

/** True when document.cookie contains the non-httpOnly session hint. */
export function hasSessionHintCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((c) => {
    const name = c.trim().split("=")[0];
    return name === SESSION_HINT_COOKIE;
  });
}

/**
 * UX hint that cookies may restore a session — never an authorization decision.
 * Does not use bf_access_token (legacy key is scrubbed only).
 */
export function hasLikelyClientSession(): boolean {
  if (typeof document === "undefined") return false;
  clearLegacyAccessToken();
  return (
    hasSessionHintCookie() ||
    Boolean(getRefreshToken()) // legacy migrate-once
  );
}

export type AuthUser = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  avatar_url?: string | null;
  avatar_display_url?: string | null;
  target_band?: number | null;
  /** YYYY-MM-DD exam / test date from diagnostic or profile edit */
  exam_date?: string | null;
  ielts_purpose?: string | null;
  ielts_goal?: string | null;
  /** FSP Writing track: academic | general_training | null */
  exam_module?: "academic" | "general_training" | null;
  role?: string;
  is_active?: boolean;
};

/** Minimal authenticated user for shell rendering (layout, auth guards). */
export type SessionUser = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  avatar_display_url: string | null;
  is_active: boolean;
  ielts_purpose?: string | null;
  ielts_goal?: string | null;
};

/** Used when NEXT_PUBLIC_AUTH_ENABLED is false (local UI / mock dev). */
export const GUEST_USER: AuthUser = {
  id: "00000000-0000-0000-0000-000000000000",
  email: null,
  full_name: "Guest",
  phone: null,
  email_verified: false,
  phone_verified: false,
};

export const GUEST_SESSION: SessionUser = {
  id: GUEST_USER.id,
  full_name: GUEST_USER.full_name,
  email: GUEST_USER.email,
  role: "student",
  avatar_display_url: null,
  is_active: true,
};
