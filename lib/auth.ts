import {
  ApiError,
  parseApiError,
  parseJsonResponse,
  type ApiErrorBody,
} from "@/lib/api";
import { fetchWithTimeout } from "@/lib/fetch-server";
import { isAuthEnabled } from "@/lib/flags";
import {
  clearAuthStorage,
  persistAuthTokens,
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

async function authFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`/api/auth/${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
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
  const { getRefreshToken } = await import("@/lib/session");
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

/**
 * On app load: refresh via cookie, or restore from localStorage if cookies missing.
 */
export async function ensureSession(): Promise<AuthResponse | null> {
  try {
    return await refreshSession();
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      return restoreSessionFromStorage();
    }
    return null;
  }
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
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
    if (meRes.ok) {
      return (await meRes.json()) as AuthUser;
    }

    if (meRes.status !== 401) return null;

    const refreshRes = await fetchWithTimeout(`${base}/auth/refresh`, {
      method: "POST",
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
    if (!refreshRes.ok) return null;

    const data = (await refreshRes.json()) as AuthResponse;
    return data.user ?? null;
  } catch {
    return null;
  }
}
