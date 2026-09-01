import assert from "node:assert/strict";
import test from "node:test";

import {
  isShortOrSilentResponse,
  SHORT_RESPONSE_SEC,
} from "./detect-short-response.ts";

test("isShortOrSilentResponse rejects short duration", () => {
  assert.equal(isShortOrSilentResponse(SHORT_RESPONSE_SEC - 1, new Blob(["x"])), true);
});

test("isShortOrSilentResponse rejects tiny blobs", () => {
  assert.equal(isShortOrSilentResponse(SHORT_RESPONSE_SEC, new Blob(["x"])), true);
});

test("isShortOrSilentResponse accepts long enough recording", () => {
  const blob = new Blob([new Uint8Array(2_500)]);
  assert.equal(isShortOrSilentResponse(SHORT_RESPONSE_SEC, blob), false);
});
