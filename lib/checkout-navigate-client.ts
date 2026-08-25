import {
  abandonCheckoutResume,
  clearPendingCheckoutResume,
  isCheckoutAttemptLive,
  releaseCheckoutOpeningLock,
} from "@/lib/checkout-resume";
import {
  CHECKOUT_SUCCESS_PATH,
  destinationWhenPaidOnResults,
  shouldNavigateToCheckoutSuccess,
  shouldSkipPaidBootstrapRedirect,
} from "@/lib/checkout-navigate";
import { readCheckoutReceiptContext } from "@/lib/payments";

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
