/**
 * Node test runner for entitlement helpers (keep in sync with entitlement.ts).
 */
import assert from "node:assert/strict";
import test from "node:test";

const FULL_SKILL_PROGRAM_SLUG = "full_skill_program";
const FULL_SKILL_PROGRAM_TIER = "full_skill_program";
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

function hasActivePersonalizedPlan(profile) {
  const plan = profile.study_plan;
  const tier = plan?.plan_tier;
  if (tier !== FULL_SKILL_PROGRAM_TIER) return false;

  const examRaw = profile.exam_date ?? plan?.exam_date;
  if (!examRaw) return false;

  const exam = new Date(String(examRaw).slice(0, 10));
  if (Number.isNaN(exam.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  exam.setHours(0, 0, 0, 0);
  if (exam < today) return false;

  return (plan.weeks?.length ?? 0) > 0;
}

function canAccessPersonalizedDashboard(profile, subscription) {
  if (!hasFullSkillProgram(subscription)) return false;
  return isDiagnosticComplete(profile) || hasActivePersonalizedPlan(profile);
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

test("hasActivePersonalizedPlan requires tier, future exam date, and weeks", () => {
  const future = new Date();
  future.setDate(future.getDate() + 30);

  assert.equal(
    hasActivePersonalizedPlan({
      exam_date: future.toISOString().slice(0, 10),
      study_plan: { plan_tier: FULL_SKILL_PROGRAM_TIER, weeks: [{ days: [] }] },
    }),
    true,
  );

  assert.equal(
    hasActivePersonalizedPlan({
      exam_date: "2020-01-01",
      study_plan: { plan_tier: FULL_SKILL_PROGRAM_TIER, weeks: [{ days: [] }] },
    }),
    false,
  );
});

test("canAccessPersonalizedDashboard allows subscribed users with personalized plan", () => {
  const future = new Date();
  future.setDate(future.getDate() + 30);
  const sub = { is_active: true, plan_slug: FULL_SKILL_PROGRAM_SLUG };
  const profile = {
    source_counts: { diagnostic: 0 },
    module_summary: {},
    exam_date: future.toISOString().slice(0, 10),
    study_plan: { plan_tier: FULL_SKILL_PROGRAM_TIER, weeks: [{ days: [] }] },
  };

  assert.equal(isDiagnosticComplete(profile), false);
  assert.equal(canAccessPersonalizedDashboard(profile, sub), true);
});
