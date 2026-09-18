import type { LearningProfile } from "@/lib/learning-types";
import type { Entitlements, Subscription } from "@/lib/payments";
import { FULL_SKILL_PROGRAM_SLUG } from "@/lib/plan-preview";
import { isAllowedSkillCoursePath } from "./post-login-destination";

export { isAllowedSkillCoursePath } from "./post-login-destination";
export { FULL_SKILL_PROGRAM_SLUG } from "@/lib/plan-preview";

export const WRITING_SKILL_SLUG = "writing_skill";
export const SPEAKING_SKILL_SLUG = "speaking_skill";
export const DUAL_BUNDLE_SLUG = "dual_bundle";

const SKILL_KEYS = ["listening", "reading", "writing", "speaking"] as const;

export type PracticeAccessKind =
  | "fsp"
  | "writing_skill"
  | "speaking_skill"
  | "dual_bundle"
  | "none";

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
    speaking_skill: false,
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
    const out: Entitlements = {
      plans: [...(sub.entitlements.plans ?? [])],
      skills: {
        listening: Boolean(sub.entitlements.skills?.listening),
        reading: Boolean(sub.entitlements.skills?.reading),
        writing: Boolean(sub.entitlements.skills?.writing),
        speaking: Boolean(sub.entitlements.skills?.speaking),
      },
      writing_skill: Boolean(sub.entitlements.writing_skill),
      speaking_skill: Boolean(sub.entitlements.speaking_skill),
      full_skill_program: Boolean(sub.entitlements.full_skill_program),
    };
    // Dual Bundle composes Writing + Speaking pack access at the entitlement layer.
    if (
      out.plans.includes(DUAL_BUNDLE_SLUG) ||
      (sub.is_active && (sub.plan_slug ?? "").toLowerCase() === DUAL_BUNDLE_SLUG)
    ) {
      if (!out.plans.includes(DUAL_BUNDLE_SLUG)) out.plans.push(DUAL_BUNDLE_SLUG);
      out.writing_skill = true;
      out.speaking_skill = true;
      out.skills.writing = true;
      out.skills.speaking = true;
    }
    return out;
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
  if (slug === SPEAKING_SKILL_SLUG || name.includes("speaking skill")) {
    if (!out.plans.includes(SPEAKING_SKILL_SLUG)) out.plans.push(SPEAKING_SKILL_SLUG);
    out.speaking_skill = true;
    out.skills.speaking = true;
  }
  if (slug === DUAL_BUNDLE_SLUG || name.includes("dual bundle")) {
    if (!out.plans.includes(DUAL_BUNDLE_SLUG)) out.plans.push(DUAL_BUNDLE_SLUG);
    out.writing_skill = true;
    out.speaking_skill = true;
    out.skills.writing = true;
    out.skills.speaking = true;
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
 * Priority: FSP → dual_bundle → writing_skill → speaking_skill → none.
 */
export function resolvePracticeAccessKind(
  sub: Subscription | null | undefined,
): PracticeAccessKind {
  const ent = resolveEntitlementsFromSubscription(sub);
  if (ent.full_skill_program) return "fsp";
  if (hasDualBundlePlan(sub)) return "dual_bundle";
  if (ent.writing_skill) return "writing_skill";
  if (ent.speaking_skill) return "speaking_skill";
  return "none";
}

/**
 * Per-skill practice gate. Pack checks are independent so Writing + Speaking
 * singles (or Dual) unlock the right skills even when kind priority prefers writing.
 */
export function canAccessPracticeSkill(
  sub: Subscription | null | undefined,
  skill: string,
): boolean {
  if (hasFullSkillProgram(sub)) return true;
  if (skill === "writing") {
    return hasWritingSkillPlan(sub);
  }
  if (skill === "speaking") {
    return hasSpeakingSkillPlan(sub);
  }
  return false;
}

/**
 * True when the user has Writing and/or Speaking and/or Dual packs but not FSP.
 * Used for pack-only shell nav (hide Today / Full plan / Library).
 */
export function isPackOnlyAccess(
  sub: Subscription | null | undefined,
): boolean {
  if (hasFullSkillProgram(sub)) return false;
  return (
    hasWritingSkillPlan(sub) ||
    hasSpeakingSkillPlan(sub) ||
    hasDualBundlePlan(sub)
  );
}

export type PaywallSkuSlug =
  | typeof WRITING_SKILL_SLUG
  | typeof SPEAKING_SKILL_SLUG
  | typeof DUAL_BUNDLE_SLUG
  | typeof FULL_SKILL_PROGRAM_SLUG;

/**
 * SKU to buy when the user cannot access a practice skill route.
 * Returns null when already entitled.
 */
export function missingSkuForPracticeSkill(
  sub: Subscription | null | undefined,
  skill: string,
): PaywallSkuSlug | null {
  if (canAccessPracticeSkill(sub, skill)) return null;
  if (skill === "writing") return WRITING_SKILL_SLUG;
  if (skill === "speaking") return SPEAKING_SKILL_SLUG;
  // Listening / Reading / unknown → Full Skill Program
  return FULL_SKILL_PROGRAM_SLUG;
}

/** Pricing deep-link for a sellable SKU. */
export function pricingHrefForSku(slug: PaywallSkuSlug): string {
  return `/pricing#plan-${slug}`;
}

/**
 * Skill-pack card unlocks on `/practice` (non-FSP index only).
 * FSP never renders this catalog — do not treat FSP as owning Dual/pack cards.
 */
export function isWritingPackUnlocked(
  sub: Subscription | null | undefined,
): boolean {
  return !hasFullSkillProgram(sub) && hasWritingSkillPlan(sub);
}

export function isSpeakingPackUnlocked(
  sub: Subscription | null | undefined,
): boolean {
  return !hasFullSkillProgram(sub) && hasSpeakingSkillPlan(sub);
}

export function isDualPackUnlocked(
  sub: Subscription | null | undefined,
): boolean {
  return !hasFullSkillProgram(sub) && hasDualBundlePlan(sub);
}

/**
 * Non-FSP `/practice` catalog: omit the Dual purchase card when the Dual SKU
 * is owned, or when Writing + Speaking singles already cover both skills.
 */
export function shouldHideDualPackCard(
  sub: Subscription | null | undefined,
): boolean {
  return (
    hasDualBundlePlan(sub) ||
    (hasWritingSkillPlan(sub) && hasSpeakingSkillPlan(sub))
  );
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
/** Dual Bundle course chooser (Writing + Speaking cards). */
export const PRACTICE_PATH = "/practice";

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
  return resolveEntitlementsFromSubscription(sub).speaking_skill;
}

/** Active Dual Bundle SKU (not FSP). */
export function hasDualBundlePlan(
  sub: Subscription | null | undefined,
): boolean {
  return planSlugInSubscription(sub, DUAL_BUNDLE_SLUG);
}

/**
 * Where to send the user after checkout unlock succeeds.
 * When receiptPlanSlug is a known sellable SKU, that purchase wins over
 * pre-existing pack entitlements (e.g. already owns Writing, just bought Speaking).
 * Without a reliable receipt slug, fall back to entitlement priority:
 * FSP → Dual → Writing → Speaking → pricing.
 */
export function postCheckoutDestination(
  sub: Subscription | null | undefined,
  opts?: { receiptPlanSlug?: string | null },
): string {
  const receiptSlug = (opts?.receiptPlanSlug ?? "").toLowerCase();
  if (receiptSlug === FULL_SKILL_PROGRAM_SLUG) {
    return "/dashboard?activating=1";
  }
  if (receiptSlug === DUAL_BUNDLE_SLUG) {
    return PRACTICE_PATH;
  }
  if (receiptSlug === WRITING_SKILL_SLUG) {
    return WRITING_PRACTICE_PATH;
  }
  if (receiptSlug === SPEAKING_SKILL_SLUG) {
    return SPEAKING_PRACTICE_PATH;
  }

  if (hasFullSkillProgram(sub)) {
    return "/dashboard?activating=1";
  }
  if (hasDualBundlePlan(sub)) {
    return PRACTICE_PATH;
  }
  if (hasWritingSkillPlan(sub)) {
    return WRITING_PRACTICE_PATH;
  }
  if (hasSpeakingSkillPlan(sub)) {
    return SPEAKING_PRACTICE_PATH;
  }
  return "/pricing";
}

/**
 * Post-login / checkout-resume course destination for skill-pack buyers.
 * FSP (including FSP + Dual) → null (caller uses FSP dashboard path).
 * Dual → `/practice`; Writing/Speaking singles → their course homes.
 * Allowlist is shared with resolvePostLoginDestination (isAllowedSkillCoursePath).
 */
export function skillCoursePathForSubscription(
  sub: Subscription | null | undefined,
): string | null {
  if (!sub || hasFullSkillProgram(sub)) return null;
  if (!hasSpeakingSkillPlan(sub) && !hasWritingSkillPlan(sub)) return null;
  const dest = postCheckoutDestination(sub);
  return isAllowedSkillCoursePath(dest) ? dest : null;
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
