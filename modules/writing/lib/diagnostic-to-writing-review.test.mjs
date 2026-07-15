/**
 * Adapter contract test (keep in sync with diagnostic-to-writing-review.ts).
 * Run: npm run test:writing-diagnostic-adapter
 */

import assert from "node:assert/strict";

/** Mirrors frontend/modules/writing/lib/diagnostic-to-writing-review.ts */
function diagnosticToWritingReview(input) {
  const { evaluation, essay, question, taskPart } = input;
  const wordCount =
    evaluation.metadata?.word_count > 0
      ? evaluation.metadata.word_count
      : essay.trim().split(/\s+/).filter(Boolean).length;

  const improvements = [
    ...(evaluation.feedback.weaknesses ?? []),
    ...(evaluation.feedback.improvement_tips ?? []),
  ];

  return {
    attempt_id: input.attemptId ?? evaluation.evaluation_id,
    status: "completed",
    module: "writing",
    part: taskPart === 2 ? 2 : 1,
    test_title: input.testTitle?.trim() || "Free Diagnostic",
    question_type: taskPart === 2 ? "task2" : "task1",
    prompt: question,
    user_answer: essay,
    word_count: wordCount,
    band: evaluation.writing_band,
    ai_band: evaluation.writing_band,
    ai_available: true,
    ai_status: "ai_complete",
    band_source: "ai",
    human_verified: false,
    reviewer_notes: null,
    ai_criteria: {
      task_achievement: evaluation.scores.task_achievement,
      coherence: evaluation.scores.coherence,
      lexical_resource: evaluation.scores.lexical_resource,
      grammar: evaluation.scores.grammar,
    },
    ai_strengths: evaluation.feedback.strengths ?? [],
    ai_improvements: improvements,
    ai_provider: evaluation.provider ?? null,
    spelling_mistakes: evaluation.spelling_mistakes ?? [],
    grammar_mistakes: evaluation.grammar_mistakes ?? [],
    next_band_advice: evaluation.next_band_advice ?? "",
    confidence: evaluation.confidence ?? null,
    vocabulary_highlights: evaluation.vocabulary_highlights ?? [],
    strong_spans: evaluation.strong_spans ?? [],
    min_words: taskPart === 2 ? 250 : 150,
    submitted_at: null,
    saved_for_review: false,
  };
}

const evaluation = {
  evaluation_id: "diag-eval-1",
  writing_band: 6.5,
  scores: {
    task_achievement: 6.5,
    coherence: 6.0,
    lexical_resource: 6.5,
    grammar: 6.0,
  },
  feedback: {
    strengths: ["Clear position throughout"],
    weaknesses: ["Some repetition of basic adjectives"],
    improvement_tips: ["Add a specific policy example"],
  },
  metadata: {
    word_count: 42,
    sentence_count: 4,
    paragraph_count: 2,
  },
  next_band_advice: "Develop the second body paragraph with concrete data.",
  confidence: 0.75,
  vocabulary_highlights: [
    { word: "detrimental", polarity: "strong", alternatives: [] },
    { word: "important", polarity: "weak", alternatives: ["crucial", "vital"] },
  ],
  strong_spans: [
    {
      text: "excessive inequality is detrimental",
      reason: "Precise academic vocabulary",
    },
  ],
  spelling_mistakes: [],
  grammar_mistakes: [
    {
      original: "This are",
      correction: "This is",
      issue: "Subject-verb agreement",
    },
  ],
  provider: "claude",
};

const essay =
  "In many countries inequality is rising. I firmly believe that excessive inequality is detrimental to social stability. This are important for cohesion.";

const review = diagnosticToWritingReview({
  evaluation,
  essay,
  question: "Discuss both views and give your opinion.",
  taskPart: 2,
  testTitle: "Free Diagnostic",
});

assert.equal(review.attempt_id, "diag-eval-1");
assert.equal(review.ai_band, 6.5);
assert.equal(review.band, 6.5);
assert.equal(review.part, 2);
assert.equal(review.human_verified, false);
assert.equal(review.band_source, "ai");
assert.equal(review.test_title, "Free Diagnostic");
assert.equal(review.user_answer, essay);
assert.equal(review.ai_criteria?.coherence, 6.0);
assert.equal(review.ai_criteria?.task_achievement, 6.5);
assert.deepEqual(review.ai_strengths, ["Clear position throughout"]);
assert.ok(review.ai_improvements?.some((s) => s.includes("repetition")));
assert.ok(review.ai_improvements?.some((s) => s.includes("policy")));
assert.equal(
  review.next_band_advice,
  "Develop the second body paragraph with concrete data.",
);
assert.equal(review.confidence, 0.75);
assert.equal(review.vocabulary_highlights?.[0]?.word, "detrimental");
assert.equal(review.vocabulary_highlights?.[1]?.polarity, "weak");
assert.equal(review.strong_spans?.[0]?.text, "excessive inequality is detrimental");
assert.equal(review.grammar_mistakes?.[0]?.correction, "This is");
assert.equal(review.min_words, 250);

const requiredForBuilder = [
  "ai_band",
  "ai_criteria",
  "ai_strengths",
  "ai_improvements",
  "next_band_advice",
  "vocabulary_highlights",
  "strong_spans",
  "grammar_mistakes",
  "user_answer",
  "part",
];
for (const key of requiredForBuilder) {
  assert.ok(key in review, `missing Review field ${key} for buildWritingFeedback`);
}

console.log("OK diagnosticToWritingReview feeds WritingReview for shared UI builder");
