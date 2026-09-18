/**
 * Regression: FSP-targeted entitlement paywalls must not show diagnostic CTAs.
 * Keep in sync with plan-paywall.ts + entitled-route / missingSku helpers.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const FULL_SKILL_PROGRAM_SLUG = "full_skill_program";
const WRITING_SKILL_SLUG = "writing_skill";
const SPEAKING_SKILL_SLUG = "speaking_skill";
const DUAL_BUNDLE_SLUG = "dual_bundle";

function resolvePlanPaywallKind({
  targetSlug = FULL_SKILL_PROGRAM_SLUG,
  hasDiagnostic,
}) {
  if (targetSlug === FULL_SKILL_PROGRAM_SLUG && hasDiagnostic !== undefined) {
    return hasDiagnostic ? "diagnostic_unlock" : "diagnostic_start";
  }
  return "purchase";
}

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
  return {
    plans: [],
    writing_skill: false,
    speaking_skill: false,
    full_skill_program: false,
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

function canAccessPracticeSkill(sub, skill) {
  if (hasFullSkillProgram(sub)) return true;
  if (skill === "writing") return hasWritingSkillPlan(sub);
  if (skill === "speaking") return hasSpeakingSkillPlan(sub);
  return false;
}

function resolveEntitledRoute({ subscription }) {
  if (!hasFullSkillProgram(subscription)) return { kind: "paywall" };
  return { kind: "ok" };
}

function missingSkuForPracticeSkill(sub, skill) {
  if (canAccessPracticeSkill(sub, skill)) return null;
  if (skill === "writing") return WRITING_SKILL_SLUG;
  if (skill === "speaking") return SPEAKING_SKILL_SLUG;
  return FULL_SKILL_PROGRAM_SLUG;
}

/** Entitlement-gate paywall: never pass hasDiagnostic. */
function fspRoutePaywallKind() {
  return resolvePlanPaywallKind({ targetSlug: FULL_SKILL_PROGRAM_SLUG });
}

const writingOnly = {
  is_active: true,
  plan_slug: WRITING_SKILL_SLUG,
  entitlements: {
    plans: [WRITING_SKILL_SLUG],
    writing_skill: true,
    speaking_skill: false,
    full_skill_program: false,
  },
};

const speakingOnly = {
  is_active: true,
  plan_slug: SPEAKING_SKILL_SLUG,
  entitlements: {
    plans: [SPEAKING_SKILL_SLUG],
    writing_skill: false,
    speaking_skill: true,
    full_skill_program: false,
  },
};

const dualOnly = {
  is_active: true,
  plan_slug: DUAL_BUNDLE_SLUG,
  entitlements: {
    plans: [DUAL_BUNDLE_SLUG],
    writing_skill: false,
    speaking_skill: false,
    full_skill_program: false,
  },
};

const fspOwner = {
  is_active: true,
  plan_slug: FULL_SKILL_PROGRAM_SLUG,
  entitlements: {
    plans: [FULL_SKILL_PROGRAM_SLUG],
    writing_skill: false,
    speaking_skill: false,
    full_skill_program: true,
  },
};

test("A: Writing-only + FSP route → blocked, Buy FSP (not Start diagnostic)", () => {
  assert.equal(resolveEntitledRoute({ subscription: writingOnly }).kind, "paywall");
  assert.equal(fspRoutePaywallKind(), "purchase");
  assert.notEqual(fspRoutePaywallKind(), "diagnostic_start");
});

test("B: Speaking-only + FSP route → blocked, Buy FSP (not Start diagnostic)", () => {
  assert.equal(resolveEntitledRoute({ subscription: speakingOnly }).kind, "paywall");
  assert.equal(fspRoutePaywallKind(), "purchase");
  assert.notEqual(fspRoutePaywallKind(), "diagnostic_start");
});

test("C: Dual + FSP route → blocked, Buy FSP (not Start diagnostic)", () => {
  assert.equal(resolveEntitledRoute({ subscription: dualOnly }).kind, "paywall");
  assert.equal(fspRoutePaywallKind(), "purchase");
  assert.notEqual(fspRoutePaywallKind(), "diagnostic_start");
});

test("D: FSP owner + FSP route → allowed, no purchase paywall", () => {
  assert.equal(resolveEntitledRoute({ subscription: fspOwner }).kind, "ok");
});

test("E: genuine diagnostic unpaid flow keeps Start / Unlock walls", () => {
  assert.equal(
    resolvePlanPaywallKind({
      targetSlug: FULL_SKILL_PROGRAM_SLUG,
      hasDiagnostic: false,
    }),
    "diagnostic_start",
  );
  assert.equal(
    resolvePlanPaywallKind({
      targetSlug: FULL_SKILL_PROGRAM_SLUG,
      hasDiagnostic: true,
    }),
    "diagnostic_unlock",
  );
});

test("F: Writing-only on Speaking-targeted → Speaking purchase wall", () => {
  assert.equal(canAccessPracticeSkill(writingOnly, "speaking"), false);
  assert.equal(
    missingSkuForPracticeSkill(writingOnly, "speaking"),
    SPEAKING_SKILL_SLUG,
  );
  assert.equal(
    resolvePlanPaywallKind({ targetSlug: SPEAKING_SKILL_SLUG }),
    "purchase",
  );
});

test("G: Speaking-only on Writing-targeted → Writing purchase wall", () => {
  assert.equal(canAccessPracticeSkill(speakingOnly, "writing"), false);
  assert.equal(
    missingSkuForPracticeSkill(speakingOnly, "writing"),
    WRITING_SKILL_SLUG,
  );
  assert.equal(
    resolvePlanPaywallKind({ targetSlug: WRITING_SKILL_SLUG }),
    "purchase",
  );
});

test("FSP purchase CTA label is wired in DashboardPlanPaywall SKU map", () => {
  const src = readFileSync(
    join(
      __dirname,
      "../components/bandforge/dashboard/dashboard-plan-paywall.tsx",
    ),
    "utf8",
  );
  assert.match(src, /ctaLabel:\s*"Buy Full Skill Program"/);
  assert.match(src, /ctaLabel="Start diagnostic"/);
  assert.match(src, /resolvePlanPaywallKind/);
});

test("EntitledRouteGate does not pass hasDiagnostic into FSP paywall", () => {
  const src = readFileSync(
    join(
      __dirname,
      "../components/bandforge/dashboard/entitled-route-gate.tsx",
    ),
    "utf8",
  );
  assert.doesNotMatch(src, /hasDiagnostic=\{/);
  assert.doesNotMatch(src, /hasDiagnostic\?:/);
  assert.match(src, /<DashboardPlanPaywall targetSlug=\{targetSlug\} \/>/);
});

test("Dashboard unlock gate still opts into diagnostic walls", () => {
  const src = readFileSync(
    join(
      __dirname,
      "../components/bandforge/dashboard/dashboard-plan-activating.tsx",
    ),
    "utf8",
  );
  assert.match(src, /DashboardPlanPaywall hasDiagnostic=\{false\}/);
  assert.match(src, /<DashboardPlanPaywall hasDiagnostic \/>/);
});
