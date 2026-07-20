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

const FULL_SKILL_PROGRAM_TIER = "full_skill_program";

/** True when the user has an exam-date-bound personalized plan (paid program). */
export function hasActivePersonalizedPlan(profile: LearningProfile): boolean {
  const plan = profile.study_plan;
  const tier = plan?.plan_tier;
  if (tier !== FULL_SKILL_PROGRAM_TIER) return false;

  const examRaw = profile.exam_date ?? plan?.exam_date;
  if (!examRaw) return false;

  const exam = new Date(String(examRaw).slice(0, 10));
  if (Number.isNaN(exam.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  exam.setHours(0, 0, 0, 0);
  if (exam < today) return false;

  return (plan.weeks?.length ?? 0) > 0;
}

/** Subscribed users with a generated plan may use the dashboard even if diagnostic flags are stale. */
export function canAccessPersonalizedDashboard(
  profile: LearningProfile,
  subscription: Subscription | null | undefined,
): boolean {
  if (!hasFullSkillProgram(subscription)) return false;
  return isDiagnosticComplete(profile) || hasActivePersonalizedPlan(profile);
}
