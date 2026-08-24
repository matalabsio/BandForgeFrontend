/**
 * Phase 2 — diagnostic multi-SKU offer view-model + feature flag.
 */
import assert from "node:assert/strict";
import test from "node:test";

const {
  DIAGNOSTIC_SKU_FALLBACK_AMOUNT_PAISE,
  buildMultiSkuOfferView,
  pendingRecommendationNote,
  resolveDisplayPrimary,
  resolveSkuPricePaise,
} = await import("./diagnostic-sku-offer.ts");

const { recommendSkuFromDiagnostic } = await import(
  "./diagnostic-sku-recommend.ts"
);

const { isDiagnosticMultiSkuRecommendEnabled } = await import("./flags.ts");

const { FULL_SKILL_PROGRAM } = await import("./diagnostic-plan-content.ts");

const WRITING = "writing_skill";
const SPEAKING = "speaking_skill";
const DUAL = "dual_bundle";
const FSP = "full_skill_program";

const ORIGINAL_FLAG = process.env.NEXT_PUBLIC_DIAGNOSTIC_MULTI_SKU_RECOMMEND;

test.after(() => {
  if (ORIGINAL_FLAG === undefined) {
    delete process.env.NEXT_PUBLIC_DIAGNOSTIC_MULTI_SKU_RECOMMEND;
  } else {
    process.env.NEXT_PUBLIC_DIAGNOSTIC_MULTI_SKU_RECOMMEND = ORIGINAL_FLAG;
  }
});

function bands(partial) {
  return {
    listening: 7,
    reading: 7,
    writing: 7,
    speaking: 7,
    ...partial,
  };
}

function activeFsp(amount = 249900) {
  return [{ slug: FSP, amount }];
}

function activeAll() {
  return [
    { slug: WRITING, amount: 89900 },
    { slug: SPEAKING, amount: 89900 },
    { slug: DUAL, amount: 179900 },
    { slug: FSP, amount: 249900 },
  ];
}

function offerFor(partialBands, activePlans = activeAll()) {
  const skillBands = bands(partialBands);
  const recommendation = recommendSkuFromDiagnostic({
    bands: skillBands,
    targetBand: 7,
  });
  return buildMultiSkuOfferView({
    recommendation,
    bands: skillBands,
    activePlans,
  });
}

// --- Feature flag ---

test("multi-SKU flag OFF by default preserves legacy path", () => {
  delete process.env.NEXT_PUBLIC_DIAGNOSTIC_MULTI_SKU_RECOMMEND;
  assert.equal(isDiagnosticMultiSkuRecommendEnabled(), false);
});

test("multi-SKU flag ON only for exact true", () => {
  process.env.NEXT_PUBLIC_DIAGNOSTIC_MULTI_SKU_RECOMMEND = "true";
  assert.equal(isDiagnosticMultiSkuRecommendEnabled(), true);
  process.env.NEXT_PUBLIC_DIAGNOSTIC_MULTI_SKU_RECOMMEND = "TRUE";
  assert.equal(isDiagnosticMultiSkuRecommendEnabled(), false);
});

// --- Primary recommendations ---

test("Writing recommendation → Writing primary, not in secondary", () => {
  const offer = offerFor({ writing: 5 });
  assert.equal(offer.displayPrimary, WRITING);
  assert.equal(offer.idealPrimary, WRITING);
  assert.equal(offer.primary.slug, WRITING);
  assert.equal(
    offer.reason,
    "Writing is holding your overall band back.",
  );
  assert.ok(!offer.secondary.some((c) => c.slug === WRITING));
  assert.deepEqual(
    offer.secondary.map((c) => c.slug).sort(),
    [DUAL, FSP, SPEAKING].sort(),
  );
});

test("Speaking recommendation → Speaking primary", () => {
  const offer = offerFor({ speaking: 5 });
  assert.equal(offer.displayPrimary, SPEAKING);
  assert.equal(offer.reason, "Speaking is the priority skill to fix first.");
  assert.ok(!offer.secondary.some((c) => c.slug === SPEAKING));
});

test("Dual recommendation → Dual primary", () => {
  const offer = offerFor({ writing: 5, speaking: 5 });
  assert.equal(offer.displayPrimary, DUAL);
  assert.match(offer.reason, /Writing and Speaking/);
  assert.ok(!offer.secondary.some((c) => c.slug === DUAL));
});

