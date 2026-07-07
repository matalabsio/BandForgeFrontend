/**
 * Node tests for mock section continue destinations (keep in sync with mock-section-continue.ts).
 */
import assert from "node:assert/strict";
import test from "node:test";

const M01 = "a0000000-0000-4000-8000-000000000001";
const M02 = "b0000000-0000-4000-8000-000000000002";
const MT1_ATTEMPT = "33333333-3333-4333-8333-333333333333";

const META = {
  1: { slug: M01, listening: 4, reading: 2, writing: 2, speakingMin: 14 },
  2: { slug: M02, listening: 4, reading: 3, writing: 2, speakingMin: 0 },
};

function slugForTest(n) {
  return META[n].slug;
}

function getMockSectionContinue({ testNumber, mockAttemptId, module, part }) {
  const meta = META[testNumber];
  if (module === "listening") {
    if (part < meta.listening) {
      return {
        path: part + 1 === 1 ? `/test/${testNumber}/listening` : `/test/${testNumber}/listening?part=${part + 1}`,
        label: "Continue to Next Section",
      };
    }
    return { path: `/test/${testNumber}/reading`, label: "Continue to Reading" };
  }
  if (module === "reading") {
    if (part < meta.reading) {
      const next = part + 1;
      return {
        path: next === 1 ? `/test/${testNumber}/reading` : `/test/${testNumber}/reading?passage=${next}`,
        label: "Continue to Next Section",
      };
    }
    return { path: `/test/${testNumber}/writing`, label: "Continue to Writing" };
  }
  if (module === "writing") {
    if (part < meta.writing) {
      const next = part + 1;
      return {
        path: next === 1 ? `/test/${testNumber}/writing` : `/test/${testNumber}/writing?part=${next}`,
        label: "Continue to Next Section",
      };
    }
    if (meta.speakingMin > 0) {
      return { path: `/test/${testNumber}/speaking`, label: "Continue to Speaking" };
    }
    return {
      path: `/test/${testNumber}/results?mock_attempt=${mockAttemptId}`,
      label: "Finish Test",
    };
  }
  return {
    path: `/test/${testNumber}/results?mock_attempt=${mockAttemptId}`,
    label: "Finish Test",
  };
}

test("MT1 listening part 4 → reading", () => {
  const next = getMockSectionContinue({
    testNumber: 1,
    mockAttemptId: MT1_ATTEMPT,
    module: "listening",
    part: 4,
  });
  assert.equal(next.path, "/test/1/reading");
});

test("MT2 writing task 2 → final results", () => {
  const next = getMockSectionContinue({
    testNumber: 2,
    mockAttemptId: MT1_ATTEMPT,
    module: "writing",
    part: 2,
  });
  assert.equal(next.path, `/test/2/results?mock_attempt=${MT1_ATTEMPT}`);
});

test("slug map sanity", () => {
  assert.equal(slugForTest(1), M01);
  assert.equal(slugForTest(2), M02);
});
