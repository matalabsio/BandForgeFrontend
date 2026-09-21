import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";

const ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function base62Encode(data) {
  let n = 0n;
  for (const b of data) n = (n << 8n) + BigInt(b);
  if (n === 0n) return ALPHABET[0];
  let out = "";
  while (n > 0n) {
    out = ALPHABET[Number(n % 62n)] + out;
    n /= 62n;
  }
  return out;
}

function planShortPath(opts) {
  const raw = `${opts.skill}|${opts.hubId}|${opts.task}|${opts.taskId}`;
  const digest = createHash("sha256").update(raw, "utf8").digest().subarray(0, 6);
  const code = (base62Encode(digest) + "00000000").slice(0, 8);
  return `/p/${code}`;
}

function isBankSubmitConfig(cfg) {
  if (!cfg) return false;
  if (cfg.type === "bank") return true;
  return typeof cfg.href === "string" && cfg.href.includes("/practice/");
}

function planExerciseHref(opts) {
  if (opts.taskId) {
    return planShortPath({
      skill: opts.skill,
      hubId: opts.hubId,
      task: opts.task,
      taskId: opts.taskId,
    });
  }
  const q = new URLSearchParams({ from: "plan", task: opts.task });
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

test("bank submit_config emits opaque /p code when taskId set", () => {
  const href = planStepOpenHref({
    skill: "listening",
    hubId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    task: "practice",
    taskId: "t-2026-09-03-listening-practice-s1",
    submitConfig: {
      type: "bank",
      href: "/practice/listening/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/exercise",
    },
  });
  assert.match(href, /^\/p\/[0-9A-Za-z]{8}$/);
  assert.doesNotMatch(href, /aaaaaaaa/);
  assert.doesNotMatch(href, /\/test\//);
});

test("bank without taskId keeps legacy exercise query URL", () => {
  const href = planExerciseHref({
    skill: "listening",
    hubId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    task: "practice",
  });
  assert.match(
    href,
    /^\/practice\/listening\/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa\/exercise\?/,
  );
});

test("module hubs still open mock test", () => {
  const href = planStepOpenHref({
    skill: "listening",
    hubId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    task: "practice",
    taskId: "t-1-listening-practice-s0",
    submitConfig: { type: "module", catalog_number: 1, part: 1 },
  });
  assert.equal(href, "/test/1/listening?part=1");
  assert.doesNotMatch(href, /^\/p\//);
});
