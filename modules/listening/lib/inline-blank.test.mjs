/**
 * Node test runner for inline-blank parsing (no TS import — avoids package.json "type": "module").
 * Keep patterns in sync with inline-blank.ts.
 */
import assert from "node:assert/strict";
import test from "node:test";

const INLINE_BLANK_PATTERN = /_{3,}/;

function hasInlineBlank(prompt) {
  return INLINE_BLANK_PATTERN.test(prompt);
}

function splitPromptBlank(prompt) {
  const match = prompt.match(INLINE_BLANK_PATTERN);
  if (!match || match.index === undefined) return null;
  const before = prompt.slice(0, match.index).trimEnd();
  const after = prompt.slice(match.index + match[0].length).trimStart();
  return { before, after };
}

test("hasInlineBlank detects ___ and ______", () => {
  assert.equal(hasInlineBlank("a ___ b"), true);
  assert.equal(hasInlineBlank("a ______ b"), true);
  assert.equal(hasInlineBlank("no gap"), false);
});

test("splitPromptBlank splits on first marker only", () => {
  assert.deepEqual(splitPromptBlank("Transport produces approximately a ___ of global CO2"), {
    before: "Transport produces approximately a",
    after: "of global CO2",
  });
  assert.equal(splitPromptBlank("no gap"), null);
  assert.deepEqual(splitPromptBlank("a ___ b ___ c"), {
    before: "a",
    after: "b ___ c",
  });
});
