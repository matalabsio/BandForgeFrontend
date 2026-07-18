import type { LearningProfile } from "@/lib/learning-types";
import type { Subscription } from "@/lib/payments";
import { FULL_SKILL_PROGRAM_SLUG } from "@/lib/plan-preview";

const SKILL_KEYS = ["listening", "reading", "writing", "speaking"] as const;

export function hasFullSkillProgram(
  sub: Subscription | null | undefined,
): boolean {
  if (!sub?.is_active) return false;
  if (sub.plan_slug === FULL_SKILL_PROGRAM_SLUG) return true;
  const slug = (sub.plan_slug ?? "").toLowerCase();
  const name = (sub.plan_name ?? "").toLowerCase();
  return slug.includes("full_skill") || name.includes("full skill");
}

export function hasModuleSummaryBands(profile: LearningProfile): boolean {
  const summary = profile.module_summary ?? {};
  return SKILL_KEYS.some((key) => {
    const row = summary[key];
    return row?.latest != null && row.latest > 0;
  });
}

export function isDiagnosticComplete(profile: LearningProfile): boolean {
  if ((profile.source_counts?.diagnostic ?? 0) > 0) return true;
  return hasModuleSummaryBands(profile);
}
