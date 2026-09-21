/**
 * /diagnostic landing bootstrap decisions (FSP redirect vs resume vs lead form).
 * Pure helper for unit tests — no network or storage.
 */

export type DiagnosticStartGateDecision =
  | { kind: "redirect_dashboard" }
  | { kind: "auto_resume" }
  | { kind: "show_form" };

/**
 * After subscription check (or fail/timeout treated as non-FSP):
 * FSP → dashboard; else in-progress local attempt → resume; else lead form.
 */
export function decideDiagnosticStartGate(opts: {
  isFsp: boolean;
  hasInProgress: boolean;
}): DiagnosticStartGateDecision {
  if (opts.isFsp) return { kind: "redirect_dashboard" };
  if (opts.hasInProgress) return { kind: "auto_resume" };
  return { kind: "show_form" };
}

/** Hard ceiling so a slow payments API never traps users on the start loader. */
export const DIAGNOSTIC_START_SUBSCRIPTION_TIMEOUT_MS = 5_000;
