function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

/** Retired Railway hosts — older Vercel builds may still bake these. */
const LEGACY_RAILWAY_API_HOSTS = new Set([
  "bandforge-api-production-6b30.up.railway.app",
  "adequate-surprise-production-0f84.up.railway.app",
  "adequate-surprise-production-96bc.up.railway.app",
]);

/** Current production Railway API. Production-only fallback — never for staging. */
export const DEFAULT_RAILWAY_API_URL =
  "https://backend-production-a813.up.railway.app";

export const PRODUCTION_RAILWAY_API_HOST = "backend-production-a813.up.railway.app";

/** Explicit staging marker — set on the staging Vercel project / Preview env. */
export function isStagingAppEnv(): boolean {
  return (process.env.NEXT_PUBLIC_APP_ENV || "").trim().toLowerCase() === "staging";
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function isProductionRailwayHost(host: string): boolean {
  return (
    host === PRODUCTION_RAILWAY_API_HOST || LEGACY_RAILWAY_API_HOSTS.has(host)
  );
}

function normalizeApiUrl(url: string): string {
  if (!url) return url;
  try {
    const host = hostnameOf(url);
    if (isStagingAppEnv() && isProductionRailwayHost(host)) {
      throw new Error(
        `Staging refuses production Railway API host (${host}). ` +
          "Set API_URL / NEXT_PUBLIC_API_URL to the staging Railway service.",
      );
    }
    if (LEGACY_RAILWAY_API_HOSTS.has(host)) {
      if (isStagingAppEnv()) {
        throw new Error(
          "Staging must not rewrite legacy Railway hosts to production. " +
            "Set API_URL to the staging API host explicitly.",
        );
      }
      return DEFAULT_RAILWAY_API_URL;
    }
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("Staging")) {
      throw err;
    }
  }
  return stripTrailingSlash(url);
}

function isLocalhostUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return false;
  }
}

/** Warn/fail fast when Vercel deploys without a reachable Railway API URL. */
export function isApiUrlConfiguredForVercel(): { ok: true } | { ok: false; detail: string } {
  if (process.env.VERCEL !== "1") {
    return { ok: true };
  }

  try {
    const resolved = normalizeApiUrl(
      process.env.API_URL?.trim() ||
        process.env.NEXT_PUBLIC_API_URL?.trim() ||
        "",
    );

    if (!resolved) {
      return {
        ok: false,
        detail: isStagingAppEnv()
          ? "Staging requires API_URL / NEXT_PUBLIC_API_URL pointing at the staging Railway API (no production fallback)."
          : "API_URL / NEXT_PUBLIC_API_URL is missing on Vercel. Set API_URL to your Railway URL (works without redeploy).",
      };
    }

    if (isLocalhostUrl(resolved)) {
      return {
        ok: false,
        detail:
          "API URL points at localhost on Vercel. Set API_URL to your Railway public URL.",
      };
    }

    if (isStagingAppEnv() && isProductionRailwayHost(hostnameOf(resolved))) {
      return {
        ok: false,
        detail:
          "Staging NEXT_PUBLIC_APP_ENV=staging must not use the production Railway API.",
      };
    }

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      detail: err instanceof Error ? err.message : "Invalid API URL configuration.",
    };
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

  if (isStagingAppEnv()) {
    const resolved = normalizeApiUrl(apiUrl || publicUrl || "");
    if (!resolved) {
      throw new Error(
        "Staging requires API_URL or NEXT_PUBLIC_API_URL (staging Railway). " +
          "Refusing silent fallback to production.",
      );
    }
    return resolved;
  }

  if (process.env.VERCEL === "1") {
    // API_URL is runtime on Vercel — prefer it over baked NEXT_PUBLIC_* (fixes without redeploy).
    if (apiUrl && !isLocalhostUrl(apiUrl)) return normalizeApiUrl(apiUrl);
    if (publicUrl) return normalizeApiUrl(publicUrl);
    return normalizeApiUrl(DEFAULT_RAILWAY_API_URL);
  }

  return normalizeApiUrl(apiUrl || publicUrl || "http://127.0.0.1:8000");
}

/** Same as getApiUrl but throws on misconfigured Vercel deploys (server routes). */
export function requireApiUrl(): string {
  const config = isApiUrlConfiguredForVercel();
  if (!config.ok) {
    throw new Error(config.detail);
  }
  return getApiUrl();
}

export type ApiErrorBody = {
  detail?: string | { msg?: string }[] | { message?: string };
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
  if (
    body.detail &&
    typeof body.detail === "object" &&
    !Array.isArray(body.detail) &&
    "message" in body.detail &&
    typeof (body.detail as { message?: unknown }).message === "string"
  ) {
    return (body.detail as { message: string }).message;
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
  if (message.toLowerCase().includes("subscription")) {
    return message;
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
