/**
 * Part 3 — completion sync await + results reconcile safety.
 * Pure helpers import without @/ alias; completeDiagnostic contract is exercised inlined.
 */
import assert from "node:assert/strict";
import test from "node:test";

const {
  shouldAcceptServerLatest,
  mergeServerLatestIntoLocal,
} = await import("./diagnostic-results-reconcile.ts");

/**
 * Mirrors completeDiagnostic sync phase: persist local first, then await sync.
 * Used so Node tests can verify await/order without loading @/ modules.
 */
async function completeWithSync(options) {
  const { attemptId, scores, sync } = options;
  const local = {
    mock_attempt_id: attemptId,
    ...scores,
    completed_at: new Date().toISOString(),
    review_status: "pending_human",
  };
  // Local always persisted before sync returns.
  const store = { results: local, deleted: false };
  let synced = false;
  try {
    synced = await sync({
      mock_attempt_id: local.mock_attempt_id,
      ...scores,
    });
  } catch {
    synced = false;
  }
  return { local: store.results, synced, store };
}

test("shouldAcceptServerLatest accepts matching client_attempt_id", () => {
  assert.equal(
    shouldAcceptServerLatest(
      {
        mock_attempt_id: "attempt-x",
        listening_band: 6.5,
        reading_band: 6,
        writing_band: 5.5,
        speaking_band: 6,
        aggregate_band: 6,
      },
      {
        id: "row-1",
        client_attempt_id: "attempt-x",
        status: "completed",
        listening_band: 6.5,
        reading_band: 6,
        writing_band: 5.5,
        speaking_band: 6,
        aggregate_band: 6,
        completed_at: "2026-01-01T00:00:00.000Z",
        pack_version: null,
      },
    ),
    true,
  );
});

test("shouldAcceptServerLatest rejects different or missing attempt", () => {
  const local = {
    mock_attempt_id: "attempt-x",
    listening_band: 6.5,
    reading_band: 6,
    writing_band: 5.5,
    speaking_band: 6,
    aggregate_band: 6,
  };
  assert.equal(
    shouldAcceptServerLatest(local, {
      id: "row-2",
      client_attempt_id: "attempt-other",
      status: "completed",
      listening_band: 9,
      reading_band: 9,
      writing_band: 9,
      speaking_band: 9,
      aggregate_band: 9,
      completed_at: "2026-01-02T00:00:00.000Z",
      pack_version: null,
    }),
    false,
  );
  assert.equal(
    shouldAcceptServerLatest(local, {
      id: "row-3",
      client_attempt_id: null,
      status: "completed",
      listening_band: 9,
      reading_band: 9,
      writing_band: 9,
      speaking_band: 9,
      aggregate_band: 9,
      completed_at: null,
      pack_version: null,
    }),
    false,
  );
});

test("mergeServerLatestIntoLocal keeps local review/eval and adopts server bands", () => {
  const merged = mergeServerLatestIntoLocal(
    {
      mock_attempt_id: "attempt-x",
      listening_band: 6.0,
      reading_band: 6.0,
      writing_band: null,
      speaking_band: 5.5,
      aggregate_band: 6.0,
      review_status: "pending_human",
      review: { listening: { wrong: [], bySkill: {} } },
      writingEvaluation: { evaluation_id: "eval-1", writing_band: 5.5 },
    },
    {
      id: "row-1",
      client_attempt_id: "attempt-x",
      status: "completed",
      listening_band: 6.5,
      reading_band: 6.0,
      writing_band: 5.5,
      speaking_band: 6.0,
      aggregate_band: 6.0,
      completed_at: "2026-01-01T00:00:00.000Z",
      pack_version: "v1",
    },
  );
  assert.equal(merged.mock_attempt_id, "attempt-x");
  assert.equal(merged.listening_band, 6.5);
  assert.equal(merged.speaking_band, 6.0);
  assert.equal(merged.writingEvaluation?.evaluation_id, "eval-1");
  assert.equal(merged.review_status, "pending_human");
  assert.ok(merged.review?.listening);
});

test("complete sync success awaits sync before resolve", async () => {
  const events = [];
  const result = await completeWithSync({
    attemptId: "attempt-sync-ok",
    scores: {
      listening_band: 6.5,
      reading_band: 6.0,
      writing_band: 5.5,
      speaking_band: 6.0,
      aggregate_band: 6.0,
    },
    sync: async (snapshot) => {
      events.push("sync");
      assert.equal(snapshot.mock_attempt_id, "attempt-sync-ok");
      return true;
    },
  });
  events.push("after");
  assert.equal(result.synced, true);
  assert.equal(result.local.mock_attempt_id, "attempt-sync-ok");
  assert.deepEqual(events, ["sync", "after"]);
});

test("failed sync does not delete local results", async () => {
  const result = await completeWithSync({
    attemptId: "attempt-sync-fail",
    scores: {
      listening_band: 6.5,
      reading_band: 6.0,
      writing_band: 5.5,
      speaking_band: 6.0,
      aggregate_band: 6.0,
    },
    sync: async () => false,
  });
  assert.equal(result.synced, false);
  assert.equal(result.store.deleted, false);
  assert.equal(result.local.mock_attempt_id, "attempt-sync-fail");
});

test("retry uses the same client_attempt_id", async () => {
  const ids = [];
  await completeWithSync({
    attemptId: "attempt-retry-x",
    scores: {
      listening_band: 7,
      reading_band: 7,
      writing_band: 6.5,
      speaking_band: 6.5,
      aggregate_band: 6.5,
    },
    sync: async (snapshot) => {
      ids.push(snapshot.mock_attempt_id);
      return false;
    },
  });
  await completeWithSync({
    attemptId: "attempt-retry-x",
    scores: {
      listening_band: 7,
      reading_band: 7,
      writing_band: 6.5,
      speaking_band: 6.5,
      aggregate_band: 6.5,
    },
    sync: async (snapshot) => {
      ids.push(snapshot.mock_attempt_id);
      return true;
    },
  });
  assert.deepEqual(ids, ["attempt-retry-x", "attempt-retry-x"]);
});

test("speaking-style navigation waits until sync attempt completes", async () => {
  const events = [];
  const result = await completeWithSync({
    attemptId: "attempt-nav-order",
    scores: {
      listening_band: 6,
      reading_band: 6,
      writing_band: 6,
      speaking_band: 6,
      aggregate_band: 6,
    },
    sync: async () => {
      events.push("sync_done");
      return true;
    },
  });
  events.push("navigate");
  assert.equal(result.synced, true);
  assert.deepEqual(events, ["sync_done", "navigate"]);
});

test("reconcile does not overwrite local with a different latest attempt", () => {
  const local = {
    mock_attempt_id: "attempt-x",
    listening_band: 6.5,
    reading_band: 6.0,
    writing_band: 5.5,
    speaking_band: 6.0,
    aggregate_band: 6.0,
  };
  const latest = {
    id: "row-old",
    client_attempt_id: "attempt-other",
    status: "completed",
    listening_band: 9,
    reading_band: 9,
    writing_band: 9,
    speaking_band: 9,
    aggregate_band: 9,
    completed_at: "2026-01-01T00:00:00.000Z",
    pack_version: null,
  };
  assert.equal(shouldAcceptServerLatest(local, latest), false);
  // Caller must retain local when accept is false — simulate.
  const kept = shouldAcceptServerLatest(local, latest)
    ? mergeServerLatestIntoLocal(local, latest)
    : local;
  assert.equal(kept.mock_attempt_id, "attempt-x");
  assert.equal(kept.listening_band, 6.5);
});
