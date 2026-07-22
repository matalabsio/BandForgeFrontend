/**
 * Node tests for dashboard scores helpers (keep in sync with scores-utils.ts).
 */
import assert from "node:assert/strict";
import test from "node:test";

const M01 = "00000000-0000-4000-8000-000000000001";

function attemptReportHref(attempt) {
  const mockAttemptId = attempt.mock_attempt_id?.trim() || null;
  const part = attempt.part ?? undefined;
  const testNumber = 1;

  if (
    mockAttemptId &&
    (attempt.module === "listening" || attempt.module === "reading")
  ) {
    const params = new URLSearchParams({ attempt: attempt.id });
    if (part != null) params.set("part", String(part));
    params.set("mock_attempt", mockAttemptId);
    return `/test/${testNumber}/${attempt.module}/results?${params.toString()}`;
  }
  return `/test/${testNumber}/${attempt.module}/results`;
}

function dashboardModuleBands(recent, latestMock) {
  const modules = ["listening", "reading", "writing", "speaking"];
  return modules.map((module) => {
    const rollupKey = `${module}_band`;
    const rollup =
      latestMock && latestMock[rollupKey] != null && latestMock[rollupKey] > 0
        ? latestMock[rollupKey]
        : null;
    const latest = recent.find((a) => a.module === module);
    const band =
      rollup ??
      (latest?.band != null && latest.band > 0 ? latest.band : null);
    return {
      module,
      band,
      reviewState:
        (module === "writing" || module === "speaking") &&
        latest &&
        latest.score_source === "ai_estimate"
          ? "under_review"
          : "none",
      mockAttemptId: latest?.mock_attempt_id ?? latestMock?.mock_attempt_id ?? null,
    };
  });
}

test("attemptReportHref uses section results path when mock_attempt present", () => {
  const href = attemptReportHref({
    id: "attempt-1",
    module: "listening",
    part: 2,
    mock_attempt_id: "mock-session-1",
    mock_test: { id: M01 },
  });
  assert.match(href, /mock_attempt=mock-session-1/);
  assert.match(href, /attempt=attempt-1/);
  assert.match(href, /part=2/);
});

test("dashboardModuleBands always returns four modules", () => {
  const bands = dashboardModuleBands([], {
    mock_attempt_id: "mock-1",
    listening_band: 6.5,
    reading_band: null,
    writing_band: null,
    speaking_band: null,
  });
  assert.equal(bands.length, 4);
  assert.equal(bands[0].band, 6.5);
  assert.equal(bands[0].mockAttemptId, "mock-1");
});

test("dashboardModuleBands exposes provisional AI writing and speaking bands", () => {
  const recent = [
    {
      id: "speaking-attempt",
      module: "speaking",
      status: "completed",
      completed_at: "2026-07-21T10:00:00Z",
      band: 6.5,
      score_source: "ai_estimate",
    },
    {
      id: "writing-attempt",
      module: "writing",
      status: "completed",
      completed_at: "2026-07-21T09:00:00Z",
      band: 7,
      score_source: "ai_estimate",
    },
  ];
  const bands = dashboardModuleBands(recent, {
    mock_attempt_id: "mock-1",
    writing_band: null,
    speaking_band: null,
  });

  assert.equal(bands.find((row) => row.module === "writing").band, 7);
  assert.equal(
    bands.find((row) => row.module === "speaking").band,
    6.5,
  );
  assert.equal(
    bands.find((row) => row.module === "speaking").reviewState,
    "under_review",
  );
});
