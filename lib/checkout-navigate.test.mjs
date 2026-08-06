import assert from "node:assert/strict";
import {
  CHECKOUT_SUCCESS_PATH,
  shouldNavigateToCheckoutSuccess,
} from "./checkout-navigate.ts";

assert.equal(CHECKOUT_SUCCESS_PATH, "/checkout/success");

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

console.log("checkout-navigate tests passed");
