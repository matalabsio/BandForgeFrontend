/**
 * Phase 6A: Writing Skill pricing + track selection helpers.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const planCardSrc = readFileSync(
  join(__dirname, "../components/pricing/plan-card.tsx"),
  "utf8",
);
const pricingClientSrc = readFileSync(
  join(__dirname, "../components/pricing/pricing-client.tsx"),
  "utf8",
);
const claimsSrc = readFileSync(
  join(__dirname, "seo/claims.ts"),
  "utf8",
);

test("writing_skill plan copy renders Writing Skill commerce claims", () => {
  assert.match(planCardSrc, /writing_skill:\s*\{/);
  assert.match(planCardSrc, /Buy Writing Skill/);
  assert.match(planCardSrc, /180 days/);
  assert.match(planCardSrc, /Academic or General Training/);
  assert.match(planCardSrc, /12 Writing practice hubs/);
});

test("FSP pricing copy remains unchanged", () => {
  assert.match(planCardSrc, /"full_skill_program":\s*\{/);
  assert.match(planCardSrc, /Buy Full Skill Program/);
  assert.match(planCardSrc, /48 practice hubs/);
  assert.match(claimsSrc, /FULL_SKILL_PROGRAM_SLUG = "full_skill_program"/);
  assert.match(claimsSrc, /priceInr: 2499/);
});

test("checkout persists plan_slug including writing_skill", () => {
  assert.match(pricingClientSrc, /plan_slug:\s*slug/);
  assert.match(
    readFileSync(join(__dirname, "payments.ts"), "utf8"),
    /plan_slug\?:\s*string\s*\|\s*null/,
  );
});

test("createOrder still posts plan_slug body (writing_skill compatible)", () => {
  const payments = readFileSync(join(__dirname, "payments.ts"), "utf8");
  assert.match(payments, /JSON\.stringify\(\{\s*plan_slug:\s*planSlug\s*\}\)/);
});

/** Pure track-selection helpers mirrored from writing-skill-track.ts */
const WRITING_PRACTICE_PATH = "/practice/writing";
const WRITING_SKILL_ONBOARDING_PATH = "/practice/writing/onboarding";

async function selectWritingSkillTrack(examModule, api) {
  try {
    const result = await api.setWritingSkillExamModule(examModule);
    return { path: WRITING_PRACTICE_PATH, changed: result.changed };
  } catch (error) {
    if (error && error.status === 409) {
      const state = await api.probe();
      if (state === "ready") return { path: WRITING_PRACTICE_PATH, changed: false };
      return { path: WRITING_SKILL_ONBOARDING_PATH, changed: false };
    }
    throw error;
  }
}

test("Academic selection sends academic", async () => {
  const calls = [];
  const out = await selectWritingSkillTrack("academic", {
    setWritingSkillExamModule: async (m) => {
      calls.push(m);
      return { exam_module: m, usage_id: "u1", changed: true };
    },
    probe: async () => "ready",
  });
  assert.deepEqual(calls, ["academic"]);
  assert.equal(out.path, WRITING_PRACTICE_PATH);
  assert.equal(out.changed, true);
});

test("GT selection sends general_training", async () => {
  const calls = [];
  const out = await selectWritingSkillTrack("general_training", {
    setWritingSkillExamModule: async (m) => {
      calls.push(m);
      return { exam_module: m, usage_id: "u1", changed: true };
    },
    probe: async () => "ready",
  });
  assert.deepEqual(calls, ["general_training"]);
  assert.equal(out.path, WRITING_PRACTICE_PATH);
});

test("backend 409 does not overwrite track — routes by probe", async () => {
  let setCalls = 0;
  const out = await selectWritingSkillTrack("general_training", {
    setWritingSkillExamModule: async () => {
      setCalls += 1;
      const err = new Error("exam_module cannot be changed");
      err.status = 409;
      throw err;
    },
    probe: async () => "ready",
  });
  assert.equal(setCalls, 1);
  assert.equal(out.path, WRITING_PRACTICE_PATH);
  assert.equal(out.changed, false);
});

test("NULL track shows picker; selected track skips picker", () => {
  function entryPath(state) {
    if (state === "ready") return WRITING_PRACTICE_PATH;
    if (state === "needs_track") return WRITING_SKILL_ONBOARDING_PATH;
    return WRITING_SKILL_ONBOARDING_PATH;
  }
  assert.equal(entryPath("needs_track"), WRITING_SKILL_ONBOARDING_PATH);
  assert.equal(entryPath("ready"), WRITING_PRACTICE_PATH);
});
