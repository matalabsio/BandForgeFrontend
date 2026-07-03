#!/usr/bin/env node
/**
 * Smoke test: GET /auth/session returns lightweight shell user.
 *
 * Prereqs:
 *   - backend :8000, NEXT_PUBLIC_AUTH_ENABLED=true
 *   - TEST_EMAIL, TEST_PASSWORD (admin or any valid account)
 *
 * Usage:
 *   TEST_EMAIL=... TEST_PASSWORD=... node scripts/verify-auth-session-flow.mjs
 */

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(
  /\/$/,
  "",
);

const email = process.env.TEST_EMAIL;
const password = process.env.TEST_PASSWORD;

if (!email || !password) {
  console.error("Set TEST_EMAIL and TEST_PASSWORD");
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
  const cookies = cookieHeader(jar);

  console.log("2. GET /auth/session (expect 200)…");
  const sessionRes = await fetch(`${API}/auth/session`, {
    headers: { cookie: cookies },
  });
  if (!sessionRes.ok) {
    console.error("Session failed:", sessionRes.status, await sessionRes.text());
    process.exit(1);
  }
  const session = await sessionRes.json();
  const required = ["id", "full_name", "email", "role", "avatar_display_url", "is_active"];
  for (const key of required) {
    if (!(key in session)) {
      console.error(`Missing session field: ${key}`);
      process.exit(1);
    }
  }
  if ("target_band" in session || "phone" in session) {
    console.error("Session includes profile fields it should omit");
    process.exit(1);
  }

  console.log("3. GET /auth/session without cookies (expect 401)…");
  const anonRes = await fetch(`${API}/auth/session`);
  if (anonRes.status !== 401) {
    console.error(`Expected 401, got ${anonRes.status}`);
    process.exit(1);
  }

  console.log("\n✅ /auth/session smoke test passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
