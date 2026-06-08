import assert from "node:assert/strict";
import test from "node:test";
import {
  EXAM_REFRESH_COOLDOWN_MS,
  shouldRunProactiveRefresh,
} from "./exam-session-refresh-policy.ts";

function accessExpired(token, skewSeconds = 30) {
  if (token === "hard-expired") return true;
  if (token === "soft-stale") return skewSeconds >= 360;
  return false;
}

function accessNeedsRefresh(token) {
  return !token || token === "soft-stale" || token === "hard-expired";
}

test("shouldRunProactiveRefresh returns false when access is fresh", () => {
  assert.equal(
    shouldRunProactiveRefresh(
      1000,
      null,
      "valid-token",
      accessExpired,
      accessNeedsRefresh,
    ),
    false,
  );
});

test("shouldRunProactiveRefresh returns true when access is soft-stale and no prior refresh", () => {
  assert.equal(
    shouldRunProactiveRefresh(
      1000,
      null,
      "soft-stale",
      accessExpired,
      accessNeedsRefresh,
    ),
    true,
  );
});

test("shouldRunProactiveRefresh returns false during cooldown for soft-stale", () => {
  const now = 10_000;
  const last = now - 60_000;
  assert.equal(
    shouldRunProactiveRefresh(
      now,
      last,
      "soft-stale",
      accessExpired,
      accessNeedsRefresh,
    ),
    false,
  );
});

test("shouldRunProactiveRefresh returns true during cooldown when hard-expired", () => {
  const now = 10_000;
  const last = now - 60_000;
  assert.equal(
    shouldRunProactiveRefresh(
      now,
      last,
      "hard-expired",
      accessExpired,
      accessNeedsRefresh,
    ),
    true,
  );
});

test("shouldRunProactiveRefresh returns true after cooldown elapses", () => {
  const now = EXAM_REFRESH_COOLDOWN_MS + 5_000;
  const last = 0;
  assert.equal(
    shouldRunProactiveRefresh(
      now,
      last,
      "soft-stale",
      accessExpired,
      accessNeedsRefresh,
    ),
    true,
  );
});
