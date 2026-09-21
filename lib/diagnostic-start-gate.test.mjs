/**
 * Diagnostic start gate — FSP redirect, auto-resume, or lead form.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { decideDiagnosticStartGate } from "./diagnostic-start-gate.ts";

test("FSP → redirect_dashboard even with in-progress attempt", () => {
  assert.deepEqual(
    decideDiagnosticStartGate({ isFsp: true, hasInProgress: true }),
    { kind: "redirect_dashboard" },
  );
});

test("FSP → redirect_dashboard with no progress", () => {
  assert.deepEqual(
    decideDiagnosticStartGate({ isFsp: true, hasInProgress: false }),
    { kind: "redirect_dashboard" },
  );
});

test("non-FSP + in-progress → auto_resume", () => {
  assert.deepEqual(
    decideDiagnosticStartGate({ isFsp: false, hasInProgress: true }),
    { kind: "auto_resume" },
  );
});

test("non-FSP + no progress → show_form", () => {
  assert.deepEqual(
    decideDiagnosticStartGate({ isFsp: false, hasInProgress: false }),
    { kind: "show_form" },
  );
});
