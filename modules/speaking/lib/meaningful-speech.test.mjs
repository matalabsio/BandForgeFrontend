import assert from "node:assert/strict";
import test from "node:test";

import {
  attemptMeaningfulWordCount,
  displayTranscript,
  isInsufficientSpeechPayload,
  meaningfulWordCount,
  transcriptLooksEmpty,
} from "./meaningful-speech.ts";

test("meaningfulWordCount ignores punctuation-only tokens", () => {
  assert.equal(meaningfulWordCount("."), 0);
  assert.equal(meaningfulWordCount(".."), 0);
  assert.equal(meaningfulWordCount("I"), 1);
  assert.equal(meaningfulWordCount("I am from India"), 4);
});

test("transcriptLooksEmpty", () => {
  assert.equal(transcriptLooksEmpty("."), true);
  assert.equal(transcriptLooksEmpty("hello"), false);
});

test("displayTranscript", () => {
  assert.equal(displayTranscript("."), "");
  assert.equal(displayTranscript("I am fine"), "I am fine");
});

test("isInsufficientSpeechPayload respects status and legacy heuristic", () => {
  const base = {
    attempt_id: "a",
    status: "completed",
    review_status: "pending",
    human_band: null,
    score_source: "ai_estimate",
    ai_band: 2,
    ai_criteria: {},
    ai_strengths: [],
    ai_improvements: [],
    next_band_advice: null,
    ai_parts: [],
    ai_evidence: [],
    ai_patterns: [],
    ai_fluency: {},
    ai_part_metrics: {},
    responses: [],
    submitted_at: null,
    student_name: null,
    message: "",
    transcription_progress: null,
    release_state: "awaiting_examiner",
    report_available: false,
    released_at: null,
    approval_version: 0,
    reviewer: null,
  };

  assert.equal(
    isInsufficientSpeechPayload({
      ...base,
      ai_status: "insufficient_speech",
    }),
    true,
  );

  assert.equal(
    isInsufficientSpeechPayload({
      ...base,
      ai_status: "ai_complete",
      responses: [
        { transcript: "." },
        { transcript: "I" },
        { transcript: "am" },
        { transcript: "fine" },
      ],
    }),
    true,
  );

  assert.equal(
    isInsufficientSpeechPayload({
      ...base,
      ai_status: "ai_complete",
      responses: [
        {
          transcript:
            "I am from India and I really enjoy living there because it is peaceful",
        },
      ],
    }),
    false,
  );
});

test("attemptMeaningfulWordCount", () => {
  assert.equal(
    attemptMeaningfulWordCount([
      { transcript: "." },
      { transcript: "I" },
      { transcript: "am fine" },
    ]),
    3,
  );
});
