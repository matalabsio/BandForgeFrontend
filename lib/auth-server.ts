import { collectSetCookieHeaders, parseSetCookieHeader } from "@/lib/auth-cookies";
import type { AuthResponse } from "@/lib/auth";
import { coalescedServerRefresh } from "@/lib/auth-refresh-coordinator";
import { fetchWithTimeout } from "@/lib/fetch-server";
import { serverAuthHeaders } from "@/lib/server-auth-headers";
import { isAuthEnabled } from "@/lib/flags";
import {
  ACCESS_COOKIE,
  GUEST_USER,
  REFRESH_COOKIE,
  type AuthUser,
} from "@/lib/session";

function backendBase(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    "http://localhost:8000"
  );
}

/** True when JWT access token is missing or past expiry (30s skew). */
export function accessTokenExpired(token: string): boolean {
  try {
    const part = token.split(".")[1];
    if (!part) return true;
    const padded = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(
      typeof atob !== "undefined"
        ? atob(padded)
        : Buffer.from(padded, "base64").toString("utf8"),
    ) as { exp?: number };
    if (typeof json.exp !== "number") return true;
    return Date.now() / 1000 >= json.exp - 30;
  } catch {
    return true;
  }
}

function mergeAuthCookieHeader(
  existing: string,
  setCookieHeaders: string[],
  tokens?: { access_token?: string; refresh_token?: string | null },
): string {
  const jar = new Map<string, string>();
  for (const segment of existing.split(";")) {
    const trimmed = segment.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    jar.set(trimmed.slice(0, eq), trimmed.slice(eq + 1));
  }
  for (const raw of setCookieHeaders) {
    const parsed = parseSetCookieHeader(raw);
    if (parsed) jar.set(parsed.name, parsed.value);
  }
  if (tokens?.access_token) jar.set(ACCESS_COOKIE, tokens.access_token);
  if (tokens?.refresh_token) jar.set(REFRESH_COOKIE, tokens.refresh_token);

  return Array.from(jar.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
}

async function refreshAuthSessionOnce(
  cookieHeader: string,
): Promise<{
  cookieHeader: string;
  setCookieHeaders: string[];
  auth: AuthResponse;
} | null> {
  const res = await fetchWithTimeout(`${backendBase()}/auth/refresh`, {
    method: "POST",
    headers: { cookie: cookieHeader },
    cache: "no-store",
    timeoutMs: 8_000,
  });
  if (!res.ok) return null;

  const setCookieHeaders = collectSetCookieHeaders(res.headers);
  const auth = (await res.json()) as AuthResponse;
  const nextHeader = mergeAuthCookieHeader(
    cookieHeader,
    setCookieHeaders,
    auth,
  );
  return { cookieHeader: nextHeader, setCookieHeaders, auth };
}

/** Rotate session when refresh cookie is valid (for RSC and API route handlers). */
export async function refreshAuthSession(
  cookieHeader: string,
): Promise<{
  cookieHeader: string;
  setCookieHeaders: string[];
  auth: AuthResponse;
} | null> {
  if (!/(?:^|;\s*)bf_refresh=/.test(cookieHeader)) return null;

  try {
    return await coalescedServerRefresh(cookieHeader, refreshAuthSessionOnce);
  } catch {
    return null;
  }
}

/** Rotate session on EC2 when refresh cookie is valid. */
export async function refreshServerAuth(
  cookieHeader: string,
): Promise<{ user: AuthUser; cookieHeader: string } | null> {
  const refreshed = await refreshAuthSession(cookieHeader);
  if (!refreshed) return null;
  return { user: refreshed.auth.user, cookieHeader: refreshed.cookieHeader };
}

/** Resolve user for RSC; refreshes access token server-side when /auth/me returns 401. */
export async function getServerAuth(
  cookieHeader: string,
): Promise<{ user: AuthUser | null; cookieHeader: string }> {
  if (!isAuthEnabled()) {
    return { user: GUEST_USER, cookieHeader };
  }
  if (!cookieHeader.trim()) {
    return { user: null, cookieHeader };
  }

  let header = cookieHeader;
  try {
    const meRes = await fetchWithTimeout(`${backendBase()}/auth/me`, {
      headers: serverAuthHeaders(header),
      cache: "no-store",
      timeoutMs: 8_000,
    });
    if (meRes.ok) {
      return { user: (await meRes.json()) as AuthUser, cookieHeader: header };
    }
    if (meRes.status === 401) {
      const refreshed = await refreshServerAuth(header);
      if (refreshed) return refreshed;
    }
    return { user: null, cookieHeader: header };
  } catch {
    return { user: null, cookieHeader: header };
  }
}
