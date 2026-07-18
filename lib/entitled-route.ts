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
  if (!isDiagnosticComplete(learning)) {
    return { kind: "redirect", path: "/diagnostic" };
  }

  if (!hasFullSkillProgram(subscription)) {
    return { kind: "paywall" };
  }

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
