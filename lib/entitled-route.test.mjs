/**
 * Node test runner for entitled-route (keep in sync with entitled-route.ts).
 */
import assert from "node:assert/strict";
import test from "node:test";

const FULL_SKILL_PROGRAM_SLUG = "full_skill_program";
const WRITING_SKILL_SLUG = "writing_skill";
const SPEAKING_SKILL_SLUG = "speaking_skill";
const DUAL_BUNDLE_SLUG = "dual_bundle";

function resolveEntitlementsFromSubscription(sub) {
  if (sub?.entitlements) {
    const out = {
      plans: [...(sub.entitlements.plans ?? [])],
      writing_skill: Boolean(sub.entitlements.writing_skill),
      speaking_skill: Boolean(sub.entitlements.speaking_skill),
      full_skill_program: Boolean(sub.entitlements.full_skill_program),
    };
    if (
      out.plans.includes(DUAL_BUNDLE_SLUG) ||
      (sub.is_active && (sub.plan_slug ?? "").toLowerCase() === DUAL_BUNDLE_SLUG)
    ) {
      if (!out.plans.includes(DUAL_BUNDLE_SLUG)) out.plans.push(DUAL_BUNDLE_SLUG);
      out.writing_skill = true;
      out.speaking_skill = true;
    }
    return out;
  }
  const slug = (sub?.plan_slug ?? "").toLowerCase();
  const dual = Boolean(sub?.is_active && slug === DUAL_BUNDLE_SLUG);
  return {
    plans: sub?.is_active && slug ? [slug] : [],
    writing_skill: Boolean(
      sub?.is_active && (slug === WRITING_SKILL_SLUG || dual),
    ),
    speaking_skill: Boolean(
      sub?.is_active && (slug === SPEAKING_SKILL_SLUG || dual),
    ),
    full_skill_program: Boolean(
      sub?.is_active && slug === FULL_SKILL_PROGRAM_SLUG,
    ),
  };
}

function hasFullSkillProgram(sub) {
  return resolveEntitlementsFromSubscription(sub).full_skill_program;
}

function hasWritingSkillPlan(sub) {
  return resolveEntitlementsFromSubscription(sub).writing_skill;
}

function hasSpeakingSkillPlan(sub) {
  return resolveEntitlementsFromSubscription(sub).speaking_skill;
}

function hasDualBundlePlan(sub) {
  const ent = resolveEntitlementsFromSubscription(sub);
  if (ent.plans.includes(DUAL_BUNDLE_SLUG)) return true;
  if (!sub?.is_active) return false;
  return (sub.plan_slug ?? "").toLowerCase() === DUAL_BUNDLE_SLUG;
}

function canAccessPracticeSkill(sub, skill) {
  if (hasFullSkillProgram(sub)) return true;
  if (skill === "writing") {
    return hasWritingSkillPlan(sub);
  }
  if (skill === "speaking") {
    return hasSpeakingSkillPlan(sub);
  }
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
  speaking_skill: false,
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
          speaking_skill: false,
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
          speaking_skill: false,
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
      speaking_skill: false,
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
  assert.deepEqual(
    resolvePracticeEntitledRoute({
      learning: profile,
      subscription: ws,
      skill: "speaking",
    }),
    { kind: "paywall" },
  );
});

test("resolvePracticeEntitledRoute allows speaking_skill for speaking only", () => {
  const profile = { source_counts: { diagnostic: 0 }, module_summary: {} };
  const ss = {
    is_active: true,
    plan_slug: SPEAKING_SKILL_SLUG,
    entitlements: {
      plans: [SPEAKING_SKILL_SLUG],
      skills: {
        listening: false,
        reading: false,
        writing: false,
        speaking: true,
      },
      writing_skill: false,
      speaking_skill: true,
      full_skill_program: false,
    },
  };
  assert.deepEqual(
    resolvePracticeEntitledRoute({
      learning: profile,
      subscription: ss,
      skill: "speaking",
    }),
    { kind: "ok", profile },
  );
  assert.deepEqual(
    resolvePracticeEntitledRoute({
      learning: profile,
      subscription: ss,
      skill: "writing",
    }),
    { kind: "paywall" },
  );
});

test("resolvePracticeEntitledRoute allows dual_bundle for writing and speaking", () => {
  const profile = { source_counts: { diagnostic: 0 }, module_summary: {} };
  const dualOnly = {
    is_active: true,
    plan_slug: DUAL_BUNDLE_SLUG,
    entitlements: {
      plans: [DUAL_BUNDLE_SLUG],
      skills: {
        listening: false,
        reading: false,
        writing: true,
        speaking: true,
      },
      writing_skill: false,
      speaking_skill: false,
      full_skill_program: false,
    },
  };
  assert.deepEqual(
    resolvePracticeEntitledRoute({
      learning: profile,
      subscription: dualOnly,
      skill: "writing",
    }),
    { kind: "ok", profile },
  );
  assert.deepEqual(
    resolvePracticeEntitledRoute({
      learning: profile,
      subscription: dualOnly,
      skill: "speaking",
    }),
    { kind: "ok", profile },
  );
  assert.deepEqual(
    resolvePracticeEntitledRoute({
      learning: profile,
      subscription: dualOnly,
      skill: "listening",
    }),
    { kind: "paywall" },
  );
});
