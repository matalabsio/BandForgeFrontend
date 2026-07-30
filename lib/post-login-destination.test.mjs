import assert from "node:assert/strict";
import {
  resolvePostLoginDestination,
  safePostLoginPath,
} from "./post-login-destination.ts";

assert.equal(safePostLoginPath("https://evil.example"), "/dashboard");
assert.equal(safePostLoginPath("//evil.example"), "/dashboard");
assert.equal(safePostLoginPath("/scores"), "/scores");

// /dashboard follows diagnostic-first when unpaid
assert.equal(
  resolvePostLoginDestination("/dashboard", false),
  "/diagnostic",
);
assert.equal(
  resolvePostLoginDestination("/dashboard", true),
  "/diagnostic/results?checkout=1",
);
assert.equal(
  resolvePostLoginDestination("/dashboard?tab=plan", true),
  "/diagnostic/results?checkout=1",
);
assert.equal(
  resolvePostLoginDestination("/dashboard", false, {
    hasServerDiagnostic: true,
  }),
  "/diagnostic/results?checkout=1",
);
assert.equal(
  resolvePostLoginDestination("/dashboard", false, {
    hasPaidFullSkillProgram: true,
  }),
  "/dashboard",
);
assert.equal(
  resolvePostLoginDestination("/dashboard", true, {
    hasPaidFullSkillProgram: true,
  }),
  "/dashboard",
);

// Other default entries still diagnostic-first when unpaid + local results
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

// No diagnostic + non-dashboard default entry → diagnostic
assert.equal(
  resolvePostLoginDestination("/onboarding", false),
  "/diagnostic",
);
assert.equal(resolvePostLoginDestination("/", false), "/diagnostic");
assert.equal(
  resolvePostLoginDestination("/diagnostic", false),
  "/diagnostic",
);

// Server diagnostic, unpaid, non-dashboard → results checkout
assert.equal(
  resolvePostLoginDestination("/diagnostic", false, {
    hasServerDiagnostic: true,
    hasPaidFullSkillProgram: false,
  }),
  "/diagnostic/results?checkout=1",
);

// Server diagnostic + paid → dashboard for default entries
assert.equal(
  resolvePostLoginDestination("/onboarding", true, {
    hasServerDiagnostic: true,
    hasPaidFullSkillProgram: true,
  }),
  "/dashboard",
);

// Deep links still allowed when unpaid with server diagnostic
assert.equal(
  resolvePostLoginDestination("/writing", false, {
    hasServerDiagnostic: true,
  }),
  "/writing",
);

console.log("OK post-login diagnostic destination recovery");
