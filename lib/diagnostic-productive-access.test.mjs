/**
 * Diagnostic productive (W/S) access — no mount from session hints alone.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { decideDiagnosticProductiveAccess } from "./diagnostic-productive-access.ts";

test("productive access: unresolved role → loading (children must not mount)", () => {
  const d = decideDiagnosticProductiveAccess({
    roleResolved: false,
    hasSession: true,
    role: undefined,
  });
  assert.equal(d.kind, "loading");
});

test("productive access: session hint alone never allows (unresolved)", () => {
  // Simulates hasLikelyClientSession() true before /me — must stay loading.
  const d = decideDiagnosticProductiveAccess({
    roleResolved: false,
    hasSession: true,
    role: "guest",
  });
  assert.equal(d.kind, "loading");
});

test("productive access: guest session after resolve → deny (no children)", () => {
  const d = decideDiagnosticProductiveAccess({
    roleResolved: true,
    hasSession: true,
    role: "guest",
  });
  assert.equal(d.kind, "deny");
});

test("productive access: no session after resolve → deny", () => {
  const d = decideDiagnosticProductiveAccess({
    roleResolved: true,
    hasSession: false,
    role: undefined,
  });
  assert.equal(d.kind, "deny");
});

test("productive access: student → allow", () => {
  const d = decideDiagnosticProductiveAccess({
    roleResolved: true,
    hasSession: true,
    role: "student",
  });
  assert.equal(d.kind, "allow");
});

test("productive access: admin → allow", () => {
  const d = decideDiagnosticProductiveAccess({
    roleResolved: true,
    hasSession: true,
    role: "admin",
  });
  assert.equal(d.kind, "allow");
});
