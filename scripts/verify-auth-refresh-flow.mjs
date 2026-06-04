#!/usr/bin/env node
/**
 * Smoke test: expired access token + Next proxy refresh + retry.
 *
 * Prereqs:
 *   - backend/.env.local: ACCESS_TOKEN_EXPIRE_MINUTES=1 (restart backend)
 *   - backend :8000, frontend :3000, NEXT_PUBLIC_AUTH_ENABLED=true
 *   - TEST_EMAIL, TEST_PASSWORD
 *
 * Usage:
 *   TEST_EMAIL=... TEST_PASSWORD=... node scripts/verify-auth-refresh-flow.mjs
 */

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(
  /\/$/,
  "",
);
const WEB = (process.env.FRONTEND_URL || "http://localhost:3000").replace(
  /\/$/,
  "",
);
const M01 = "a0000000-0000-4000-8000-000000000001";
const WAIT_MS = Number(process.env.AUTH_TEST_WAIT_MS || 75_000);

const email = process.env.TEST_EMAIL;
const password = process.env.TEST_PASSWORD;

if (!email || !password) {
  console.error(
    "Set TEST_EMAIL and TEST_PASSWORD, then restart backend with ACCESS_TOKEN_EXPIRE_MINUTES=1",
  );
  process.exit(1);
}

function parseCookies(setCookieHeaders) {
  const jar = new Map();
  for (const raw of setCookieHeaders) {
    const part = raw.split(";")[0]?.trim();
    if (!part) continue;
    const eq = part.indexOf("=");
    if (eq <= 0) continue;
    jar.set(part.slice(0, eq), part.slice(eq + 1));
  }
  return jar;
}

function cookieHeader(jar) {
  return Array.from(jar.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

function jwtExp(token) {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString(),
    );
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log("1. Login…");
  const loginRes = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!loginRes.ok) {
    console.error("Login failed:", loginRes.status, await loginRes.text());
    process.exit(1);
  }

  const setCookies =
    typeof loginRes.headers.getSetCookie === "function"
      ? loginRes.headers.getSetCookie()
      : loginRes.headers.get("set-cookie")
        ? [loginRes.headers.get("set-cookie")]
        : [];
  const jar = parseCookies(setCookies);
  const access = jar.get("bf_access");
  if (!access) {
    console.error("No bf_access cookie from login");
    process.exit(1);
  }

  const exp = jwtExp(access);
  const ttlSec = exp ? exp - Math.floor(Date.now() / 1000) : null;
  console.log(`   Access token TTL ~${ttlSec ?? "?"}s (expect ~60 with ACCESS_TOKEN_EXPIRE_MINUTES=1)`);

  console.log(`2. Wait ${WAIT_MS / 1000}s for access expiry…`);
  await sleep(WAIT_MS);

  const cookies = cookieHeader(jar);
  console.log("3. Backend /auth/me (expect 401)…");
  const meBackend = await fetch(`${API}/auth/me`, {
    headers: { cookie: cookies },
  });
  console.log(`   status=${meBackend.status}`);

  console.log("4. Frontend proxy GET /api/mock-attempts/session (expect 200 after refresh)…");
  const proxyRes = await fetch(
    `${WEB}/api/mock-attempts/session?mock_test_id=${M01}`,
    { headers: { cookie: cookies }, cache: "no-store" },
  );
  const proxySetCookies =
    typeof proxyRes.headers.getSetCookie === "function"
      ? proxyRes.headers.getSetCookie()
      : [];
  for (const c of proxySetCookies) {
    const parsed = parseCookies([c]);
    for (const [k, v] of parsed) jar.set(k, v);
  }

  console.log(`   status=${proxyRes.status}`);
  if (!proxyRes.ok) {
    console.error(await proxyRes.text());
    process.exit(1);
  }

  const newAccess = jar.get("bf_access");
  const newExp = newAccess ? jwtExp(newAccess) : null;
  if (newExp && exp && newExp > exp) {
    console.log("   bf_access rotated (new exp later than old)");
  }

  console.log("\n✅ Proxy request succeeded after access expiry.");
  console.log("   Check frontend logs for auth_refresh_success and proxy_retry_success.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
