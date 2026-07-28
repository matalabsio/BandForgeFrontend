const DASHBOARD_PATH = "/dashboard";
const DIAGNOSTIC_LANDING_PATH = "/diagnostic";
const DIAGNOSTIC_RESULTS_PATH = "/diagnostic/results";
/** Unpaid post-login / checkout-resume destination (query survives OAuth). */
const DIAGNOSTIC_CHECKOUT_RETURN_PATH = "/diagnostic/results?checkout=1";
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

/** Pathname only — ignore query/hash for default-entry matching. */
function pathOnly(path: string): string {
  return path.split(/[?#]/, 1)[0] || path;
}

function isDefaultEntryPath(path: string): boolean {
  return DEFAULT_ENTRY_PATHS.has(pathOnly(path));
}

function isDiagnosticResultsPath(path: string): boolean {
  const base = pathOnly(path);
  return base === DIAGNOSTIC_RESULTS_PATH;
}

function isLegacyPlanPath(path: string): boolean {
  const base = pathOnly(path);
  return base === "/diagnostic/plan";
}

/**
 * Resolve where to send a user after login / OAuth continue.
 *
 * - Explicit `/dashboard` is preserved (paywall or personalized content lives there).
 * - Other default entries (`/`, `/onboarding`, `/diagnostic`) stay diagnostic-first when unpaid.
 * - Diagnostic + unpaid entry → `/diagnostic/results?checkout=1`
 * - Diagnostic + paid → `/dashboard` for default entries / results checkout
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

  // Legacy plan URL → results checkout resume
  if (isLegacyPlanPath(safePath)) {
    return hasPaid ? DASHBOARD_PATH : DIAGNOSTIC_CHECKOUT_RETURN_PATH;
  }

  // Explicit results / checkout return — preserve when unpaid; dashboard when paid
  if (isDiagnosticResultsPath(safePath)) {
    return hasPaid ? DASHBOARD_PATH : safePath;
  }

  // User asked for dashboard — never bounce them into the diagnostic exam.
  if (pathOnly(safePath) === DASHBOARD_PATH) {
    return DASHBOARD_PATH;
  }

  if (isDefaultEntryPath(safePath)) {
    if (!hasDiagnostic) {
      return DIAGNOSTIC_LANDING_PATH;
    }
    if (hasPaid) {
      return DASHBOARD_PATH;
    }
    return DIAGNOSTIC_CHECKOUT_RETURN_PATH;
  }

  return safePath;
}
