/** Self-contained for Node unit tests (no @/ alias / extension resolution). */

const PENDING_CHECKOUT_KEY = "bf_pending_checkout";
const OPENING_LOCK_KEY = "bf_checkout_opening";
const SOFT_FAIL_MODAL_KEY = "bf_checkout_soft_fail_modal";
const SUPPRESS_AUTO_KEY = "bf_checkout_suppress_auto";
const OPENING_LOCK_TTL_MS = 20_000;

export const FULL_SKILL_PROGRAM_SLUG = "full_skill_program";
export const WRITING_SKILL_SLUG = "writing_skill";
export const SPEAKING_SKILL_SLUG = "speaking_skill";
export const DUAL_BUNDLE_SLUG = "dual_bundle";

export type RecommendableSlug =
  | typeof FULL_SKILL_PROGRAM_SLUG
  | typeof WRITING_SKILL_SLUG
  | typeof SPEAKING_SKILL_SLUG
  | typeof DUAL_BUNDLE_SLUG;

const KNOWN_CHECKOUT_SLUGS = new Set<string>([
  FULL_SKILL_PROGRAM_SLUG,
  WRITING_SKILL_SLUG,
  SPEAKING_SKILL_SLUG,
  DUAL_BUNDLE_SLUG,
]);

function normalizeCheckoutSlug(
  slug: string | null | undefined,
): RecommendableSlug | null {
  const trimmed = slug?.trim().toLowerCase();
  if (!trimmed || !KNOWN_CHECKOUT_SLUGS.has(trimmed)) return null;
  return trimmed as RecommendableSlug;
}

/** Post-login return path that triggers auto-open Razorpay on results. */
export const DIAGNOSTIC_CHECKOUT_RETURN_PATH = "/diagnostic/results?checkout=1";

export const DIAGNOSTIC_RESULTS_PATH = "/diagnostic/results";

export type PendingCheckoutResume = {
  planSlug: RecommendableSlug;
  returnTo: string;
};

/** Module claim — survives Strict Mode remount; cleared on soft-fail / dismiss. */
let checkoutResumeClaimed = false;

export function isCheckoutResumeClaimed(): boolean {
  return checkoutResumeClaimed;
}

export function markCheckoutResumeClaimed(): void {
  checkoutResumeClaimed = true;
}

export function clearCheckoutResumeClaimed(): void {
  checkoutResumeClaimed = false;
}

/** Test-only reset for claim. */
export function resetCheckoutResumeStateForTests(): void {
  checkoutResumeClaimed = false;
}

function sanitizePendingCheckoutResume(
  raw: unknown,
): PendingCheckoutResume | null {
  if (!raw || typeof raw !== "object") return null;
  const parsed = raw as Partial<PendingCheckoutResume>;
  if (!parsed.returnTo || typeof parsed.returnTo !== "string") return null;
  if (
    !parsed.returnTo.startsWith("/") ||
    parsed.returnTo.startsWith("//")
  ) {
    return null;
  }
  const planSlug =
    normalizeCheckoutSlug(parsed.planSlug) ?? FULL_SKILL_PROGRAM_SLUG;
  return { planSlug, returnTo: parsed.returnTo };
}

export function setPendingCheckoutResume(
  input: Partial<PendingCheckoutResume> = {},
): void {
  if (typeof window === "undefined") return;
  const payload: PendingCheckoutResume = {
    planSlug: normalizeCheckoutSlug(input.planSlug) ?? FULL_SKILL_PROGRAM_SLUG,
    returnTo: input.returnTo ?? DIAGNOSTIC_CHECKOUT_RETURN_PATH,
  };
  try {
    sessionStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify(payload));
  } catch {
    /* quota / private mode */
  }
}

/** Read pending checkout intent without clearing. */
export function peekPendingCheckoutResume(): PendingCheckoutResume | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PENDING_CHECKOUT_KEY);
    if (!raw) return null;
    return sanitizePendingCheckoutResume(JSON.parse(raw));
  } catch {
    return null;
  }
}

/** Read + clear pending checkout intent (one-shot). */
export function consumePendingCheckoutResume(): PendingCheckoutResume | null {
  const pending = peekPendingCheckoutResume();
  clearPendingCheckoutResume();
  return pending;
}

export function clearPendingCheckoutResume(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
  } catch {
    /* ignore */
  }
}

/** Prevent Strict Mode / remount from opening Razorpay twice. */
export function tryAcquireCheckoutOpeningLock(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = sessionStorage.getItem(OPENING_LOCK_KEY);
    if (raw) {
      const started = Number(raw);
      if (Number.isFinite(started) && Date.now() - started < OPENING_LOCK_TTL_MS) {
        return false;
      }
    }
    sessionStorage.setItem(OPENING_LOCK_KEY, String(Date.now()));
    return true;
  } catch {
    return true;
  }
}

export function releaseCheckoutOpeningLock(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(OPENING_LOCK_KEY);
  } catch {
    /* ignore */
  }
}

/** True while an opener holds the short-lived Strict Mode / remount lock. */
export function isCheckoutOpeningLockHeld(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = sessionStorage.getItem(OPENING_LOCK_KEY);
    if (!raw) return false;
    const started = Number(raw);
    return Number.isFinite(started) && Date.now() - started < OPENING_LOCK_TTL_MS;
  } catch {
    return false;
  }
}

