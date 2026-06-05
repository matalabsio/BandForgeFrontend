/**
 * Node tests for exam submit error formatting (keep in sync with exam-session.ts / submit-with-exam-session.ts).
 */
import assert from "node:assert/strict";
import test from "node:test";

const EXAM_SESSION_EXPIRED_MESSAGE =
  "Session expired. Please sign in again, then retry.";

class ExamSessionError extends Error {
  constructor(message = EXAM_SESSION_EXPIRED_MESSAGE) {
    super(message);
    this.name = "ExamSessionError";
    this.status = 401;
  }
}

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

function formatExamSubmitError(e) {
  if (e instanceof ExamSessionError) return e.message;
  if (e instanceof ApiError) {
    if (e.status === 401) return EXAM_SESSION_EXPIRED_MESSAGE;
    return e.message;
  }
  return "Submit failed.";
}

test("formatExamSubmitError maps ExamSessionError", () => {
  assert.equal(
    formatExamSubmitError(new ExamSessionError()),
    EXAM_SESSION_EXPIRED_MESSAGE,
  );
});

test("formatExamSubmitError maps ApiError 401", () => {
  assert.equal(
    formatExamSubmitError(new ApiError("Not authenticated.", 401)),
    EXAM_SESSION_EXPIRED_MESSAGE,
  );
});

test("formatExamSubmitError passes through other ApiError", () => {
  assert.equal(
    formatExamSubmitError(new ApiError("Conflict", 409)),
    "Conflict",
  );
});
