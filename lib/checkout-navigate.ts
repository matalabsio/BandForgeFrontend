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
 * Paid diagnostic bootstrap must not race an in-flight checkout (Razorpay /
 * verify). Receipt alone must NOT keep the user stuck on results — send them
 * to success or dashboard instead.
 */
export function shouldSkipPaidBootstrapRedirect(opts: {
  checkoutInFlight?: boolean;
}): boolean {
  return Boolean(opts.checkoutInFlight);
}

/**
 * Where to send an already-paid student who lands on diagnostic results.
 * Receipt → sticky success page; otherwise dashboard activating.
 */
export function destinationWhenPaidOnResults(opts: {
  hasReceipt?: boolean;
}): string {
  return opts.hasReceipt ? CHECKOUT_SUCCESS_PATH : DASHBOARD_AFTER_CHECKOUT_PATH;
}
