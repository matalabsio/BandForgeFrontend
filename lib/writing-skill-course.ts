/**
 * Writing Skill course-home helpers — render server state only.
 * Do not unlock hubs/mocks from completed counts in the frontend.
 */
import type { PlanTaskKind } from "@/lib/plan-task-flow";
import type { MockUnlock, PracticeHub } from "@/lib/practice-types";

export type WritingTrack = "academic" | "general_training";

export type WritingMockUiState =
  | "locked"
  | "unlocked"
  | "used"
  | "unavailable";

export type WritingHubUiState = "current" | "completed" | "locked" | "open";

export function writingTrackLabel(track: WritingTrack | null | undefined): string {
  if (track === "general_training") return "General Training";
  if (track === "academic") return "Academic";
  return "";
}

/** Prefer API exam_module; never fall back to users.exam_module. */
export function resolveWritingTrackFromUnlock(
  mockUnlock: MockUnlock | null | undefined,
): WritingTrack | null {
  const mod = mockUnlock?.exam_module;
  if (mod === "academic" || mod === "general_training") return mod;
  return null;
}

/**
 * Progress counts from mock-unlock / hub list.
 * Prefer API completed/required; never hardcode 12.
 */
export function writingCourseProgress(
  hubs: PracticeHub[],
  mockUnlock: MockUnlock | null | undefined,
): { completed: number; total: number } {
  const fromHubsCompleted = hubs.filter((h) => h.status === "completed").length;
  const fromHubsTotal = hubs.length;
  const completed =
    typeof mockUnlock?.completed === "number"
      ? mockUnlock.completed
      : fromHubsCompleted;
  const total =
    typeof mockUnlock?.required === "number" && mockUnlock.required > 0
      ? mockUnlock.required
      : fromHubsTotal;
  return { completed, total };
}

export function isWritingHubAccessible(hub: PracticeHub): boolean {
  return hub.accessible !== false;
}

/**
 * Current hub = first accessible, not completed — mirrors list UX but does not
 * invent unlock order (accessibility comes from the API).
 */
export function findCurrentWritingHub(
  hubs: PracticeHub[],
): PracticeHub | undefined {
  return hubs.find(
    (h) => isWritingHubAccessible(h) && h.status !== "completed",
  );
}

export function writingHubUiState(
  hub: PracticeHub,
  currentHubId: string | undefined,
): WritingHubUiState {
  if (!isWritingHubAccessible(hub)) return "locked";
  if (hub.status === "completed") return "completed";
  if (currentHubId && hub.id === currentHubId) return "current";
  return "open";
}

export function writingHubCtaLabel(state: WritingHubUiState): string {
  switch (state) {
    case "current":
      return "Continue";
    case "completed":
      return "Review";
    case "open":
      return "Start";
    case "locked":
      return "Locked";
  }
}

/** Task label from title/content metadata only — no position→task mapping. */
export function writingHubTaskLabel(hub: PracticeHub): string | null {
  const raw = (hub.title || "").trim();
  if (/task\s*1\b/i.test(raw) || /[-_]t1([-_]|$)/i.test(raw)) return "Task 1";
  if (/task\s*2\b/i.test(raw) || /[-_]t2([-_]|$)/i.test(raw)) return "Task 2";
  return null;
}

export function writingHubTitleLooksLikeSlug(title: string): boolean {
  const raw = title.trim();
  return (
    !raw ||
    /^MT\d+_[A-Z]+_T\d+$/i.test(raw) ||
    /^[a-z]+-(b\d+-s\d+|custom-)/i.test(raw) ||
    (/^[a-z0-9_-]{8,}$/i.test(raw) && (raw.includes("-") || raw.includes("_")))
  );
}

/** Direct exercise URL — skips the hub landing page for Writing Skill. */
export function writingHubExerciseHref(
  hubId: string,
  opts?: {
    fromPlan?: boolean;
    task?: PlanTaskKind | null;
    taskId?: string | null;
  },
): string {
  const base = `/practice/writing/${hubId}/exercise`;
  if (!opts?.fromPlan && !opts?.task && !opts?.taskId) return base;
  const q = new URLSearchParams();
  if (opts.fromPlan) q.set("from", "plan");
  if (opts.task) q.set("task", opts.task);
  if (opts.taskId) q.set("taskId", opts.taskId);
  const qs = q.toString();
  return qs ? `${base}?${qs}` : base;
}

export function writingHubDisplayTitle(hub: PracticeHub, position: number): string {
  const raw = (hub.title || "").trim();
  if (writingHubTitleLooksLikeSlug(raw)) {
    const task = writingHubTaskLabel(hub);
    if (task && hub.set_number > 0) return `${task} · Set ${hub.set_number}`;
    if (task) return task;
    if (hub.set_number > 0) return `Set ${hub.set_number}`;
    return `Hub ${position}`;
  }
  return raw;
}

/**
 * Mock CTA state from backend unlock payload only.
 * Never unlocks from completed === total alone.
 */
export function resolveWritingMockUiState(
  mockUnlock: MockUnlock | null | undefined,
): WritingMockUiState {
  if (!mockUnlock) return "unavailable";

  const granted = mockUnlock.mocks_granted;
  const used = mockUnlock.mocks_used;
  if (
    typeof granted === "number" &&
    typeof used === "number" &&
    granted > 0 &&
    used >= granted
  ) {
    return "used";
  }

  if (mockUnlock.unlocked && mockUnlock.mock_test_id) {
    return "unlocked";
  }

  // Course complete (or unlock claimed) but no allotted content attached.
  if (
    !mockUnlock.mock_test_id &&
    typeof mockUnlock.required === "number" &&
    mockUnlock.required > 0 &&
    mockUnlock.completed >= mockUnlock.required
  ) {
    return "unavailable";
  }

  if (mockUnlock.unlocked && !mockUnlock.mock_test_id) {
    return "unavailable";
  }

  return "locked";
}

export function writingMockLockedCopy(): string {
  return "Complete the course to unlock your writing mock.";
}

export function writingMockUsedCopy(): string {
  return "You have used your Writing Skill mock allotment.";
}

export function writingMockUnavailableCopy(): string {
  return "Your writing mock is not available yet. Contact support if this persists.";
}

export function writingMocksRemaining(
  mockUnlock: MockUnlock | null | undefined,
): number | null {
  if (
    typeof mockUnlock?.mocks_granted !== "number" ||
    typeof mockUnlock?.mocks_used !== "number"
  ) {
    return null;
  }
  return Math.max(0, mockUnlock.mocks_granted - mockUnlock.mocks_used);
}
