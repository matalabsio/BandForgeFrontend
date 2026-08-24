/**
 * Node test runner for entitlement helpers (keep in sync with entitlement.ts).
 */
import assert from "node:assert/strict";
import test from "node:test";

const FULL_SKILL_PROGRAM_SLUG = "full_skill_program";
const WRITING_SKILL_SLUG = "writing_skill";
const SPEAKING_SKILL_SLUG = "speaking_skill";
const DUAL_BUNDLE_SLUG = "dual_bundle";
const FULL_SKILL_PROGRAM_TIER = "full_skill_program";
const SKILL_KEYS = ["listening", "reading", "writing", "speaking"];
const WRITING_SKILL_ONBOARDING_PATH = "/practice/writing/onboarding";
const WRITING_PRACTICE_PATH = "/practice/writing";
const SPEAKING_PRACTICE_PATH = "/practice/speaking";

function emptyEntitlements() {
  return {
    plans: [],
    skills: {
      listening: false,
      reading: false,
      writing: false,
      speaking: false,
    },
    writing_skill: false,
    full_skill_program: false,
  };
}

function resolveEntitlementsFromSubscription(sub) {
  if (sub?.entitlements) {
    return {
      plans: [...(sub.entitlements.plans ?? [])],
      skills: {
        listening: Boolean(sub.entitlements.skills?.listening),
        reading: Boolean(sub.entitlements.skills?.reading),
        writing: Boolean(sub.entitlements.skills?.writing),
        speaking: Boolean(sub.entitlements.skills?.speaking),
      },
      writing_skill: Boolean(sub.entitlements.writing_skill),
      full_skill_program: Boolean(sub.entitlements.full_skill_program),
    };
  }

  const out = emptyEntitlements();
  if (!sub?.is_active) return out;
  const slug = (sub.plan_slug ?? "").toLowerCase();
  const name = (sub.plan_name ?? "").toLowerCase();
  if (
    slug === FULL_SKILL_PROGRAM_SLUG ||
    slug.includes("full_skill") ||
    name.includes("full skill")
  ) {
    out.plans.push(FULL_SKILL_PROGRAM_SLUG);
    out.full_skill_program = true;
    out.skills.listening = true;
    out.skills.reading = true;
    out.skills.writing = true;
    out.skills.speaking = true;
  }
  if (slug === WRITING_SKILL_SLUG || name.includes("writing skill")) {
    if (!out.plans.includes(WRITING_SKILL_SLUG)) out.plans.push(WRITING_SKILL_SLUG);
    out.writing_skill = true;
    out.skills.writing = true;
  }
  return out;
}

function hasFullSkillProgram(sub) {
  return resolveEntitlementsFromSubscription(sub).full_skill_program;
}

function hasWritingSkillPlan(sub) {
  return resolveEntitlementsFromSubscription(sub).writing_skill;
}

function hasSpeakingSkillPlan(sub) {
  const ent = resolveEntitlementsFromSubscription(sub);
  if (ent.plans.includes(SPEAKING_SKILL_SLUG)) return true;
  if (!sub?.is_active) return false;
  return (sub.plan_slug ?? "").toLowerCase() === SPEAKING_SKILL_SLUG;
}

function hasDualBundlePlan(sub) {
  const ent = resolveEntitlementsFromSubscription(sub);
  if (ent.plans.includes(DUAL_BUNDLE_SLUG)) return true;
  if (!sub?.is_active) return false;
  return (sub.plan_slug ?? "").toLowerCase() === DUAL_BUNDLE_SLUG;
}

function hasWritingAccess(sub) {
  return resolveEntitlementsFromSubscription(sub).skills.writing;
}

function resolvePracticeAccessKind(sub) {
  const ent = resolveEntitlementsFromSubscription(sub);
  if (ent.full_skill_program) return "fsp";
  if (ent.writing_skill) return "writing_skill";
  return "none";
}

function canAccessPracticeSkill(sub, skill) {
  const kind = resolvePracticeAccessKind(sub);
  if (kind === "fsp") return true;
  if (kind === "writing_skill") return skill === "writing";
  return false;
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
  if (hasFullSkillProgram(subscription)) return true;
  return isDiagnosticComplete(profile);
}

function postCheckoutDestination(sub, opts = {}) {
  if (hasFullSkillProgram(sub)) {
    return "/dashboard?activating=1";
  }
  const receiptSlug = (opts.receiptPlanSlug ?? "").toLowerCase();
  if (hasDualBundlePlan(sub) || receiptSlug === DUAL_BUNDLE_SLUG) {
    return WRITING_PRACTICE_PATH;
  }
  if (hasWritingSkillPlan(sub) || receiptSlug === WRITING_SKILL_SLUG) {
    return WRITING_PRACTICE_PATH;
  }
  if (hasSpeakingSkillPlan(sub) || receiptSlug === SPEAKING_SKILL_SLUG) {
    return SPEAKING_PRACTICE_PATH;
  }
  return "/pricing";
}

