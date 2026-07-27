import assert from "node:assert/strict";
import {
  resolvePostLoginDestination,
  safePostLoginPath,
} from "./post-login-destination.ts";

assert.equal(safePostLoginPath("https://evil.example"), "/dashboard");
assert.equal(safePostLoginPath("//evil.example"), "/dashboard");
assert.equal(safePostLoginPath("/scores"), "/scores");

// Local diagnostic results + default entry → results (plan + checkout)
assert.equal(
  resolvePostLoginDestination("/dashboard", true),
  "/diagnostic/results#plan-unlock",
);
assert.equal(
  resolvePostLoginDestination("/diagnostic", true),
  "/diagnostic/results#plan-unlock",
);
assert.equal(
  resolvePostLoginDestination("/onboarding", true),
  "/diagnostic/results#plan-unlock",
);
assert.equal(
  resolvePostLoginDestination("/", true),
  "/diagnostic/results#plan-unlock",
);

// Legacy plan deep link → results
assert.equal(
  resolvePostLoginDestination("/diagnostic/plan", true),
  "/diagnostic/results#plan-unlock",
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

// Server diagnostic, unpaid → results
assert.equal(
  resolvePostLoginDestination("/dashboard", false, {
    hasServerDiagnostic: true,
  }),
  "/diagnostic/results#plan-unlock",
);
assert.equal(
  resolvePostLoginDestination("/diagnostic", false, {
    hasServerDiagnostic: true,
    hasPaidFullSkillProgram: false,
  }),
  "/diagnostic/results#plan-unlock",
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
