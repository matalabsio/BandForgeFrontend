/**
 * Diagnostic results checkout auth decisions (mid-auth product).
 *
 * Normal path: full account → create-order → Razorpay (no login CTA).
 * Fallback: missing/expired full session → login with session=expired → resume.
 *
 * Self-contained for Node unit tests (no @/ alias / extension resolution).
 */

/** Keep in sync with `DIAGNOSTIC_CHECKOUT_RETURN_PATH` in checkout-resume.ts */
export const DIAGNOSTIC_EXPIRED_CHECKOUT_RETURN_PATH =
  "/diagnostic/results?checkout=1";

export type DiagnosticCheckoutAuthGate =
  | { kind: "proceed" }
  | { kind: "session_expired" };

function isFullAccountRole(role: string | undefined): boolean {
  return Boolean(role && role !== "guest");
}

/** Mirror of loginPathWithNext for expired checkout resume (keeps tests free of auth graph). */
function loginPathWithNext(nextPath: string, sessionExpired = false): string {
  const next =
    nextPath.startsWith("/") && !nextPath.startsWith("//")
      ? nextPath
      : "/dashboard";
  const q = new URLSearchParams({ next });
  if (sessionExpired) q.set("session", "expired");
  return `/login?${q.toString()}`;
}

/**
 * Guest-era "Sign in to unlock checkout" must not appear on results.
 * Session loss is handled only when the student attempts checkout.
 */
export function shouldShowDiagnosticCheckoutSignInBanner(): boolean {
  return false;
}

/** Full account with a live session may call create-order; otherwise treat as expiry. */
export function decideDiagnosticCheckoutAuthGate(opts: {
  hasSession: boolean;
  role: string | null | undefined;
}): DiagnosticCheckoutAuthGate {
  if (!opts.hasSession || !isFullAccountRole(opts.role ?? undefined)) {
    return { kind: "session_expired" };
  }
  return { kind: "proceed" };
}

/** Login href for expired-session checkout resume (never the normal path). */
export function diagnosticExpiredCheckoutLoginHref(): string {
  return loginPathWithNext(DIAGNOSTIC_EXPIRED_CHECKOUT_RETURN_PATH, true);
}
