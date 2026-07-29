/**
 * Node test runner for diagnostic-scoring (keep in sync with diagnostic-scoring.ts).
 */
import assert from "node:assert/strict";
import test from "node:test";

function normalize(value) {
  if (value == null) return "";
  return String(value).trim().toLowerCase().replace(/\s+/g, " ");
}

function isAnswerCorrect(userAnswer, correctAnswer) {
  if (correctAnswer == null || correctAnswer === "") return false;
  const userNorm = normalize(userAnswer);
  if (!userNorm) return false;
  const alternatives = String(correctAnswer).split("/").map((part) => normalize(part));
  return alternatives.includes(userNorm);
}

const LISTENING_BAND_TABLE = [
  [39, 9.0],
  [37, 8.5],
  [35, 8.0],
  [32, 7.5],
  [30, 7.0],
  [26, 6.5],
  [23, 6.0],
  [0, 0.0],
];

const SHORT_RESPONSE_AI_MIN_WORDS = 100;
const SHORT_SPEAKING_MAX_SEC = 45;

function bandFromTable(rawScore, total, table) {
  const safeTotal = Math.max(1, total);
  const scaled = safeTotal !== 40 ? Math.round((rawScore / safeTotal) * 40) : rawScore;
  const clamped = Math.max(0, Math.min(40, scaled));
  for (const [threshold, band] of table) {
    if (clamped >= threshold) return band;
  }
  return 0;
}

function calculateWritingBand(words, part) {
  const minimum = part === 1 ? 150 : 250;
  if (words <= 0) return 0;
  if (words >= minimum) return 7.8;
  return 3.0 + (words / minimum) * (7.8 - 3.0);
}

function shortResponseBand(amount, maxForFullShort = SHORT_RESPONSE_AI_MIN_WORDS - 1) {
  if (amount <= 0) return 0;
  const ceiling = Math.max(1, maxForFullShort);
  const capped = Math.min(amount, ceiling);
  return Math.round((capped / ceiling) * 3 * 2) / 2;
}

function aggregateBand(listening, reading, writing, speaking) {
  const bands = [listening, reading, writing, speaking].filter(
    (b) => b != null && b > 0,
  );
  if (bands.length === 0) return null;
  const avg = bands.reduce((sum, b) => sum + b, 0) / bands.length;
  return Math.round(avg * 10) / 10;
}

function buildModuleReview(questions, answers) {
  const wrong = [];
  const bySkill = {};
  for (const q of questions) {
    const skill = q.skill ?? "general";
    if (!bySkill[skill]) bySkill[skill] = { correct: 0, total: 0 };
    bySkill[skill].total += 1;
    const userAnswer = answers[q.id] ?? "";
    if (isAnswerCorrect(userAnswer, q.answer)) {
      bySkill[skill].correct += 1;
    } else {
      wrong.push({
        id: q.id,
        number: q.number,
        prompt: q.prompt,
        userAnswer: userAnswer || "—",
        correctAnswer: q.answer,
        skill,
      });
    }
  }
  return { wrong, bySkill };
}

function scoreSpeakingModule({ part1Questions, part2MinSec, part2Enabled = true, answers }) {
  let earned = 0;
  const possible = part1Questions.length + (part2Enabled ? 1 : 0);
  let totalSec = 0;
  for (const q of part1Questions) {
    const rec = answers.part1[q.id];
    if (rec?.durationSec && rec.durationSec > 0) totalSec += rec.durationSec;
    if (rec?.completed && rec.durationSec >= q.minSec) earned += 1;
    else if (rec?.completed && rec.durationSec > 0) earned += 0.5;
  }
  if (part2Enabled) {
    const p2 = answers.part2;
    if (p2?.recordSec && p2.recordSec > 0) totalSec += p2.recordSec;
    if (p2?.completed && p2.recordSec >= part2MinSec) earned += 1;
    else if (p2?.completed && p2.recordSec > 0) earned += 0.5;
  }
  const completionRate = possible > 0 ? earned / possible : 0;
  if (totalSec < SHORT_SPEAKING_MAX_SEC) {
    return {
      band: shortResponseBand(totalSec, SHORT_SPEAKING_MAX_SEC - 1),
      completionRate,
    };
  }
  const band = Math.round((4.0 + completionRate * 3.5) * 10) / 10;
  return { band, completionRate };
}