test("FSP recommendation → FSP primary", () => {
  const offer = offerFor({
    listening: 5,
    reading: 5,
    writing: 5,
    speaking: 5,
  });
  assert.equal(offer.displayPrimary, FSP);
  assert.equal(
    offer.reason,
    "Gaps across all skills — you need a full personalised plan.",
  );
  assert.ok(!offer.secondary.some((c) => c.slug === FSP));
});

// --- Inactive fallback ---

test("inactive Dual falls back to Writing when Writing active", () => {
  const offer = offerFor(
    { writing: 5, speaking: 5 },
    [
      { slug: WRITING, amount: 89900 },
      { slug: FSP, amount: 249900 },
    ],
  );
  assert.equal(offer.idealPrimary, DUAL);
  assert.equal(offer.displayPrimary, WRITING);
  assert.equal(offer.fellBackFromInactive, true);
  assert.equal(offer.primary.isActive, true);
  assert.equal(offer.primary.comingSoon, false);
  const dualCard = offer.secondary.find((c) => c.slug === DUAL);
  assert.ok(dualCard);
  assert.equal(dualCard.comingSoon, true);
  assert.equal(dualCard.isActive, false);
});

test("inactive Dual + inactive Writing falls back to FSP", () => {
  const { displayPrimary, fellBack } = resolveDisplayPrimary(
    recommendSkuFromDiagnostic({
      bands: bands({ writing: 5, speaking: 5 }),
      targetBand: 7,
    }),
    activeFsp(),
  );
  assert.equal(displayPrimary, FSP);
  assert.equal(fellBack, true);
});

test("inactive secondary has Coming soon — no purchasable primary for inactive ideal alone", () => {
  const offer = offerFor({ writing: 5 }, activeFsp());
  // Writing ideal inactive → FSP display
  assert.equal(offer.displayPrimary, FSP);
  const writing = offer.secondary.find((c) => c.slug === WRITING);
  assert.ok(writing?.comingSoon);
  assert.equal(offer.primary.comingSoon, false);
  assert.equal(offer.primary.isActive, true);
});

// --- Prices ---

test("live prices preferred over fallbacks", () => {
  assert.equal(
    resolveSkuPricePaise(FSP, [{ slug: FSP, amount: 249900 }]),
    249900,
  );
  assert.equal(resolveSkuPricePaise(WRITING, []), 89900);
  assert.equal(DIAGNOSTIC_SKU_FALLBACK_AMOUNT_PAISE[DUAL], 179900);
  assert.equal(DIAGNOSTIC_SKU_FALLBACK_AMOUNT_PAISE[FSP], 249900);
});

test("offer cards show live FSP price when active", () => {
  const offer = offerFor({}, [{ slug: FSP, amount: 249900 }]);
  assert.equal(offer.primary.priceLabel, "₹2,499");
});

test("fallback amount used when SKU missing from /plans", () => {
  const offer = offerFor({ writing: 5 }, activeFsp());
  const writing = offer.secondary.find((c) => c.slug === WRITING);
  assert.equal(writing?.priceLabel, "₹899");
});

// --- Pending note ---

test("pending Speaking shows soft note", () => {
  assert.equal(
    pendingRecommendationNote(bands({ speaking: null })),
    "Recommendation may update when Speaking review is ready.",
  );
});

test("pending Writing shows soft note", () => {
  assert.equal(
    pendingRecommendationNote(bands({ writing: null })),
    "Recommendation may update when Writing evaluation is ready.",
  );
});

test("scored W+S has no pending note", () => {
  assert.equal(pendingRecommendationNote(bands({})), null);
});

test("offer includes pending note when Speaking unscored", () => {
  const offer = offerFor({ speaking: null, writing: 5 });
  assert.match(offer.pendingNote ?? "", /Speaking review/);
});

// --- Legacy FSP catalog still intact for flag-OFF UI ---

test("legacy FULL_SKILL_PROGRAM card copy unchanged for flag-OFF path", () => {
  assert.equal(FULL_SKILL_PROGRAM.slug, FSP);
  assert.equal(FULL_SKILL_PROGRAM.badge, "Recommended for you");
  assert.equal(FULL_SKILL_PROGRAM.cta, "Start my plan");
  assert.ok(FULL_SKILL_PROGRAM.features.length >= 4);
});
