/**
 * Staging API URL safety (keep in sync with lib/api.ts).
 */
import assert from "node:assert/strict";
import test from "node:test";

const LEGACY_RAILWAY_API_HOSTS = new Set([
  "bandforge-api-production-6b30.up.railway.app",
  "adequate-surprise-production-0f84.up.railway.app",
  "adequate-surprise-production-96bc.up.railway.app",
]);

const DEFAULT_RAILWAY_API_URL =
  "https://backend-production-a813.up.railway.app";
const PRODUCTION_RAILWAY_API_HOST = "backend-production-a813.up.railway.app";

function stripTrailingSlash(url) {
  return url.replace(/\/$/, "");
}

function isStagingAppEnv(env) {
  return (env.NEXT_PUBLIC_APP_ENV || "").trim().toLowerCase() === "staging";
}

function hostnameOf(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function isProductionRailwayHost(host) {
  return (
    host === PRODUCTION_RAILWAY_API_HOST || LEGACY_RAILWAY_API_HOSTS.has(host)
  );
}

function normalizeApiUrl(url, env) {
  if (!url) return url;
  const host = hostnameOf(url);
  if (isStagingAppEnv(env) && isProductionRailwayHost(host)) {
    throw new Error(
      `Staging refuses production Railway API host (${host}).`,
    );
  }
  if (LEGACY_RAILWAY_API_HOSTS.has(host)) {
    if (isStagingAppEnv(env)) {
      throw new Error("Staging must not rewrite legacy Railway hosts");
    }
    return DEFAULT_RAILWAY_API_URL;
  }
  return stripTrailingSlash(url);
}

function getApiUrl(env) {
  const publicUrl = env.NEXT_PUBLIC_API_URL
    ? stripTrailingSlash(env.NEXT_PUBLIC_API_URL)
    : "";
  const apiUrl = env.API_URL ? stripTrailingSlash(env.API_URL) : "";

  if (isStagingAppEnv(env)) {
    const resolved = normalizeApiUrl(apiUrl || publicUrl || "", env);
    if (!resolved) {
      throw new Error(
        "Staging requires API_URL or NEXT_PUBLIC_API_URL (staging Railway).",
      );
    }
    return resolved;
  }

  if (env.VERCEL === "1") {
    if (apiUrl) return normalizeApiUrl(apiUrl, env);
    if (publicUrl) return normalizeApiUrl(publicUrl, env);
    return normalizeApiUrl(DEFAULT_RAILWAY_API_URL, env);
  }

  return normalizeApiUrl(apiUrl || publicUrl || "http://127.0.0.1:8000", env);
}

test("production Vercel still falls back to DEFAULT_RAILWAY_API_URL", () => {
  assert.equal(
    getApiUrl({ VERCEL: "1" }),
    DEFAULT_RAILWAY_API_URL,
  );
});

test("production Vercel respects explicit API_URL", () => {
  assert.equal(
    getApiUrl({
      VERCEL: "1",
      API_URL: "https://backend-production-a813.up.railway.app",
    }),
    "https://backend-production-a813.up.railway.app",
  );
});

test("staging refuses missing API URL (no production fallback)", () => {
  assert.throws(
    () => getApiUrl({ NEXT_PUBLIC_APP_ENV: "staging", VERCEL: "1" }),
    /Staging requires API_URL/,
  );
});

test("staging refuses production Railway host", () => {
  assert.throws(
    () =>
      getApiUrl({
        NEXT_PUBLIC_APP_ENV: "staging",
        API_URL: `https://${PRODUCTION_RAILWAY_API_HOST}`,
      }),
    /Staging refuses production Railway/,
  );
});

test("staging accepts dedicated staging API host", () => {
  assert.equal(
    getApiUrl({
      NEXT_PUBLIC_APP_ENV: "staging",
      API_URL: "https://bandforge-api-staging.up.railway.app",
      NEXT_PUBLIC_API_URL: "https://bandforge-api-staging.up.railway.app",
    }),
    "https://bandforge-api-staging.up.railway.app",
  );
});
