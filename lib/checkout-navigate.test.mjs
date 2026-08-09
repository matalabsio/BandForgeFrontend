import assert from "node:assert/strict";
import {
  CHECKOUT_SUCCESS_PATH,
  DASHBOARD_AFTER_CHECKOUT_PATH,
  shouldNavigateToCheckoutSuccess,
  shouldSkipPaidBootstrapRedirect,
} from "./checkout-navigate.ts";

assert.equal(CHECKOUT_SUCCESS_PATH, "/checkout/success");
assert.equal(DASHBOARD_AFTER_CHECKOUT_PATH, "/dashboard?activating=1");

assert.equal(
  shouldNavigateToCheckoutSuccess({ verifyOk: true }),
  true,
  "verify OK always navigates",
);
assert.equal(
  shouldNavigateToCheckoutSuccess({ verifyOk: true, hasReceipt: false }),
  true,
  "verify OK ignores missing receipt",
);
assert.equal(
  shouldNavigateToCheckoutSuccess({ verifyOk: false, hasReceipt: true }),
  true,
  "receipt after Razorpay success still navigates",
);
assert.equal(
  shouldNavigateToCheckoutSuccess({ verifyOk: false, hasReceipt: false }),
  false,
  "no verify and no receipt stays on checkout surface",
);
assert.equal(
  shouldNavigateToCheckoutSuccess({ verifyOk: false }),
  false,
  "missing hasReceipt treated as false",
);

assert.equal(
  shouldSkipPaidBootstrapRedirect({}),
  false,
  "already-paid with no checkout in flight and no receipt may go to dashboard",
);
assert.equal(
  shouldSkipPaidBootstrapRedirect({ checkoutInFlight: false, hasReceipt: false }),
  false,
  "explicit false flags do not skip",
);
assert.equal(
  shouldSkipPaidBootstrapRedirect({ checkoutInFlight: true }),
  true,
  "in-flight checkout skips dashboard bootstrap",
);
assert.equal(
  shouldSkipPaidBootstrapRedirect({ hasReceipt: true }),
  true,
  "pending receipt skips dashboard bootstrap",
);
assert.equal(
  shouldSkipPaidBootstrapRedirect({ checkoutInFlight: true, hasReceipt: true }),
  true,
  "in-flight plus receipt still skips",
);

console.log("checkout-navigate tests passed");
