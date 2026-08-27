/**
 * Speaking Skill course home helpers (server-state rendering only).
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const {
  speakingCourseProgress,
  isSpeakingHubAccessible,
  findCurrentSpeakingHub,
  speakingHubUiState,
  speakingHubCtaLabel,
  speakingHubPartLabel,
  speakingHubDisplayTitle,
  resolveSpeakingMockUiState,
  speakingMockLockedCopy,
  speakingMocksRemaining,
  speakingEmptyInventoryCopy,
} = await import("./speaking-skill-course.ts");

function hub(partial) {
  return {
    id: partial.id ?? "h1",
    slug: partial.slug ?? "hub",
    skill: "speaking",
    bank_number: partial.bank_number ?? 1,
    set_number: partial.set_number ?? 1,
    title: partial.title ?? "Hub",
    estimated_min: 15,
    sort_order: partial.sort_order ?? 1,
    status: partial.status ?? "pending",
    completed_at: null,
    accessible: partial.accessible,
    locked_reason: partial.locked_reason ?? null,
  };
}

function unlock(partial) {
  return {
    skill: "speaking",
    unlocked: false,
    completed: 0,
    required: 12,
    mock_test_id: null,
    exam_module: null,
    ...partial,
  };
}

test("progress uses API completed/required (not hardcoded 12)", () => {
  const hubs = [
    hub({ id: "a", status: "completed", accessible: true }),
    hub({ id: "b", status: "pending", accessible: true }),
    hub({ id: "c", status: "pending", accessible: false }),
  ];
  const p = speakingCourseProgress(
    hubs,
    unlock({ completed: 1, required: 3 }),
  );
  assert.deepEqual(p, { completed: 1, total: 3 });
});

test("progress falls back to hub list when required missing", () => {
  const hubs = [hub({ id: "a" }), hub({ id: "b" })];
  const p = speakingCourseProgress(hubs, null);
  assert.equal(p.total, 2);
  assert.equal(p.completed, 0);
});

test("empty inventory progress is zero", () => {
  assert.deepEqual(speakingCourseProgress([], null), {
    completed: 0,
    total: 0,
  });
  assert.match(speakingEmptyInventoryCopy(), /not configured/i);
});

test("first hub unlocked, later locked from accessible flags", () => {
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
  const current = findCurrentSpeakingHub(hubs);
  assert.equal(current?.id, "1");
  assert.equal(speakingHubUiState(hubs[0], current.id), "current");
  assert.equal(speakingHubCtaLabel("current"), "Continue");
  assert.equal(speakingHubUiState(hubs[1], current.id), "locked");
  assert.equal(speakingHubUiState(hubs[2], current.id), "locked");
  assert.equal(isSpeakingHubAccessible(hubs[1]), false);
});

test("completed hubs remain open; completing N unlocks N+1 via API flags", () => {
  const hubs = [
    hub({ id: "1", status: "completed", accessible: true }),
    hub({ id: "2", status: "pending", accessible: true }),
    hub({ id: "3", status: "pending", accessible: false }),
  ];
  const current = findCurrentSpeakingHub(hubs);
  assert.equal(current?.id, "2");
  assert.equal(speakingHubUiState(hubs[0], current.id), "completed");
  assert.equal(speakingHubCtaLabel("completed"), "Review");
  assert.equal(speakingHubUiState(hubs[1], current.id), "current");
  assert.equal(speakingHubUiState(hubs[2], current.id), "locked");
});

test("frontend does not invent unlock order from index alone", () => {
  const hubs = [
    hub({ id: "1", status: "completed", accessible: true }),
    hub({ id: "2", status: "pending", accessible: false }),
  ];
  assert.equal(speakingHubUiState(hubs[1], "2"), "locked");
  assert.equal(findCurrentSpeakingHub(hubs), undefined);
});

test("part label from title/slug metadata only — no position mapping", () => {
  assert.equal(
    speakingHubPartLabel(hub({ title: "Warm-up Part 1 questions" })),
    "Part 1",
  );
  assert.equal(
    speakingHubPartLabel(hub({ title: "Cue card", slug: "speaking-ss-p2-03" })),
    "Part 2",
  );
  assert.equal(
    speakingHubPartLabel(hub({ title: "Discussion", slug: "speaking-ss-p3-01" })),
    "Part 3",
  );
  // Position 7 without part in metadata → no invented Part 2
  assert.equal(
    speakingHubPartLabel(hub({ title: "Set seven", set_number: 7, slug: "hub-seven" })),
    null,
  );
});

test("no Academic/GT labels in speaking helpers", () => {
  const src = fs.readFileSync(
    new URL("./speaking-skill-course.ts", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(src, /\bAcademic\b|General Training|writingTrack/);
});

test("display title prefers human title over slug", () => {
  assert.equal(
    speakingHubDisplayTitle(hub({ title: "Hometown warm-up", set_number: 1 }), 1),
    "Hometown warm-up",
  );
  assert.equal(
    speakingHubDisplayTitle(
      hub({ title: "speaking-ss-p1-02", slug: "speaking-ss-p1-02", set_number: 2 }),
      1,
    ),
    "Part 1 · Set 2",
  );
});

test("locked mock when unlock false and course incomplete", () => {
  assert.equal(
    resolveSpeakingMockUiState(
      unlock({ unlocked: false, completed: 2, required: 12 }),
    ),
    "locked",
  );
  assert.match(speakingMockLockedCopy(), /Complete the course/i);
});

test("unlocked mock when backend unlocked + mock_test_id", () => {
  assert.equal(
    resolveSpeakingMockUiState(
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
    resolveSpeakingMockUiState(
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

test("does not unlock mock from completedCount alone", () => {
  const state = resolveSpeakingMockUiState(
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
    speakingMocksRemaining(unlock({ mocks_granted: 1, mocks_used: 0 })),
    1,
  );
  assert.equal(
    speakingMocksRemaining(unlock({ mocks_granted: 1, mocks_used: 1 })),
    0,
  );
  assert.equal(speakingMocksRemaining(unlock({})), null);
});
