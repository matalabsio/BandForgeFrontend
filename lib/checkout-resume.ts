import { FULL_SKILL_PROGRAM_SLUG } from "@/lib/diagnostic-plan-content";

const PENDING_CHECKOUT_KEY = "bf_pending_checkout";
const OPENING_LOCK_KEY = "bf_checkout_opening";
const OPENING_LOCK_TTL_MS = 20_000;

/** Post-login return path that triggers auto-open Razorpay on results. */
export const DIAGNOSTIC_CHECKOUT_RETURN_PATH = "/diagnostic/results?checkout=1";

export type PendingCheckoutResume = {
  planSlug: string;
  returnTo: string;
};

export function setPendingCheckoutResume(
  input: Partial<PendingCheckoutResume> = {},
): void {
  if (typeof window === "undefined") return;
  const payload: PendingCheckoutResume = {
    planSlug: input.planSlug ?? FULL_SKILL_PROGRAM_SLUG,
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
    const parsed = JSON.parse(raw) as PendingCheckoutResume;
    if (!parsed?.planSlug || !parsed?.returnTo) return null;
    if (!parsed.returnTo.startsWith("/") || parsed.returnTo.startsWith("//")) {
      return null;
    }
    return parsed;
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
