import assert from "node:assert/strict";
import {
  isAllowedSkillCoursePath,
  postLoginNeedsServerLookup,
  resolvePostLoginDestination,
  safePostLoginPath,
} from "./post-login-destination.ts";

assert.equal(safePostLoginPath("https://evil.example"), "/dashboard");
assert.equal(safePostLoginPath("//evil.example"), "/dashboard");
assert.equal(safePostLoginPath("/scores"), "/scores");

// Explicit mid-auth / deep links must not wait on profile/subscription
assert.equal(postLoginNeedsServerLookup("/diagnostic/writing"), false);
assert.equal(postLoginNeedsServerLookup("/diagnostic/speaking"), false);
assert.equal(postLoginNeedsServerLookup("/pricing"), false);
assert.equal(postLoginNeedsServerLookup("/scores"), false);
assert.equal(postLoginNeedsServerLookup("/dashboard"), true);
assert.equal(postLoginNeedsServerLookup("/diagnostic"), true);
assert.equal(postLoginNeedsServerLookup("/diagnostic/results?checkout=1"), true);
assert.equal(postLoginNeedsServerLookup("/diagnostic/plan"), true);

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

// Mid-auth Writing deep link preserved without server lookup fields
assert.equal(
  resolvePostLoginDestination("/diagnostic/writing", false),
  "/diagnostic/writing",
);
assert.equal(
  resolvePostLoginDestination("/diagnostic/writing", true),
  "/diagnostic/writing",
);

// Paid skill pack (Speaking) → course home instead of diagnostic checkout
assert.equal(
  resolvePostLoginDestination("/dashboard", false, {
    hasServerDiagnostic: true,
    hasPaidFullSkillProgram: false,
    paidSkillCoursePath: "/practice/speaking",
  }),
  "/practice/speaking",
);
assert.equal(
  resolvePostLoginDestination("/diagnostic/results?checkout=1", true, {
    hasPaidFullSkillProgram: false,
    paidSkillCoursePath: "/practice/speaking",
  }),
  "/practice/speaking",
);

// Dual → /practice on dashboard and checkout resume continue
assert.equal(
  resolvePostLoginDestination("/dashboard", false, {
    hasServerDiagnostic: true,
    hasPaidFullSkillProgram: false,
    paidSkillCoursePath: "/practice",
  }),
  "/practice",
);
assert.equal(
  resolvePostLoginDestination("/diagnostic/results?checkout=1", true, {
    hasPaidFullSkillProgram: false,
    paidSkillCoursePath: "/practice",
  }),
  "/practice",
);
assert.equal(
  resolvePostLoginDestination("/diagnostic/plan", true, {
    hasPaidFullSkillProgram: false,
    paidSkillCoursePath: "/practice",
  }),
  "/practice",
);

// Writing-only continue
assert.equal(
  resolvePostLoginDestination("/dashboard", true, {
    hasPaidFullSkillProgram: false,
    paidSkillCoursePath: "/practice/writing",
  }),
  "/practice/writing",
);

// FSP precedence over Dual skill path if both somehow set
assert.equal(
  resolvePostLoginDestination("/dashboard", true, {
    hasPaidFullSkillProgram: true,
    paidSkillCoursePath: "/practice",
  }),
  "/dashboard",
);

// Reject unrelated / open-redirect style paidSkillCoursePath values
assert.equal(
  resolvePostLoginDestination("/dashboard", true, {
    hasPaidFullSkillProgram: false,
    paidSkillCoursePath: "/pricing",
  }),
  "/diagnostic/results?checkout=1",
);
assert.equal(
  resolvePostLoginDestination("/dashboard", true, {
    hasPaidFullSkillProgram: false,
    paidSkillCoursePath: "//evil.example",
  }),
  "/diagnostic/results?checkout=1",
);
assert.equal(
  resolvePostLoginDestination("/dashboard", true, {
    hasPaidFullSkillProgram: false,
    paidSkillCoursePath: "/practice/listening",
  }),
  "/diagnostic/results?checkout=1",
);
assert.equal(
  resolvePostLoginDestination("/dashboard", true, {
    hasPaidFullSkillProgram: false,
    paidSkillCoursePath: "/practice/writing/extra",
  }),
  "/diagnostic/results?checkout=1",
);

assert.equal(isAllowedSkillCoursePath("/practice"), true);
assert.equal(isAllowedSkillCoursePath("/practice/writing"), true);
assert.equal(isAllowedSkillCoursePath("/practice/speaking"), true);
assert.equal(isAllowedSkillCoursePath("/practice/listening"), false);
assert.equal(isAllowedSkillCoursePath("//evil.example"), false);
assert.equal(isAllowedSkillCoursePath("/pricing"), false);

console.log("OK post-login diagnostic destination recovery");
