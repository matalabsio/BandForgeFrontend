export const CHECKOUT_SUCCESS_PATH = "/checkout/success";
/** Land on dashboard with activating poll so a stale miss-cache cannot flash the paywall. */
export const DASHBOARD_AFTER_CHECKOUT_PATH = "/dashboard?activating=1";

/**
 * After Razorpay captured a payment, leave the checkout surface for
 * /checkout/success whenever verify succeeded or a receipt is already saved.
 */
export function shouldNavigateToCheckoutSuccess(opts: {
  verifyOk: boolean;
  hasReceipt?: boolean;
}): boolean {
  if (opts.verifyOk) return true;
  return Boolean(opts.hasReceipt);
}

/**
 * Paid diagnostic bootstrap must not race verify → /checkout/success.
 * Skip dashboard redirect while checkout is in flight or a receipt was just saved.
 */
export function shouldSkipPaidBootstrapRedirect(opts: {
  checkoutInFlight?: boolean;
  hasReceipt?: boolean;
}): boolean {
  return Boolean(opts.checkoutInFlight) || Boolean(opts.hasReceipt);
}
