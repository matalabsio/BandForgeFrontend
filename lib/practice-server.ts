import { getApiUrl } from "@/lib/api";
import { fetchWithTimeout } from "@/lib/fetch-server";
import { isAuthEnabled } from "@/lib/flags";
import type { MockUnlock, PracticeHub, PracticeHubDetail } from "@/lib/practice-types";
import { serverAuthHeaders } from "@/lib/server-auth-headers";

/** Skill-pack hubs hit Supabase per-hub; local/prod often exceeds 10s. */
const FETCH_MS = 45_000;

export async function fetchPracticeHubs(
  cookieHeader: string,
  skill: string,
): Promise<PracticeHub[] | null> {
  if (!isAuthEnabled() || !cookieHeader.trim()) return null;
  try {
    const res = await fetchWithTimeout(
      `${getApiUrl()}/api/practice/hubs?skill=${encodeURIComponent(skill)}`,
      {
        headers: serverAuthHeaders(cookieHeader),
        cache: "no-store",
        timeoutMs: FETCH_MS,
      },
    );
    if (!res.ok) return null;
    return (await res.json()) as PracticeHub[];
  } catch {
    return null;
  }
}

/** Status-aware hubs fetch for Writing Skill track gating. */
export async function fetchPracticeHubsStatus(
  cookieHeader: string,
  skill: string,
): Promise<
  | { status: "ok"; hubs: PracticeHub[] }
  | { status: "needs_track" }
  | { status: "forbidden" }
  | { status: "error" }
> {
  if (!isAuthEnabled() || !cookieHeader.trim()) return { status: "error" };
  try {
    const res = await fetchWithTimeout(
      `${getApiUrl()}/api/practice/hubs?skill=${encodeURIComponent(skill)}`,
      {
        headers: serverAuthHeaders(cookieHeader),
        cache: "no-store",
        timeoutMs: FETCH_MS,
      },
    );
    if (res.status === 409) {
      const body = (await res.json().catch(() => null)) as {
        detail?: string;
      } | null;
      const detail =
        typeof body?.detail === "string"
          ? body.detail
          : JSON.stringify(body?.detail ?? "");
      if (/exam_module/i.test(detail)) return { status: "needs_track" };
      return { status: "error" };
    }
    if (res.status === 403) return { status: "forbidden" };
    if (!res.ok) return { status: "error" };
    return { status: "ok", hubs: (await res.json()) as PracticeHub[] };
  } catch {
    return { status: "error" };
  }
}

export async function fetchMockUnlock(
  cookieHeader: string,
  skill: string,
): Promise<MockUnlock | null> {
  if (!isAuthEnabled() || !cookieHeader.trim()) return null;
  try {
    const res = await fetchWithTimeout(
      `${getApiUrl()}/api/practice/mock-unlock?skill=${encodeURIComponent(skill)}`,
      {
        headers: serverAuthHeaders(cookieHeader),
        cache: "no-store",
        timeoutMs: FETCH_MS,
      },
    );
    if (!res.ok) return null;
    return (await res.json()) as MockUnlock;
  } catch {
    return null;
  }
}

export async function fetchPracticeHub(
  cookieHeader: string,
  hubId: string,
): Promise<PracticeHubDetail | null> {
  if (!isAuthEnabled() || !cookieHeader.trim()) return null;
  try {
    const res = await fetchWithTimeout(
      `${getApiUrl()}/api/practice/hubs/${encodeURIComponent(hubId)}`,
      {
        headers: serverAuthHeaders(cookieHeader),
        cache: "no-store",
        timeoutMs: FETCH_MS,
      },
    );
    if (res.status === 403) {
      const err = new Error("HUB_LOCKED");
      (err as Error & { code?: string }).code = "HUB_LOCKED";
      throw err;
    }
    if (!res.ok) return null;
    return (await res.json()) as PracticeHubDetail;
  } catch (e) {
    if (e instanceof Error && (e as Error & { code?: string }).code === "HUB_LOCKED") {
      throw e;
    }
    return null;
  }
}

export function isHubLockedError(error: unknown): boolean {
  return (
    error instanceof Error &&
    ((error as Error & { code?: string }).code === "HUB_LOCKED" ||
      error.message === "HUB_LOCKED")
  );
}
