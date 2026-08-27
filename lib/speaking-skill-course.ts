/**
 * Speaking Skill course-home helpers — render server state only.
 * Do not unlock hubs/mocks from completed counts in the frontend.
 * Speaking has no track fork (unlike Writing).
 */
import type { MockUnlock, PracticeHub } from "@/lib/practice-types";

export type SpeakingMockUiState =
  | "locked"
  | "unlocked"
  | "used"
  | "unavailable";

export type SpeakingHubUiState = "current" | "completed" | "locked" | "open";

export type SpeakingPartLabel = "Part 1" | "Part 2" | "Part 3";

/**
 * Progress counts from mock-unlock / hub list.
 * Prefer API completed/required; never hardcode 12.
 */
export function speakingCourseProgress(
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

export function isSpeakingHubAccessible(hub: PracticeHub): boolean {
  return hub.accessible !== false;
}

/**
 * Current hub = first accessible, not completed — mirrors list UX but does not
 * invent unlock order (accessibility comes from the API).
 */
export function findCurrentSpeakingHub(
  hubs: PracticeHub[],
): PracticeHub | undefined {
  return hubs.find(
    (h) => isSpeakingHubAccessible(h) && h.status !== "completed",
  );
}

export function speakingHubUiState(
  hub: PracticeHub,
  currentHubId: string | undefined,
): SpeakingHubUiState {
  if (!isSpeakingHubAccessible(hub)) return "locked";
  if (hub.status === "completed") return "completed";
  if (currentHubId && hub.id === currentHubId) return "current";
  return "open";
}

export function speakingHubCtaLabel(state: SpeakingHubUiState): string {
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

/**
 * Part label from title/slug metadata only — no position→part mapping.
 */
export function speakingHubPartLabel(
  hub: PracticeHub,
): SpeakingPartLabel | null {
  const raw = `${hub.title || ""} ${hub.slug || ""}`.trim();
  if (/part\s*1\b/i.test(raw) || /[-_]p1([-_]|$)/i.test(raw) || /speaking_part1/i.test(raw)) {
    return "Part 1";
  }
  if (/part\s*2\b/i.test(raw) || /[-_]p2([-_]|$)/i.test(raw) || /speaking_part2/i.test(raw)) {
    return "Part 2";
  }
  if (/part\s*3\b/i.test(raw) || /[-_]p3([-_]|$)/i.test(raw) || /speaking_part3/i.test(raw)) {
    return "Part 3";
  }
  return null;
}

export function speakingHubDisplayTitle(hub: PracticeHub, position: number): string {
  const raw = (hub.title || "").trim();
  const looksLikeSlug =
    !raw ||
    /^[a-z]+-(b\d+-s\d+|custom-|ss-p)/i.test(raw) ||
    (/^[a-z0-9-]{10,}$/i.test(raw) && raw.includes("-"));
  if (looksLikeSlug) {
    const part = speakingHubPartLabel(hub);
    if (part && hub.set_number > 0) return `${part} · Set ${hub.set_number}`;
    if (part) return part;
    if (hub.set_number > 0) return `Set ${hub.set_number}`;
    return `Hub ${position}`;
  }
  return raw;
}

/**
 * Mock CTA state from backend unlock payload only.
 * Never unlocks from completed === total alone.
 */
export function resolveSpeakingMockUiState(
  mockUnlock: MockUnlock | null | undefined,
): SpeakingMockUiState {
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

export function speakingMockLockedCopy(): string {
  return "Complete the course to unlock your speaking mock.";
}

export function speakingMockUsedCopy(): string {
  return "You have used your Speaking Skill mock allotment.";
}

export function speakingMockUnavailableCopy(): string {
  return "Your speaking mock is not available yet. Contact support if this persists.";
}

export function speakingEmptyInventoryCopy(): string {
  return "Speaking Skill course content is not configured yet. Check back soon or contact support.";
}

export function speakingMocksRemaining(
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
