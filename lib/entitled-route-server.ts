import {
  emptyLearningProfile,
  fetchLearningProfile,
} from "@/lib/learning-server";
import { fetchSubscription } from "@/lib/payments-server";

export async function fetchEntitledContext(
  cookieHeader: string,
  userId: string,
) {
  const [learning, subscription] = await Promise.all([
    fetchLearningProfile(cookieHeader),
    fetchSubscription(cookieHeader),
  ]);
  const profile = learning ?? emptyLearningProfile(userId);
  return { profile, subscription };
}
