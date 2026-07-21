import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const mapper = await import(pathToFileURL(path.join(here, "build-speaking-feedback.ts")));
const helpers = await import(
  pathToFileURL(path.join(here, "../components/report/report-helpers.ts"))
);
const locator = await import(
  pathToFileURL(path.join(here, "../../shared/annotations/annotation-locator.ts"))
);

const fixture = {
  schema_version: "speaking-report.v2",
  attempt: {
    id: "attempt-1",
    mock_title: "Full Mock 2",
    test_number: 2,
    submitted_at: "2026-07-04T10:00:00Z",
  },
  student: { display_name: "Alex", target_band_at_release: 7 },
  release: {
    released_at: "2026-07-05T10:00:00Z",
    approval_version: 2,
    human_verified: true,
    reviewer: {
      display_name: "Examiner A",
      credential_label: "Certified IELTS Examiner",
    },
  },
  scores: {
    overall: 6.5,
    criteria: {
      fluency: { band: 6, target_band: 7, target_gap: 1 },
      lexical: { band: 6.5, target_band: 7, target_gap: 0.5 },
      grammar: { band: 6.5, target_band: 7, target_gap: 0.5 },
      pronunciation: { band: 7, target_band: 7, target_gap: 0 },
    },
    biggest_gap: { criterion: "fluency", gap: 1 },
  },
  parts: [
    {
      part: 1,
      label: "Introduction",
      ai_band: 6.5,
      ai_note: "Clear, direct answers.",
      metrics: { words_per_minute: 121 },
      response_ids: ["r1", "missing-response"],
    },
    {
      part: 2,
      label: "Long turn",
      ai_band: null,
      ai_note: null,
      response_ids: ["r2"],
    },
  ],
  responses: [
    {
      id: "r1",
      question_id: "q1",
      part: 1,
      sequence: 1,
      prompt: "Where do you live?",
      duration_sec: 34,
      transcript: "I live near the sea and the sea is calm.",
      transcript_words: [],
      pause_markers: [],
      audio_url: "https://cdn.example/r1.webm",
      audio_expires_at: "2026-07-05T11:00:00Z",
      metrics: { words_per_minute: 121 },
    },
    {
      id: "r2",
      question_id: "q2",
      part: 2,
      sequence: 2,
      prompt: "Describe a place.",
      duration_sec: 0,
      transcript: "",
      transcript_words: [],
      pause_markers: [],
      audio_url: null,
      audio_expires_at: null,
      metrics: null,
    },
  ],
  fluency_summary: {
    overall: {
      words_per_minute: 118,
      total_speaking_seconds: 34,
      long_pauses: 1,
      response_count: 2,
      questions_asked: 2,
      word_count: 67,
    },
    parts: {
      "1": { words_per_minute: 121 },
      "2": { words_per_minute: 104 },
    },
    responses: [],
    source: "response_metrics",
    complete: true,
  },
  pronunciation_advisory: {
    score_authority: "human_examiner",
    ai_inference_source: "transcript_inferred",
    ai_advisory_only: true,
    ai_confidence: 0.55,
    ai_low_confidence: true,
  },
  evidence: [
    {
      response_id: "r1",
      question_id: "q1",
      part: 1,
      criterion: "LR",
      polarity: "strength",
      quote: "the sea",
      span: { char_start: 12, char_end: 19, start_ms: 1200, end_ms: 1800 },
      issue: "Precise vocabulary",
      title: "Precise phrase",
      explanation: "Grounded examiner evidence.",
      suggestion: "Keep using specific language.",
      advisory_only: false,
      inference_source: "audio",
      confidence: 0.9,
    },
  ],
  patterns: [
    {
      pattern: "Article omission",
      criterion: "GRA",
      frequency: "often",
      occurrence_count: null,
      occurrence_count_semantics: null,
      frequency_is_model_estimate: true,
      examples: [{ text: "in city", response_id: null }],
    },
  ],
  summary: {
    strengths: ["Clear pronunciation."],
    improvements: ["Develop Part 3 answers."],
    vocabulary: ["coastal"],
    next_advice: "Extend abstract answers.",
    examiner_note: "A balanced performance.",
  },
  analysis: { status: "complete", unavailable_sections: [] },
  // Legacy rollout fields must never override v2 human scores.
  overall_band: 4,
  human_criteria_scores: {
    fluency: 4,
    lexical: 4,
    grammar: 4,
    pronunciation: 4,
  },
};

const mapped = mapper.buildSpeakingFeedback(fixture);
assert.equal(mapped.overallBand, 6.5);
assert.equal(mapped.criteria[0].band, 6);
assert.equal(mapped.descriptor, "Competent User");
assert.equal(mapped.biggestGap?.key, "fluency");
assert.equal(mapped.parts[0].responses.length, 1);
assert.equal(mapped.parts[1].responses[0].audioUrl, null);
assert.equal(mapped.parts[1].responses[0].transcript, "");
assert.deepEqual(mapped.summary.strengths, ["Clear pronunciation."]);
assert.equal(mapped.fluencySummary.overall.words_per_minute, 118);
assert.equal(mapped.pronunciationAdvisory.score_authority, "human_examiner");

assert.equal(mapper.targetDelta(6.5, 7), 0.5);
assert.equal(mapper.targetDelta(7.5, 7), -0.5);
assert.equal(mapper.targetDelta(6.5, null), null);
assert.equal(mapper.ieltsDescriptor(8), "Very Good User");
assert.equal(
  mapper.findBiggestGap([
    { key: "fluency", label: "F", shortLabel: "F", band: 7, targetGap: 0 },
    { key: "grammar", label: "G", shortLabel: "G", band: 6, targetGap: 1 },
  ])?.key,
  "grammar",
);

const emptySummary = mapper.buildSpeakingFeedback({
  ...fixture,
  summary: { strengths: [], improvements: [], vocabulary: [] },
  patterns: [],
  evidence: [],
});
assert.deepEqual(emptySummary.summary.strengths, []);
assert.deepEqual(emptySummary.patterns, []);

assert.throws(
  () =>
    mapper.buildSpeakingFeedback({
      ...fixture,
      scores: {
        ...fixture.scores,
        criteria: { ...fixture.scores.criteria, grammar: undefined },
      },
    }),
  /missing the human Grammar/,
);
assert.throws(
  () => mapper.buildSpeakingFeedback({ ...fixture, schema_version: undefined }),
  /unsupported format/,
);

const annotations = helpers.responseAnnotations(mapped.parts[0].responses[0]);
assert.equal(annotations[0].start, 12);
assert.equal(helpers.nextReportTab([1, 2, 3], 1, "ArrowLeft"), 3);
assert.equal(helpers.nextReportTab([1, 2, 3], 2, "ArrowRight"), 3);
assert.equal(helpers.nextReportTab([1, 2, 3], 2, "Home"), 1);
assert.equal(helpers.nextReportTab([1, 2, 3], 2, "End"), 3);

const annotationBase = {
  kind: "evidence_strength",
  title: "Evidence",
  body: "",
};
const repeated = locator.locateAnnotations("the sea and the sea", [
  { ...annotationBase, id: "second", text: "the sea", start: 12, end: 19 },
  { ...annotationBase, id: "first", text: "the sea" },
  { ...annotationBase, id: "missing", text: "not present" },
]);
assert.deepEqual(
  repeated.map(({ id, start }) => ({ id, start })),
  [
    { id: "first", start: 0 },
    { id: "second", start: 12 },
  ],
);

console.log("OK speaking-report.v2 mapper, helpers, spans, and tabs");
