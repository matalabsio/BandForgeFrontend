/**
 * Node test runner for plan-preview (keep in sync with plan-preview.ts).
 */
import assert from "node:assert/strict";
import test from "node:test";

const HARD_GAP_THRESHOLD = 1.0;
const GAP_FLOOR = 0.5;
const FOUNDATION_BAND_THRESHOLD = 6.0;
const SKILL_ORDER = ["listening", "reading", "writing", "speaking"];
const HARD_POOL = ["writing", "speaking"];
const EASY_POOL = ["listening", "reading"];
const MIXED_TEMPLATE = ["H", "E", "H", "H", "E"];

function skillGap(band, target) {
  if (band == null || band <= 0) return Math.max(target, GAP_FLOOR);
  return Math.max(target - band, GAP_FLOOR);
}

function isFoundationPath(bands) {
  for (const key of SKILL_ORDER) {
    const band = bands[key];
    if (band == null || band <= 0) return false;
    if (band >= FOUNDATION_BAND_THRESHOLD) return false;
  }
  return true;
}

function allocateDays(gaps, totalDays) {
  const sum = SKILL_ORDER.reduce((acc, key) => acc + gaps[key], 0);
  const quotas = SKILL_ORDER.map((key) => ({
    key,
    quota: (gaps[key] / sum) * totalDays,
  }));
  const floors = quotas.map(({ key, quota }) => ({
    key,
    floor: Math.floor(quota),
    remainder: quota - Math.floor(quota),
  }));
  const allocated = Object.fromEntries(floors.map(({ key, floor }) => [key, floor]));
  let remain = totalDays - floors.reduce((acc, row) => acc + row.floor, 0);
  const sorted = [...floors].sort((a, b) => b.remainder - a.remainder);
  let i = 0;
  while (remain > 0) {
    const key = sorted[i % sorted.length].key;
    allocated[key] += 1;
    remain -= 1;
    i += 1;
  }
  return allocated;
}

function pickFromPool(pool, gaps, lastSkill, consecutive, alternation) {
  const eligible = pool.filter((skill) => {
    if (lastSkill === skill && consecutive >= 2) return false;
    return true;
  });
  const candidates = eligible.length > 0 ? eligible : [...pool];
  candidates.sort((a, b) => {
    const gapDiff = gaps[b] - gaps[a];
    if (gapDiff !== 0) return gapDiff;
    return alternation[a] - alternation[b];
  });
  const pick = candidates[0];
  alternation[pick] += 1;
  return pick;
}

function buildSessionOrder(bands, target) {
  if (isFoundationPath(bands)) {
    return {
      kind: "foundation",
      order: ["listening", "reading", "writing", "speaking"],
    };
  }
  const gaps = {
    listening: skillGap(bands.listening, target),
    reading: skillGap(bands.reading, target),
    writing: skillGap(bands.writing, target),
    speaking: skillGap(bands.speaking, target),
  };
  const order = [];
  let lastSkill = null;
  let consecutive = 0;
  const alternation = { listening: 0, reading: 0, writing: 0, speaking: 0 };
  for (const slot of MIXED_TEMPLATE) {
    const pool = slot === "H" ? HARD_POOL : EASY_POOL;
    const pick = pickFromPool(pool, gaps, lastSkill, consecutive, alternation);
    if (pick === lastSkill) consecutive += 1;
    else {
      lastSkill = pick;
      consecutive = 1;
    }
    order.push(pick);
  }
  return { kind: "mixed", order };
}

test("mixed path L7 R7 W6 S6 target 7", () => {
  const bands = { listening: 7, reading: 7, writing: 6, speaking: 6 };
  const { kind, order } = buildSessionOrder(bands, 7);
  assert.equal(kind, "mixed");
  assert.deepEqual(order, ["writing", "listening", "speaking", "writing", "reading"]);
});

test("foundation path L4 R4 W2 S2", () => {
  const bands = { listening: 4, reading: 4, writing: 2, speaking: 2 };
  const { kind, order } = buildSessionOrder(bands, 7);
  assert.equal(kind, "foundation");
  assert.deepEqual(order, ["listening", "reading", "writing", "speaking"]);
});

test("hamilton sums to N for L4 R4 W2 S2", () => {
  const gaps = {
    listening: skillGap(4, 7),
    reading: skillGap(4, 7),
    writing: skillGap(2, 7),
    speaking: skillGap(2, 7),
  };
  const alloc = allocateDays(gaps, 14);
  const sum = SKILL_ORDER.reduce((acc, k) => acc + alloc[k], 0);
  assert.equal(sum, 14);
  assert.equal(alloc.writing, 4);
  assert.equal(alloc.speaking, 4);
});
