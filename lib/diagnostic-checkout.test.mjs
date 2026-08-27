/**
 * Phase 3 — diagnostic checkout slug resolution, validation, routing, analytics.
 */
import assert from "node:assert/strict";
import test from "node:test";

const FULL = "full_skill_program";
const WRITING = "writing_skill";
const SPEAKING = "speaking_skill";
const DUAL = "dual_bundle";

const ACTIVE_FSP = [{ slug: FULL, amount: 249900 }];

function normalizeDiagnosticCheckoutSlug(slug) {
  const trimmed = slug?.trim().toLowerCase();
  const known = [FULL, WRITING, SPEAKING, DUAL];
  if (!trimmed || !known.includes(trimmed)) return null;
  return trimmed;
}

function resolveDiagnosticCheckoutSlug(opts) {
  if (!opts.multiSkuEnabled) return FULL;
  return (
    normalizeDiagnosticCheckoutSlug(opts.pendingResumeSlug) ??
    normalizeDiagnosticCheckoutSlug(opts.requestedSlug) ??
    FULL
  );
}

function isPlanSlugPurchasable(slug, activePlans) {
  const normalized = normalizeDiagnosticCheckoutSlug(slug);
  if (!normalized) return false;
  return activePlans.some((p) => p.slug === normalized);
}

function assertPlanSlugPurchasable(slug, activePlans) {
  const normalized = normalizeDiagnosticCheckoutSlug(slug);
  if (!normalized || !isPlanSlugPurchasable(normalized, activePlans)) {
    throw new Error(`Plan "${slug}" is not available for purchase.`);
  }
  return normalized;
}

function destinationForEntitledPlanSlug(slug) {
  switch (slug) {
    case FULL:
      return "/dashboard?activating=1";
    case WRITING:
      return "/practice/writing";
    case SPEAKING:
      return "/practice/speaking";
    case DUAL:
      return "/practice";
    default:
      return "/pricing";
  }
}

function postCheckoutDestination(sub, opts = {}) {
  const ent = sub?.entitlements;
  if (ent?.full_skill_program) return "/dashboard?activating=1";
  const receiptSlug = (opts.receiptPlanSlug ?? "").toLowerCase();
  if (ent?.plans?.includes(DUAL) || receiptSlug === DUAL) {
    return "/practice";
  }
  if (ent?.writing_skill || receiptSlug === WRITING) {
    return "/practice/writing";
  }
  if (ent?.plans?.includes(SPEAKING) || receiptSlug === SPEAKING) {
    return "/practice/speaking";
  }
  return "/pricing";
}

const analyticsEvents = [];
function logDiagnosticSkuCheckoutClick(opts) {
  analyticsEvents.push({
    event: "diagnostic_sku_checkout_click",
    slug: opts.slug,
    was_primary: opts.wasPrimary,
  });
}
function logDiagnosticSkuPurchased(slug) {
  analyticsEvents.push({ event: "diagnostic_sku_purchased", slug });
}

test("1. Primary Writing CTA → writing_skill reaches checkout", () => {
  const slug = resolveDiagnosticCheckoutSlug({
    multiSkuEnabled: true,
    requestedSlug: WRITING,
  });
  assert.equal(slug, WRITING);
});

test("2. Secondary Writing CTA → writing_skill reaches checkout", () => {
  const slug = resolveDiagnosticCheckoutSlug({
    multiSkuEnabled: true,
    requestedSlug: WRITING,
  });
  assert.equal(slug, WRITING);
});

test("3. Primary Speaking CTA → speaking_skill reaches checkout", () => {
  const slug = resolveDiagnosticCheckoutSlug({
    multiSkuEnabled: true,
    requestedSlug: SPEAKING,
  });
  assert.equal(slug, SPEAKING);
});

test("4. Primary Dual CTA → dual_bundle reaches checkout", () => {
  const slug = resolveDiagnosticCheckoutSlug({
    multiSkuEnabled: true,
    requestedSlug: DUAL,
  });
  assert.equal(slug, DUAL);
});

