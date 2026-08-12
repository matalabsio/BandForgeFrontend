import assert from "node:assert/strict";
import test from "node:test";

function toSlug(type) {
  const map = {
    "Form completion": "form_completion",
    "Sentence completion": "sentence_completion",
    "MCQ — single answer": "mcq",
    "MCQ — choose TWO": "mcq",
  };
  if (map[type]) return map[type];
  const lower = type.toLowerCase();
  if (lower.includes("choose") && lower.includes("two")) return "mcq";
  return lower.replace(/[\s—–-]+/g, "_");
}

function looksLikeChooseTwo(a, b) {
  return a.slug === "mcq" && b.slug === "mcq" && a.prompt === b.prompt;
}

test("slug maps admin choose TWO to mcq", () => {
  assert.equal(toSlug("MCQ — choose TWO"), "mcq");
  assert.equal(toSlug("Sentence completion"), "sentence_completion");
  assert.equal(toSlug("mcq"), "mcq");
});

test("choose TWO pair shares prompt", () => {
  const a = { slug: "mcq", prompt: "Which TWO?" };
  const b = { slug: "mcq", prompt: "Which TWO?" };
  assert.equal(looksLikeChooseTwo(a, b), true);
});
