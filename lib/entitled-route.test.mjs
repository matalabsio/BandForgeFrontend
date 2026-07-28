/**
 * Node test runner for entitled-route (keep in sync with entitled-route.ts).
 */
import assert from "node:assert/strict";
import test from "node:test";

const FULL_SKILL_PROGRAM_SLUG = "full_skill_program";

function hasFullSkillProgram(sub) {
  return Boolean(sub?.is_active && sub.plan_slug === FULL_SKILL_PROGRAM_SLUG);
}

function resolveEntitledRoute({ learning, subscription }) {
  if (!hasFullSkillProgram(subscription)) {
    return { kind: "paywall" };
  }
  return { kind: "ok", profile: learning };
}

test("resolveEntitledRoute branches", () => {
  const empty = { source_counts: { diagnostic: 0 }, module_summary: {} };
  assert.deepEqual(
    resolveEntitledRoute({ learning: empty, subscription: null }),
    { kind: "paywall" },
  );
  assert.deepEqual(
    resolveEntitledRoute({
      learning: { source_counts: { diagnostic: 1 }, module_summary: {} },
      subscription: { is_active: false, plan_slug: null },
    }),
    { kind: "paywall" },
  );
  const profile = { source_counts: { diagnostic: 1 }, module_summary: {} };
  assert.deepEqual(
    resolveEntitledRoute({
      learning: profile,
      subscription: {
        is_active: true,
        plan_slug: FULL_SKILL_PROGRAM_SLUG,
      },
    }),
    { kind: "ok", profile },
  );
});
