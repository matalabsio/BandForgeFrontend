import { cache } from "react";
import { getApiUrl } from "@/lib/api";
import { fetchWithTimeout } from "@/lib/fetch-server";
import { isAuthEnabled } from "@/lib/flags";
import type { Plan, Subscription } from "@/lib/payments";
import { serverAuthHeaders } from "@/lib/server-auth-headers";

const FETCH_MS = 10_000;
const PLANS_FETCH_MS = 4_000;

export function emptySubscription(): Subscription {
  return {
    is_active: false,
    plan_slug: null,
    plan_name: null,
    status: null,
    starts_at: null,
    expires_at: null,
    entitlements: {
      plans: [],
      skills: {
        listening: false,
        reading: false,
        writing: false,
        speaking: false,
      },
      writing_skill: false,
      full_skill_program: false,
    },
  };
}

export type SubscriptionFetchResult = {
  subscription: Subscription;
  /** False when the API errored/timed out — not the same as unpaid. */
  known: boolean;
};

export type PlansFetchResult = {
  plans: Plan[];
  payments_enabled: boolean;
  checkout_test_mode: boolean;
  /** False when the API errored/timed out. */
  known: boolean;
};

/** Public catalog — cache briefly so /pricing SSR is fast on repeat visits. */
export const fetchPlansResult = cache(async (): Promise<PlansFetchResult> => {
  try {
    const res = await fetchWithTimeout(`${getApiUrl()}/api/payments/plans`, {
      next: { revalidate: 60 },
      timeoutMs: PLANS_FETCH_MS,
    });
    if (!res.ok) {
      return {
        plans: [],
        payments_enabled: false,
        checkout_test_mode: false,
        known: false,
      };
    }
    const data = (await res.json()) as {
      plans: Plan[];
      payments_enabled: boolean;
      checkout_test_mode: boolean;
    };
    return {
      plans: data.plans ?? [],
      payments_enabled: Boolean(data.payments_enabled),
      checkout_test_mode: Boolean(data.checkout_test_mode),
      known: true,
    };
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[payments] plans fetch failed:", err);
    }
    return {
      plans: [],
      payments_enabled: false,
      checkout_test_mode: false,
      known: false,
    };
  }
});

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
