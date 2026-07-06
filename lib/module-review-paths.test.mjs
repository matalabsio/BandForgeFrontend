/**
 * Node tests for module review path helpers (keep in sync with module-review-paths.ts).
 */
import assert from "node:assert/strict";
import test from "node:test";

function objectiveModuleReviewPath(testNumber, module, mockAttemptId) {
  const base = `/test/${testNumber}/${module}/review`;
  if (!mockAttemptId) return base;
  const params = new URLSearchParams({ mock_attempt: mockAttemptId });
  return `${base}?${params.toString()}`;
}

function listeningModuleReviewPath(testNumber, mockAttemptId) {
  return objectiveModuleReviewPath(testNumber, "listening", mockAttemptId);
}

function mockResultsPathForTest(testNumber, mockAttemptId) {
  const base = `/test/${testNumber}/results`;
  if (!mockAttemptId) return base;
  return `${base}?${new URLSearchParams({ mock_attempt: mockAttemptId }).toString()}`;
}

test("listeningModuleReviewPath without attempt", () => {
  assert.equal(listeningModuleReviewPath(1), "/test/1/listening/review");
});

test("listeningModuleReviewPath with attempt", () => {
  assert.equal(
    listeningModuleReviewPath(2, "abc-123"),
    "/test/2/listening/review?mock_attempt=abc-123",
  );
});

test("mockResultsPathForTest with attempt", () => {
  assert.equal(
    mockResultsPathForTest(1, "uuid-1"),
    "/test/1/results?mock_attempt=uuid-1",
  );
});
