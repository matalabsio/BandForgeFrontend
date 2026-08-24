#!/usr/bin/env node
/**
 * SEO smoke test against production or local base URL.
 * Usage: node scripts/verify-seo.mjs [baseUrl]
 */

const BASE = (process.argv[2] ?? process.env.SEO_BASE_URL ?? "https://bandforgeuinew.vercel.app").replace(/\/$/, "");

const PATHS = [
  "/",
  "/diagnostic",
  "/pricing",
  "/writing",
  "/speaking",
  "/telugu",
  "/urdu",
  "/hyderabad",
  "/faq",
  "/vs-coaching-centres",
  "/blog",
  "/robots.txt",
  "/sitemap.xml",
  "/llms.txt",
];

const FORBIDDEN = [
  "90-minute",
  "90 minute",
  "₹1,499",
  "₹3,499",
  "Starter Pack",
  "10,000+",
  "Start free, upgrade when ready",
];

const REQUIRED_ON_MARKETING = [
  "15-minute",
  "2499",
  "48 hours",
];

const JSON_LD_PATHS = ["/pricing", "/faq", "/hyderabad"];

let failed = false;

function fail(message) {
  failed = true;
  console.error(`FAIL: ${message}`);
}

function pass(message) {
  console.log(`OK: ${message}`);
}

async function fetchText(path) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, { redirect: "follow" });
  const text = await res.text();
  return { url, status: res.status, text };
}

console.log(`SEO verify — ${BASE}\n`);

for (const path of PATHS) {
  try {
    const { url, status, text } = await fetchText(path);
    if (status !== 200) {
      fail(`${path} → HTTP ${status} (${url})`);
      continue;
    }
    pass(`${path} → HTTP 200`);

    if (path.endsWith(".txt") || path.endsWith(".xml")) continue;

    for (const phrase of FORBIDDEN) {
      if (text.includes(phrase)) {
        fail(`${path} contains forbidden phrase: "${phrase}"`);
      }
    }

    if (["/", "/pricing", "/faq", "/writing", "/speaking"].includes(path)) {
      for (const phrase of REQUIRED_ON_MARKETING) {
        if (!text.includes(phrase)) {
          fail(`${path} missing required phrase: "${phrase}"`);
        }
      }
    }

    if (JSON_LD_PATHS.includes(path) && !text.includes("application/ld+json")) {
      fail(`${path} missing JSON-LD`);
    }
  } catch (error) {
    fail(`${path} → ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Redirect alias
try {
  const res = await fetch(`${BASE}/vs-coaching`, { redirect: "manual" });
  const location = res.headers.get("location") ?? "";
  if (res.status >= 300 && res.status < 400 && location.includes("/vs-coaching-centres")) {
    pass("/vs-coaching → redirects to /vs-coaching-centres");
  } else {
    fail(`/vs-coaching redirect unexpected: HTTP ${res.status} location=${location}`);
  }
} catch (error) {
  fail(`/vs-coaching → ${error instanceof Error ? error.message : String(error)}`);
}

console.log(failed ? "\nSEO verify failed." : "\nSEO verify passed.");
process.exit(failed ? 1 : 0);
