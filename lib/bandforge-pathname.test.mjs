import assert from "node:assert/strict";
import test from "node:test";

import {
  bandforgeQuietListeningExerciseChrome,
  bandforgeQuietReadingExerciseChrome,
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

test("practice listening exercise uses quiet chrome", () => {
  assert.equal(
    bandforgeQuietListeningExerciseChrome(`/practice/listening/${hub}/exercise`),
    true,
  );
});

test("practice listening exercise results uses quiet chrome", () => {
  assert.equal(
    bandforgeQuietListeningExerciseChrome(
      `/practice/listening/${hub}/exercise/results`,
    ),
    true,
  );
});

test("practice reading exercise results uses quiet chrome", () => {
  assert.equal(
    bandforgeQuietReadingExerciseChrome(
      `/practice/reading/${hub}/exercise/results`,
    ),
    true,
  );
});

test("short plan listening entry uses quiet chrome", () => {
  assert.equal(
    bandforgeQuietListeningExerciseChrome(
      `/p/l/${hub}/practice/t-2026-09-03-listening-practice-s1`,
    ),
    true,
  );
});

test("opaque plan short code uses quiet chrome", () => {
  assert.equal(bandforgeQuietListeningExerciseChrome("/p/WFAZvPmH"), true);
  assert.equal(bandforgeQuietSpeakingExerciseChrome("/p/WFAZvPmH"), true);
  assert.equal(bandforgeQuietWritingExerciseChrome("/p/WFAZvPmH"), true);
  assert.equal(bandforgeQuietReadingExerciseChrome("/p/WFAZvPmH"), true);
});

test("short plan speaking entry uses quiet chrome", () => {
  assert.equal(
    bandforgeQuietSpeakingExerciseChrome(
      `/p/s/${hub}/submit/t-2026-09-03-speaking-submit-s1`,
    ),
    true,
  );
});

test("short plan writing entry uses quiet chrome", () => {
  assert.equal(
    bandforgeQuietWritingExerciseChrome(
      `/p/w/${hub}/practice/t-2026-09-03-writing-practice-s1`,
    ),
    true,
  );
});

test("short plan reading entry uses quiet chrome", () => {
  assert.equal(
    bandforgeQuietReadingExerciseChrome(
      `/p/r/${hub}/practice/t-2026-09-03-reading-practice-s1`,
    ),
    true,
  );
});
