/**
 * Node tests for listening question grouping (keep in sync with listening-question-groups.ts).
 */
import assert from "node:assert/strict";
import test from "node:test";

function optionsKey(options) {
  if (!options?.length) return "";
  return options.map((o) => `${o.label}:${o.text}`).join("|");
}

function isChooseTwoInstruction(text) {
  if (!text) return false;
  return /choose\s+two/i.test(text);
}

function isChooseTwoPair(a, b) {
  if (a.question_type !== "mcq" || b.question_type !== "mcq") return false;
  if (a.prompt.trim() !== b.prompt.trim()) return false;
  if (optionsKey(a.options) !== optionsKey(b.options)) return false;
  const instr = a.instructions ?? b.instructions ?? "";
  return isChooseTwoInstruction(instr);
}

test("isChooseTwoPair detects Part 3 style pairs", () => {
  const opts = [
    { label: "A", text: "One" },
    { label: "B", text: "Two" },
  ];
  const a = {
    question_type: "mcq",
    prompt: "Which TWO weaknesses?",
    instructions: "Choose TWO letters, A-E.",
    options: opts,
  };
  const b = { ...a, instructions: null };
  assert.equal(isChooseTwoPair(a, b), true);
});

test("isChooseTwoPair rejects different stems", () => {
  const opts = [{ label: "A", text: "x" }];
  assert.equal(
    isChooseTwoPair(
      { question_type: "mcq", prompt: "A", instructions: "Choose TWO", options: opts },
      { question_type: "mcq", prompt: "B", instructions: "Choose TWO", options: opts },
    ),
    false,
  );
});
