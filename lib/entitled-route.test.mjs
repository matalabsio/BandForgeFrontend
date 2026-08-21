/**
 * Node test runner for entitled-route (keep in sync with entitled-route.ts).
 */
import assert from "node:assert/strict";
import test from "node:test";

const FULL_SKILL_PROGRAM_SLUG = "full_skill_program";
const WRITING_SKILL_SLUG = "writing_skill";

function resolveEntitlementsFromSubscription(sub) {
  if (sub?.entitlements) {
    return {
      writing_skill: Boolean(sub.entitlements.writing_skill),
      full_skill_program: Boolean(sub.entitlements.full_skill_program),
    };
  }
  return {
    writing_skill: sub?.is_active && sub.plan_slug === WRITING_SKILL_SLUG,
    full_skill_program:
      sub?.is_active && sub.plan_slug === FULL_SKILL_PROGRAM_SLUG,
  };
}

function hasFullSkillProgram(sub) {
  return resolveEntitlementsFromSubscription(sub).full_skill_program;
}

function hasWritingSkillPlan(sub) {
  return resolveEntitlementsFromSubscription(sub).writing_skill;
}

function canAccessPracticeSkill(sub, skill) {
  const ent = resolveEntitlementsFromSubscription(sub);
  if (ent.full_skill_program) return true;
  if (ent.writing_skill) return skill === "writing";
  return false;
}

function resolveEntitledRoute({ learning, subscription }) {
  if (!hasFullSkillProgram(subscription)) {
    return { kind: "paywall" };
  }
  return { kind: "ok", profile: learning };
}

function resolvePracticeEntitledRoute({ learning, subscription, skill }) {
  if (!canAccessPracticeSkill(subscription, skill)) {
    return { kind: "paywall" };
  }
  return { kind: "ok", profile: learning };
}

const dual = {
  plans: [FULL_SKILL_PROGRAM_SLUG, WRITING_SKILL_SLUG],
  skills: {
    listening: true,
    reading: true,
    writing: true,
    speaking: true,
  },
  writing_skill: true,
  full_skill_program: true,
};

test("resolveEntitledRoute remains FSP-only for dashboard", () => {
  const empty = { source_counts: { diagnostic: 0 }, module_summary: {} };
  assert.deepEqual(
    resolveEntitledRoute({ learning: empty, subscription: null }),
    { kind: "paywall" },
  );
  assert.deepEqual(
    resolveEntitledRoute({
      learning: empty,
      subscription: {
        is_active: true,
        plan_slug: WRITING_SKILL_SLUG,
        entitlements: {
          plans: [WRITING_SKILL_SLUG],
          skills: {
            listening: false,
            reading: false,
            writing: true,
            speaking: false,
          },
          writing_skill: true,
          full_skill_program: false,
        },
      },
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
        entitlements: {
          plans: [FULL_SKILL_PROGRAM_SLUG],
          skills: {
            listening: true,
            reading: true,
            writing: true,
            speaking: true,
          },
          writing_skill: false,
          full_skill_program: true,
        },
      },
    }),
    { kind: "ok", profile },
  );
});

test("dual SKU: Writing Skill not lost when plan_slug is writing_skill", () => {
  const profile = { source_counts: { diagnostic: 0 }, module_summary: {} };
  const sub = {
    is_active: true,
    plan_slug: WRITING_SKILL_SLUG,
    entitlements: dual,
  };
  assert.equal(hasFullSkillProgram(sub), true);
  assert.equal(hasWritingSkillPlan(sub), true);
  assert.deepEqual(
    resolveEntitledRoute({ learning: profile, subscription: sub }),
    { kind: "ok", profile },
  );
  assert.deepEqual(
    resolvePracticeEntitledRoute({
      learning: profile,
      subscription: sub,
      skill: "listening",
    }),
    { kind: "ok", profile },
  );
});

test("dual SKU: Writing Skill not lost when plan_slug is FSP", () => {
  const profile = { source_counts: { diagnostic: 0 }, module_summary: {} };
  const sub = {
    is_active: true,
    plan_slug: FULL_SKILL_PROGRAM_SLUG,
    entitlements: dual,
  };
  assert.equal(hasWritingSkillPlan(sub), true);
  assert.deepEqual(
    resolvePracticeEntitledRoute({
      learning: profile,
      subscription: sub,
      skill: "writing",
    }),
    { kind: "ok", profile },
  );
});

test("resolvePracticeEntitledRoute allows writing_skill for writing only", () => {
  const profile = { source_counts: { diagnostic: 0 }, module_summary: {} };
  const ws = {
    is_active: true,
    plan_slug: WRITING_SKILL_SLUG,
    entitlements: {
      plans: [WRITING_SKILL_SLUG],
      skills: {
        listening: false,
        reading: false,
        writing: true,
        speaking: false,
      },
      writing_skill: true,
      full_skill_program: false,
    },
  };
  assert.deepEqual(
    resolvePracticeEntitledRoute({
      learning: profile,
      subscription: ws,
      skill: "writing",
    }),
    { kind: "ok", profile },
  );
  assert.deepEqual(
    resolvePracticeEntitledRoute({
      learning: profile,
      subscription: ws,
      skill: "listening",
    }),
    { kind: "paywall" },
  );
});
