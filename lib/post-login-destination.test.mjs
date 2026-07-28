import assert from "node:assert/strict";
import {
  resolvePostLoginDestination,
  safePostLoginPath,
} from "./post-login-destination.ts";

assert.equal(safePostLoginPath("https://evil.example"), "/dashboard");
assert.equal(safePostLoginPath("//evil.example"), "/dashboard");
assert.equal(safePostLoginPath("/scores"), "/scores");

// Local diagnostic results + default entry → results checkout resume
assert.equal(
  resolvePostLoginDestination("/dashboard", true),
  "/diagnostic/results?checkout=1",
);
assert.equal(
  resolvePostLoginDestination("/diagnostic", true),
  "/diagnostic/results?checkout=1",
);
assert.equal(
  resolvePostLoginDestination("/onboarding", true),
  "/diagnostic/results?checkout=1",
);
assert.equal(
  resolvePostLoginDestination("/", true),
  "/diagnostic/results?checkout=1",
);
// Query on dashboard still treated as default entry
assert.equal(
  resolvePostLoginDestination("/dashboard?tab=plan", true),
  "/diagnostic/results?checkout=1",
);

// Legacy plan deep link → results checkout
assert.equal(
  resolvePostLoginDestination("/diagnostic/plan", true),
  "/diagnostic/results?checkout=1",
);
assert.equal(
  resolvePostLoginDestination("/diagnostic/plan#x", true),
  "/diagnostic/results?checkout=1",
);

// Explicit results?checkout=1 preserved when unpaid
assert.equal(
  resolvePostLoginDestination("/diagnostic/results?checkout=1", true),
  "/diagnostic/results?checkout=1",
);
assert.equal(
  resolvePostLoginDestination("/diagnostic/results?checkout=1", false, {
    hasServerDiagnostic: true,
  }),
  "/diagnostic/results?checkout=1",
);

// Paid + results/checkout → dashboard
assert.equal(
  resolvePostLoginDestination("/diagnostic/results?checkout=1", true, {
    hasPaidFullSkillProgram: true,
  }),
  "/dashboard",
);
assert.equal(
  resolvePostLoginDestination("/diagnostic/plan", true, {
    hasPaidFullSkillProgram: true,
  }),
  "/dashboard",
);

assert.equal(resolvePostLoginDestination("/scores", true), "/scores");
assert.equal(resolvePostLoginDestination("/pricing", false), "/pricing");

// No diagnostic + default entry → diagnostic (not empty dashboard)
assert.equal(
  resolvePostLoginDestination("/dashboard", false),
  "/diagnostic",
);
assert.equal(
  resolvePostLoginDestination("/onboarding", false),
  "/diagnostic",
);
assert.equal(resolvePostLoginDestination("/", false), "/diagnostic");
assert.equal(
  resolvePostLoginDestination("/diagnostic", false),
  "/diagnostic",
);

// Server diagnostic, unpaid → results checkout
assert.equal(
  resolvePostLoginDestination("/dashboard", false, {
    hasServerDiagnostic: true,
  }),
  "/diagnostic/results?checkout=1",
);
assert.equal(
  resolvePostLoginDestination("/diagnostic", false, {
    hasServerDiagnostic: true,
    hasPaidFullSkillProgram: false,
  }),
  "/diagnostic/results?checkout=1",
);

// Server diagnostic + paid → dashboard for default entries
assert.equal(
  resolvePostLoginDestination("/dashboard", false, {
    hasServerDiagnostic: true,
    hasPaidFullSkillProgram: true,
  }),
  "/dashboard",
);
assert.equal(
  resolvePostLoginDestination("/onboarding", true, {
    hasServerDiagnostic: true,
    hasPaidFullSkillProgram: true,
  }),
  "/dashboard",
);

// Paid without diagnostic still forced to diagnostic first
assert.equal(
  resolvePostLoginDestination("/dashboard", false, {
    hasPaidFullSkillProgram: true,
  }),
  "/diagnostic",
);

// Deep links still allowed when unpaid with server diagnostic
assert.equal(
  resolvePostLoginDestination("/writing", false, {
    hasServerDiagnostic: true,
  }),
  "/writing",
);

console.log("OK post-login diagnostic destination recovery");
