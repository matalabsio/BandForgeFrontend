/**
 * Node tests for reading question group helpers (keep in sync with question-groups.ts).
 */
import assert from "node:assert/strict";
import test from "node:test";

function readingTfngIntro(passage, mockSlug) {
  if (mockSlug === "m02" && passage === 3) {
    return "Part 1 — Yes / No / Not Given";
  }
  return "Part 1 — True / False / Not Given";
}

test("readingTfngIntro uses YES/NO for m02 passage 3", () => {
  assert.equal(readingTfngIntro(3, "m02"), "Part 1 — Yes / No / Not Given");
});

test("readingTfngIntro uses TFNG for m02 passage 1", () => {
  assert.equal(readingTfngIntro(1, "m02"), "Part 1 — True / False / Not Given");
});

test("readingTfngIntro uses TFNG for m01 passage 3", () => {
  assert.equal(readingTfngIntro(3, "m01"), "Part 1 — True / False / Not Given");
});
