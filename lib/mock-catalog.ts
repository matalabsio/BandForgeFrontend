import { scoresAfterMockCompletePath } from "@/lib/scores-path";

/** Published full IELTS mocks (orchestrated multi-module exams). */

/** Academic Mock 1 — valid Postgres UUID (a000 prefix; `m` is not hex). */
export const M01_MOCK_TEST_ID = "a0000000-0000-4000-8000-000000000001";

const PUBLISHED_FULL_MOCK_IDS: readonly string[] = [M01_MOCK_TEST_ID];

const MOCK_SLUGS = {
  m01: M01_MOCK_TEST_ID,
} as const;

export type MockSlug = keyof typeof MOCK_SLUGS;

export const DEFAULT_MOCK_SLUG: MockSlug = "m01";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const LEGACY_INVALID_M01_ID = "m0000000-0000-4000-8000-000000000001";

export type MockModule = "reading" | "listening" | "writing" | "speaking";

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

function resolveMockId(slugOrId: string): string {
  if (slugOrId === LEGACY_INVALID_M01_ID) return M01_MOCK_TEST_ID;
  if (slugOrId in MOCK_SLUGS) {
    return MOCK_SLUGS[slugOrId as MockSlug];
  }
  if (isUuid(slugOrId)) return slugOrId;
  return M01_MOCK_TEST_ID;
}

function mockSlugForId(id: string): MockSlug | string {
  if (id === LEGACY_INVALID_M01_ID) return DEFAULT_MOCK_SLUG;
  for (const [slug, uuid] of Object.entries(MOCK_SLUGS) as [MockSlug, string][]) {
    if (uuid === id) return slug;
  }
  return id;
}

export function canonicalMockSlug(slugOrId: string): string {
  const resolved = resolveMockId(slugOrId);
  const slug = mockSlugForId(resolved);
  return typeof slug === "string" && slug in MOCK_SLUGS ? slug : DEFAULT_MOCK_SLUG;
}

export function isFullMock(testId: string): boolean {
  return PUBLISHED_FULL_MOCK_IDS.includes(resolveMockId(testId));
}

/** Canonical Test 1 hub — section cards (Listening, Reading, Writing). */
export function test1HubPath(mockAttemptId?: string | null): string {
  const base = "/test/1";
  if (!mockAttemptId) return base;
  return `${base}?mock_attempt=${encodeURIComponent(mockAttemptId)}`;
}

export function mockHubPath(
  slug: string = DEFAULT_MOCK_SLUG,
  mockAttemptId?: string | null,
): string {
  if (canonicalMockSlug(slug) === DEFAULT_MOCK_SLUG) {
    return test1HubPath(mockAttemptId);
  }
  const base = `/mock/${canonicalMockSlug(slug)}`;
  if (!mockAttemptId) return base;
  return `${base}?mock_attempt=${encodeURIComponent(mockAttemptId)}`;
}

export function mockModulePath(
  slugOrId: string,
  module: MockModule,
  opts?: { part?: number; passage?: number; auto?: boolean; mockAttemptId?: string },
): string {
  const slug = canonicalMockSlug(slugOrId);
  const base = `/mock/${slug}/${module}`;
  const params = new URLSearchParams();
  if (module === "listening" && opts?.part) {
    params.set("part", String(opts.part));
  }
  if (module === "reading") {
    const passage = opts?.passage ?? opts?.part ?? 1;
    params.set("passage", String(passage));
  }
  if (module === "writing" && opts?.part) {
    params.set("part", String(opts.part));
  }
  if (opts?.auto) params.set("auto", "1");
  if (opts?.mockAttemptId) params.set("mock_attempt", opts.mockAttemptId);
  const q = params.toString();
  return q ? `${base}?${q}` : base;
}

export function mockCheckpointPath(
  slugOrId: string,
  opts: { mockAttemptId: string; attempt: string; from?: "reading" | "listening" },
): string {
  const slug = canonicalMockSlug(slugOrId);
  const params = new URLSearchParams({
    mock_attempt: opts.mockAttemptId,
    attempt: opts.attempt,
  });
  if (opts.from) params.set("from", opts.from);
  return `/mock/${slug}/checkpoint?${params.toString()}`;
}

export function mockResultsPath(slugOrId: string, mockAttemptId: string): string {
  const slug = canonicalMockSlug(slugOrId);
  const params = new URLSearchParams({ mock_attempt: mockAttemptId });
  return `/mock/${slug}/results?${params.toString()}`;
}

/** Listening parts included in Test 1 flow. */
export const TEST1_LISTENING_PART_COUNT = 4;

/** Reading passages in Test 1 quick flow. */
export const TEST1_READING_PASSAGE_COUNT = 2;

/** Writing tasks in Test 1 quick flow. */
export const TEST1_WRITING_TASK_COUNT = 2;

/**
 * Where to go after finishing a section inside a full mock (Test 1).
 * Listening parts 1–3 → next part; part 4 → Reading passage 1;
 * Reading passages 1–3 → next passage; passage 4 → /scores.
 */
