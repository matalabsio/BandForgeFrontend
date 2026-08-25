/**
 * Phase 1 — diagnostic multi-SKU recommendation engine.
 * Keep in sync with diagnostic-sku-recommend.ts + docs/diagnostic-to-personalized-plan.md §5.
 */
import assert from "node:assert/strict";
import test from "node:test";

const {
  DEFAULT_WEAK_GAP,
  DUAL_BUNDLE_SLUG,
  FULL_SKILL_PROGRAM_SLUG,
  SPEAKING_SKILL_SLUG,
  WRITING_SKILL_SLUG,
  collectWeakSkills,
  recommendSkuFromDiagnostic,
  scoredSkillGap,
} = await import("./diagnostic-sku-recommend.ts");

const TARGET = 7.0;

function bands(partial) {
  return {
    listening: 7,
    reading: 7,
    writing: 7,
    speaking: 7,
    ...partial,
  };
}

function assertRecommendation(actual, expected) {
  assert.equal(actual.primary, expected.primary);
  assert.deepEqual(actual.weakSkills, expected.weakSkills);
  assert.deepEqual(actual.alternatives, expected.alternatives);
  assert.equal(typeof actual.reason, "string");
  assert.ok(actual.reason.length > 0);
  if (expected.reason) {
    assert.equal(actual.reason, expected.reason);
  }
}

// --- Helpers ---

test("DEFAULT_WEAK_GAP is 1.0", () => {
  assert.equal(DEFAULT_WEAK_GAP, 1.0);
});

test("scoredSkillGap is max(target - band, 0)", () => {
  assert.equal(scoredSkillGap(5, 7), 2);
  assert.equal(scoredSkillGap(7, 7), 0);
  assert.equal(scoredSkillGap(8, 7), 0);
  assert.equal(scoredSkillGap(6, 7), 1);
});

test("collectWeakSkills ignores pending / missing / non-positive", () => {
  assert.deepEqual(
    collectWeakSkills(
      bands({ writing: null, speaking: 0, listening: undefined }),
      TARGET,
    ),
    [],
  );
});

// --- Matrix cases ---

test("1. Writing only → writing_skill", () => {
  const out = recommendSkuFromDiagnostic({
    bands: bands({ writing: 5.0 }),
    targetBand: TARGET,
  });
  assertRecommendation(out, {
    primary: WRITING_SKILL_SLUG,
    weakSkills: ["writing"],
    alternatives: [SPEAKING_SKILL_SLUG, DUAL_BUNDLE_SLUG, FULL_SKILL_PROGRAM_SLUG],
    reason: "Writing is holding your overall band back.",
  });
});

test("2. Speaking only → speaking_skill", () => {
  const out = recommendSkuFromDiagnostic({
    bands: bands({ speaking: 5.0 }),
    targetBand: TARGET,
  });
  assertRecommendation(out, {
    primary: SPEAKING_SKILL_SLUG,
    weakSkills: ["speaking"],
    alternatives: [WRITING_SKILL_SLUG, DUAL_BUNDLE_SLUG, FULL_SKILL_PROGRAM_SLUG],
    reason: "Speaking is the priority skill to fix first.",
  });
});

test("3. Writing + Speaking → dual_bundle", () => {
  const out = recommendSkuFromDiagnostic({
    bands: bands({ writing: 5.0, speaking: 5.0 }),
    targetBand: TARGET,
  });
  assertRecommendation(out, {
    primary: DUAL_BUNDLE_SLUG,
    weakSkills: ["writing", "speaking"],
    alternatives: [WRITING_SKILL_SLUG, SPEAKING_SKILL_SLUG, FULL_SKILL_PROGRAM_SLUG],
    reason:
      "Your biggest gaps are Writing and Speaking — close both together.",
  });
});

test("4. 3+ weak skills → full_skill_program", () => {
  const out = recommendSkuFromDiagnostic({
    bands: bands({ listening: 5.0, writing: 5.0, speaking: 5.0 }),
    targetBand: TARGET,
  });
  assertRecommendation(out, {
    primary: FULL_SKILL_PROGRAM_SLUG,
    weakSkills: ["listening", "writing", "speaking"],
    alternatives: [WRITING_SKILL_SLUG, SPEAKING_SKILL_SLUG, DUAL_BUNDLE_SLUG],
  });
});

test("5. Listening + Reading weak → full_skill_program", () => {
  const out = recommendSkuFromDiagnostic({
    bands: bands({ listening: 5.5, reading: 5.5 }),
    targetBand: TARGET,
  });
  assertRecommendation(out, {
    primary: FULL_SKILL_PROGRAM_SLUG,
    weakSkills: ["listening", "reading"],
    alternatives: [WRITING_SKILL_SLUG, SPEAKING_SKILL_SLUG, DUAL_BUNDLE_SLUG],
  });
});

