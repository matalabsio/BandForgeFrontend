export const CHECKOUT_SUCCESS_PATH = "/checkout/success";

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
