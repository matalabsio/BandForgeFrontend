import type { LearningProfile } from "@/lib/learning-types";
import type { Entitlements, Subscription } from "@/lib/payments";
import { FULL_SKILL_PROGRAM_SLUG } from "@/lib/plan-preview";

export const WRITING_SKILL_SLUG = "writing_skill";
export const SPEAKING_SKILL_SLUG = "speaking_skill";
export const DUAL_BUNDLE_SLUG = "dual_bundle";

const SKILL_KEYS = ["listening", "reading", "writing", "speaking"] as const;

export type PracticeAccessKind = "fsp" | "writing_skill" | "none";

export function emptyEntitlements(): Entitlements {
  return {
    plans: [],
    skills: {
      listening: false,
      reading: false,
      writing: false,
      speaking: false,
    },
    writing_skill: false,
    full_skill_program: false,
  };
}

/**
 * Prefer multi-SKU ``entitlements`` from the API when present.
 * Falls back to single ``plan_slug`` for older responses / offline mocks.
 */
export function resolveEntitlementsFromSubscription(
  sub: Subscription | null | undefined,
): Entitlements {
  if (sub?.entitlements) {
    return {
      plans: [...(sub.entitlements.plans ?? [])],
      skills: {
        listening: Boolean(sub.entitlements.skills?.listening),
        reading: Boolean(sub.entitlements.skills?.reading),
        writing: Boolean(sub.entitlements.skills?.writing),
        speaking: Boolean(sub.entitlements.skills?.speaking),
      },
      writing_skill: Boolean(sub.entitlements.writing_skill),
      full_skill_program: Boolean(sub.entitlements.full_skill_program),
    };
  }

  // Legacy single-row fallback (order-dependent — avoid once entitlements ship).
  const out = emptyEntitlements();
  if (!sub?.is_active) return out;
  const slug = (sub.plan_slug ?? "").toLowerCase();
  const name = (sub.plan_name ?? "").toLowerCase();
  if (slug === FULL_SKILL_PROGRAM_SLUG || slug.includes("full_skill") || name.includes("full skill")) {
    out.plans.push(FULL_SKILL_PROGRAM_SLUG);
    out.full_skill_program = true;
    out.skills.listening = true;
    out.skills.reading = true;
    out.skills.writing = true;
    out.skills.speaking = true;
  }
  if (slug === WRITING_SKILL_SLUG || name.includes("writing skill")) {
    if (!out.plans.includes(WRITING_SKILL_SLUG)) out.plans.push(WRITING_SKILL_SLUG);
    out.writing_skill = true;
    out.skills.writing = true;
  }
  return out;
}

export function hasFullSkillProgram(
  sub: Subscription | null | undefined,
): boolean {
  return resolveEntitlementsFromSubscription(sub).full_skill_program;
}

/** Active Writing Skill pack SKU (not FSP, not generic premium). */
export function hasWritingSkillPlan(
  sub: Subscription | null | undefined,
): boolean {
  return resolveEntitlementsFromSubscription(sub).writing_skill;
}

/**
 * Writing practice access: FSP or Writing Skill pack.
 * Does not treat arbitrary active subscriptions as writing access.
 */
export function hasWritingAccess(
  sub: Subscription | null | undefined,
): boolean {
  return resolveEntitlementsFromSubscription(sub).skills.writing;
}

/**
 * Practice access mode. FSP wins for behavior when both exist;
 * entitlements still report both flags as true.
 */
export function resolvePracticeAccessKind(
  sub: Subscription | null | undefined,
): PracticeAccessKind {
  const ent = resolveEntitlementsFromSubscription(sub);
  if (ent.full_skill_program) return "fsp";
  if (ent.writing_skill) return "writing_skill";
  return "none";
}

export function canAccessPracticeSkill(
  sub: Subscription | null | undefined,
  skill: string,
): boolean {
  const kind = resolvePracticeAccessKind(sub);
  if (kind === "fsp") return true;
  if (kind === "writing_skill") return skill === "writing";
  return false;
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

/** Subscribed users always reach the dashboard; others need a completed diagnostic baseline. */
export function canAccessPersonalizedDashboard(
  profile: LearningProfile,
  subscription: Subscription | null | undefined,
): boolean {
  if (hasFullSkillProgram(subscription)) return true;
  return isDiagnosticComplete(profile);
}

export const WRITING_SKILL_ONBOARDING_PATH = "/practice/writing/onboarding";
export const WRITING_PRACTICE_PATH = "/practice/writing";
export const SPEAKING_PRACTICE_PATH = "/practice/speaking";

function planSlugInSubscription(
  sub: Subscription | null | undefined,
  slug: string,
): boolean {
  const ent = resolveEntitlementsFromSubscription(sub);
  if (ent.plans.includes(slug)) return true;
  if (!sub?.is_active) return false;
  return (sub.plan_slug ?? "").toLowerCase() === slug;
}

/** Active Speaking Skill pack SKU (not FSP). */
export function hasSpeakingSkillPlan(
  sub: Subscription | null | undefined,
): boolean {
  return planSlugInSubscription(sub, SPEAKING_SKILL_SLUG);
}

/** Active Dual Bundle SKU (not FSP). */
export function hasDualBundlePlan(
  sub: Subscription | null | undefined,
): boolean {
  return planSlugInSubscription(sub, DUAL_BUNDLE_SLUG);
}

/**
 * Where to send the user after checkout unlock succeeds.
 * FSP → dashboard activating. Writing Skill only → track onboarding.
 * Dual SKU: FSP-first (dashboard), without losing Writing Skill entitlement flags.
 */
export function postCheckoutDestination(
  sub: Subscription | null | undefined,
  opts?: { receiptPlanSlug?: string | null },
): string {
  if (hasFullSkillProgram(sub)) {
    return "/dashboard?activating=1";
  }
  const receiptSlug = (opts?.receiptPlanSlug ?? "").toLowerCase();
  if (hasDualBundlePlan(sub) || receiptSlug === DUAL_BUNDLE_SLUG) {
    return WRITING_PRACTICE_PATH;
  }
  if (hasWritingSkillPlan(sub) || receiptSlug === WRITING_SKILL_SLUG) {
    return WRITING_PRACTICE_PATH;
  }
  if (hasSpeakingSkillPlan(sub) || receiptSlug === SPEAKING_SKILL_SLUG) {
    return SPEAKING_PRACTICE_PATH;
  }
  return "/pricing";
}

/** Subscription is “unlocked” for checkout success (any sellable diagnostic SKU). */
export function subscriptionUnlocksAfterCheckout(
  sub: Subscription | null | undefined,
): boolean {
  return (
    hasFullSkillProgram(sub) ||
    hasWritingSkillPlan(sub) ||
    hasSpeakingSkillPlan(sub) ||
    hasDualBundlePlan(sub)
  );
}
