/**
 * Phase 6B — Writing Skill course home helpers (server-state rendering only).
 */
import assert from "node:assert/strict";
import test from "node:test";

const {
  writingTrackLabel,
  resolveWritingTrackFromUnlock,
  writingCourseProgress,
  isWritingHubAccessible,
  findCurrentWritingHub,
  writingHubUiState,
  writingHubCtaLabel,
  writingHubTaskLabel,
  writingHubDisplayTitle,
  writingHubExerciseHref,
  resolveWritingMockUiState,
  writingMockLockedCopy,
  writingMocksRemaining,
} = await import("./writing-skill-course.ts");

function hub(partial) {
  return {
    id: partial.id ?? "h1",
    slug: partial.slug ?? "hub",
    skill: "writing",
    bank_number: partial.bank_number ?? 1,
    set_number: partial.set_number ?? 1,
    title: partial.title ?? "Hub",
    estimated_min: 25,
    sort_order: partial.sort_order ?? 1,
    status: partial.status ?? "pending",
    completed_at: null,
    accessible: partial.accessible,
    locked_reason: partial.locked_reason ?? null,
  };
}

function unlock(partial) {
  return {
    skill: "writing",
    unlocked: false,
    completed: 0,
    required: 12,
    mock_test_id: null,
    ...partial,
  };
}

// --- Track ---

test("Academic track label from unlock exam_module", () => {
  assert.equal(
    writingTrackLabel(resolveWritingTrackFromUnlock(unlock({ exam_module: "academic" }))),
    "Academic",
  );
});

test("GT track label from unlock exam_module", () => {
  assert.equal(
    writingTrackLabel(
      resolveWritingTrackFromUnlock(unlock({ exam_module: "general_training" })),
    ),
    "General Training",
  );
});

test("missing track does not invent Academic", () => {
  assert.equal(resolveWritingTrackFromUnlock(unlock({})), null);
  assert.equal(resolveWritingTrackFromUnlock(null), null);
  assert.equal(writingTrackLabel(null), "");
});

// --- Progress ---

test("progress uses API completed/required (not hardcoded 12)", () => {
  const hubs = [
    hub({ id: "a", status: "completed", accessible: true }),
    hub({ id: "b", status: "pending", accessible: true }),
    hub({ id: "c", status: "pending", accessible: false }),
  ];
  const p = writingCourseProgress(
    hubs,
    unlock({ completed: 1, required: 3 }),
  );
  assert.deepEqual(p, { completed: 1, total: 3 });
});

test("progress falls back to hub list length when required missing", () => {
  const hubs = [hub({ id: "a" }), hub({ id: "b" })];
  const p = writingCourseProgress(hubs, null);
  assert.equal(p.total, 2);
  assert.equal(p.completed, 0);
});

test("progress does not force total 12 when API says otherwise", () => {
  const p = writingCourseProgress([], unlock({ completed: 4, required: 8 }));
  assert.deepEqual(p, { completed: 4, total: 8 });
});

// --- Hub states / CTA ---

test("initial: hub1 current, hub2+ locked from accessible flags", () => {
  const hubs = [
    hub({ id: "1", status: "pending", accessible: true, set_number: 1 }),
    hub({
      id: "2",
      status: "pending",
      accessible: false,
      locked_reason: "Complete previous",
      set_number: 2,
    }),
    hub({ id: "3", status: "pending", accessible: false, set_number: 3 }),
  ];
  const current = findCurrentWritingHub(hubs);
  assert.equal(current?.id, "1");
  assert.equal(writingHubUiState(hubs[0], current.id), "current");
  assert.equal(writingHubCtaLabel("current"), "Continue");
  assert.equal(writingHubUiState(hubs[1], current.id), "locked");
  assert.equal(writingHubUiState(hubs[2], current.id), "locked");
  assert.equal(isWritingHubAccessible(hubs[1]), false);
});

test("after hub1: completed review + current hub2", () => {
  const hubs = [
    hub({ id: "1", status: "completed", accessible: true }),
    hub({ id: "2", status: "pending", accessible: true }),
    hub({ id: "3", status: "pending", accessible: false }),
  ];
  const current = findCurrentWritingHub(hubs);
  assert.equal(current?.id, "2");
  assert.equal(writingHubUiState(hubs[0], current.id), "completed");
  assert.equal(writingHubCtaLabel("completed"), "Review");
  assert.equal(writingHubUiState(hubs[1], current.id), "current");
  assert.equal(writingHubUiState(hubs[2], current.id), "locked");
});

