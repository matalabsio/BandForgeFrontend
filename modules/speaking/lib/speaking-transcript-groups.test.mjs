import assert from "node:assert/strict";
import {
  groupSpeakingTranscripts,
  speakingTranscriptStatus,
} from "./speaking-transcript-groups.ts";

const responses = [
  {
    id: "r3",
    question_id: "q3",
    part: 2,
    sequence: 3,
    prompt: "Describe a skill.",
    duration_sec: 90,
    transcription_status: "completed",
    transcript: "Full long-turn answer.",
    transcription_error: null,
  },
  {
    id: "r1",
    question_id: "q1",
    part: 1,
    sequence: 1,
    prompt: "Where are you from?",
    duration_sec: 20,
    transcription_status: "completed",
    transcript: "I am from Chennai.",
    transcription_error: null,
  },
  {
    id: "r2",
    question_id: "q2",
    part: 1,
    sequence: 2,
    prompt: "What do you like there?",
    duration_sec: 15,
    transcription_status: "failed",
    transcript: "",
    transcription_error: "Transcription unavailable after retry.",
  },
];

const groups = groupSpeakingTranscripts(responses);
assert.deepEqual(
  groups.map((group) => [group.part, group.responses.map((item) => item.id)]),
  [
    [1, ["r1", "r2"]],
    [2, ["r3"]],
  ],
);
assert.equal(groups[0].label, "Introduction");
assert.equal(groups[1].label, "Long Turn");
assert.equal(groups[0].responses[0].transcript, "I am from Chennai.");
assert.equal(speakingTranscriptStatus("completed"), "complete");
assert.equal(speakingTranscriptStatus("retry_wait"), "processing");
assert.equal(speakingTranscriptStatus("failed"), "failed");

console.log("OK section-wise Speaking transcript grouping");
