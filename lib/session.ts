export const ACCESS_COOKIE = "bf_access";
export const REFRESH_COOKIE = "bf_refresh";

/** localStorage keys — survives browser restarts (unlike in-memory session). */
export const LS_ACCESS_TOKEN = "bf_access_token";
export const LS_REFRESH_TOKEN = "bf_refresh_token";

let accessTokenMemory: string | null = null;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function setAccessToken(token: string | null): void {
  accessTokenMemory = token;
  if (!canUseStorage()) return;
  if (token) {
    window.localStorage.setItem(LS_ACCESS_TOKEN, token);
  } else {
    window.localStorage.removeItem(LS_ACCESS_TOKEN);
  }
}

export function getAccessToken(): string | null {
  if (accessTokenMemory) return accessTokenMemory;
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(LS_ACCESS_TOKEN);
}

export function setRefreshToken(token: string | null): void {
  if (!canUseStorage()) return;
  if (token) {
    window.localStorage.setItem(LS_REFRESH_TOKEN, token);
  } else {
    window.localStorage.removeItem(LS_REFRESH_TOKEN);
  }
}

export function getRefreshToken(): string | null {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(LS_REFRESH_TOKEN);
}

export function persistAuthTokens(
  accessToken: string,
  refreshToken?: string | null,
): void {
  setAccessToken(accessToken);
  if (refreshToken) setRefreshToken(refreshToken);
}

export function clearAccessToken(): void {
  accessTokenMemory = null;
  if (!canUseStorage()) return;
  window.localStorage.removeItem(LS_ACCESS_TOKEN);
}

export function clearAuthStorage(): void {
  clearAccessToken();
  setRefreshToken(null);
}

/** True when the browser may have a restorable session (avoids noisy /api/auth calls on login). */
export function hasLikelyClientSession(): boolean {
  if (typeof document === "undefined") return false;
  const hasCookie = document.cookie.split(";").some((c) => {
    const name = c.trim().split("=")[0];
    return name === ACCESS_COOKIE || name === REFRESH_COOKIE;
  });
  return hasCookie || Boolean(getRefreshToken()) || Boolean(getAccessToken());
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
