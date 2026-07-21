import assert from "node:assert/strict";
import test from "node:test";
import {
  acceptedRecoveredQuestionIds,
  createSpeakingResponseState,
  hasAllExpectedResponses,
  missingExpectedResponseIds,
  speakingResponseReducer,
} from "./speaking-response-state.ts";
import {
  initialSpeakingFlowState,
  secondsUntilDeadline,
  speakingFlowReducer,
} from "./speaking-flow-state.ts";
import {
  shouldNavigateToSpeakingReport,
  shouldPollSpeakingRelease,
  speakingPendingPath,
  speakingReportPath,
  speakingStatusPath,
} from "./speaking-status-routing.ts";
import {
  extensionForAudioMime,
  recordingFilenameForMime,
} from "./media-recorder-support.ts";
import { speakingMicCheckStorageKey } from "./speaking-mic-check-storage.ts";
import {
  confirmSpeakingUploadBody,
  createSpeakingUploadBody,
  finalizeSpeakingBody,
} from "./speaking-upload-contract.ts";
import { parseSpeakingCueCard } from "./parse-speaking-cue-card.ts";

const expected = [
  { questionId: "p1-q1", part: 1, sequence: 1 },
  { questionId: "p2", part: 2, sequence: 2 },
  { questionId: "p3-q1", part: 3, sequence: 3 },
];

test("server recovery only accepts durable response statuses", () => {
  const recovered = acceptedRecoveredQuestionIds([
    { question_id: "p1-q1", status: "confirmed" },
    { question_id: "p2", status: "processing" },
    { question_id: "p3-q1", status: "failed" },
    { question_id: "unconfirmed", status: "uploaded" },
  ]);
  assert.deepEqual([...recovered], ["p1-q1", "p2"]);
  assert.deepEqual(missingExpectedResponseIds(expected, recovered), ["p3-q1"]);
  assert.equal(hasAllExpectedResponses(expected, recovered), false);
  recovered.add("p3-q1");
  assert.equal(hasAllExpectedResponses(expected, recovered), true);
});

test("response reducer follows capture, FIFO queue and durable upload states", () => {
  let state = createSpeakingResponseState(expected);
  state = speakingResponseReducer(state, {
    type: "capture",
    questionId: "p1-q1",
    durationSec: 12,
    capturedAt: "2026-07-21T00:00:00.000Z",
  });
  state = speakingResponseReducer(state, { type: "queue", questionId: "p1-q1" });
  state = speakingResponseReducer(state, { type: "upload_start", questionId: "p1-q1" });
  state = speakingResponseReducer(state, { type: "upload_success", questionId: "p1-q1" });
  assert.equal(state.responses["p1-q1"].status, "uploaded");
  assert.equal(state.responses["p1-q1"].durationSec, 12);
});

test("Part 2 state is race-safe and retry never returns to preparation", () => {
  const prep = speakingFlowReducer(initialSpeakingFlowState, {
    type: "question_ended",
    isPart2: true,
    prepDeadlineMs: 10_000,
  });
  const recording = speakingFlowReducer(prep, { type: "begin_part2" });
  assert.equal(recording.subPhase, "part2_record");
  assert.deepEqual(speakingFlowReducer(recording, { type: "begin_part2" }), recording);
  assert.equal(
    speakingFlowReducer(recording, { type: "retry", isPart2: true }).subPhase,
    "part2_record",
  );
  assert.equal(secondsUntilDeadline(10_001, 9_100), 1);
  assert.equal(secondsUntilDeadline(10_001, 11_000), 0);
});

test("Part 2 cue card keeps the final explanation as prose", () => {
  assert.deepEqual(
    parseSpeakingCueCard(
      "Describe a useful skill.\n\nYou should say:\n• what it is\n• how you learned it\n\nand explain why it matters.",
    ),
    {
      title: "Describe a useful skill.",
      bullets: ["what it is", "how you learned it"],
      finalInstruction: "and explain why it matters.",
    },
  );
});

test("speaking routes require explicit released and available state", () => {
  for (const release_state of ["processing", "awaiting_examiner", "withdrawn"]) {
    assert.equal(
      speakingStatusPath(1, "attempt/a", {
        release_state,
        report_available: false,
        human_band: 9,
      }),
      speakingPendingPath(1, "attempt/a"),
    );
  }
  assert.equal(
    speakingStatusPath(1, "attempt/a", {
      release_state: "released",
      report_available: false,
      human_band: 9,
    }),
    speakingPendingPath(1, "attempt/a"),
  );
  assert.equal(
    speakingStatusPath(1, "attempt/a", {
      release_state: "released",
      report_available: true,
      human_band: null,
    }),
    speakingReportPath(1, "attempt/a"),
  );
  assert.match(speakingReportPath(1, "attempt/a"), /attempt%2Fa/);
});

test("release polling covers non-released states only", () => {
  assert.equal(shouldPollSpeakingRelease("processing"), true);
  assert.equal(shouldPollSpeakingRelease("awaiting_examiner"), true);
  assert.equal(shouldPollSpeakingRelease("withdrawn"), true);
  assert.equal(shouldPollSpeakingRelease("released"), false);
});

test("released report navigation is selected exactly once", () => {
  const released = { release_state: "released", report_available: true };
  assert.equal(shouldNavigateToSpeakingReport(released, false), true);
  assert.equal(shouldNavigateToSpeakingReport(released, true), false);
  assert.equal(
    shouldNavigateToSpeakingReport(
      { release_state: "withdrawn", report_available: false },
      false,
    ),
    false,
  );
});

test("codec filenames and mic markers are scoped", () => {
  assert.equal(extensionForAudioMime("audio/mp4;codecs=mp4a.40.2"), "mp4");
  assert.equal(recordingFilenameForMime("audio/ogg;codecs=opus"), "recording.ogg");
  assert.notEqual(
    speakingMicCheckStorageKey("mock-a"),
    speakingMicCheckStorageKey("mock-b"),
  );
  assert.match(speakingMicCheckStorageKey("mock-a"), /v2:mock-a$/);
});

test("upload-session payloads match the backend contract", () => {
  assert.deepEqual(
    createSpeakingUploadBody({
      questionId: "question-id",
      part: 2,
      sequence: 5,
      durationSec: 87,
      contentType: "audio/webm",
      contentLength: 4096,
      idempotencyKey: "stable-idempotency-key",
    }),
    {
      question_id: "question-id",
      part: 2,
      sequence_number: 5,
      duration_sec: 87,
      content_type: "audio/webm",
      size_bytes: 4096,
      idempotency_key: "stable-idempotency-key",
    },
  );
  assert.deepEqual(
    confirmSpeakingUploadBody({
      idempotencyKey: "stable-idempotency-key",
      durationSec: 87,
    }),
    { idempotency_key: "stable-idempotency-key", duration_sec: 87 },
  );
  assert.deepEqual(finalizeSpeakingBody("a".repeat(64)), {
    manifest_hash: "a".repeat(64),
  });
});