test("all completed: no current hub; locked uses API accessible", () => {
  const hubs = [
    hub({ id: "1", status: "completed", accessible: true }),
    hub({ id: "2", status: "completed", accessible: true }),
  ];
  assert.equal(findCurrentWritingHub(hubs), undefined);
  assert.equal(writingHubUiState(hubs[0], undefined), "completed");
});

test("frontend does not unlock from index alone — inaccessible stays locked", () => {
  const hubs = [
    hub({ id: "1", status: "completed", accessible: true }),
    // Backend still locked despite being "next" in local imagination
    hub({ id: "2", status: "pending", accessible: false }),
  ];
  assert.equal(writingHubUiState(hubs[1], "2"), "locked");
  assert.equal(findCurrentWritingHub(hubs), undefined);
});

test("task label from title metadata only — no position mapping", () => {
  assert.equal(
    writingHubTaskLabel(hub({ title: "Charts — Task 1 practice" })),
    "Task 1",
  );
  assert.equal(
    writingHubTaskLabel(hub({ title: "Essay Task 2" })),
    "Task 2",
  );
  assert.equal(writingHubTaskLabel(hub({ title: "MT2_WT_T1" })), "Task 1");
  assert.equal(writingHubTaskLabel(hub({ title: "MT1_WT_T2" })), "Task 2");
  // Position 7 without task in title → no invented Task 2
  assert.equal(writingHubTaskLabel(hub({ title: "Set seven", set_number: 7 })), null);
});

test("exercise href skips hub landing page", () => {
  const hubId = "c1100000-0000-4000-8000-000000000021";
  assert.equal(
    writingHubExerciseHref(hubId),
    `/practice/writing/${hubId}/exercise`,
  );
  assert.equal(
    writingHubExerciseHref(hubId, {
      fromPlan: true,
      task: "practice",
      taskId: "t-1",
    }),
    `/practice/writing/${hubId}/exercise?from=plan&task=practice&taskId=t-1`,
  );
});

test("display title prefers human title over slug", () => {
  assert.equal(
    writingHubDisplayTitle(hub({ title: "Line graph overview", set_number: 1 }), 1),
    "Line graph overview",
  );
  assert.equal(
    writingHubDisplayTitle(hub({ title: "writing-b1-s1", set_number: 3 }), 1),
    "Set 3",
  );
  assert.equal(
    writingHubDisplayTitle(hub({ title: "MT2_WT_T1", set_number: 6 }), 1),
    "Task 1 · Set 6",
  );
});

// --- Mock states ---

test("locked mock when unlock false and course incomplete", () => {
  assert.equal(
    resolveWritingMockUiState(unlock({ unlocked: false, completed: 2, required: 12 })),
    "locked",
  );
  assert.match(writingMockLockedCopy(), /Complete the course/i);
});

test("unlocked mock when backend unlocked + mock_test_id", () => {
  assert.equal(
    resolveWritingMockUiState(
      unlock({
        unlocked: true,
        completed: 12,
        required: 12,
        mock_test_id: "mock-uuid",
        mocks_granted: 1,
        mocks_used: 0,
      }),
    ),
    "unlocked",
  );
});

test("used mock when mocks_used >= mocks_granted", () => {
  assert.equal(
    resolveWritingMockUiState(
      unlock({
        unlocked: false,
        completed: 12,
        required: 12,
        mock_test_id: "mock-uuid",
        mocks_granted: 1,
        mocks_used: 1,
      }),
    ),
    "used",
  );
});

test("unavailable when course complete but no mock content (no premium fallback)", () => {
  assert.equal(
    resolveWritingMockUiState(
      unlock({
        unlocked: false,
        completed: 12,
        required: 12,
        mock_test_id: null,
        mocks_granted: 1,
        mocks_used: 0,
      }),
    ),
    "unavailable",
  );
  assert.equal(resolveWritingMockUiState(null), "unavailable");
});

test("does not unlock mock from completedCount alone", () => {
  // 12/12 but unlocked=false and no used quota → still locked or unavailable
  const state = resolveWritingMockUiState(
    unlock({
      unlocked: false,
      completed: 12,
      required: 12,
      mock_test_id: "x",
      mocks_granted: 1,
      mocks_used: 0,
    }),
  );
  assert.notEqual(state, "unlocked");
});

