import {
  ApiError,
  parseApiError,
  parseJsonResponse,
  type ApiErrorBody,
} from "@/lib/api";
import { fetchWithTimeout } from "@/lib/fetch-server";
import { serverAuthHeaders } from "@/lib/server-auth-headers";
import { isAuthEnabled } from "@/lib/flags";
import {
  ACCESS_COOKIE,
  clearAuthStorage,
  getAccessToken,
  getRefreshToken,
  persistAuthTokens,
  REFRESH_COOKIE,
  type AuthUser,
} from "@/lib/session";

/** Used when NEXT_PUBLIC_AUTH_ENABLED is false (local UI / mock dev). */
export const GUEST_USER: AuthUser = {
  id: "00000000-0000-0000-0000-000000000000",
  email: null,
  full_name: "Guest",
  phone: null,
  email_verified: false,
  phone_verified: false,
};

export type AuthResponse = {
  user: AuthUser;
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string | null;
};

export type MessageResponse = {
  ok?: boolean;
  message: string;
};

function clientAuthHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers(extra);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (typeof window !== "undefined") {
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
}

async function authFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`/api/auth/${path}`, {
    ...init,
    credentials: "include",
    headers: clientAuthHeaders(init?.headers),
  });
  const body = await parseJsonResponse<T | ApiErrorBody>(res);
  if (!res.ok) {
    throw new ApiError(parseApiError(body as ApiErrorBody, res.status), res.status);
  }
  return body as T;
}

function storeAuthFromResponse(data: AuthResponse): void {
  persistAuthTokens(data.access_token, data.refresh_token);
}

export async function register(input: {
  email: string;
  password: string;
  full_name?: string;
}): Promise<MessageResponse> {
  return authFetch<MessageResponse>("register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** Save phone/email to Supabase signup_leads (no MSG91 SMS yet). */
export async function collectLead(input: {
  phone?: string;
  email?: string;
  full_name?: string;
  channel?: string;
}): Promise<MessageResponse> {
  return authFetch<MessageResponse>("collect-lead", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function login(input: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const data = await authFetch<AuthResponse>("login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  storeAuthFromResponse(data);
  return data;
}

export async function sendOtp(phone: string): Promise<MessageResponse> {
  return authFetch<MessageResponse>("send-otp", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
}

export async function verifyOtp(input: {
  phone: string;
  code: string;
}): Promise<AuthResponse> {
  const data = await authFetch<AuthResponse>("verify-otp", {
    method: "POST",
    body: JSON.stringify(input),
  });
  storeAuthFromResponse(data);
  return data;
}

export async function verifyEmail(token: string): Promise<AuthResponse> {
  const data = await authFetch<AuthResponse>("verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
  storeAuthFromResponse(data);
  return data;
}

export async function refreshSession(): Promise<AuthResponse> {
  const data = await authFetch<AuthResponse>("refresh", { method: "POST" });
  storeAuthFromResponse(data);
  return data;
}

/** Restore session from localStorage refresh token when cookies were cleared. */
export async function restoreSessionFromStorage(): Promise<AuthResponse | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    const data = await authFetch<AuthResponse>("restore", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refresh }),
    });
    storeAuthFromResponse(data);
    return data;
  } catch {
    return null;
  }
}

function hasBrowserAuthCookies(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .some((c) => {
      const name = c.trim().split("=")[0];
      return name === ACCESS_COOKIE || name === REFRESH_COOKIE;
    });
}

/**
 * On app load: restore JWT from localStorage into cookies when needed, then refresh.
 * Avoids server-side refresh (rotates tokens without updating browser cookies).
 */
export async function ensureSession(): Promise<AuthResponse | null> {
  const storedRefresh = getRefreshToken();

  if (!hasBrowserAuthCookies() && storedRefresh) {
    const restored = await restoreSessionFromStorage();
    if (restored) return restored;
  }

  try {
    return await refreshSession();
  } catch (err) {
    if (err instanceof ApiError && err.status === 401 && storedRefresh) {
      const restored = await restoreSessionFromStorage();
      if (restored) return restored;
      await logout();
      return null;
    }
    if (err instanceof ApiError && err.status === 401) {
      await logout();
      return null;
    }
    return null;
  }
}

/** Server pages: send users to bootstrap (never straight to login) to try localStorage restore. */
export function authGuardRedirectPath(nextPath: string): string {
  return authBootstrapPath(nextPath);
}

/** True if cookie header may contain stale BandForge session cookies. */
export function hasAuthCookies(cookieHeader: string): boolean {
  return /(?:^|;\s*)bf_(?:refresh|access)=/.test(cookieHeader);
}

export function loginPathWithNext(nextPath: string, sessionExpired = false): string {
  const next =
    nextPath.startsWith("/") && !nextPath.startsWith("//")
      ? nextPath
      : "/dashboard";
  const q = new URLSearchParams({ next });
  if (sessionExpired) q.set("session", "expired");
  return `/login?${q.toString()}`;
}

export async function logout(): Promise<void> {
  try {
    await authFetch<MessageResponse>("logout", { method: "POST" });
  } finally {
    clearAuthStorage();
  }
}

export async function forgotPassword(email: string): Promise<MessageResponse> {
  return authFetch<MessageResponse>("forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(input: {
  token: string;
  password: string;
}): Promise<MessageResponse> {
  return authFetch<MessageResponse>("reset-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getMe(): Promise<AuthUser> {
  return authFetch<AuthUser>("me", { method: "GET" });
}

function backendBase(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    "http://localhost:8000"
  );
}

/** Redirect target when a protected server page cannot resolve the user. */
export function authBootstrapPath(nextPath: string): string {
  const next =
    nextPath.startsWith("/") && !nextPath.startsWith("//")
      ? nextPath
      : "/dashboard";
  return `/auth/bootstrap?next=${encodeURIComponent(next)}`;
}

export async function getServerUser(cookieHeader: string): Promise<AuthUser | null> {
  if (!isAuthEnabled()) return GUEST_USER;

  const base = backendBase();
  if (!cookieHeader.trim()) return null;

  try {
    const meRes = await fetchWithTimeout(`${base}/auth/me`, {
      headers: serverAuthHeaders(cookieHeader),
      cache: "no-store",
      timeoutMs: 3_000,
    });
    if (meRes.ok) {
      return (await meRes.json()) as AuthUser;
    }
    return null;
  } catch {
    return null;
  }
}
