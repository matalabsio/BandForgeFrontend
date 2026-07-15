/**
 * Light check: when AI evaluation fields are present, buildSpeakingFeedback
 * prefers them over heuristics and attaches interactive annotation payloads.
 */

import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function loadBuilder() {
  const tsPath = path.join(__dirname, "build-speaking-feedback.ts");
  try {
    const mod = await import(pathToFileURL(tsPath).href);
    return mod.buildSpeakingFeedback;
  } catch {
    console.log(
      "SKIP build-speaking-feedback TS import (no strip-types); backend covers schema",
    );
    process.exit(0);
  }
}

const transcript =
  "I live near the sea and I enjoy walking there every weekend with friends.";

const baseReport = {
  attempt_id: "a1",
  status: "completed",
  review_status: "completed",
  overall_band: 6.5,
  human_verified: true,
  human_criteria_scores: null,
  ai_band: 6.0,
  fluency: 6.0,
  lexical: 6.0,
  grammar: 5.5,
  pronunciation: 6.0,
  evaluation: {
    band_scores: {
      FC: 6.0,
      LR: 6.5,
      GRA: 5.5,
      P: 6.0,
      P_confidence: 0.8,
      overall: 6.0,
    },
    part_performance: [
      { part: 1, note: "Clear answers on hometown.", band_estimate: 6.0 },
    ],
    evidence_quotes: [
      {
        quote: "I live near the sea",
        criterion: "FC",
        polarity: "strength",
        part: 1,
      },
      {
        quote: "every weekend with friends",
        criterion: "LR",
        polarity: "weakness",
        part: 1,
      },
      {
        quote: "enjoy walking",
        criterion: "P",
        polarity: "strength",
        part: 1,
      },
    ],
    recurring_patterns: [
      {
        pattern: "Simple linking",
        criterion: "GRA",
        frequency: "often",
        examples: ["and"],
      },
    ],
    strengths: ["AI strength: clear topic statement."],
    improvements: ["AI improve: extend with examples."],
    vocabulary_highlights: ["hometown"],
    next_band_advice: "AI next-band: add one concrete example per answer.",
  },
  fluency_metrics: {
    words_per_minute: 120,
    total_speaking_seconds: 40,
    long_pauses: 1,
    response_count: 1,
    questions_asked: 1,
  },
  pause_markers: [{ after_word: "and", gap_sec: 2.4 }],
  transcript,
  audio_play_url: null,
  ai_status: "ai_stub",
  prompt_version: "v1-stub",
  provider_asr: "stub",
  provider_eval: "stub",
  model_asr: null,
  model_eval: null,
  submitted_at: null,
  student_name: "Alex",
  reviewer_notes: null,
  part: 1,
};

const buildSpeakingFeedback = await loadBuilder();
const withAi = buildSpeakingFeedback(baseReport);

assert.equal(withAi.strengths[0], "AI strength: clear topic statement.");
assert.equal(
  withAi.next_band_advice,
  "AI next-band: add one concrete example per answer.",
);
assert.ok(withAi.criteria.some((c) => c.key === "lexical" && c.band === 6.5));
assert.ok(
  withAi.highlights.some(
    (h) =>
      h.text.includes("I live near the sea") &&
      h.kind === "evidence_strength" &&
      h.title &&
      h.body,
  ),
);
assert.ok(
  withAi.highlights.some((h) => h.kind === "pronunciation" && h.title === "Pronunciation"),
);
assert.ok(
  withAi.highlights.some((h) => h.kind === "fluency_pause" && h.text === "and"),
);
assert.equal(withAi.pronunciation_confidence_label, "Pronunciation confidence: high");
assert.equal(withAi.part_cards.length, 1);
assert.equal(withAi.patterns.length, 1);

const heuristicOnly = buildSpeakingFeedback({
  ...baseReport,
  evaluation: null,
  fluency: null,
  lexical: null,
  grammar: null,
  pronunciation: null,
  pause_markers: [],
});
assert.notEqual(
  heuristicOnly.next_band_advice,
  "AI next-band: add one concrete example per answer.",
);
assert.ok(heuristicOnly.strengths.length > 0);

console.log("OK build-speaking-feedback prefers AI + interactive annotation fields");
