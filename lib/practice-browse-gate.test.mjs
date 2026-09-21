/**
 * Node tests for practice-browse-gate (keep in sync with practice-browse-gate.ts).
 */
import assert from "node:assert/strict";
import test from "node:test";

const FSP_PRACTICE_BROWSE_REDIRECT = "/study-plan/today";

function hasFullSkillProgram(sub) {
  return Boolean(sub?.entitlements?.full_skill_program);
}

function isFspPracticeBrowseRestricted(sub) {
  return hasFullSkillProgram(sub);
}

function firstQueryValue(value) {
  if (Array.isArray(value)) return value[0] ?? null;
  if (value == null) return null;
  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
}

function hasPlanPracticeContext(input) {
  const from = firstQueryValue(input.from);
  if (from === "plan") return true;
  const task = firstQueryValue(input.task);
  if (task === "watch" || task === "practice" || task === "submit") return true;
  const taskId = firstQueryValue(input.taskId);
  return Boolean(taskId && taskId.startsWith("t-"));
}

function fspSub() {
  return {
    entitlements: { full_skill_program: true },
  };
}

function writingPackSub() {
  return {
    entitlements: {
      full_skill_program: false,
      writing_skill: true,
    },
  };
}

function dualPackSub() {
  return {
    entitlements: {
      full_skill_program: false,
      writing_skill: true,
      speaking_skill: true,
    },
  };
}

test("isFspPracticeBrowseRestricted true only for FSP", () => {
  assert.equal(isFspPracticeBrowseRestricted(fspSub()), true);
  assert.equal(isFspPracticeBrowseRestricted(writingPackSub()), false);
  assert.equal(isFspPracticeBrowseRestricted(dualPackSub()), false);
  assert.equal(isFspPracticeBrowseRestricted(null), false);
});

test("FSP_PRACTICE_BROWSE_REDIRECT is Today's plan", () => {
  assert.equal(FSP_PRACTICE_BROWSE_REDIRECT, "/study-plan/today");
});

test("hasPlanPracticeContext accepts from=plan", () => {
  assert.equal(hasPlanPracticeContext({ from: "plan" }), true);
  assert.equal(hasPlanPracticeContext({ from: ["plan"] }), true);
});

test("hasPlanPracticeContext accepts plan task kinds", () => {
  assert.equal(hasPlanPracticeContext({ task: "practice" }), true);
  assert.equal(hasPlanPracticeContext({ task: "submit" }), true);
  assert.equal(hasPlanPracticeContext({ task: "watch" }), true);
  assert.equal(hasPlanPracticeContext({ task: "other" }), false);
});

test("hasPlanPracticeContext accepts plan taskId prefix", () => {
  assert.equal(
    hasPlanPracticeContext({
      taskId: "t-2026-09-21-speaking-submit-s0",
    }),
    true,
  );
  assert.equal(hasPlanPracticeContext({ taskId: "attempt-123" }), false);
});

test("hasPlanPracticeContext false for empty browse", () => {
  assert.equal(hasPlanPracticeContext({}), false);
  assert.equal(hasPlanPracticeContext({ from: "library" }), false);
});
