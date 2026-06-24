/**
 * Node tests for mock catalog routing (keep in sync with mock-catalog.ts).
 */
import assert from "node:assert/strict";
import test from "node:test";

const M01_MOCK_TEST_ID = "a0000000-0000-4000-8000-000000000001";
const M02_MOCK_TEST_ID = "a0000000-0000-4000-8000-000000000002";

const MOCK_SLUGS = {
  m01: M01_MOCK_TEST_ID,
  m02: M02_MOCK_TEST_ID,
};

const MOCK_TEST_PANEL = [
  { number: 1, slug: "m01" },
  { number: 2, slug: "m02" },
];

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value) {
  return UUID_RE.test(value);
}

function resolveMockId(slugOrId) {
  if (slugOrId in MOCK_SLUGS) return MOCK_SLUGS[slugOrId];
  if (isUuid(slugOrId)) return slugOrId;
  return M01_MOCK_TEST_ID;
}

function mockSlugForId(id) {
  for (const [slug, uuid] of Object.entries(MOCK_SLUGS)) {
    if (uuid === id) return slug;
  }
  return id;
}

function publishedSlugForMockRef(slugOrId) {
  const id = resolveMockId(slugOrId);
  const slug = mockSlugForId(id);
  if (slug === "m01" || slug === "m02") return slug;
  return null;
}

function getMockPanelSlotBySlug(slug) {
  return MOCK_TEST_PANEL.find((slot) => slot.slug === slug);
}

function testNumberForMockId(mockTestId) {
  const slug = publishedSlugForMockRef(mockTestId);
  if (slug) {
    const panelSlot = getMockPanelSlotBySlug(slug);
    if (panelSlot) return panelSlot.number;
  }
  return 1;
}

function mockTestNumberPath(number) {
  return `/test?test=${number}`;
}

function testHubPath(slugOrId, _mockAttemptId, catalogNumber) {
  if (catalogNumber != null && catalogNumber >= 1) {
    return mockTestNumberPath(catalogNumber);
  }
  const slug = publishedSlugForMockRef(slugOrId);
  if (slug) {
    const slot = getMockPanelSlotBySlug(slug);
    if (slot) return mockTestNumberPath(slot.number);
  }
  return mockTestNumberPath(1);
}

function shortModuleExamPath(testNumber, module, opts = {}) {
  const base = `/test/${testNumber}/${module}`;
  const params = new URLSearchParams();
  if (module === "listening" && opts.part && opts.part !== 1) {
    params.set("part", String(opts.part));
  }
  const q = params.toString();
  return q ? `${base}?${q}` : base;
}

function isLiveCatalogNumber(catalogNumber) {
  return catalogNumber >= 1 && catalogNumber <= 2;
}

function mockModulePath(slugOrId, module, opts = {}) {
  const id = resolveMockId(slugOrId);
  const testNumber = testNumberForMockId(id);
  if (
    isLiveCatalogNumber(testNumber) &&
    (module === "listening" ||
      module === "reading" ||
      module === "writing" ||
      module === "speaking")
  ) {
    return shortModuleExamPath(testNumber, module, {
      part: opts.part,
      passage: opts.passage,
    });
  }
  return `/mock/${slugOrId}/${module}`;
}

test("testNumberForMockId maps M01 UUID to 1", () => {
  assert.equal(testNumberForMockId(M01_MOCK_TEST_ID), 1);
});

test("testNumberForMockId maps M02 UUID to 2", () => {
  assert.equal(testNumberForMockId(M02_MOCK_TEST_ID), 2);
});

test("testNumberForMockId maps m02 slug to 2", () => {
  assert.equal(testNumberForMockId("m02"), 2);
});

test("mockModulePath(M02 UUID, listening) -> /test/2/listening", () => {
  assert.equal(
    mockModulePath(M02_MOCK_TEST_ID, "listening"),
    "/test/2/listening",
  );
});

test("testHubPath(M02 UUID) -> /test?test=2", () => {
  assert.equal(testHubPath(M02_MOCK_TEST_ID), "/test?test=2");
});

test("mockModulePath(M01 UUID, listening, part 2) -> /test/1/listening?part=2", () => {
  assert.equal(
    mockModulePath(M01_MOCK_TEST_ID, "listening", { part: 2 }),
    "/test/1/listening?part=2",
  );
});
