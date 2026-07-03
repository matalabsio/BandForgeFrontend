#!/usr/bin/env node
/**
 * Smoke test: unauthenticated /dashboard redirects to /login (not /auth/bootstrap).
 *
 * Prereqs: frontend running (npm run start), NEXT_PUBLIC_AUTH_ENABLED=true
 *
 * Usage:
 *   FRONTEND_URL=http://localhost:3000 node scripts/verify-auth-redirect-flow.mjs
 */

const WEB = (process.env.FRONTEND_URL || "http://localhost:3000").replace(
  /\/$/,
  "",
);

async function followRedirects(path, maxHops = 8) {
  const chain = [];
  let url = `${WEB}${path}`;

  for (let i = 0; i < maxHops; i++) {
    const res = await fetch(url, { redirect: "manual" });
    chain.push({ url, status: res.status });
    if (res.status < 300 || res.status >= 400) {
      return { chain, finalUrl: url, finalStatus: res.status };
    }
    const location = res.headers.get("location");
    if (!location) break;
    url = new URL(location, url).toString();
  }

  return { chain, finalUrl: url, finalStatus: null };
}

async function main() {
  const { chain, finalUrl } = await followRedirects("/dashboard");

  console.log("Redirect chain for GET /dashboard (no cookies):");
  for (const hop of chain) {
    console.log(`  ${hop.status} ${hop.url}`);
  }
  console.log(`Final URL: ${finalUrl}`);

  const finalPath = new URL(finalUrl).pathname;
  const finalSearch = new URL(finalUrl).search;

  if (finalPath !== "/login") {
    console.error(`FAIL: expected final path /login, got ${finalPath}`);
    process.exit(1);
  }

  if (!finalSearch.includes("next=")) {
    console.error("FAIL: expected next= query on login redirect");
    process.exit(1);
  }

  if (chain.some((hop) => new URL(hop.url).pathname === "/auth/bootstrap")) {
    console.error("FAIL: redirect chain should not pass through /auth/bootstrap");
    process.exit(1);
  }

  console.log("OK: unauthenticated dashboard → /login?next=...");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
