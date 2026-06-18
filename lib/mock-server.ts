import type { MockCatalogApiItem } from "@/lib/mock-catalog-api";
import type { MockMeta } from "@/lib/mock-catalog";
import { resolveMockMetaFromCatalog } from "@/lib/mock-catalog";
import type { MockAttemptProgress, MockAttemptSummary } from "@/modules/mock/services/mock-api";
import { fetchWithTimeout } from "@/lib/fetch-server";
import { perfLog } from "@/lib/performance";
import { serverAuthHeaders } from "@/lib/server-auth-headers";

function backendBase(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    "http://localhost:8000"
  );
}

async function fetchBackendJson<T>(
  path: string,
  cookieHeader: string,
  fallback: T,
): Promise<T> {
  const started = performance.now();
  try {
    const res = await fetchWithTimeout(`${backendBase()}${path}`, {
      headers: serverAuthHeaders(cookieHeader),
      cache: "no-store",
      timeoutMs: 6_000,
    });
    perfLog("server-fetch", {
      path,
      duration_ms: Math.round(performance.now() - started),
      ok: res.ok,
      status: res.status,
    });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    perfLog("server-fetch", {
      path,
      duration_ms: Math.round(performance.now() - started),
      ok: false,
      status: 0,
    });
    return fallback;
  }
}

export async function fetchMockCatalogServer(
  cookieHeader: string,
): Promise<MockCatalogApiItem[]> {
  return fetchBackendJson<MockCatalogApiItem[]>(
    "/api/mock-attempts/catalog",
    cookieHeader,
    [],
  );
}

export async function resolveMockMetaServer(
  cookieHeader: string,
  slugOrId: string,
): Promise<MockMeta> {
  const catalog = await fetchMockCatalogServer(cookieHeader);
  return resolveMockMetaFromCatalog(catalog, slugOrId);
}

export async function fetchMockSessionServer(
  cookieHeader: string,
  mockTestId: string,
): Promise<MockAttemptProgress | null> {
  return fetchBackendJson<MockAttemptProgress | null>(
    `/api/mock-attempts/session?mock_test_id=${encodeURIComponent(mockTestId)}`,
    cookieHeader,
    null,
  );
}

export async function fetchMockSummaryServer(
  cookieHeader: string,
  mockAttemptId: string,
): Promise<MockAttemptSummary | null> {
  return fetchBackendJson<MockAttemptSummary | null>(
    `/api/mock-attempts/${encodeURIComponent(mockAttemptId)}/summary`,
    cookieHeader,
    null,
  );
}

export type ListeningBootServer = {
  attempt_id: string;
  started_at: string;
  server_time: string;
  status: string;
  duration_seconds: number;
  resumed: boolean;
  test?: { id: string; title: string; description?: string | null };
  parts?: Array<{
    part: number;
    title: string;
    context: string;
    common_question_type: string;
    questions: unknown[];
  }>;
};

export async function fetchListeningBootServer(
  cookieHeader: string,
  mockTestId: string,
  part: number,
  mockAttemptId: string,
): Promise<ListeningBootServer | null> {
  const q = new URLSearchParams({
    part: String(part),
    mock_attempt_id: mockAttemptId,
    include_questions: "true",
  });
  try {
    const res = await fetchWithTimeout(
      `${backendBase()}/api/listening/${encodeURIComponent(mockTestId)}/start?${q}`,
      {
        method: "POST",
        headers: serverAuthHeaders(cookieHeader),
        cache: "no-store",
        timeoutMs: 8_000,
      },
    );
    if (!res.ok) return null;
    return (await res.json()) as ListeningBootServer;
  } catch {
    return null;
  }
}

export type ReadingBootServer = {
  attempt_id: string;
  started_at: string;
  server_time: string;
  status: string;
  duration_seconds: number;
  resumed: boolean;
  passage_text?: string | null;
  questions?: unknown[];
  test?: { id: string; title: string; description?: string | null };
};

export async function fetchReadingBootServer(
  cookieHeader: string,
  mockTestId: string,
  passage: number,
  mockAttemptId: string,
): Promise<ReadingBootServer | null> {
  const q = new URLSearchParams({
    passage: String(passage),
    mock_attempt_id: mockAttemptId,
    include_questions: "true",
  });
  try {
    const res = await fetchWithTimeout(
      `${backendBase()}/api/reading/${encodeURIComponent(mockTestId)}/start?${q}`,
      {
        method: "POST",
        headers: serverAuthHeaders(cookieHeader),
        cache: "no-store",
        timeoutMs: 8_000,
      },
    );
    if (!res.ok) return null;
    return (await res.json()) as ReadingBootServer;
  } catch {
    return null;
  }
}

export type WritingBootServer = {
  attempt_id: string;
  started_at: string;
  server_time: string;
  status: string;
  part: number;
  duration_seconds: number;
  resumed: boolean;
  task?: unknown;
  saved_answer?: string | null;
  test?: { id: string; title: string; description?: string | null };
};

export async function fetchWritingBootServer(
  cookieHeader: string,
  mockTestId: string,
  part: number,
  mockAttemptId: string,
): Promise<WritingBootServer | null> {
  const q = new URLSearchParams({
    part: String(part),
    mock_attempt_id: mockAttemptId,
  });
  try {
    const res = await fetchWithTimeout(
      `${backendBase()}/api/writing/${encodeURIComponent(mockTestId)}/start?${q}`,
      {
        method: "POST",
        headers: serverAuthHeaders(cookieHeader),
        cache: "no-store",
        timeoutMs: 8_000,
      },
    );
    if (!res.ok) return null;
    return (await res.json()) as WritingBootServer;
  } catch {
    return null;
  }
}