test("6. Writing + Speaking + L/R weak → full_skill_program (not Dual)", () => {
  const out = recommendSkuFromDiagnostic({
    bands: bands({
      listening: 5.5,
      reading: 7.0,
      writing: 5.0,
      speaking: 5.0,
    }),
    targetBand: TARGET,
  });
  // weak = L, W, S (≥3) → FSP wins over Dual
  assertRecommendation(out, {
    primary: FULL_SKILL_PROGRAM_SLUG,
    weakSkills: ["listening", "writing", "speaking"],
    alternatives: [WRITING_SKILL_SLUG, SPEAKING_SKILL_SLUG, DUAL_BUNDLE_SLUG],
  });

  const bothLr = recommendSkuFromDiagnostic({
    bands: bands({
      listening: 5.0,
      reading: 5.0,
      writing: 5.0,
      speaking: 5.0,
    }),
    targetBand: TARGET,
  });
  assert.equal(bothLr.primary, FULL_SKILL_PROGRAM_SLUG);
  assert.deepEqual(bothLr.weakSkills, [
    "listening",
    "reading",
    "writing",
    "speaking",
  ]);
});

test("7. Pending Writing/Speaking — never invent Dual", () => {
  const writingPending = recommendSkuFromDiagnostic({
    bands: bands({ writing: null, speaking: 5.0 }),
    targetBand: TARGET,
  });
  assertRecommendation(writingPending, {
    primary: SPEAKING_SKILL_SLUG,
    weakSkills: ["speaking"],
    alternatives: [WRITING_SKILL_SLUG, DUAL_BUNDLE_SLUG, FULL_SKILL_PROGRAM_SLUG],
  });

  const speakingPending = recommendSkuFromDiagnostic({
    bands: bands({ writing: 5.0, speaking: null }),
    targetBand: TARGET,
  });
  assertRecommendation(speakingPending, {
    primary: WRITING_SKILL_SLUG,
    weakSkills: ["writing"],
    alternatives: [SPEAKING_SKILL_SLUG, DUAL_BUNDLE_SLUG, FULL_SKILL_PROGRAM_SLUG],
  });

  const bothPending = recommendSkuFromDiagnostic({
    bands: bands({ writing: null, speaking: 0 }),
    targetBand: TARGET,
  });
  assertRecommendation(bothPending, {
    primary: FULL_SKILL_PROGRAM_SLUG,
    weakSkills: [],
    alternatives: [WRITING_SKILL_SLUG, SPEAKING_SKILL_SLUG, DUAL_BUNDLE_SLUG],
  });
});

test("8. No skills weak (gaps under threshold) → full_skill_program", () => {
  // gap 0.5 < 1.0 → not weak
  const out = recommendSkuFromDiagnostic({
    bands: bands({
      listening: 6.5,
      reading: 6.5,
      writing: 6.5,
      speaking: 6.5,
    }),
    targetBand: TARGET,
  });
  assertRecommendation(out, {
    primary: FULL_SKILL_PROGRAM_SLUG,
    weakSkills: [],
    alternatives: [WRITING_SKILL_SLUG, SPEAKING_SKILL_SLUG, DUAL_BUNDLE_SLUG],
  });
});

test("9. All skills at/above target → full_skill_program", () => {
  const out = recommendSkuFromDiagnostic({
    bands: bands({
      listening: 7.0,
      reading: 7.5,
      writing: 8.0,
      speaking: 7.0,
    }),
    targetBand: TARGET,
  });
  assertRecommendation(out, {
    primary: FULL_SKILL_PROGRAM_SLUG,
    weakSkills: [],
    alternatives: [WRITING_SKILL_SLUG, SPEAKING_SKILL_SLUG, DUAL_BUNDLE_SLUG],
  });
});

test("10. Boundary: gap exactly 1.0 is weak", () => {
  const out = recommendSkuFromDiagnostic({
    bands: bands({ writing: 6.0 }),
    targetBand: TARGET,
  });
  assert.equal(scoredSkillGap(6.0, TARGET), 1.0);
  assertRecommendation(out, {
    primary: WRITING_SKILL_SLUG,
    weakSkills: ["writing"],
    alternatives: [SPEAKING_SKILL_SLUG, DUAL_BUNDLE_SLUG, FULL_SKILL_PROGRAM_SLUG],
  });

  // Just under threshold
  const under = recommendSkuFromDiagnostic({
    bands: bands({ writing: 6.5 }),
    targetBand: TARGET,
  });
  assert.equal(scoredSkillGap(6.5, TARGET), 0.5);
  assert.equal(under.primary, FULL_SKILL_PROGRAM_SLUG);
  assert.deepEqual(under.weakSkills, []);
});

test("L-only or R-only weak → full_skill_program", () => {
  const lOnly = recommendSkuFromDiagnostic({
    bands: bands({ listening: 5.0 }),
    targetBand: TARGET,
  });
  assert.equal(lOnly.primary, FULL_SKILL_PROGRAM_SLUG);
  assert.deepEqual(lOnly.weakSkills, ["listening"]);

  const rOnly = recommendSkuFromDiagnostic({
    bands: bands({ reading: 5.0 }),
    targetBand: TARGET,
  });
  assert.equal(rOnly.primary, FULL_SKILL_PROGRAM_SLUG);
  assert.deepEqual(rOnly.weakSkills, ["reading"]);
});

test("weakGap override is respected", () => {
  const out = recommendSkuFromDiagnostic({
    bands: bands({ writing: 6.5 }),
    targetBand: TARGET,
    weakGap: 0.5,
  });
  assert.equal(out.primary, WRITING_SKILL_SLUG);
  assert.deepEqual(out.weakSkills, ["writing"]);
});
