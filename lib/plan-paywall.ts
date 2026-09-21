import {
  FULL_SKILL_PROGRAM_SLUG,
  type PaywallSkuSlug,
} from "@/lib/entitlement";

export type PlanPaywallKind =
  | "diagnostic_start"
  | "diagnostic_unlock"
  | "purchase";

/**
 * Paywall copy kind for a blocked route.
 * Diagnostic Start/Unlock only when the caller explicitly opts in via
 * `hasDiagnostic` (dashboard unpaid flow). FSP-targeted entitlement gates
 * omit it and get the purchase CTA — pack ownership ≠ diagnostic wall.
 */
export function resolvePlanPaywallKind({
  targetSlug = FULL_SKILL_PROGRAM_SLUG,
  hasDiagnostic,
}: {
  targetSlug?: PaywallSkuSlug;
  /** When set, FSP paywall uses diagnostic Start/Unlock instead of purchase. */
  hasDiagnostic?: boolean;
}): PlanPaywallKind {
  if (targetSlug === FULL_SKILL_PROGRAM_SLUG && hasDiagnostic !== undefined) {
    return hasDiagnostic ? "diagnostic_unlock" : "diagnostic_start";
  }
  return "purchase";
}
