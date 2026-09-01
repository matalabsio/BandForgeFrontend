/**
 * Node tests for objective explanation + full diagnostic review mapper.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { buildObjectiveExplanation } from "./objective-explanation.ts";

function normalize(value) {
  if (value == null) return "";
  return String(value).trim().toLowerCase().replace(/\s+/g, " ");
}

function isAnswerCorrect(userAnswer, correctAnswer) {
  if (correctAnswer == null || correctAnswer === "") return false;
  const userNorm = normalize(userAnswer);
  if (!userNorm) return false;
  return String(correctAnswer)
    .split("/")
    .map((part) => normalize(part))
    .includes(userNorm);
}

function diagnosticPackToModuleReview(questions, answers) {
  return questions
    .map((q) => {
      const userAnswer = answers[q.id] ?? "";
      const isCorrect = isAnswerCorrect(userAnswer, q.answer);
      return {
        question_id: q.id,
        question_number: q.number,
        question_type: q.type,
        prompt: q.prompt,
        user_answer: userAnswer,
        correct_answer: q.answer,
        is_correct: isCorrect,
        explanation: buildObjectiveExplanation({
          prompt: q.prompt,
          userAnswer,
          correctAnswer: q.answer,
          isCorrect,
        }),
      };
    })
    .sort((a, b) => a.question_number - b.question_number);
}

test("diagnosticPackToModuleReview returns all questions with explanations", () => {
  const questions = [
    {
      id: "q1",
      number: 1,
      type: "form_completion",
      prompt: "Name",
      answer: "Alice",
    },
    {
      id: "q2",
      number: 2,
      type: "form_completion",
      prompt: "City",
      answer: "London/UK",
    },
  ];
  const answers = { q1: "Alice", q2: "Paris" };
  const items = diagnosticPackToModuleReview(questions, answers);
  assert.equal(items.length, 2);
  assert.equal(items[0].is_correct, true);
  assert.equal(items[1].is_correct, false);
  assert.ok(items[0].explanation.includes("Correct"));
  assert.ok(items[1].explanation.includes("London"));
});

test("buildObjectiveExplanation handles skipped answers", () => {
  const text = buildObjectiveExplanation({
    prompt: "City",
    userAnswer: "",
    correctAnswer: "London",
    isCorrect: false,
  });
  assert.ok(text.includes("No answer given"));
});
