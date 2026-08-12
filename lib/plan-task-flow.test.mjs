import assert from "node:assert/strict";
import test from "node:test";

function isBankSubmitConfig(cfg) {
  if (!cfg) return false;
  if (cfg.type === "bank") return true;
  return typeof cfg.href === "string" && cfg.href.includes("/practice/");
}

function planExerciseHref(opts) {
  const q = new URLSearchParams({ from: "plan", task: opts.task });
  if (opts.taskId) q.set("taskId", opts.taskId);
  return `/practice/${opts.skill}/${opts.hubId}/exercise?${q.toString()}`;
}

function planStepOpenHref(opts) {
  const cfg = opts.submitConfig;
  if (isBankSubmitConfig(cfg)) {
    return planExerciseHref({
      skill: opts.skill,
      hubId: opts.hubId,
      task: opts.task,
      taskId: opts.taskId,
    });
  }
  return `/test/1/listening?part=1`;
}

test("bank submit_config stays on practice exercise", () => {
  const href = planStepOpenHref({
    skill: "listening",
    hubId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    task: "practice",
    submitConfig: {
      type: "bank",
      href: "/practice/listening/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/exercise",
    },
  });
  assert.match(href, /^\/practice\/listening\/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa\/exercise/);
  assert.doesNotMatch(href, /\/test\//);
});

test("module hubs still open mock test", () => {
  const href = planStepOpenHref({
    skill: "listening",
    hubId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    task: "practice",
    submitConfig: { type: "module", catalog_number: 1, part: 1 },
  });
  assert.equal(href, "/test/1/listening?part=1");
});
