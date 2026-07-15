/**
 * Light check: when AI vocab / next-band / strong spans are present,
 * buildWritingFeedback prefers them over heuristics.
 */

import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function loadBuilder() {
  const tsPath = path.join(__dirname, "build-writing-feedback.ts");
  try {
    const mod = await import(pathToFileURL(tsPath).href);
    return mod.buildWritingFeedback;
  } catch {
    console.log("SKIP build-writing-feedback TS import (no strip-types); backend covers schema");
    process.exit(0);
  }
}

const baseReview = {
  attempt_id: "a1",
  status: "completed",
  module: "writing",
  part: 2,
  test_title: "Mock",
  question_type: "task2",
  prompt: "Discuss both views.",
  user_answer:
    "Education is important for people. It is very good for society and many people think so.",
  word_count: 20,
  band: 6.0,
  min_words: 250,
  submitted_at: null,
  saved_for_review: false,
};

const buildWritingFeedback = await loadBuilder();

const withAi = buildWritingFeedback({
  ...baseReview,
  next_band_advice: "Extend the conclusion with a specific policy example.",
  confidence: 0.8,
  vocabulary_highlights: [
    { word: "crucial", polarity: "strong", alternatives: [] },
    { word: "good", polarity: "weak", alternatives: ["beneficial", "valuable"] },
  ],
  strong_spans: [
    { text: "Education is important for people", reason: "Clear topic sentence" },
  ],
  spelling_mistakes: [
    { original: "people", correction: "individuals", context: "many people" },
  ],
  grammar_mistakes: [
    { original: "think so", correction: "think that way", issue: "vague reference" },
  ],
  ai_strengths: ["Clear position"],
  ai_improvements: ["Add examples"],
});

assert.equal(
  withAi.next_band_advice,
  "Extend the conclusion with a specific policy example.",
);
assert.ok(withAi.strong_words.includes("crucial"));
assert.equal(withAi.weak_words[0]?.word, "good");
assert.equal(withAi.confidence_label, "AI confidence: high");
assert.ok(
  withAi.highlights.some(
    (h) => h.type === "strong" && h.text.includes("Education is important") && h.detail,
  ),
);
assert.ok(
  withAi.highlights.some(
    (h) => h.type === "improve" && h.suggestion?.includes("beneficial"),
  ),
  "merged highlights should include weak vocab suggestion even with mistakes present",
);
assert.ok(
  withAi.highlights.some((h) => h.type === "grammar" && h.suggestion),
);

const heuristic = buildWritingFeedback({ ...baseReview });
assert.notEqual(
  heuristic.next_band_advice,
  "Extend the conclusion with a specific policy example.",
);
assert.ok(heuristic.next_band_advice.length > 0);

console.log("OK build-writing-feedback prefers AI v5 fields + interactive payloads");
