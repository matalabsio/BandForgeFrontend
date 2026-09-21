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
    const r = Number(n % 62n);
    out = ALPHABET[r] + out;
    n /= 62n;
  }
  return out;
}

function planShortCode(opts) {
  const raw = `${opts.skill}|${opts.hubId}|${opts.task}|${opts.taskId}`;
  const digest = createHash("sha256").update(raw, "utf8").digest().subarray(0, 6);
  return (base62Encode(digest) + "00000000").slice(0, 8);
}

function planShortPath(opts) {
  return `/p/${planShortCode(opts)}`;
}

test("planShortPath is opaque 8-char code", () => {
  const href = planShortPath({
    skill: "listening",
    hubId: "c5100000-0000-4000-8000-000000000004",
    task: "practice",
    taskId: "t-2026-09-03-listening-practice-s1",
  });
  assert.match(href, /^\/p\/[0-9A-Za-z]{8}$/);
  assert.doesNotMatch(href, /c5100000/);
  assert.doesNotMatch(href, /taskId/);
  assert.equal(href, "/p/WFAZvPmH");
});

test("planShortCode is stable", () => {
  const a = planShortCode({
    skill: "writing",
    hubId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    task: "submit",
    taskId: "t-1-writing-submit-s0",
  });
  const b = planShortCode({
    skill: "writing",
    hubId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    task: "submit",
    taskId: "t-1-writing-submit-s0",
  });
  assert.equal(a, b);
  assert.equal(a.length, 8);
});