export function shouldResumeDiagnosticCheckout(): boolean {
  if (typeof window === "undefined") return false;
  try {
    // Only auto-resume when the URL explicitly asks for checkout. A stale
    // pending flag alone must not blank /diagnostic/results after speaking.
    const params = new URLSearchParams(window.location.search);
    return params.get("checkout") === "1";
  } catch {
    return false;
  }
}

/**
 * If pending checkout exists but the query was dropped (OAuth/continue edge),
 * rewrite to ?checkout=1 once. Does not blank results when there is no pending.
 */
export function ensureDiagnosticCheckoutQueryIfPending(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.location.pathname !== DIAGNOSTIC_RESULTS_PATH) return false;
    if (shouldResumeDiagnosticCheckout()) return false;
    if (!peekPendingCheckoutResume()) return false;
    window.history.replaceState(null, "", DIAGNOSTIC_CHECKOUT_RETURN_PATH);
    return true;
  } catch {
    return false;
  }
}

export type CheckoutResumeStartAction =
  | "wait_bootstrap"
  | "skip"
  | "wait_lock"
  | "start";

/**
 * Pure gate for post-auth auto-open. Never start while plans bootstrap is loading
 * (empty activePlans would fail assertPlanSlugPurchasable and silent-settle).
 */
export function decideCheckoutResumeStart(opts: {
  bootstrapping: boolean;
  shouldResume: boolean;
  claimed: boolean;
  lockAcquired: boolean;
  autoOpenSuppressed?: boolean;
}): CheckoutResumeStartAction {
  if (!opts.shouldResume) return "skip";
  if (opts.autoOpenSuppressed) return "skip";
  if (opts.bootstrapping) return "wait_bootstrap";
  if (opts.claimed) return "skip";
  if (!opts.lockAcquired) return "wait_lock";
  return "start";
}

/**
 * Soft-fail / dismiss: restore pending slug, clear claim + lock so retry works.
 * Suppresses auto-open until the student taps Continue to payment (or abandons).
 */
export function prepareCheckoutResumeRetry(planSlug: string): void {
  setPendingCheckoutResume({
    planSlug: normalizeCheckoutSlug(planSlug) ?? FULL_SKILL_PROGRAM_SLUG,
    returnTo: DIAGNOSTIC_CHECKOUT_RETURN_PATH,
  });
  releaseCheckoutOpeningLock();
  clearCheckoutResumeClaimed();
  suppressCheckoutResumeAutoOpen();
}

/** Explicit leave checkout — clear intent and allow plain results. */
export function abandonCheckoutResume(): void {
  clearPendingCheckoutResume();
  releaseCheckoutOpeningLock();
  clearCheckoutResumeClaimed();
  clearCheckoutResumeSoftFailModal();
  clearCheckoutResumeAutoOpenSuppress();
}

/**
 * Fresh post-auth checkout attempt (Google /auth/continue with checkout=1).
 * Clears sticky claim, suppress, and opening lock so Razorpay can auto-open.
 * Does not clear pending planSlug — results still need it for the order.
 */
export function resetCheckoutResumeForPostAuth(): void {
  clearCheckoutResumeClaimed();
  clearCheckoutResumeAutoOpenSuppress();
  releaseCheckoutOpeningLock();
  clearCheckoutResumeSoftFailModal();
}

export function suppressCheckoutResumeAutoOpen(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SUPPRESS_AUTO_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function isCheckoutResumeAutoOpenSuppressed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(SUPPRESS_AUTO_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearCheckoutResumeAutoOpenSuppress(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(SUPPRESS_AUTO_KEY);
  } catch {
    /* ignore */
  }
}

export function stripCheckoutQueryFromResultsUrl(): void {
  if (typeof window === "undefined") return;
  try {
    window.history.replaceState(null, "", DIAGNOSTIC_RESULTS_PATH);
  } catch {
    /* ignore */
  }
}

export type CheckoutResumeSoftFailModal =
  | "cancelled"
  | "verify_failed"
  | "payments_disabled"
  | "checkout_unavailable"
  | "payment_failed";

export type CheckoutResumeSoftFail = {
  modal: CheckoutResumeSoftFailModal;
  detail?: string | null;
};

export function stashCheckoutResumeSoftFailModal(
  payload: CheckoutResumeSoftFail,
): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SOFT_FAIL_MODAL_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function consumeCheckoutResumeSoftFailModal(): CheckoutResumeSoftFail | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SOFT_FAIL_MODAL_KEY);
    sessionStorage.removeItem(SOFT_FAIL_MODAL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CheckoutResumeSoftFail;
    if (!parsed?.modal || typeof parsed.modal !== "string") return null;
    return {
      modal: parsed.modal,
      detail: parsed.detail ?? null,
    };
  } catch {
    return null;
  }
}

export function clearCheckoutResumeSoftFailModal(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(SOFT_FAIL_MODAL_KEY);
  } catch {
    /* ignore */
  }
}

export { OPENING_LOCK_TTL_MS };
