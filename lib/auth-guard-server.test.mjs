/**
 * Account auth guard predicate — null / placeholder / role=guest vs full accounts.
 */
import assert from "node:assert/strict";
import test from "node:test";

const GUEST_USER_ID = "00000000-0000-0000-0000-000000000000";

/** Mirror of isGuestOrMissingUser in auth-guard-server.ts (keep in sync). */
function isGuestOrMissingUser(user) {
  return (
    !user ||
    user.id === GUEST_USER_ID ||
    user.role === "guest"
  );
}

const REAL_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

test("isGuestOrMissingUser: null → rejected", () => {
  assert.equal(isGuestOrMissingUser(null), true);
});

test("isGuestOrMissingUser: GUEST_USER placeholder → rejected", () => {
  assert.equal(
    isGuestOrMissingUser({ id: GUEST_USER_ID, role: "student" }),
    true,
  );
});

test("isGuestOrMissingUser: real UUID + role=guest → rejected", () => {
  assert.equal(
    isGuestOrMissingUser({ id: REAL_ID, role: "guest" }),
    true,
  );
});

test("isGuestOrMissingUser: real UUID + role=student → allowed", () => {
  assert.equal(
    isGuestOrMissingUser({ id: REAL_ID, role: "student" }),
    false,
  );
});

test("isGuestOrMissingUser: real UUID + role=admin → allowed", () => {
  assert.equal(
    isGuestOrMissingUser({ id: REAL_ID, role: "admin" }),
    false,
  );
});

test("isGuestOrMissingUser: real UUID + role=super_admin → allowed", () => {
  assert.equal(
    isGuestOrMissingUser({ id: REAL_ID, role: "super_admin" }),
    false,
  );
});

test("isGuestOrMissingUser: real UUID without role field → allowed", () => {
  // AuthUser may omit role on some paths; only explicit guest is rejected.
  assert.equal(isGuestOrMissingUser({ id: REAL_ID }), false);
});
