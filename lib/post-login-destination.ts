const DASHBOARD_PATH = "/dashboard";
const DIAGNOSTIC_LANDING_PATH = "/diagnostic";
const DIAGNOSTIC_PLAN_PATH = "/diagnostic/plan";

export function safePostLoginPath(raw: string | null | undefined): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return DASHBOARD_PATH;
  }
  return raw;
}

/**
 * A completed guest diagnostic only exists in browser storage until the first
 * full-account login. Keep that user in the conversion flow instead of sending
 * them through the empty-dashboard guard and back to the diagnostic start.
 */
export function resolvePostLoginDestination(
  requestedPath: string | null | undefined,
  hasLocalDiagnosticResults: boolean,
): string {
  const safePath = safePostLoginPath(requestedPath);
  if (
    hasLocalDiagnosticResults &&
    (safePath === DASHBOARD_PATH || safePath === DIAGNOSTIC_LANDING_PATH)
  ) {
    return DIAGNOSTIC_PLAN_PATH;
  }
  return safePath;
}
