import type {
  DashboardSummary,
  MockTestSummary,
} from "@/components/bandforge/dashboard/types";
import { fetchWithTimeout } from "@/lib/fetch-server";
import { isAuthEnabled } from "@/lib/flags";

const EMPTY_SUMMARY: DashboardSummary = {
  stats: {
    total_attempts: 0,
    completed_attempts: 0,
    in_progress_attempts: 0,
    average_band: null,
    best_band: null,
    last_activity_at: null,
  },
  in_progress: [],
  recent: [],
};

function backendBase(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    "http://localhost:8000"
  );
}

/** Avoid waiting on 401s when auth is disabled for local UI work. */
export function shouldFetchDashboardApi(cookieHeader: string): boolean {
  if (!isAuthEnabled()) return false;
  return cookieHeader.trim().length > 0;
}

async function getMockTests(cookieHeader: string): Promise<MockTestSummary[]> {
  if (!shouldFetchDashboardApi(cookieHeader)) return [];
  try {
    const res = await fetchWithTimeout(`${backendBase()}/api/tests/mock-tests`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = (await res.json()) as MockTestSummary[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function getSummary(cookieHeader: string): Promise<DashboardSummary> {
  if (!shouldFetchDashboardApi(cookieHeader)) return EMPTY_SUMMARY;
  try {
    const res = await fetchWithTimeout(`${backendBase()}/api/dashboard/summary`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
    if (!res.ok) return EMPTY_SUMMARY;
    const data = (await res.json()) as DashboardSummary;
    return data ?? EMPTY_SUMMARY;
  } catch {
    return EMPTY_SUMMARY;
  }
}

export type DashboardPayload = {
  mockTests: MockTestSummary[];
  summary: DashboardSummary;
};

export async function fetchDashboardPayload(
  cookieHeader: string,
): Promise<DashboardPayload> {
  const [mockTests, summary] = await Promise.all([
    getMockTests(cookieHeader),
    getSummary(cookieHeader),
  ]);
  return { mockTests, summary };
}
