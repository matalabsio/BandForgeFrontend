/** Pure refresh-throttle policy for long exam sessions (testable without auth I/O). */

/** Skip back-to-back proactive refreshes during autosave bursts (3 min < 6 min margin). */
export const EXAM_REFRESH_COOLDOWN_MS = 3 * 60 * 1000;

/** Hard expiry skew — always refresh when access is past this threshold. */
export const EXAM_HARD_EXPIRY_SKEW_SEC = 30;

/**
 * Whether a proactive refresh should run now.
 * Returns false during cooldown unless access is hard-expired (30s skew).
 */
export function shouldRunProactiveRefresh(
  nowMs: number,
  lastSuccessfulRefreshAtMs: number | null,
  access: string | null,
  accessExpired: (token: string, skewSeconds?: number) => boolean,
  accessNeedsRefresh: (token: string | null) => boolean,
): boolean {
  if (!accessNeedsRefresh(access)) return false;
  if (access && accessExpired(access, EXAM_HARD_EXPIRY_SKEW_SEC)) {
    return true;
  }
  if (
    lastSuccessfulRefreshAtMs !== null &&
    nowMs - lastSuccessfulRefreshAtMs < EXAM_REFRESH_COOLDOWN_MS
  ) {
    return false;
  }
  return true;
}
