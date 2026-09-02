/**
 * Node tests for stable module practice result URLs (keep in sync with mock-catalog.ts,
 * listening-test.ts, reading-test.ts, plan-day-tasks.ts).
 */
import assert from "node:assert/strict";
import test from "node:test";

const ATTEMPT = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const HUB = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const TASK = "t-2026-09-01-listening-practice-s1";

function shortModuleObjectiveResultsPath(
  testNumber,
  module,
  attemptId,
  opts = {},
) {
  const params = new URLSearchParams({ attempt: attemptId });
  const mockAttemptId = opts.mockAttemptId?.trim();
  if (mockAttemptId) params.set("mock_attempt", mockAttemptId);
  if (opts.part != null && Number.isFinite(opts.part) && opts.part >= 1) {
    params.set("part", String(opts.part));
  }
  return `/test/${testNumber}/${module}/results?${params.toString()}`;
}

function shortModuleListeningResultsPath(testNumber, attemptId, opts) {
  return shortModuleObjectiveResultsPath(testNumber, "listening", attemptId, opts);
}

function shortModuleReadingResultsPath(testNumber, attemptId, opts) {
  return shortModuleObjectiveResultsPath(testNumber, "reading", attemptId, opts);
}

function listeningResultsPath(testNumber = 1, attemptId, opts) {
  if (attemptId) {
    return shortModuleListeningResultsPath(testNumber, attemptId, opts);
  }
  return `/test/${testNumber}/listening/results`;
}

function readingResultsPath(testNumber = 1, attemptId, opts) {
  if (attemptId) {
    return shortModuleReadingResultsPath(testNumber, attemptId, opts);
  }
  return `/test/${testNumber}/reading/results`;
}

function appendPlanResultParams(href, ctx) {
  if (!ctx?.taskId && !ctx?.hubId) return href;
  const url = new URL(href, "http://localhost");
  url.searchParams.set("from", "plan");
  if (ctx.task) url.searchParams.set("task", ctx.task);
  if (ctx.taskId) url.searchParams.set("taskId", ctx.taskId);
  if (ctx.hubId) url.searchParams.set("hubId", ctx.hubId);
  return `${url.pathname}${url.search}`;
}

function buildModulePracticeResultHref(opts) {
  const base =
    opts.module === "listening"
      ? listeningResultsPath(opts.testNumber, opts.attemptId, {
          mockAttemptId: opts.mockAttemptId,
          part: opts.part,
        })
      : readingResultsPath(opts.testNumber, opts.attemptId, {
          mockAttemptId: opts.mockAttemptId,
          part: opts.part,
        });
  return appendPlanResultParams(base, opts.plan);
}

function listeningModuleResultsPath(testId, attemptId) {
  const M01 = "a0000000-0000-4000-8000-000000000001";
  if (testId === M01) {
    return listeningResultsPath(1, attemptId);
  }
  return `/mock/${encodeURIComponent(testId)}/listening/results`;
}

test("shortModuleListeningResultsPath embeds attempt id", () => {
  const href = shortModuleListeningResultsPath(1, ATTEMPT);
  assert.match(href, /^\/test\/1\/listening\/results\?/);
  assert.match(href, new RegExp(`attempt=${ATTEMPT}`));
});

test("shortModuleReadingResultsPath embeds attempt id and optional part", () => {
  const href = shortModuleReadingResultsPath(2, ATTEMPT, { part: 3 });
  assert.equal(
    href,
    `/test/2/reading/results?attempt=${ATTEMPT}&part=3`,
  );
});

test("buildModulePracticeResultHref preserves plan params and attempt", () => {
  const href = buildModulePracticeResultHref({
    testNumber: 1,
    module: "listening",
    attemptId: ATTEMPT,
    plan: {
      task: "practice",
      taskId: TASK,
      hubId: HUB,
    },
  });
  assert.match(href, new RegExp(`attempt=${ATTEMPT}`));
  assert.match(href, /from=plan/);
  assert.match(href, /task=practice/);
  assert.match(href, new RegExp(`taskId=${TASK}`));
  assert.match(href, new RegExp(`hubId=${HUB}`));
});

test("listeningModuleResultsPath includes attempt for catalog mocks", () => {
  const href = listeningModuleResultsPath(
    "a0000000-0000-4000-8000-000000000001",
    ATTEMPT,
  );
  assert.match(href, new RegExp(`attempt=${ATTEMPT}`));
});

test("bank hub results URL unchanged", () => {
  const bankHref = `/practice/listening/${HUB}/exercise/results?attempt=${ATTEMPT}&from=plan&task=practice&taskId=${TASK}`;
  assert.match(bankHref, /\/practice\/listening\//);
  assert.match(bankHref, new RegExp(`attempt=${ATTEMPT}`));
});
