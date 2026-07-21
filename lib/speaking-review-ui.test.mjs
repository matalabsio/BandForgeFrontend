import assert from "node:assert/strict";
import test from "node:test";

import {
  hasLargeSpeakingOverride,
  orderedSpeakingResponses,
  speakingEvidenceForResponse,
  speakingPipelineState,
} from "./speaking-review-ui.ts";

const review = (overrides = {}) => ({
  id: "review-1",
  audio_url: null,
  audio_play_url: null,
  transcript: null,
  submission_meta: { responses: [] },
  transcription_progress: null,
  ai_scores: null,
  attempt_metrics: null,
  ...overrides,
});

test("orders response metadata by manifest sequence", () => {
  const responses = orderedSpeakingResponses(
    review({
      submission_meta: {
        responses: [
          { response_id: "b", sequence_number: 2 },
          { response_id: "a", sequence_number: 1 },
        ],
      },
    }),
  );
  assert.deepEqual(
    responses.map((response) => response.response_id),
    ["a", "b"],
  );
});

test("distinguishes transcription, AI, complete, and legacy states", () => {
  const responses = [{ response_id: "a", sequence_number: 1 }];
  assert.equal(speakingPipelineState(review()), "legacy");
  assert.equal(
    speakingPipelineState(
      review({
        submission_meta: { responses },
        transcription_progress: { total: 1, completed: 0, failed: 0 },
      }),
    ),
    "transcribing",
  );
  assert.equal(
    speakingPipelineState(
      review({
        submission_meta: { responses },
        transcription_progress: { total: 1, completed: 1, failed: 0 },
        ai_scores: { status: "pending" },
      }),
    ),
    "ai_pending",
  );
  assert.equal(
    speakingPipelineState(
      review({
        submission_meta: { responses },
        transcription_progress: { total: 1, completed: 1, failed: 0 },
        ai_scores: { status: "ai_complete" },
      }),
    ),
    "complete",
  );
  assert.equal(
    speakingPipelineState(
      review({
        submission_meta: { responses },
        transcription_progress: { total: 1, completed: 1, failed: 0 },
        ai_scores: { status: "ai_stub" },
      }),
    ),
    "ai_stub",
  );
});

test("requires notes for one-band-or-greater overrides", () => {
  assert.equal(
    hasLargeSpeakingOverride({
      rows: [{ delta: 0.5 }],
      deltaOverall: 0.5,
    }),
    false,
  );
  assert.equal(
    hasLargeSpeakingOverride({
      rows: [{ delta: -1 }],
      deltaOverall: 0.5,
    }),
    true,
  );
});

test("scopes AI evidence strictly by response id", () => {
  const evidence = [
    { response_id: "r1", question_id: "q1", quote: "shared phrase" },
    { response_id: "r2", question_id: "q2", quote: "shared phrase" },
    { response_id: "r1", question_id: "q1", quote: "another phrase" },
  ];
  assert.deepEqual(
    speakingEvidenceForResponse({ evidence_quotes: evidence }, "r1"),
    [evidence[0], evidence[2]],
  );
  assert.deepEqual(speakingEvidenceForResponse({ evidence_quotes: evidence }, null), []);
  assert.deepEqual(speakingEvidenceForResponse({ evidence_quotes: evidence }, "missing"), []);
});
