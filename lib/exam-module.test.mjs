/**
 * FSP Writing track helpers (users.exam_module) — unit tests.
 * Does not cover planner filtering (Phase 2).
 */
import assert from "node:assert/strict";
import test from "node:test";

import {
  EXAM_MODULE_OPTIONS,
  recommendExamModule,
  requiresExplicitExamModuleChoice,
  resolveExamModuleSelection,
} from "./diagnostic-lead.ts";

test("Academic and General Training options render metadata", () => {
  const ids = EXAM_MODULE_OPTIONS.map((o) => o.id);
  assert.deepEqual(ids, ["academic", "general_training"]);
  assert.match(EXAM_MODULE_OPTIONS[0].title, /Academic/);
  assert.match(EXAM_MODULE_OPTIONS[1].title, /General Training/);
  assert.match(EXAM_MODULE_OPTIONS[0].task1, /charts/i);
  assert.match(EXAM_MODULE_OPTIONS[1].task1, /letter/i);
});

test("university recommends Academic", () => {
  assert.equal(recommendExamModule("university"), "academic");
  assert.equal(requiresExplicitExamModuleChoice("university"), false);
});

test("immigration recommends General Training", () => {
  assert.equal(recommendExamModule("immigration"), "general_training");
  assert.equal(requiresExplicitExamModuleChoice("immigration"), false);
});

test("professional requires explicit selection with no recommendation", () => {
  assert.equal(recommendExamModule("professional"), null);
  assert.equal(requiresExplicitExamModuleChoice("professional"), true);
});

test("general requires explicit selection with no recommendation", () => {
  assert.equal(recommendExamModule("general"), null);
  assert.equal(requiresExplicitExamModuleChoice("general"), true);
});

test("explicit Academic selection is preserved over purpose recommendation", () => {
  assert.equal(
    resolveExamModuleSelection({
      existing: "academic",
      purpose: "immigration",
      draft: "general_training",
    }),
    "academic",
  );
});

test("explicit GT selection is preserved over purpose recommendation", () => {
  assert.equal(
    resolveExamModuleSelection({
      existing: "general_training",
      purpose: "university",
      draft: "academic",
    }),
    "general_training",
  );
});

test("NULL does not silently become Academic", () => {
  assert.equal(
    resolveExamModuleSelection({
      existing: null,
      purpose: "university",
      draft: null,
    }),
    null,
  );
});

test("purpose change does not invent exam_module when unset", () => {
  assert.equal(
    resolveExamModuleSelection({ purpose: "immigration" }),
    null,
  );
  assert.equal(
    resolveExamModuleSelection({ purpose: "university" }),
    null,
  );
});

test("draft selection used when no existing profile module", () => {
  assert.equal(
    resolveExamModuleSelection({
      existing: null,
      purpose: "professional",
      draft: "academic",
    }),
    "academic",
  );
  assert.equal(
    resolveExamModuleSelection({
      existing: null,
      purpose: "university",
      draft: "general_training",
    }),
    "general_training",
  );
});
