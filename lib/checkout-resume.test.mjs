/**
 * Phase 3 — pending checkout resume preserves selected plan_slug.
 */
import assert from "node:assert/strict";
import test from "node:test";

const FULL = "full_skill_program";
const WRITING = "writing_skill";
const DUAL = "dual_bundle";

function normalizeDiagnosticCheckoutSlug(slug) {
  const trimmed = slug?.trim().toLowerCase();
  const known = [FULL, "writing_skill", "speaking_skill", DUAL];
  if (!trimmed || !known.includes(trimmed)) return null;
  return trimmed;
}

function sanitizePendingCheckoutResume(raw) {
  if (!raw || typeof raw !== "object") return null;
  const parsed = raw;
  if (!parsed.returnTo || typeof parsed.returnTo !== "string") return null;
  if (!parsed.returnTo.startsWith("/") || parsed.returnTo.startsWith("//")) {
    return null;
  }
  const planSlug =
    normalizeDiagnosticCheckoutSlug(parsed.planSlug) ?? FULL;
  return { planSlug, returnTo: parsed.returnTo };
}

test("resume preserves writing_skill from stored payload", () => {
  const pending = sanitizePendingCheckoutResume({
    planSlug: WRITING,
    returnTo: "/diagnostic/results?checkout=1",
  });
  assert.equal(pending?.planSlug, WRITING);
});

test("resume preserves dual_bundle from stored payload", () => {
  const pending = sanitizePendingCheckoutResume({
    planSlug: DUAL,
    returnTo: "/diagnostic/results?checkout=1",
  });
  assert.equal(pending?.planSlug, DUAL);
});

test("legacy resume without planSlug defaults to FSP", () => {
  const pending = sanitizePendingCheckoutResume({
    returnTo: "/diagnostic/results?checkout=1",
  });
  assert.equal(pending?.planSlug, FULL);
});

test("invalid slug in resume falls back to FSP (backward compatible)", () => {
  const pending = sanitizePendingCheckoutResume({
    planSlug: "premium_monthly",
    returnTo: "/diagnostic/results?checkout=1",
  });
  assert.equal(pending?.planSlug, FULL);
});

console.log("checkout-resume tests passed");
