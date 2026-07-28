import {
  hasFullSkillProgram,
  isDiagnosticComplete,
} from "@/lib/entitlement";
import type { LearningProfile } from "@/lib/learning-types";
import type { Subscription } from "@/lib/payments";

export type EntitledRouteResult =
  | { kind: "redirect"; path: string }
  | { kind: "paywall" }
  | { kind: "ok"; profile: LearningProfile };

type Args = {
  learning: LearningProfile;
  subscription: Subscription;
};

export function resolveEntitledRoute({
  learning,
  subscription,
}: Args): EntitledRouteResult {
  if (!hasFullSkillProgram(subscription)) {
    return { kind: "paywall" };
  }

  // Paid users stay on the entitled route even if diagnostic counters lag.
  return { kind: "ok", profile: learning };
}

export function resolveDiagnosticRoute(
  learning: LearningProfile,
): EntitledRouteResult | { kind: "redirect"; path: string } | { kind: "ok"; profile: LearningProfile } {
  if (!isDiagnosticComplete(learning)) {
    return { kind: "redirect", path: "/diagnostic" };
  }
  return { kind: "ok", profile: learning };
}
