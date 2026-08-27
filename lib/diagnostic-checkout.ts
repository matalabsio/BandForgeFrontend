import {
  DUAL_BUNDLE_SLUG,
  FULL_SKILL_PROGRAM_SLUG,
  SPEAKING_SKILL_SLUG,
  WRITING_SKILL_SLUG,
  type RecommendableSlug,
} from "@/lib/diagnostic-plan-content";
import {
  hasDualBundlePlan,
  hasFullSkillProgram,
  hasSpeakingSkillPlan,
  hasWritingSkillPlan,
  PRACTICE_PATH,
  SPEAKING_PRACTICE_PATH,
  WRITING_PRACTICE_PATH,
} from "@/lib/entitlement";
import type { Subscription } from "@/lib/payments";

export const DIAGNOSTIC_CHECKOUT_SLUGS = [
  FULL_SKILL_PROGRAM_SLUG,
  WRITING_SKILL_SLUG,
  SPEAKING_SKILL_SLUG,
  DUAL_BUNDLE_SLUG,
] as const;

export type DiagnosticCheckoutSlug = RecommendableSlug;

export type ActivePlanRef = { slug: string; amount: number };

export function isKnownDiagnosticCheckoutSlug(
  slug: string | null | undefined,
): slug is DiagnosticCheckoutSlug {
  if (!slug) return false;
  return (DIAGNOSTIC_CHECKOUT_SLUGS as readonly string[]).includes(slug);
}

export function normalizeDiagnosticCheckoutSlug(
  slug: string | null | undefined,
): DiagnosticCheckoutSlug | null {
  const trimmed = slug?.trim().toLowerCase();
  if (!trimmed || !isKnownDiagnosticCheckoutSlug(trimmed)) return null;
  return trimmed;
}

/**
 * Resolve the slug that diagnostic checkout should use.
 * Flag off → always FSP (legacy). Flag on → pending resume, then click, then FSP.
 */
export function resolveDiagnosticCheckoutSlug(opts: {
  requestedSlug?: string | null;
  multiSkuEnabled: boolean;
  pendingResumeSlug?: string | null;
}): DiagnosticCheckoutSlug {
  if (!opts.multiSkuEnabled) {
    return FULL_SKILL_PROGRAM_SLUG;
  }
  return (
    normalizeDiagnosticCheckoutSlug(opts.pendingResumeSlug) ??
    normalizeDiagnosticCheckoutSlug(opts.requestedSlug) ??
    FULL_SKILL_PROGRAM_SLUG
  );
}

export function isPlanSlugPurchasable(
  slug: string,
  activePlans: ActivePlanRef[],
): boolean {
  const normalized = normalizeDiagnosticCheckoutSlug(slug);
  if (!normalized) return false;
  return activePlans.some((plan) => plan.slug === normalized);
}

export class CheckoutPlanNotPurchasableError extends Error {
  slug: string;

  constructor(slug: string) {
    super(`Plan "${slug}" is not available for purchase.`);
    this.slug = slug;
    this.name = "CheckoutPlanNotPurchasableError";
  }
}

/** Server-side create-order guard mirror — reject unknown/inactive slugs before API call. */
export function assertPlanSlugPurchasable(
  slug: string,
  activePlans: ActivePlanRef[],
): DiagnosticCheckoutSlug {
  const normalized = normalizeDiagnosticCheckoutSlug(slug);
  if (!normalized) {
    throw new CheckoutPlanNotPurchasableError(slug);
  }
  if (!isPlanSlugPurchasable(normalized, activePlans)) {
    throw new CheckoutPlanNotPurchasableError(normalized);
  }
  return normalized;
}

export function userAlreadyEntitledToPlanSlug(
  sub: Subscription | null | undefined,
  slug: DiagnosticCheckoutSlug,
): boolean {
  switch (slug) {
    case FULL_SKILL_PROGRAM_SLUG:
      return hasFullSkillProgram(sub);
    case WRITING_SKILL_SLUG:
      return hasWritingSkillPlan(sub);
    case SPEAKING_SKILL_SLUG:
      return hasSpeakingSkillPlan(sub);
    case DUAL_BUNDLE_SLUG:
      return hasDualBundlePlan(sub);
    default:
      return false;
  }
}

/** Skip payment when the user already owns the selected pack (or FSP dashboard). */
export function destinationForEntitledPlanSlug(
  slug: DiagnosticCheckoutSlug,
): string {
  switch (slug) {
    case FULL_SKILL_PROGRAM_SLUG:
      return "/dashboard?activating=1";
    case WRITING_SKILL_SLUG:
      return WRITING_PRACTICE_PATH;
    case SPEAKING_SKILL_SLUG:
      return SPEAKING_PRACTICE_PATH;
    case DUAL_BUNDLE_SLUG:
      return PRACTICE_PATH;
    default:
      return "/pricing";
  }
}

/** Structured diagnostic commerce trail (browser console). */
export function diagnosticSkuTraceLog(
  event: string,
  fields: Record<string, string | boolean | number | null | undefined> = {},
): void {
  console.info(
    JSON.stringify({
      scope: "bandforge_diagnostic",
      event,
      ...fields,
    }),
  );
}

export function logDiagnosticSkuCheckoutClick(opts: {
  slug: DiagnosticCheckoutSlug;
  wasPrimary: boolean;
}): void {
  diagnosticSkuTraceLog("diagnostic_sku_checkout_click", {
    slug: opts.slug,
    was_primary: opts.wasPrimary,
  });
}

export function logDiagnosticSkuPurchased(slug: DiagnosticCheckoutSlug): void {
  diagnosticSkuTraceLog("diagnostic_sku_purchased", { slug });
}

export function logDiagnosticSkuRecommended(opts: {
  primary: string;
  weakSkills: readonly string[];
  targetBand: number;
  bands: Record<string, number | null>;
}): void {
  diagnosticSkuTraceLog("diagnostic_sku_recommended", {
    primary: opts.primary,
    weak_skills: opts.weakSkills.join(","),
    target_band: opts.targetBand,
    bands: JSON.stringify(opts.bands),
  });
}
