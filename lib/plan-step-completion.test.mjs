/**
 * Keep in sync with plan-step-completion.ts policy helpers.
 */
import assert from "node:assert/strict";
import test from "node:test";

function localPlanDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function shouldCompleteHubForPlanTask(skill, currentTask) {
  if (skill === "listening" || skill === "reading") {
    return currentTask === "practice";
  }
  if (skill === "writing" || skill === "speaking") {
    return currentTask === "submit";
  }
  return false;
}

function progressPercent(done, total) {
  if (total <= 0) return 0;
  return Math.round((done / total) * 100);
}

test("localPlanDateKey is YYYY-MM-DD local", () => {
  const d = new Date(2026, 7, 4); // Aug 4 local
  assert.equal(localPlanDateKey(d), "2026-08-04");
});

test("hub completion policy per skill", () => {
  assert.equal(shouldCompleteHubForPlanTask("listening", "practice"), true);
  assert.equal(shouldCompleteHubForPlanTask("listening", "watch"), false);
  assert.equal(shouldCompleteHubForPlanTask("reading", "practice"), true);
  assert.equal(shouldCompleteHubForPlanTask("writing", "practice"), false);
  assert.equal(shouldCompleteHubForPlanTask("writing", "submit"), true);
  assert.equal(shouldCompleteHubForPlanTask("speaking", "submit"), true);
});

test("progressPercent guards empty totals", () => {
  assert.equal(progressPercent(0, 0), 0);
  assert.equal(progressPercent(1, 2), 50);
  assert.equal(progressPercent(2, 3), 67);
  assert.equal(progressPercent(4, 7), 57);
});