test("isAnswerCorrect accepts slash alternatives", () => {
  assert.equal(isAnswerCorrect("3", "three/3"), true);
  assert.equal(isAnswerCorrect("three", "three/3"), true);
  assert.equal(isAnswerCorrect("four", "three/3"), false);
});

test("isAnswerCorrect is case insensitive", () => {
  assert.equal(isAnswerCorrect("b", "B"), true);
  assert.equal(isAnswerCorrect("NOT GIVEN", "not given"), true);
});

test("bandFromTable scales 10-question diagnostic to 40-equivalent", () => {
  assert.equal(bandFromTable(7, 10, LISTENING_BAND_TABLE), 6.5);
  assert.equal(bandFromTable(10, 10, LISTENING_BAND_TABLE), 9.0);
});

test("calculateWritingBand rewards minimum word count", () => {
  assert.equal(calculateWritingBand(150, 1), 7.8);
  assert.equal(calculateWritingBand(0, 1), 0);
});

test("shortResponseBand maps 0–99 words onto 0–3 half-bands", () => {
  assert.equal(shortResponseBand(0), 0);
  assert.equal(shortResponseBand(99), 3);
  assert.equal(shortResponseBand(33), 1);
  assert.equal(shortResponseBand(50), 1.5);
  assert.ok(shortResponseBand(99) <= 3);
  assert.ok(shortResponseBand(1) >= 0);
});

test("aggregateBand averages four modules", () => {
  assert.equal(aggregateBand(6.0, 7.0, 6.5, 7.5), 6.8);
  assert.equal(aggregateBand(null, 7.0, 6.5, null), 6.8);
});

test("buildModuleReview groups wrong answers by skill", () => {
  const questions = [
    { id: "L1", number: 1, prompt: "Q1", answer: "A", skill: "detail" },
    { id: "L2", number: 2, prompt: "Q2", answer: "B", skill: "gist" },
  ];
  const review = buildModuleReview(questions, { L1: "A", L2: "wrong" });
  assert.equal(review.wrong.length, 1);
  assert.equal(review.wrong[0].id, "L2");
  assert.equal(review.bySkill.detail.correct, 1);
  assert.equal(review.bySkill.gist.correct, 0);
});

test("scoreSpeakingModule rewards full completion", () => {
  const result = scoreSpeakingModule({
    part1Questions: [{ id: "SP1", minSec: 30 }],
    part2MinSec: 90,
    answers: {
      part1: { SP1: { durationSec: 35, completed: true } },
      part2: { prepSec: 60, recordSec: 100, completed: true },
    },
  });
  assert.equal(result.band, 7.5);
  assert.equal(result.completionRate, 1);
});

test("scoreSpeakingModule clamps very short audio to 0–3", () => {
  const result = scoreSpeakingModule({
    part1Questions: [{ id: "SP1", minSec: 30 }],
    part2MinSec: 90,
    answers: {
      part1: { SP1: { durationSec: 10, completed: true } },
      part2: { prepSec: 60, recordSec: 5, completed: true },
    },
  });
  assert.ok(result.band >= 0 && result.band <= 3);
  assert.equal(result.band, shortResponseBand(15, SHORT_SPEAKING_MAX_SEC - 1));
});

test("scoreSpeakingModule part1-only when part2 disabled", () => {
  const result = scoreSpeakingModule({
    part1Questions: [{ id: "S1", minSec: 90 }],
    part2MinSec: 90,
    part2Enabled: false,
    answers: {
      part1: { S1: { durationSec: 95, completed: true } },
      part2: null,
    },
  });
  assert.equal(result.band, 7.5);
  assert.equal(result.completionRate, 1);
});
