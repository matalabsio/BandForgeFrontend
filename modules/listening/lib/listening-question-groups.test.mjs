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

const GREENFIELD_PART2 = "Monologue — MCQ and matching (founder Section 2)";

function audioPanelInstructionMirror(part, mockSlug) {
  const fromDb = part.questions?.[0]?.instructions?.trim() || null;
  if (fromDb) return fromDb;
  if (mockSlug === "m01" || mockSlug === undefined) {
    if (part.part === 2) return GREENFIELD_PART2;
  }
  return null;
}

test("audioPanelInstruction prefers DB instructions for m02", () => {
  const part = {
    part: 2,
    questions: [
      {
        question_type: "sentence_completion",
        instructions:
          "Complete the sentences below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
        prompt: "The reserve was created on land that was previously a ___ .",
      },
    ],
  };
  const instr = audioPanelInstructionMirror(part, "m02");
  assert.match(instr, /Complete the sentences below/);
  assert.notEqual(instr, GREENFIELD_PART2);
});

test("audioPanelInstruction falls back to Greenfield for m01 without DB text", () => {
  const part = { part: 2, questions: [{ question_type: "mcq", prompt: "Q", instructions: null }] };
  assert.equal(audioPanelInstructionMirror(part, "m01"), GREENFIELD_PART2);
});

test("audioPanelInstruction does not use Greenfield for m02 without DB text", () => {
  const part = { part: 2, questions: [{ question_type: "mcq", prompt: "Q", instructions: null }] };
  assert.equal(audioPanelInstructionMirror(part, "m02"), null);
});
