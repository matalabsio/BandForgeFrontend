import { cache } from "react";
import {
  emptyLearningProfile,
  fetchLearningProfile,
} from "@/lib/learning-server";
import { fetchSubscription } from "@/lib/payments-server";

/**
 * Deduped per RSC request. Study-plan layout + today/full page share one
 * profile + subscription pair instead of doubling ~5s profile work.
 */
export const fetchEntitledContext = cache(
  async (cookieHeader: string, userId: string) => {
    const [learning, subscription] = await Promise.all([
      fetchLearningProfile(cookieHeader),
      fetchSubscription(cookieHeader),
    ]);
    const profile = learning ?? emptyLearningProfile(userId);
    return { profile, subscription };
  },
);

/**
 * Paywall gate only — skips the heavy learning profile (today rewrite, hubs).
 * Use on practice hub/exercise routes that don't render the study plan.
 * Subscription is still request-cached via fetchSubscription.
 */
export const fetchEntitlementGate = cache(
  async (cookieHeader: string, userId: string) => {
    const subscription = await fetchSubscription(cookieHeader);
    return {
      profile: emptyLearningProfile(userId),
      subscription,
    };
  },
);
