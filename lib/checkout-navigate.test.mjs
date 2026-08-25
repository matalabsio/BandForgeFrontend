import assert from "node:assert/strict";
import {
  CHECKOUT_SUCCESS_PATH,
  DASHBOARD_AFTER_CHECKOUT_PATH,
  destinationWhenPaidOnResults,
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
  "already-paid with no checkout in flight may leave results",
);
assert.equal(
  shouldSkipPaidBootstrapRedirect({ checkoutInFlight: false }),
  false,
  "explicit false does not skip",
);
assert.equal(
  shouldSkipPaidBootstrapRedirect({ checkoutInFlight: true }),
  true,
  "in-flight checkout skips leave-results bootstrap",
);
assert.equal(
  destinationWhenPaidOnResults({ hasReceipt: true }),
  CHECKOUT_SUCCESS_PATH,
  "paid + receipt → sticky success",
);
assert.equal(
  destinationWhenPaidOnResults({ hasReceipt: false }),
  DASHBOARD_AFTER_CHECKOUT_PATH,
  "paid without receipt → dashboard activating",
);
assert.equal(
  destinationWhenPaidOnResults({}),
  DASHBOARD_AFTER_CHECKOUT_PATH,
  "missing hasReceipt → dashboard activating",
);

console.log("checkout-navigate tests passed");
