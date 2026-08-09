import { cache } from "react";
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

export type SubscriptionFetchResult = {
  subscription: Subscription;
  /** False when the API errored/timed out — not the same as unpaid. */
  known: boolean;
};

/** Deduped per RSC request — layout + page share one subscription round-trip. */
export const fetchSubscriptionResult = cache(
  async (cookieHeader: string): Promise<SubscriptionFetchResult> => {
    if (!isAuthEnabled() || !cookieHeader.trim()) {
      return { subscription: emptySubscription(), known: true };
    }
    try {
      const res = await fetchWithTimeout(
        `${getApiUrl()}/api/payments/subscription`,
        {
          headers: serverAuthHeaders(cookieHeader),
          cache: "no-store",
          timeoutMs: FETCH_MS,
        },
      );
      if (!res.ok) {
        return { subscription: emptySubscription(), known: false };
      }
      return {
        subscription: (await res.json()) as Subscription,
        known: true,
      };
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[payments] subscription fetch failed:", err);
      }
      return { subscription: emptySubscription(), known: false };
    }
  },
);

export async function fetchSubscription(
  cookieHeader: string,
): Promise<Subscription> {
  return (await fetchSubscriptionResult(cookieHeader)).subscription;
}
