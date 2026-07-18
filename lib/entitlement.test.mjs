/**
 * Node test runner for entitlement helpers (keep in sync with entitlement.ts).
 */
import assert from "node:assert/strict";
import test from "node:test";

const FULL_SKILL_PROGRAM_SLUG = "full_skill_program";
const SKILL_KEYS = ["listening", "reading", "writing", "speaking"];

function hasFullSkillProgram(sub) {
  if (!sub?.is_active) return false;
  if (sub.plan_slug === FULL_SKILL_PROGRAM_SLUG) return true;
  const slug = (sub.plan_slug ?? "").toLowerCase();
  const name = (sub.plan_name ?? "").toLowerCase();
  return slug.includes("full_skill") || name.includes("full skill");
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

test("hasFullSkillProgram requires active full_skill_program slug", () => {
  assert.equal(hasFullSkillProgram(null), false);
  assert.equal(
    hasFullSkillProgram({ is_active: true, plan_slug: "other" }),
    false,
  );
  assert.equal(
    hasFullSkillProgram({
      is_active: true,
      plan_slug: FULL_SKILL_PROGRAM_SLUG,
    }),
    true,
  );
  assert.equal(
    hasFullSkillProgram({
      is_active: true,
      plan_slug: null,
      plan_name: "Full Skill Program",
    }),
    true,
  );
});

test("isDiagnosticComplete uses diagnostic count or module_summary bands", () => {
  const empty = {
    source_counts: { diagnostic: 0 },
    module_summary: {},
  };
  assert.equal(isDiagnosticComplete(empty), false);

  assert.equal(
    isDiagnosticComplete({
      source_counts: { diagnostic: 1 },
      module_summary: {},
    }),
    true,
  );

  assert.equal(
    isDiagnosticComplete({
      source_counts: { diagnostic: 0 },
      module_summary: {
        listening: { latest: 5.5 },
      },
    }),
    true,
  );
});