function subscriptionUnlocksAfterCheckout(sub) {
  return (
    hasFullSkillProgram(sub) ||
    hasWritingSkillPlan(sub) ||
    hasSpeakingSkillPlan(sub) ||
    hasDualBundlePlan(sub)
  );
}

function dualEntitlements() {
  return {
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
}

test("FSP only", () => {
  const sub = {
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
  };
  assert.equal(hasFullSkillProgram(sub), true);
  assert.equal(hasWritingSkillPlan(sub), false);
  assert.equal(hasWritingAccess(sub), true);
  assert.equal(resolvePracticeAccessKind(sub), "fsp");
});

test("Writing Skill only", () => {
  const sub = {
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
  assert.equal(hasFullSkillProgram(sub), false);
  assert.equal(hasWritingSkillPlan(sub), true);
  assert.equal(canAccessPracticeSkill(sub, "writing"), true);
  assert.equal(canAccessPracticeSkill(sub, "listening"), false);
  assert.equal(postCheckoutDestination(sub), WRITING_PRACTICE_PATH);
});

test("Speaking Skill only routes to speaking practice", () => {
  const sub = {
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
      full_skill_program: false,
    },
  };
  assert.equal(postCheckoutDestination(sub), SPEAKING_PRACTICE_PATH);
});

test("Dual Bundle routes to writing practice entry", () => {
  const sub = {
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
      full_skill_program: false,
    },
  };
  assert.equal(postCheckoutDestination(sub), WRITING_PRACTICE_PATH);
  assert.equal(subscriptionUnlocksAfterCheckout(sub), true);
});

test("FSP + Writing Skill — both flags true regardless of plan_slug order", () => {
  const ent = dualEntitlements();
  const fspPrimary = {
    is_active: true,
    plan_slug: FULL_SKILL_PROGRAM_SLUG,
    entitlements: ent,
  };
  const wsPrimary = {
    is_active: true,
    plan_slug: WRITING_SKILL_SLUG,
    entitlements: ent,
  };

  for (const sub of [fspPrimary, wsPrimary]) {
    assert.equal(hasFullSkillProgram(sub), true);
    assert.equal(hasWritingSkillPlan(sub), true);
    assert.equal(hasWritingAccess(sub), true);
    assert.equal(resolvePracticeAccessKind(sub), "fsp");
    assert.equal(postCheckoutDestination(sub), "/dashboard?activating=1");
  }
});

test("unrelated subscription does not grant FSP or Writing Skill", () => {
  const sub = {
    is_active: true,
    plan_slug: "premium_monthly",
    entitlements: emptyEntitlements(),
  };
  assert.equal(hasFullSkillProgram(sub), false);
  assert.equal(hasWritingSkillPlan(sub), false);
  assert.equal(hasWritingAccess(sub), false);
  assert.equal(resolvePracticeAccessKind(sub), "none");
});

test("expired Writing Skill — entitlements false", () => {
  const sub = {
    is_active: false,
    plan_slug: null,
    entitlements: emptyEntitlements(),
  };
  assert.equal(hasWritingSkillPlan(sub), false);
  assert.equal(hasFullSkillProgram(sub), false);
  assert.equal(subscriptionUnlocksAfterCheckout(sub), false);
});

test("legacy single-slug fallback still works without entitlements field", () => {
  assert.equal(
    hasFullSkillProgram({
      is_active: true,
      plan_slug: FULL_SKILL_PROGRAM_SLUG,
    }),
    true,
  );
  assert.equal(
    hasWritingSkillPlan({
      is_active: true,
      plan_slug: WRITING_SKILL_SLUG,
    }),
    true,
  );
  assert.equal(
    hasWritingSkillPlan({
      is_active: true,
      plan_slug: "premium_monthly",
    }),
    false,
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

test("canAccessPersonalizedDashboard allows FSP; Writing Skill alone does not", () => {
  const emptyProfile = {
    source_counts: { diagnostic: 0 },
    module_summary: {},
    study_plan: {},
  };
  assert.equal(
    canAccessPersonalizedDashboard(emptyProfile, {
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
    }),
    false,
  );
  assert.equal(
    canAccessPersonalizedDashboard(emptyProfile, {
      is_active: true,
      plan_slug: WRITING_SKILL_SLUG,
      entitlements: dualEntitlements(),
    }),
    true,
  );
  assert.equal(WRITING_PRACTICE_PATH, "/practice/writing");
});
