import assert from "node:assert/strict";
import {
  hasPendingMockResults,
  moduleResultStatusLabel,
  overallResultPresentation,
  shouldPollMockResults,
} from "./mock-result-presentation.ts";

function summary(overrides = {}) {
  return {
    aggregate_band: null,
    provisional_aggregate_band: null,
    aggregate_is_provisional: false,
    has_pending_reviews: false,
    module_result_states: {
      listening: { band: 8, source: "final" },
      reading: { band: 7, source: "final" },
      writing: { band: null, source: "processing" },
      speaking: { band: null, source: "processing" },
    },
    ...overrides,
  };
}

const provisional = summary({
  provisional_aggregate_band: 7.3,
  aggregate_is_provisional: true,
  has_pending_reviews: true,
  module_result_states: {
    listening: { band: 8, source: "final" },
    reading: { band: 7, source: "final" },
    writing: { band: 7, source: "ai_estimate" },
    speaking: { band: null, source: "processing" },
  },
});
assert.equal(hasPendingMockResults(provisional), true);
assert.equal(shouldPollMockResults(provisional, "visible"), true);
assert.equal(shouldPollMockResults(provisional, "hidden"), false);
assert.deepEqual(overallResultPresentation(provisional), {
  band: 7.3,
  label: "Provisional overall band",
  description: "Includes AI estimates and may change after pending human reviews.",
  official: false,
});
assert.equal(moduleResultStatusLabel("ai_estimate", "writing"), "AI estimate");
assert.equal(moduleResultStatusLabel("failed", "speaking"), "Evaluation failed");

const humanReviewed = summary({
  aggregate_band: 7.5,
  module_result_states: {
    listening: { band: 8, source: "final" },
    reading: { band: 7, source: "final" },
    writing: { band: 7.5, source: "final" },
    speaking: { band: 7.5, source: "final" },
  },
});
assert.equal(hasPendingMockResults(humanReviewed), false);
assert.equal(shouldPollMockResults(humanReviewed, "visible"), false);
assert.equal(overallResultPresentation(humanReviewed).official, true);
assert.equal(overallResultPresentation(humanReviewed).band, 7.5);
assert.equal(moduleResultStatusLabel("final", "speaking"), "Human reviewed");
assert.equal(moduleResultStatusLabel("final", "reading"), "Final score");

console.log("OK provisional mock result presentation");
