import {
  clearPendingCheckoutResume,
  releaseCheckoutOpeningLock,
} from "@/lib/checkout-resume";
import {
  CHECKOUT_SUCCESS_PATH,
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
  clearCheckoutResumeState();
  opts.router.replace(CHECKOUT_SUCCESS_PATH);
  return true;
}

/** Client wrapper: reads session receipt so remounts after Razorpay still skip dashboard. */
export function shouldSkipPaidBootstrapRedirectNow(opts?: {
  checkoutInFlight?: boolean;
}): boolean {
  return shouldSkipPaidBootstrapRedirect({
    checkoutInFlight: opts?.checkoutInFlight,
    hasReceipt: Boolean(readCheckoutReceiptContext()),
  });
}

export {
  CHECKOUT_SUCCESS_PATH,
  shouldNavigateToCheckoutSuccess,
  shouldSkipPaidBootstrapRedirect,
};
