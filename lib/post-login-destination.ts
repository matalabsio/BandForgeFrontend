const DASHBOARD_PATH = "/dashboard";
const DIAGNOSTIC_LANDING_PATH = "/diagnostic";
const DIAGNOSTIC_RESULTS_PATH = "/diagnostic/results";
const ONBOARDING_PATH = "/onboarding";

/** App entry paths that should follow diagnostic-first routing. */
const DEFAULT_ENTRY_PATHS = new Set([
  DASHBOARD_PATH,
  DIAGNOSTIC_LANDING_PATH,
  ONBOARDING_PATH,
  "/",
]);

export type PostLoginDestinationOptions = {
  /** Server learning profile already has a diagnostic baseline. */
  hasServerDiagnostic?: boolean;
  /** Active Full Skill Program subscription. */
  hasPaidFullSkillProgram?: boolean;
};

export function safePostLoginPath(raw: string | null | undefined): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return DASHBOARD_PATH;
  }
  return raw;
}

function isDefaultEntryPath(path: string): boolean {
  return DEFAULT_ENTRY_PATHS.has(path);
}

/**
 * Resolve where to send a user after login / OAuth continue.
 *
 * Diagnostic-first:
 * - No diagnostic + dashboard/onboarding/diagnostic entry → `/diagnostic`
 * - Local or server diagnostic + unpaid entry → `/diagnostic/results` (plan + checkout)
 * - Diagnostic + paid → `/dashboard` for default entries
 * - Explicit deep links (`/pricing`, `/scores`, …) are preserved
 */
export function resolvePostLoginDestination(
  requestedPath: string | null | undefined,
  hasLocalDiagnosticResults: boolean,
  options: PostLoginDestinationOptions = {},
): string {
  const safePath = safePostLoginPath(requestedPath);
  const hasServerDiagnostic = Boolean(options.hasServerDiagnostic);
  const hasPaid = Boolean(options.hasPaidFullSkillProgram);
  const hasDiagnostic = hasLocalDiagnosticResults || hasServerDiagnostic;

  // Legacy plan URL → results (checkout lives there now)
  if (safePath === "/diagnostic/plan" || safePath.startsWith("/diagnostic/plan#")) {
    return `${DIAGNOSTIC_RESULTS_PATH}#plan-unlock`;
  }

  if (isDefaultEntryPath(safePath)) {
    if (!hasDiagnostic) {
      return DIAGNOSTIC_LANDING_PATH;
    }
    if (hasPaid) {
      return DASHBOARD_PATH;
    }
    return `${DIAGNOSTIC_RESULTS_PATH}#plan-unlock`;
  }

  return safePath;
}
