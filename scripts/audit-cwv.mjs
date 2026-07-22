#!/usr/bin/env node
/**
 * Core Web Vitals audit against Vercel production (PageSpeed Insights API).
 * Usage: node scripts/audit-cwv.mjs [baseUrl]
 * Exit 1 if any page misses perf/LCP/CLS thresholds.
 */

const BASE = (process.argv[2] ?? process.env.CWV_BASE_URL ?? "https://bandforge-web.vercel.app").replace(/\/$/, "");

const PATHS = ["", "diagnostic", "pricing", "telugu"];

const THRESHOLDS = {
  performance: 0.9,
  lcpMs: 2500,
  cls: 0.1,
};

async function runPagespeed(url) {
  const api =
    "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?" +
    new URLSearchParams({
      url,
      strategy: "mobile",
      category: "performance",
    });

  const res = await fetch(api);
  const data = await res.json();

  if (data.error) {
    return { error: data.error.message ?? JSON.stringify(data.error) };
  }

  const lr = data.lighthouseResult ?? {};
  const audits = lr.audits ?? {};
  const perfScore = lr.categories?.performance?.score ?? null;

  const lcpRaw = audits["largest-contentful-paint"]?.numericValue;
  const clsRaw = audits["cumulative-layout-shift"]?.numericValue;

  return {
    performance: perfScore,
    lcpMs: typeof lcpRaw === "number" ? lcpRaw : null,
    cls: typeof clsRaw === "number" ? clsRaw : null,
    lcpDisplay: audits["largest-contentful-paint"]?.displayValue ?? "n/a",
    clsDisplay: audits["cumulative-layout-shift"]?.displayValue ?? "n/a",
    tbtDisplay: audits["total-blocking-time"]?.displayValue ?? "n/a",
  };
}

function pass(label, ok) {
  return `${ok ? "PASS" : "FAIL"} ${label}`;
}

async function main() {
  console.log(`CWV audit — ${BASE} (mobile)\n`);
  console.log(
    `Thresholds: Performance ≥ ${THRESHOLDS.performance * 100}, LCP ≤ ${THRESHOLDS.lcpMs}ms, CLS ≤ ${THRESHOLDS.cls}\n`,
  );

  let allOk = true;
  const results = [];

  for (const path of PATHS) {
    const url = path ? `${BASE}/${path}` : `${BASE}/`;
    const label = path ? `/${path}` : "/";

    process.stderr.write(`Checking ${label}…\n`);
    const row = await runPagespeed(url);

    if (row.error) {
      console.log(`\n${label}`);
      console.log(`  SKIP — ${row.error}`);
      if (/quota|429|rateLimit/i.test(row.error)) {
        console.log("  (PSI quota exceeded — run Lighthouse locally or retry tomorrow)");
      }
      results.push({ label, skipped: true });
      continue;
    }

    const perfOk = row.performance != null && row.performance >= THRESHOLDS.performance;
    const lcpOk = row.lcpMs != null && row.lcpMs <= THRESHOLDS.lcpMs;
    const clsOk = row.cls != null && row.cls <= THRESHOLDS.cls;
    const pageOk = perfOk && lcpOk && clsOk;
    if (!pageOk) allOk = false;

    console.log(`\n${label}`);
    console.log(
      `  ${pass("Performance", perfOk)} — ${row.performance != null ? Math.round(row.performance * 100) : "n/a"}`,
    );
    console.log(`  ${pass("LCP", lcpOk)} — ${row.lcpDisplay} (TBT ${row.tbtDisplay})`);
    console.log(`  ${pass("CLS", clsOk)} — ${row.clsDisplay}`);

    results.push({ label, perfOk, lcpOk, clsOk, pageOk });
  }

  const measured = results.filter((r) => !r.skipped);
  if (measured.length === 0) {
    console.log("\nNo PSI results (quota or network). Verify manually with Lighthouse.");
    process.exit(0);
  }

  console.log(allOk ? "\nAll measured pages passed." : "\nSome pages missed thresholds.");
  process.exit(allOk ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
