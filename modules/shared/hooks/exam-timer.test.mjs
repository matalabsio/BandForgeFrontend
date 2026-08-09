import assert from "node:assert/strict";
import test from "node:test";

/**
 * Mirror of frontend/modules/shared/hooks/use-exam-timer.ts
 * Keep in sync when changing deadline math.
 */
function parseTimeMs(iso) {
  if (!iso) return null;
  const ms = new Date(iso).getTime();
  return Number.isFinite(ms) ? ms : null;
}

function resolveClockOffsetMs({
  serverTimeIso,
  nowMs = Date.now(),
  clockOffsetMs,
}) {
  if (typeof clockOffsetMs === "number" && Number.isFinite(clockOffsetMs)) {
    return clockOffsetMs;
  }
  const serverMs = parseTimeMs(serverTimeIso ?? null);
  if (serverMs == null) return 0;
  return serverMs - nowMs;
}

function computeRemainingSeconds({
  startedAtIso,
  durationSeconds,
  nowMs = Date.now(),
  clockOffsetMs,
  serverTimeIso = null,
}) {
  if (!startedAtIso) return Math.max(0, durationSeconds);
  const startedMs = parseTimeMs(startedAtIso);
  if (startedMs == null) return Math.max(0, durationSeconds);

  const offset = resolveClockOffsetMs({
    serverTimeIso,
    nowMs,
    clockOffsetMs,
  });
  const endMs = startedMs + durationSeconds * 1000;
  const clientNow = nowMs + offset;
  const left = Math.round((endMs - clientNow) / 1000);
  return Number.isFinite(left) ? Math.max(0, left) : Math.max(0, durationSeconds);
}

test("computeRemainingSeconds returns full duration when not started", () => {
  assert.equal(
    computeRemainingSeconds({
      startedAtIso: null,
      durationSeconds: 120,
      nowMs: 1_000_000,
    }),
    120,
  );
});

test("computeRemainingSeconds subtracts elapsed wall time", () => {
  const started = new Date("2026-01-01T00:00:00.000Z").getTime();
  const nowMs = started + 45_000;
  const left = computeRemainingSeconds({
    startedAtIso: new Date(started).toISOString(),
    durationSeconds: 120,
    nowMs,
    clockOffsetMs: 0,
  });
  assert.equal(left, 75);
});

test("computeRemainingSeconds clamps at zero after deadline", () => {
  const started = new Date("2026-01-01T00:00:00.000Z").getTime();
  const left = computeRemainingSeconds({
    startedAtIso: new Date(started).toISOString(),
    durationSeconds: 60,
    nowMs: started + 120_000,
    clockOffsetMs: 0,
  });
  assert.equal(left, 0);
});

test("computeRemainingSeconds applies frozen clockOffsetMs", () => {
  const started = new Date("2026-01-01T00:00:00.000Z").getTime();
  // Client clock is 5s behind server → offset +5000
  const left = computeRemainingSeconds({
    startedAtIso: new Date(started).toISOString(),
    durationSeconds: 120,
    nowMs: started + 10_000,
    clockOffsetMs: 5_000,
  });
  // clientNow = now + 5s = started+15s → remaining 105
  assert.equal(left, 105);
});

test("computeRemainingSeconds accepts legacy serverTimeIso as one-shot skew", () => {
  const started = new Date("2026-01-01T00:00:00.000Z").getTime();
  const nowMs = started + 10_000;
  const serverTimeIso = new Date(started + 15_000).toISOString();
  const left = computeRemainingSeconds({
    startedAtIso: new Date(started).toISOString(),
    durationSeconds: 120,
    nowMs,
    serverTimeIso,
  });
  // offset = +5s at this snapshot → remaining 105
  assert.equal(left, 105);
});

test("remaining decreases over time with a frozen boot server_time snapshot", () => {
  const started = new Date("2026-01-01T00:00:00.000Z").getTime();
  const bootServerTime = new Date(started).toISOString();
  const bootClientNow = started;
  const clockOffsetMs = resolveClockOffsetMs({
    serverTimeIso: bootServerTime,
    nowMs: bootClientNow,
  });
  assert.equal(clockOffsetMs, 0);

  const at0 = computeRemainingSeconds({
    startedAtIso: bootServerTime,
    durationSeconds: 3600,
    nowMs: bootClientNow,
    clockOffsetMs,
  });
  const at60 = computeRemainingSeconds({
    startedAtIso: bootServerTime,
    durationSeconds: 3600,
    nowMs: bootClientNow + 60_000,
    clockOffsetMs,
  });
  const at300 = computeRemainingSeconds({
    startedAtIso: bootServerTime,
    durationSeconds: 3600,
    nowMs: bootClientNow + 300_000,
    clockOffsetMs,
  });

  assert.equal(at0, 3600);
  assert.equal(at60, 3540);
  assert.equal(at300, 3300);
  assert.equal(at0 - at60, 60);
  assert.equal(at0 - at300, 300);
});

test("frozen offset still advances when server_time snapshot is stale", () => {
  const started = new Date("2026-01-01T00:00:00.000Z").getTime();
  // Server was 2s ahead at boot
  const bootServerTime = new Date(started + 2_000).toISOString();
  const bootClientNow = started;
  const clockOffsetMs = resolveClockOffsetMs({
    serverTimeIso: bootServerTime,
    nowMs: bootClientNow,
  });
  assert.equal(clockOffsetMs, 2_000);

  const early = computeRemainingSeconds({
    startedAtIso: new Date(started).toISOString(),
    durationSeconds: 600,
    nowMs: bootClientNow + 10_000,
    clockOffsetMs,
  });
  const later = computeRemainingSeconds({
    startedAtIso: new Date(started).toISOString(),
    durationSeconds: 600,
    nowMs: bootClientNow + 70_000,
    // Intentionally still pass the SAME stale server_time — must NOT recompute offset
    clockOffsetMs,
  });

  assert.equal(early, 588); // 600 - (10+2)
  assert.equal(later, 528); // 600 - (70+2)
  assert.equal(early - later, 60);
});

test("invalid startedAtIso does not yield NaN", () => {
  const left = computeRemainingSeconds({
    startedAtIso: "not-a-date",
    durationSeconds: 90,
    nowMs: 1_000_000,
    clockOffsetMs: 0,
  });
  assert.equal(left, 90);
  assert.equal(Number.isNaN(left), false);
});

test("invalid serverTimeIso resolves to zero offset", () => {
  const started = new Date("2026-01-01T00:00:00.000Z").getTime();
  const offset = resolveClockOffsetMs({
    serverTimeIso: "bad",
    nowMs: started,
  });
  assert.equal(offset, 0);
  const left = computeRemainingSeconds({
    startedAtIso: new Date(started).toISOString(),
    durationSeconds: 100,
    nowMs: started + 40_000,
    serverTimeIso: "bad",
  });
  assert.equal(left, 60);
  assert.equal(Number.isNaN(left), false);
});
