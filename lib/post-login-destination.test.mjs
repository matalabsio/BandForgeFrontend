import assert from "node:assert/strict";
import {
  resolvePostLoginDestination,
  safePostLoginPath,
} from "./post-login-destination.ts";

assert.equal(safePostLoginPath("https://evil.example"), "/dashboard");
assert.equal(safePostLoginPath("//evil.example"), "/dashboard");
assert.equal(safePostLoginPath("/scores"), "/scores");

assert.equal(
  resolvePostLoginDestination("/dashboard", true),
  "/diagnostic/plan",
);
assert.equal(
  resolvePostLoginDestination("/diagnostic", true),
  "/diagnostic/plan",
);
assert.equal(
  resolvePostLoginDestination("/diagnostic/plan", true),
  "/diagnostic/plan",
);
assert.equal(resolvePostLoginDestination("/dashboard", false), "/dashboard");
assert.equal(resolvePostLoginDestination("/scores", true), "/scores");

console.log("OK post-login diagnostic destination recovery");