test("mocks remaining from granted/used", () => {
  assert.equal(
    writingMocksRemaining(unlock({ mocks_granted: 1, mocks_used: 0 })),
    1,
  );
  assert.equal(
    writingMocksRemaining(unlock({ mocks_granted: 1, mocks_used: 1 })),
    0,
  );
  assert.equal(writingMocksRemaining(unlock({})), null);
});

// --- Entitlement / route expectations (mirrors entitled-route + commerce) ---

const FULL = "full_skill_program";
const WS = "writing_skill";

function emptyEnt() {
  return {
    plans: [],
    skills: { listening: false, reading: false, writing: false, speaking: false },
    writing_skill: false,
    full_skill_program: false,
  };
}

function resolveEnt(sub) {
  if (sub?.entitlements) {
    return {
      plans: [...(sub.entitlements.plans ?? [])],
      skills: {
        listening: Boolean(sub.entitlements.skills?.listening),
        reading: Boolean(sub.entitlements.skills?.reading),
        writing: Boolean(sub.entitlements.skills?.writing),
        speaking: Boolean(sub.entitlements.skills?.speaking),
      },
      writing_skill: Boolean(sub.entitlements.writing_skill),
      full_skill_program: Boolean(sub.entitlements.full_skill_program),
    };
  }
  return emptyEnt();
}

function canAccessPracticeSkill(sub, skill) {
  const ent = resolveEnt(sub);
  if (ent.full_skill_program) return true;
  if (ent.writing_skill && skill === "writing") return true;
  return false;
}

function resolvePracticeAccessKind(sub) {
  const ent = resolveEnt(sub);
  if (ent.full_skill_program) return "fsp";
  if (ent.writing_skill) return "writing_skill";
  return "none";
}

function shouldShowWritingCourseHome(sub) {
  return resolvePracticeAccessKind(sub) === "writing_skill";
}

test("Writing-only can access writing course home", () => {
  const sub = {
    is_active: true,
    entitlements: {
      ...emptyEnt(),
      writing_skill: true,
      skills: { ...emptyEnt().skills, writing: true },
      plans: [WS],
    },
  };
  assert.equal(canAccessPracticeSkill(sub, "writing"), true);
  assert.equal(shouldShowWritingCourseHome(sub), true);
});

test("Writing-only cannot access L/R/S premium practice", () => {
  const sub = {
    is_active: true,
    entitlements: {
      ...emptyEnt(),
      writing_skill: true,
      skills: { ...emptyEnt().skills, writing: true },
      plans: [WS],
    },
  };
  assert.equal(canAccessPracticeSkill(sub, "listening"), false);
  assert.equal(canAccessPracticeSkill(sub, "reading"), false);
  assert.equal(canAccessPracticeSkill(sub, "speaking"), false);
});

test("unrelated subscription cannot access Writing course", () => {
  const sub = {
    is_active: true,
    entitlements: emptyEnt(),
  };
  assert.equal(canAccessPracticeSkill(sub, "writing"), false);
  assert.equal(shouldShowWritingCourseHome(sub), false);
});

test("FSP-only uses FSP practice UX (not Writing Skill course home)", () => {
  const sub = {
    is_active: true,
    entitlements: {
      ...emptyEnt(),
      full_skill_program: true,
      plans: [FULL],
      skills: {
        listening: true,
        reading: true,
        writing: true,
        speaking: true,
      },
    },
  };
  assert.equal(resolvePracticeAccessKind(sub), "fsp");
  assert.equal(shouldShowWritingCourseHome(sub), false);
  assert.equal(canAccessPracticeSkill(sub, "listening"), true);
});

test("FSP + Writing Skill remains FSP-first for practice UX", () => {
  const sub = {
    is_active: true,
    entitlements: {
      plans: [FULL, WS],
      full_skill_program: true,
      writing_skill: true,
      skills: {
        listening: true,
        reading: true,
        writing: true,
        speaking: true,
      },
    },
  };
  assert.equal(resolvePracticeAccessKind(sub), "fsp");
  assert.equal(shouldShowWritingCourseHome(sub), false);
});

test("onboarding: missing track → onboarding path expectation", () => {
  // Course home only when track present on unlock; missing → page redirects.
  assert.equal(resolveWritingTrackFromUnlock(unlock({ exam_module: null })), null);
});

test("onboarding: selected track → course (track present)", () => {
  assert.equal(
    resolveWritingTrackFromUnlock(unlock({ exam_module: "academic" })),
    "academic",
  );
});
