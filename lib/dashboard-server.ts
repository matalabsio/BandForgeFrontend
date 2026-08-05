import { getApiUrl } from "@/lib/api";
import type {
  DashboardSummary,
  MockTestSummary,
} from "@/components/bandforge/dashboard/types";
import { resolveDashboardMockTests } from "@/lib/dashboard-mock-fallback";
import { fetchWithTimeout } from "@/lib/fetch-server";
import { serverAuthHeaders } from "@/lib/server-auth-headers";

const DASHBOARD_FETCH_MS = 8_000;
const DASHBOARD_FETCH_RETRIES = 1;
import { isAuthEnabled } from "@/lib/flags";

const EMPTY_SUMMARY: DashboardSummary = {
  stats: {
    total_attempts: 0,
    completed_attempts: 0,
    in_progress_attempts: 0,
    average_band: null,
    best_band: null,
    last_activity_at: null,
    current_streak: 0,
    longest_streak: 0,
  },
  in_progress: [],
  recent: [],
  activity_days: [],
  completed_mock_count: 0,
  latest_mock: null,
};
const memCache = new Map<string, { expiresAt: number; value: unknown }>();

function getMemCached<T>(key: string): T | null {
  const hit = memCache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    memCache.delete(key);
    return null;
  }
  return hit.value as T;
}

function setMemCached<T>(key: string, value: T, ttlMs: number): void {
  memCache.set(key, { expiresAt: Date.now() + ttlMs, value });
}

/** Avoid waiting on 401s when auth is disabled for local UI work. */
export function shouldFetchDashboardApi(cookieHeader: string): boolean {
  if (!isAuthEnabled()) return false;
  return cookieHeader.trim().length > 0;
}

async function fetchDashboardJson<T>(
  url: string,
  cookieHeader: string,
  fallback: T,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= DASHBOARD_FETCH_RETRIES; attempt++) {
    try {
      const res = await fetchWithTimeout(url, {
        headers: serverAuthHeaders(cookieHeader),
        cache: "no-store",
        timeoutMs: DASHBOARD_FETCH_MS,
      });
      if (!res.ok) {
        lastError = new Error(`HTTP ${res.status}`);
        continue;
      }
      return (await res.json()) as T;
    } catch (err) {
      lastError = err;
    }
  }
  if (process.env.NODE_ENV === "development" && lastError) {
    console.warn(`[dashboard] ${url} failed:`, lastError);
  }
  return fallback;
}

async function getSummary(cookieHeader: string): Promise<DashboardSummary> {
  if (!shouldFetchDashboardApi(cookieHeader)) return EMPTY_SUMMARY;
  const key = `dashboard:summary:${cookieHeader}`;
  const cached = getMemCached<DashboardSummary>(key);
  if (cached) return cached;
  const data = await fetchDashboardJson<DashboardSummary>(
    `${getApiUrl()}/api/dashboard/summary`,
    cookieHeader,
    EMPTY_SUMMARY,
  );
  const value = data ?? EMPTY_SUMMARY;
  setMemCached(key, value, 20_000);
  return value;
}

export type DashboardPayload = {
  mockTests: MockTestSummary[];
  /** True when /api/tests/mock-tests returned at least one row. */
  mockTestsFromApi: boolean;
  summary: DashboardSummary;
};

async function getMockTestsRaw(cookieHeader: string): Promise<MockTestSummary[]> {
  if (!shouldFetchDashboardApi(cookieHeader)) return [];
  const key = `dashboard:mock-tests:${cookieHeader}`;
  const cached = getMemCached<MockTestSummary[]>(key);
  if (cached) return cached;
  const data = await fetchDashboardJson<MockTestSummary[]>(
    `${getApiUrl()}/api/tests/mock-tests`,
    cookieHeader,
    [],
  );
  const value = Array.isArray(data) ? data : [];
  setMemCached(key, value, 45_000);
  return value;
}

export async function fetchDashboardPayload(
  cookieHeader: string,
): Promise<DashboardPayload> {
  const [rawMockTests, summary] = await Promise.all([
    getMockTestsRaw(cookieHeader),
    getSummary(cookieHeader),
  ]);
  return {
    mockTests: resolveDashboardMockTests(rawMockTests),
    mockTestsFromApi: rawMockTests.length > 0,
    summary,
  };
}

export async function fetchDashboardSummary(
  cookieHeader: string,
): Promise<DashboardSummary> {
  return getSummary(cookieHeader);
}

export type DashboardStreak = {
  current_streak: number;
  longest_streak: number;
  activity_days?: Array<{ date: string; count: number }>;
  week_active_days?: number;
};

const EMPTY_STREAK: DashboardStreak = {
  current_streak: 0,
  longest_streak: 0,
  activity_days: [],
  week_active_days: 0,
};

const STREAK_FETCH_MS = 4_000;

export async function fetchDashboardStreak(
  cookieHeader: string,
): Promise<DashboardStreak> {
  if (!shouldFetchDashboardApi(cookieHeader)) return EMPTY_STREAK;
  const key = `dashboard:streak:${cookieHeader}`;
  const cached = getMemCached<DashboardStreak>(key);
  if (cached) return cached;

  let lastError: unknown;
  for (let attempt = 0; attempt <= DASHBOARD_FETCH_RETRIES; attempt++) {
    try {
      const res = await fetchWithTimeout(
        `${getApiUrl()}/api/dashboard/streak`,
        {
          headers: serverAuthHeaders(cookieHeader),
          cache: "no-store",
          timeoutMs: STREAK_FETCH_MS,
        },
      );
      if (!res.ok) {
        lastError = new Error(`HTTP ${res.status}`);
        continue;
      }
      const data = (await res.json()) as DashboardStreak;
      const value = {
        current_streak: Number(data?.current_streak) || 0,
        longest_streak: Number(data?.longest_streak) || 0,
        activity_days: Array.isArray(data?.activity_days)
          ? data.activity_days
          : [],
        week_active_days: Number(data?.week_active_days) || 0,
      };
      setMemCached(key, value, 30_000);
      return value;
    } catch (err) {
      lastError = err;
    }
  }
  if (process.env.NODE_ENV === "development" && lastError) {
    console.warn(`[dashboard] streak failed:`, lastError);
  }
  return EMPTY_STREAK;
}
