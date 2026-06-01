import { collectSetCookieHeaders, parseSetCookieHeader } from "@/lib/auth-cookies";
import type { AuthResponse } from "@/lib/auth";
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

/** Rotate session on EC2 when refresh cookie is valid. */
export async function refreshServerAuth(
  cookieHeader: string,
): Promise<{ user: AuthUser; cookieHeader: string } | null> {
  if (!/(?:^|;\s*)bf_refresh=/.test(cookieHeader)) return null;

  try {
    const res = await fetchWithTimeout(`${backendBase()}/auth/refresh`, {
      method: "POST",
      headers: { cookie: cookieHeader },
      cache: "no-store",
      timeoutMs: 8_000,
    });
    if (!res.ok) return null;

    const data = (await res.json()) as AuthResponse;
    const nextHeader = mergeAuthCookieHeader(
      cookieHeader,
      collectSetCookieHeaders(res.headers),
      data,
    );
    return { user: data.user, cookieHeader: nextHeader };
  } catch {
    return null;
  }
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
