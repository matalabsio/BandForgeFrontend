import {
  canAccessPracticeSkill,
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

/** Dashboard / study-plan / multi-skill routes — FSP only. */
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

type PracticeArgs = Args & {
  skill: string;
};

/**
 * Practice hub routes: FSP for all skills; Writing / Speaking / Dual packs
 * for their respective skills only.
 */
export function resolvePracticeEntitledRoute({
  learning,
  subscription,
  skill,
}: PracticeArgs): EntitledRouteResult {
  if (!canAccessPracticeSkill(subscription, skill)) {
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
