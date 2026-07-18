import { getApiUrl } from "@/lib/api";
import { fetchWithTimeout } from "@/lib/fetch-server";
import { isAuthEnabled } from "@/lib/flags";
import type { MockUnlock, PracticeHub, PracticeHubDetail } from "@/lib/practice-types";
import { serverAuthHeaders } from "@/lib/server-auth-headers";

const FETCH_MS = 10_000;

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
    if (!res.ok) return null;
    return (await res.json()) as PracticeHubDetail;
  } catch {
    return null;
  }
}
