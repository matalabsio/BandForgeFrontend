import { getApiUrl } from "@/lib/api";
import { fetchWithTimeout } from "@/lib/fetch-server";
import { isAuthEnabled } from "@/lib/flags";
import type { Subscription } from "@/lib/payments";
import { serverAuthHeaders } from "@/lib/server-auth-headers";

const FETCH_MS = 10_000;

export function emptySubscription(): Subscription {
  return {
    is_active: false,
    plan_slug: null,
    plan_name: null,
    status: null,
    starts_at: null,
    expires_at: null,
  };
}

export async function fetchSubscription(
  cookieHeader: string,
): Promise<Subscription> {
  if (!isAuthEnabled() || !cookieHeader.trim()) return emptySubscription();
  try {
    const res = await fetchWithTimeout(
      `${getApiUrl()}/api/payments/subscription`,
      {
        headers: serverAuthHeaders(cookieHeader),
        cache: "no-store",
        timeoutMs: FETCH_MS,
      },
    );
    if (!res.ok) return emptySubscription();
    return (await res.json()) as Subscription;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[payments] subscription fetch failed:", err);
    }
    return emptySubscription();
  }
}
