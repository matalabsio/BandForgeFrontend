/**
 * Part 4 — diagnostic checkout simplification (full-account direct path vs
 * session-expiry resume fallback). Pure helpers + auth-gate orchestration.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const {
  decideDiagnosticCheckoutAuthGate,
  diagnosticExpiredCheckoutLoginHref,
  shouldShowDiagnosticCheckoutSignInBanner,
} = await import("./diagnostic-checkout-auth.ts");

const {
  DIAGNOSTIC_CHECKOUT_RETURN_PATH,
  decideCheckoutResumeStart,
  peekPendingCheckoutResume,
  prepareCheckoutResumeRetry,
  resetCheckoutResumeStateForTests,
  setPendingCheckoutResume,
} = await import("./checkout-resume.ts");

const __dirname = dirname(fileURLToPath(import.meta.url));

function destinationForEntitledPlanSlug(slug) {
  switch (slug) {
    case "full_skill_program":
      return "/dashboard?activating=1";
    case "writing_skill":
      return "/practice/writing";
    case "speaking_skill":
      return "/practice/speaking";
    case "dual_bundle":
      return "/practice";
    default:
      return "/pricing";
  }
}

function mockSessionStorage() {
  const store = new Map();
  globalThis.sessionStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => {
      store.set(k, String(v));
    },
    removeItem: (k) => {
      store.delete(k);
    },
    clear: () => store.clear(),
    key: () => null,
    get length() {
      return store.size;
    },
  };
  return store;
}

/**
 * Mirrors executeCheckout auth gate + happy-path order open without React.
 */
async function runCheckoutAuthGate(deps) {
  const session = await deps.ensureSession();
  const user = session ? await deps.getMe() : null;
  const gate = decideDiagnosticCheckoutAuthGate({
    hasSession: Boolean(session),
    role: user?.role,
  });

  if (gate.kind === "session_expired") {
    deps.prepareResume(deps.planSlug);
    deps.redirectToLogin(deps.planSlug);
    return {
      createdOrder: false,
      openedRazorpay: false,
      redirectedToLogin: true,
      loginHref: deps.lastLoginHref,
    };
  }

  await deps.createOrder(deps.planSlug);
  await deps.openRazorpay();
  return {
    createdOrder: true,
    openedRazorpay: true,
    redirectedToLogin: false,
    loginHref: null,
  };
}

test("decideDiagnosticCheckoutAuthGate proceeds for full account", () => {
  assert.deepEqual(
    decideDiagnosticCheckoutAuthGate({
      hasSession: true,
      role: "student",
    }),
    { kind: "proceed" },
  );
});

test("decideDiagnosticCheckoutAuthGate treats missing session as expired", () => {
  assert.deepEqual(
    decideDiagnosticCheckoutAuthGate({
      hasSession: false,
      role: undefined,
    }),
    { kind: "session_expired" },
  );
});

test("decideDiagnosticCheckoutAuthGate treats guest role as expired", () => {
  assert.deepEqual(
    decideDiagnosticCheckoutAuthGate({
      hasSession: true,
      role: "guest",
    }),
    { kind: "session_expired" },
  );
});

test("shouldShowDiagnosticCheckoutSignInBanner is always false", () => {
  assert.equal(shouldShowDiagnosticCheckoutSignInBanner(), false);
});

test("results checkout section has no guest Sign-in unlock banner copy", () => {
  const src = readFileSync(
    join(
      __dirname,
      "../components/diagnostic/diagnostic-plan-checkout-section.tsx",
    ),
    "utf8",
  );
  assert.equal(
    src.includes("to save your diagnostic scores and unlock checkout"),
    false,
  );
  assert.equal(src.includes("Sign in</Link>"), false);
});

test("diagnosticExpiredCheckoutLoginHref uses session=expired and checkout return", () => {
  const href = diagnosticExpiredCheckoutLoginHref();
  assert.ok(href.startsWith("/login?"));
  const q = new URL(href, "https://example.test").searchParams;
  assert.equal(q.get("next"), "/diagnostic/results?checkout=1");
  assert.equal(q.get("session"), "expired");
});

