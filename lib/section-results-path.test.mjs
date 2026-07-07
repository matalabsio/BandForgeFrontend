/**
 * Node tests for section results URL helper (keep in sync with section-results-path.ts).
 */
import assert from "node:assert/strict";
import test from "node:test";

function shortSectionResultsPath(testNumber, module, opts) {
  const params = new URLSearchParams({ attempt: opts.attempt });
  if (opts.part != null && Number.isFinite(opts.part)) {
    params.set("part", String(opts.part));
  }
  if (opts.mockAttempt) {
    params.set("mock_attempt", opts.mockAttempt);
  }
  return `/test/${testNumber}/${module}/results?${params.toString()}`;
}

function isMockSectionResultsUrl(searchParams) {
  return Boolean(
    searchParams.get("mock_attempt")?.trim() && searchParams.get("attempt")?.trim(),
  );
}

test("shortSectionResultsPath includes mock_attempt and part", () => {
  const url = shortSectionResultsPath(1, "listening", {
    attempt: "aaaa-bbbb",
    part: 2,
    mockAttempt: "mock-1",
  });
  assert.match(url, /\/test\/1\/listening\/results\?/);
  assert.match(url, /attempt=aaaa-bbbb/);
  assert.match(url, /part=2/);
  assert.match(url, /mock_attempt=mock-1/);
});

test("isMockSectionResultsUrl requires attempt and mock_attempt", () => {
  assert.equal(
    isMockSectionResultsUrl(
      new URLSearchParams("attempt=x&mock_attempt=y"),
    ),
    true,
  );
  assert.equal(
    isMockSectionResultsUrl(new URLSearchParams("mock_attempt=y")),
    false,
  );
});
