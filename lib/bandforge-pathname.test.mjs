import assert from "node:assert/strict";
import test from "node:test";

import {
  bandforgeQuietSpeakingExerciseChrome,
  bandforgeQuietWritingExerciseChrome,
} from "./bandforge-chrome-paths.ts";

const hub = "a0000000-0000-4000-8000-000000000001";

test("practice speaking exercise uses quiet chrome", () => {
  assert.equal(
    bandforgeQuietSpeakingExerciseChrome(`/practice/speaking/${hub}/exercise`),
    true,
  );
});

test("practice speaking exercise results uses quiet chrome", () => {
  assert.equal(
    bandforgeQuietSpeakingExerciseChrome(
      `/practice/speaking/${hub}/exercise/results`,
    ),
    true,
  );
});

test("practice speaking hub list does not use quiet chrome", () => {
  assert.equal(bandforgeQuietSpeakingExerciseChrome("/practice/speaking"), false);
});

test("practice writing exercise uses quiet chrome", () => {
  assert.equal(
    bandforgeQuietWritingExerciseChrome(`/practice/writing/${hub}/exercise`),
    true,
  );
});

test("practice writing exercise results uses quiet chrome", () => {
  assert.equal(
    bandforgeQuietWritingExerciseChrome(
      `/practice/writing/${hub}/exercise/results`,
    ),
    true,
  );
});

test("practice writing hub list does not use quiet chrome", () => {
  assert.equal(bandforgeQuietWritingExerciseChrome("/practice/writing"), false);
});
