/**
 * Node tests for exam timer deadline math.
 * Keep in sync with use-exam-timer.ts.
 */
import assert from "node:assert/strict";
import test from "node:test";

function computeRemainingSeconds({
  startedAtIso,
  serverTimeIso,
  durationSeconds,
  nowMs = Date.now(),
}) {
  if (!startedAtIso) return durationSeconds;
  const startedMs = new Date(startedAtIso).getTime();
  const serverMs = serverTimeIso
    ? new Date(serverTimeIso).getTime()
    : nowMs;
  const offset = serverMs - nowMs;
  const endMs = startedMs + durationSeconds * 1000;
  const clientNow = nowMs + offset;
  return Math.max(0, Math.round((endMs - clientNow) / 1000));
}

test("computeRemainingSeconds returns full duration when not started", () => {
  assert.equal(
    computeRemainingSeconds({
      startedAtIso: null,
      serverTimeIso: null,
      durationSeconds: 3600,
    }),
    3600,
  );
});

test("computeRemainingSeconds subtracts elapsed wall time", () => {
  const startedAtIso = "2026-06-03T10:00:00.000Z";
  const serverTimeIso = "2026-06-03T10:10:00.000Z";
  const nowMs = new Date("2026-06-03T10:10:00.000Z").getTime();
  const left = computeRemainingSeconds({
    startedAtIso,
    serverTimeIso,
    durationSeconds: 3600,
    nowMs,
  });
  assert.equal(left, 3000);
});

test("computeRemainingSeconds clamps at zero after deadline", () => {
  const startedAtIso = "2026-06-03T10:00:00.000Z";
  const nowMs = new Date("2026-06-03T11:30:00.000Z").getTime();
  const left = computeRemainingSeconds({
    startedAtIso,
    serverTimeIso: "2026-06-03T11:30:00.000Z",
    durationSeconds: 3600,
    nowMs,
  });
  assert.equal(left, 0);
});

test("computeRemainingSeconds applies server-client offset", () => {
  const startedAtIso = "2026-06-03T10:00:00.000Z";
  const serverTimeIso = "2026-06-03T10:05:00.000Z";
  const clientNowMs = new Date("2026-06-03T10:04:00.000Z").getTime();
  const left = computeRemainingSeconds({
    startedAtIso,
    serverTimeIso,
    durationSeconds: 3600,
    nowMs: clientNowMs,
  });
  assert.equal(left, 3300);
});

test("catch-up guard fires once when ready after expiry", () => {
  let submitCount = 0;
  let canSubmit = false;
  let remaining = 0;
  let fired = false;

  const maybeCatchUp = () => {
    if (remaining > 0) return;
    if (!canSubmit) return;
    if (fired) return;
    fired = true;
    submitCount += 1;
  };

  maybeCatchUp();
  assert.equal(submitCount, 0);

  canSubmit = true;
  maybeCatchUp();
  assert.equal(submitCount, 1);

  maybeCatchUp();
  assert.equal(submitCount, 1);
});
