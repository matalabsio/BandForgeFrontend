import assert from "node:assert/strict";
import test from "node:test";

const MATCHING_TYPES = new Set([
  "matching_headings",
  "matching_information",
  "matching_features",
  "matching_sentence_endings",
  "matching",
]);

function isReadingMatchingType(type) {
  return MATCHING_TYPES.has(type.trim().toLowerCase());
}

function matchingLabelFormat(type) {
  return type.trim().toLowerCase() === "matching_headings" ? "roman" : "letter";
}

function asSectionId(id) {
  if (
    id === "tfng" ||
    id === "matching_headings" ||
    id === "sentence_completion"
  ) {
    return id;
  }
  if (isReadingMatchingType(id)) return "matching_headings";
  return "sentence_completion";
}

function groupReadingQuestions(questions) {
  const buckets = new Map();
  for (const q of questions) {
    const key = q.question_type.toLowerCase();
    const list = buckets.get(key) ?? [];
    list.push(q);
    buckets.set(key, list);
  }
  return [...buckets.entries()].map(([id, qs]) => ({ id, questions: qs }));
}

test("matching_information is a matching type, not sentence completion", () => {
  assert.equal(isReadingMatchingType("matching_information"), true);
  assert.equal(isReadingMatchingType("matching_features"), true);
  assert.equal(isReadingMatchingType("sentence_completion"), false);
  assert.equal(asSectionId("matching_information"), "matching_headings");
  assert.equal(asSectionId("sentence_completion"), "sentence_completion");
  assert.equal(matchingLabelFormat("matching_information"), "letter");
  assert.equal(matchingLabelFormat("matching_headings"), "roman");
});

test("groupReadingQuestions keeps matching_features as its own group", () => {
  const groups = groupReadingQuestions([
    { question_type: "tfng", question_number: 1 },
    { question_type: "matching_features", question_number: 6 },
    { question_type: "matching_features", question_number: 7 },
    { question_type: "sentence_completion", question_number: 10 },
  ]);
  const matching = groups.find((g) => g.id === "matching_features");
  assert.ok(matching);
  assert.equal(matching.questions.length, 2);
  assert.equal(isReadingMatchingType(matching.id), true);
  assert.notEqual(matching.id, "sentence_completion");
});
