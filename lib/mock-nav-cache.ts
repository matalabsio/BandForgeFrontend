/** Fresh submit navigation hint — skip redundant progress API on next page. */
const NAV_KEY = "bf-mock-nav";

export type MockNavHint = {
  mock_attempt_id: string;
  next_module: string | null;
  next_part: number | null;
  ts: number;
};

const TTL_MS = 120_000;

export function cacheMockNavHint(hint: Omit<MockNavHint, "ts">): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      NAV_KEY,
      JSON.stringify({ ...hint, ts: Date.now() } satisfies MockNavHint),
    );
  } catch {
    /* ignore */
  }
}

export function consumeMockNavHint(mockAttemptId: string): MockNavHint | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(NAV_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MockNavHint;
    if (parsed.mock_attempt_id !== mockAttemptId) return null;
    if (Date.now() - parsed.ts > TTL_MS) {
      sessionStorage.removeItem(NAV_KEY);
      return null;
    }
    sessionStorage.removeItem(NAV_KEY);
    return parsed;
  } catch {
    return null;
  }
}

export function shouldSkipMockGuard(
  mockAttemptId: string | null,
  sectionStart: boolean,
): boolean {
  if (!mockAttemptId) return false;
  if (sectionStart) return true;
  return consumeMockNavHint(mockAttemptId) !== null;
}