test("full-account checkout calls createOrder and opens Razorpay without login/resume", async () => {
  mockSessionStorage();
  globalThis.window = globalThis;
  resetCheckoutResumeStateForTests();

  let createOrderCalls = 0;
  let openCalls = 0;
  let loginCalls = 0;
  let resumeCalls = 0;

  const result = await runCheckoutAuthGate({
    planSlug: "full_skill_program",
    lastLoginHref: null,
    ensureSession: async () => ({ ok: true }),
    getMe: async () => ({ role: "student" }),
    createOrder: async () => {
      createOrderCalls += 1;
    },
    openRazorpay: async () => {
      openCalls += 1;
    },
    prepareResume: () => {
      resumeCalls += 1;
    },
    redirectToLogin: () => {
      loginCalls += 1;
    },
  });

  assert.equal(result.createdOrder, true);
  assert.equal(result.openedRazorpay, true);
  assert.equal(result.redirectedToLogin, false);
  assert.equal(createOrderCalls, 1);
  assert.equal(openCalls, 1);
  assert.equal(loginCalls, 0);
  assert.equal(resumeCalls, 0);
  assert.equal(peekPendingCheckoutResume(), null);
});

test("expired checkout preserves pending plan and loginPathWithNext session=expired", async () => {
  mockSessionStorage();
  globalThis.window = globalThis;
  resetCheckoutResumeStateForTests();

  let createOrderCalls = 0;
  let lastLoginHref = null;

  const result = await runCheckoutAuthGate({
    planSlug: "writing_skill",
    get lastLoginHref() {
      return lastLoginHref;
    },
    ensureSession: async () => null,
    getMe: async () => null,
    createOrder: async () => {
      createOrderCalls += 1;
    },
    openRazorpay: async () => {},
    prepareResume: (slug) => {
      prepareCheckoutResumeRetry(slug, { suppressAutoOpen: false });
    },
    redirectToLogin: (slug) => {
      setPendingCheckoutResume({
        planSlug: slug,
        returnTo: DIAGNOSTIC_CHECKOUT_RETURN_PATH,
      });
      lastLoginHref = diagnosticExpiredCheckoutLoginHref();
    },
  });

  assert.equal(result.redirectedToLogin, true);
  assert.equal(result.createdOrder, false);
  assert.equal(createOrderCalls, 0);

  const pending = peekPendingCheckoutResume();
  assert.ok(pending);
  assert.equal(pending.planSlug, "writing_skill");
  assert.equal(pending.returnTo, DIAGNOSTIC_CHECKOUT_RETURN_PATH);

  const q = new URL(result.loginHref, "https://example.test").searchParams;
  assert.equal(q.get("next"), "/diagnostic/results?checkout=1");
  assert.equal(q.get("session"), "expired");
});

test("checkout=1 resume still starts when pending checkout exists", () => {
  mockSessionStorage();
  globalThis.window = globalThis;
  resetCheckoutResumeStateForTests();
  setPendingCheckoutResume({
    planSlug: "speaking_skill",
    returnTo: DIAGNOSTIC_CHECKOUT_RETURN_PATH,
  });

  assert.equal(
    decideCheckoutResumeStart({
      bootstrapping: false,
      shouldResume: true,
      claimed: false,
      lockAcquired: true,
      autoOpenSuppressed: false,
    }),
    "start",
  );
  assert.equal(peekPendingCheckoutResume()?.planSlug, "speaking_skill");
});

test("SKU post-payment destinations remain unchanged", () => {
  assert.equal(
    destinationForEntitledPlanSlug("full_skill_program"),
    "/dashboard?activating=1",
  );
  assert.equal(
    destinationForEntitledPlanSlug("writing_skill"),
    "/practice/writing",
  );
  assert.equal(
    destinationForEntitledPlanSlug("speaking_skill"),
    "/practice/speaking",
  );
  assert.equal(
    destinationForEntitledPlanSlug("dual_bundle"),
    "/practice",
  );
});
