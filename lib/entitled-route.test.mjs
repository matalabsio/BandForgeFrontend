/**
 * Node test runner for entitled-route (keep in sync with entitled-route.ts).
 */
import assert from "node:assert/strict";
import test from "node:test";

const FULL_SKILL_PROGRAM_SLUG = "full_skill_program";
const SKILL_KEYS = ["listening", "reading", "writing", "speaking"];

function hasFullSkillProgram(sub) {
  return Boolean(sub?.is_active && sub.plan_slug === FULL_SKILL_PROGRAM_SLUG);
}

function hasModuleSummaryBands(profile) {
  const summary = profile.module_summary ?? {};
  return SKILL_KEYS.some((key) => {
    const row = summary[key];
    return row?.latest != null && row.latest > 0;
  });
}

function isDiagnosticComplete(profile) {
  if ((profile.source_counts?.diagnostic ?? 0) > 0) return true;
  return hasModuleSummaryBands(profile);
}

function resolveEntitledRoute({ learning, subscription }) {
  if (!isDiagnosticComplete(learning)) {
    return { kind: "redirect", path: "/diagnostic" };
  }
  if (!hasFullSkillProgram(subscription)) {
    return { kind: "paywall" };
  }
  return { kind: "ok", profile: learning };
}

test("resolveEntitledRoute branches", () => {
  const empty = { source_counts: { diagnostic: 0 }, module_summary: {} };
  assert.deepEqual(
    resolveEntitledRoute({ learning: empty, subscription: null }),
    { kind: "redirect", path: "/diagnostic" },
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
