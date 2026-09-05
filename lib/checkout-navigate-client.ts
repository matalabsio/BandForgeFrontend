import {
  abandonCheckoutResume,
  clearPendingCheckoutResume,
  isCheckoutAttemptLive,
  releaseCheckoutOpeningLock,
} from "@/lib/checkout-resume";
import {
  CHECKOUT_SUCCESS_PATH,
  DASHBOARD_AFTER_CHECKOUT_PATH,
  destinationWhenPaidOnResults,
  shouldNavigateToCheckoutSuccess,
  shouldSkipPaidBootstrapRedirect,
} from "@/lib/checkout-navigate";
import { postCheckoutDestination } from "@/lib/entitlement";
import {
  readCheckoutReceiptContext,
  type Subscription,
} from "@/lib/payments";

export type CheckoutNavigateRouter = {
  replace: (href: string) => void;
};

/** Clear resume locks so remounts cannot reopen Razorpay after leaving. */
export function clearCheckoutResumeState(): void {
  clearPendingCheckoutResume();
  releaseCheckoutOpeningLock();
}

/**
 * Navigate to /checkout/success after a captured payment.
 * Returns true when navigation was performed.
 */
export function navigateAfterCheckoutVerify(opts: {
  router: CheckoutNavigateRouter;
  verifyOk: boolean;
  hasReceipt?: boolean;
}): boolean {
  const hasReceipt =
    opts.hasReceipt ?? Boolean(readCheckoutReceiptContext());
  if (
    !shouldNavigateToCheckoutSuccess({
      verifyOk: opts.verifyOk,
      hasReceipt,
    })
  ) {
    return false;
  }
  abandonCheckoutResume();
  clearCheckoutResumeState();
  opts.router.replace(CHECKOUT_SUCCESS_PATH);
  return true;
}

/**
 * Coupon grants have no Razorpay receipt — go straight to the product home.
 * FSP always lands on dashboard activating (fast path, no success page).
 */
export function navigateAfterCouponRedeem(opts: {
  router: CheckoutNavigateRouter;
  subscription: Subscription;
  planSlug?: string | null;
}): void {
  abandonCheckoutResume();
  clearCheckoutResumeState();
  const slug = (opts.planSlug ?? "").toLowerCase();
  const href =
    slug === "full_skill_program"
      ? DASHBOARD_AFTER_CHECKOUT_PATH
      : postCheckoutDestination(opts.subscription, {
          receiptPlanSlug: opts.planSlug ?? null,
        });
  // Hard navigation avoids waiting on soft client transitions under load.
  if (typeof window !== "undefined") {
    window.location.replace(href);
    return;
  }
  opts.router.replace(href);
}

/**
 * Skip paid bootstrap redirect only while a checkout attempt is live
 * (instance ref or module-level live flag across remounts).
 */
export function shouldSkipPaidBootstrapRedirectNow(opts?: {
  checkoutInFlight?: boolean;
}): boolean {
  return shouldSkipPaidBootstrapRedirect({
    checkoutInFlight:
      Boolean(opts?.checkoutInFlight) || isCheckoutAttemptLive(),
  });
}

/** Paid on results: success if receipt exists, else dashboard activating. */
export function destinationWhenPaidOnResultsNow(): string {
  return destinationWhenPaidOnResults({
    hasReceipt: Boolean(readCheckoutReceiptContext()),
  });
}

export {
  CHECKOUT_SUCCESS_PATH,
  destinationWhenPaidOnResults,
  shouldNavigateToCheckoutSuccess,
  shouldSkipPaidBootstrapRedirect,
};