export function mockAfterSectionSubmitPath(
  slugOrId: string,
  mockAttemptId: string,
  completedModule: "reading" | "listening",
  opts?: {
    nextPart?: number;
    completedPart?: number;
    attemptId?: string;
  },
): string {
  const appendSectionStart = (path: string) => {
    const sep = path.includes("?") ? "&" : "?";
    return `${path}${sep}section_start=1`;
  };

  if (completedModule === "listening") {
    const finishedPart = opts?.completedPart ?? TEST1_LISTENING_PART_COUNT;
    if (finishedPart < TEST1_LISTENING_PART_COUNT) {
      return appendSectionStart(
        mockModulePath(slugOrId, "listening", {
          part: finishedPart + 1,
          mockAttemptId,
          auto: true,
        }),
      );
    }
    return appendSectionStart(
      mockModulePath(slugOrId, "reading", {
        passage: opts?.nextPart ?? 1,
        mockAttemptId,
        auto: true,
      }),
    );
  }

  const finishedPassage = opts?.completedPart ?? TEST1_READING_PASSAGE_COUNT;
  if (finishedPassage < TEST1_READING_PASSAGE_COUNT) {
    return appendSectionStart(
      mockModulePath(slugOrId, "reading", {
        passage: finishedPassage + 1,
        mockAttemptId,
        auto: true,
      }),
    );
  }
  return appendSectionStart(
    mockModulePath(slugOrId, "writing", {
      part: 1,
      mockAttemptId,
      auto: true,
    }),
  );
}

/** After a writing task submit inside a full mock. */
export function mockAfterWritingSubmitPath(
  slugOrId: string,
  mockAttemptId: string,
  completedPart: number,
  progress: {
    status?: string;
    next_module?: string | null;
    next_part?: number | null;
  },
  attemptId: string,
): string {
  if (progress.status === "completed") {
    return mockResultsPath(slugOrId, mockAttemptId);
  }
  if (
    progress.next_module === "writing" &&
    progress.next_part === 2 &&
    completedPart === 1 &&
    TEST1_WRITING_TASK_COUNT > 1
  ) {
    const path = mockModulePath(slugOrId, "writing", {
      part: 2,
      mockAttemptId,
      auto: true,
    });
    const sep = path.includes("?") ? "&" : "?";
    return `${path}${sep}section_start=1`;
  }
  const slug = canonicalMockSlug(slugOrId);
  const params = new URLSearchParams({ mock_attempt: mockAttemptId });
  return `/test/writing/results/${encodeURIComponent(attemptId)}?${params.toString()}`;
}

/** Navigate after submit using orchestrator progress (respects listening → reading order). */
export function mockPathFromProgress(
  slugOrId: string,
  mockAttemptId: string,
  progress: {
    status?: string;
    next_module?: string | null;
    next_part?: number | null;
  },
  attemptId?: string,
): string {
  if (progress.status === "completed") {
    if (attemptId) {
      return scoresAfterMockCompletePath(attemptId);
    }
    return mockResultsPath(slugOrId, mockAttemptId);
  }
  const mod = progress.next_module;
  if (mod === "listening" || mod === "reading" || mod === "writing") {
    const path = mockModulePath(slugOrId, mod, {
      part:
        mod === "listening" || mod === "writing"
          ? (progress.next_part ?? 1)
          : undefined,
      passage: mod === "reading" ? (progress.next_part ?? 1) : undefined,
      mockAttemptId,
      auto: true,
    });
    const sep = path.includes("?") ? "&" : "?";
    return `${path}${sep}section_start=1`;
  }
  return mockHubPath(slugOrId);
}

/** Route to open right after POST /api/mock-attempts (start / new attempt). */
export function examPathForMockStart(
  slugOrId: string,
  res: {
    mock_attempt_id: string;
    current_module: string;
    part?: number | null;
  },
): string {
  const raw = res.current_module;
  const mod: MockModule =
    raw === "reading" || raw === "writing" || raw === "listening"
      ? raw
      : "listening";
  const path = mockModulePath(slugOrId, mod, {
    part: mod === "listening" || mod === "writing" ? (res.part ?? 1) : undefined,
    passage: mod === "reading" ? (res.part ?? 1) : undefined,
    mockAttemptId: res.mock_attempt_id,
    auto: true,
  });
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}section_start=1`;
}

/** If the user is on the wrong section URL, return the correct exam path. */
export function examRedirectIfMismatch(
  slugOrId: string,
  mockAttemptId: string,
  current: { module: "reading" | "listening" | "writing"; part: number },
  progress: {
    status?: string;
    next_module?: string | null;
    next_part?: number | null;
  },
): string | null {
  if (progress.status === "completed") {
    return mockResultsPath(slugOrId, mockAttemptId);
  }
  const expectedMod = progress.next_module;
  if (
    expectedMod !== "reading" &&
    expectedMod !== "listening" &&
    expectedMod !== "writing"
  ) {
    return null;
  }
  const expectedPart = progress.next_part ?? 1;
  if (expectedMod === current.module && expectedPart === current.part) {
    return null;
  }
  return mockPathFromProgress(slugOrId, mockAttemptId, {
    next_module: expectedMod,
    next_part: expectedPart,
  });
}

/** Resolved UUID for API calls from route slug or id. */
export function mockApiId(slugOrId: string): string {
  return resolveMockId(slugOrId);
}

export const DEFAULT_MOCK_TEST_ID = M01_MOCK_TEST_ID;

/** User-facing label (UI only; routes/API stay mock/m01). */
export const MOCK_DISPLAY_LABEL = "Test 1";
export const MOCK_DISPLAY_SUBTITLE =
  "Test 1 — Listening (Parts 1-4 · 30 min) → Reading (Passages 1-2 · 60 min) → Writing (Tasks 1-2 · 60 min) → Score";
export const MOCK_DISPLAY_FLOW_HINT =
  "Listening has 4 parts · reading has 2 passages · writing has 2 tasks · submit each section to unlock the next · overall band on results";

/** Per-section limits for Test 1 (matches MODULE_LIVE_PARTS). */
export const TEST1_LISTENING_MINUTES = 30;
export const TEST1_READING_MINUTES = 30;
export const TEST1_WRITING_MINUTES = 60;
export const TEST1_TOTAL_MINUTES =
  TEST1_LISTENING_MINUTES + TEST1_READING_MINUTES + TEST1_WRITING_MINUTES;