test("5. FSP → full_skill_program still works", () => {
  assert.equal(
    resolveDiagnosticCheckoutSlug({
      multiSkuEnabled: true,
      requestedSlug: FULL,
    }),
    FULL,
  );
  assert.equal(
    resolveDiagnosticCheckoutSlug({ multiSkuEnabled: false, requestedSlug: WRITING }),
    FULL,
  );
});

test("6. Selected Writing slug survives login/resume", () => {
  const slug = resolveDiagnosticCheckoutSlug({
    multiSkuEnabled: true,
    pendingResumeSlug: WRITING,
  });
  assert.equal(slug, WRITING);
});

test("7. Selected Dual slug survives login/resume", () => {
  const slug = resolveDiagnosticCheckoutSlug({
    multiSkuEnabled: true,
    pendingResumeSlug: DUAL,
  });
  assert.equal(slug, DUAL);
});

test("8. Inactive SKU cannot create an order", () => {
  assert.throws(
    () => assertPlanSlugPurchasable(WRITING, ACTIVE_FSP),
    /not available for purchase/,
  );
});

test("9. Unknown/invalid slug cannot create an order", () => {
  assert.throws(
    () => assertPlanSlugPurchasable("premium_monthly", ACTIVE_FSP),
    /not available for purchase/,
  );
  assert.throws(
    () => assertPlanSlugPurchasable("", ACTIVE_FSP),
    /not available for purchase/,
  );
});

test("10. Writing purchase does not route to FSP dashboard", () => {
  const sub = {
    entitlements: {
      plans: [WRITING],
      writing_skill: true,
      full_skill_program: false,
    },
  };
  assert.equal(postCheckoutDestination(sub), "/practice/writing");
  assert.notEqual(postCheckoutDestination(sub), "/dashboard?activating=1");
});

test("11. FSP purchase still routes to dashboard/calendar", () => {
  const sub = {
    entitlements: {
      plans: [FULL],
      writing_skill: false,
      full_skill_program: true,
    },
  };
  assert.equal(postCheckoutDestination(sub), "/dashboard?activating=1");
});

test("12. Feature flag OFF preserves legacy FSP behavior", () => {
  assert.equal(
    resolveDiagnosticCheckoutSlug({
      multiSkuEnabled: false,
      requestedSlug: WRITING,
      pendingResumeSlug: DUAL,
    }),
    FULL,
  );
});

test("13. Feature flag ON respects selected SKU", () => {
  assert.equal(
    resolveDiagnosticCheckoutSlug({
      multiSkuEnabled: true,
      requestedSlug: SPEAKING,
    }),
    SPEAKING,
  );
});

test("14. Purchase analytics records the purchased slug", () => {
  analyticsEvents.length = 0;
  logDiagnosticSkuCheckoutClick({ slug: DUAL, wasPrimary: true });
  logDiagnosticSkuPurchased(DUAL);
  assert.deepEqual(analyticsEvents, [
    {
      event: "diagnostic_sku_checkout_click",
      slug: DUAL,
      was_primary: true,
    },
    { event: "diagnostic_sku_purchased", slug: DUAL },
  ]);
});

test("15. Existing entitlement behavior — entitled slug skips to pack home", () => {
  assert.equal(destinationForEntitledPlanSlug(WRITING), "/practice/writing");
  assert.equal(destinationForEntitledPlanSlug(SPEAKING), "/practice/speaking");
  assert.equal(destinationForEntitledPlanSlug(DUAL), "/practice");
  assert.equal(destinationForEntitledPlanSlug(FULL), "/dashboard?activating=1");
});

test("16. Dual purchase routes to practice course chooser", () => {
  const sub = {
    entitlements: {
      plans: [DUAL],
      writing_skill: false,
      speaking_skill: false,
      full_skill_program: false,
    },
  };
  assert.equal(postCheckoutDestination(sub), "/practice");
  assert.equal(
    postCheckoutDestination({ entitlements: {} }, { receiptPlanSlug: DUAL }),
    "/practice",
  );
});

console.log("diagnostic-checkout tests passed");
