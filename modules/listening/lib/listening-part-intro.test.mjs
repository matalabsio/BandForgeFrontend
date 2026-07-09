import assert from "node:assert/strict";
import test from "node:test";
import {
  LISTENING_QUESTION_PREVIEW_SEC,
  questionsBrowsable,
} from "./listening-part-intro.ts";

test("LISTENING_QUESTION_PREVIEW_SEC is 30", () => {
  assert.equal(LISTENING_QUESTION_PREVIEW_SEC, 30);
});

test("questionsBrowsable is true during preview, playing, and complete", () => {
  assert.equal(questionsBrowsable("preview"), true);
  assert.equal(questionsBrowsable("playing"), true);
  assert.equal(questionsBrowsable("complete"), true);
});

test("questionsBrowsable is false before section begins", () => {
  assert.equal(questionsBrowsable("awaiting_start"), false);
});
