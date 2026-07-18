import { getApiUrl } from "@/lib/api";
import type { DiagnosticLatest } from "@/lib/diagnostic-latest-types";
import { fetchWithTimeout } from "@/lib/fetch-server";
import { isAuthEnabled } from "@/lib/flags";
import { serverAuthHeaders } from "@/lib/server-auth-headers";

const FETCH_MS = 10_000;

export async function fetchDiagnosticLatest(
  cookieHeader: string,
): Promise<DiagnosticLatest | null> {
  if (!isAuthEnabled() || !cookieHeader.trim()) return null;
  try {
    const res = await fetchWithTimeout(`${getApiUrl()}/api/diagnostic/latest`, {
      headers: serverAuthHeaders(cookieHeader),
      cache: "no-store",
      timeoutMs: FETCH_MS,
    });
    if (!res.ok) return null;
    return (await res.json()) as DiagnosticLatest;
  } catch {
    return null;
  }
}
