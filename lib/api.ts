function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

function isLocalhostUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return false;
  }
}

/** Backend base URL — single resolver for BFF proxies and server fetches. */
export function getApiUrl(): string {
  const publicUrl = process.env.NEXT_PUBLIC_API_URL
    ? stripTrailingSlash(process.env.NEXT_PUBLIC_API_URL)
    : "";
  const apiUrl = process.env.API_URL
    ? stripTrailingSlash(process.env.API_URL)
    : "";

  if (process.env.VERCEL === "1") {
    if (publicUrl) return publicUrl;
    if (apiUrl && !isLocalhostUrl(apiUrl)) return apiUrl;
    return publicUrl || "http://127.0.0.1:8000";
  }

  return apiUrl || publicUrl || "http://127.0.0.1:8000";
}

export type ApiErrorBody = {
  detail?: string | { msg?: string }[];
  error?: string;
  message?: string;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function parseApiError(body: ApiErrorBody, status: number): string {
  if (typeof body.detail === "string") return body.detail;
  if (Array.isArray(body.detail) && body.detail[0]?.msg) {
    return body.detail[0].msg;
  }
  const fallback = body.error ?? body.message ?? `Request failed (${status})`;
  if (status === 500 && fallback === "Internal Server Error") {
    return (
      "Could not complete the request. Check that the backend is running and " +
      "Supabase migrations are applied (mock_attempts, mock_test_modules)."
    );
  }
  return fallback;
}

export function formatMockStartError(message: string): string {
  if (message === "Internal Server Error") {
    return (
      "Could not start Test 1. Check backend logs and apply Supabase migrations " +
      "(20260526100000_mock_attempts_orchestration.sql, 20260526100100_m01_consolidation.sql)."
    );
  }
  if (message.includes("complete") && message.toLowerCase().includes("retake")) {
    return "This test run is finished. Use “New attempt” on the dashboard to take it again.";
  }
  return message;
}

export async function parseJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    // FastAPI may return plain text on unhandled 500s (e.g. "Internal Server Error")
    return { detail: text } as T;
  }
}
