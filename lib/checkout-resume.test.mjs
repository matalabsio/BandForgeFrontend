/**
 * Post-auth diagnostic checkout resume — plans-ready gate, soft-fail, pending restore.
 */
import assert from "node:assert/strict";
import test from "node:test";

const {
  DIAGNOSTIC_CHECKOUT_RETURN_PATH,
  abandonCheckoutResume,
  clearCheckoutResumeAutoOpenSuppress,
  clearStaleCheckoutAutoOpenSuppress,
  consumeCheckoutResumeSoftFailModal,
  decideCheckoutResumeStart,
  isCheckoutOpeningLockHeld,
  isCheckoutResumeAutoOpenSuppressed,
  isCheckoutResumeClaimed,
  markCheckoutResumeClaimed,
  peekCheckoutResumeSoftFailModal,
  peekPendingCheckoutResume,
  prepareCheckoutResumeRetry,
  releaseCheckoutOpeningLock,
  releaseStaleCheckoutOpeningLockIfIdle,
  resetCheckoutResumeForPostAuth,
  resetCheckoutResumeStateForTests,
  setPendingCheckoutResume,
  stashCheckoutResumeSoftFailModal,
  tryAcquireCheckoutOpeningLock,
} = await import("./checkout-resume.ts");

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

test("decideCheckoutResumeStart waits while bootstrapping", () => {
  assert.equal(
    decideCheckoutResumeStart({
      bootstrapping: true,
      shouldResume: true,
      claimed: false,
      lockAcquired: true,
    }),
    "wait_bootstrap",
  );
});

test("decideCheckoutResumeStart starts after plans bootstrap when lock free", () => {
  assert.equal(
    decideCheckoutResumeStart({
      bootstrapping: false,
      shouldResume: true,
      claimed: false,
      lockAcquired: true,
    }),
    "start",
  );
});

test("decideCheckoutResumeStart skips when auto-open suppressed (soft-fail)", () => {
  assert.equal(
    decideCheckoutResumeStart({
      bootstrapping: false,
      shouldResume: true,
      claimed: false,
      lockAcquired: true,
      autoOpenSuppressed: true,
    }),
    "skip",
  );
});

test("decideCheckoutResumeStart waits on lock contention", () => {
  assert.equal(
    decideCheckoutResumeStart({
      bootstrapping: false,
      shouldResume: true,
      claimed: false,
      lockAcquired: false,
    }),
    "wait_lock",
  );
});

test("decideCheckoutResumeStart skips without checkout=1 intent", () => {
  assert.equal(
    decideCheckoutResumeStart({
      bootstrapping: false,
      shouldResume: false,
      claimed: false,
      lockAcquired: true,
    }),
    "skip",
  );
});

test("prepareCheckoutResumeRetry restores pending and suppresses auto-open", () => {
  mockSessionStorage();
  globalThis.window = globalThis;
  resetCheckoutResumeStateForTests();
  markCheckoutResumeClaimed();
  assert.equal(isCheckoutResumeClaimed(), true);

  prepareCheckoutResumeRetry("writing_skill");

  assert.equal(isCheckoutResumeClaimed(), false);
  assert.equal(isCheckoutResumeAutoOpenSuppressed(), true);
  const pending = peekPendingCheckoutResume();
  assert.equal(pending?.planSlug, "writing_skill");
  assert.equal(pending?.returnTo, DIAGNOSTIC_CHECKOUT_RETURN_PATH);
});

test("prepareCheckoutResumeRetry can skip suppress for pre-Razorpay settle", () => {
  mockSessionStorage();
  globalThis.window = globalThis;
  resetCheckoutResumeStateForTests();
  prepareCheckoutResumeRetry("full_skill_program", { suppressAutoOpen: false });
  assert.equal(isCheckoutResumeAutoOpenSuppressed(), false);
  assert.equal(peekPendingCheckoutResume()?.planSlug, "full_skill_program");
});

test("clearStaleCheckoutAutoOpenSuppress keeps suppress when soft-fail modal pending", () => {
  mockSessionStorage();
  globalThis.window = globalThis;
  prepareCheckoutResumeRetry("full_skill_program");
  stashCheckoutResumeSoftFailModal({ modal: "cancelled", detail: null });
  assert.equal(peekCheckoutResumeSoftFailModal()?.modal, "cancelled");
  clearStaleCheckoutAutoOpenSuppress();
  assert.equal(isCheckoutResumeAutoOpenSuppressed(), true);
});

test("clearStaleCheckoutAutoOpenSuppress clears suppress without soft-fail modal", () => {
  mockSessionStorage();
  globalThis.window = globalThis;
  prepareCheckoutResumeRetry("full_skill_program");
  assert.equal(isCheckoutResumeAutoOpenSuppressed(), true);
  clearStaleCheckoutAutoOpenSuppress();
  assert.equal(isCheckoutResumeAutoOpenSuppressed(), false);
});

test("releaseStaleCheckoutOpeningLockIfIdle keeps fresh lock, clears aged lock", () => {
  mockSessionStorage();
  globalThis.window = globalThis;
  assert.equal(tryAcquireCheckoutOpeningLock(), true);
  assert.equal(isCheckoutOpeningLockHeld(), true);
  releaseStaleCheckoutOpeningLockIfIdle({
    checkoutInFlight: false,
    razorpayOpen: false,
    minAgeMs: 1_500,
  });
  // Fresh lock must survive (Strict Mode remount).
  assert.equal(isCheckoutOpeningLockHeld(), true);

  sessionStorage.setItem("bf_checkout_opening", String(Date.now() - 5_000));
  releaseStaleCheckoutOpeningLockIfIdle({
    checkoutInFlight: false,
    razorpayOpen: false,
    minAgeMs: 1_500,
  });
  assert.equal(isCheckoutOpeningLockHeld(), false);

  // Do not release while a live attempt is running.
  assert.equal(tryAcquireCheckoutOpeningLock(), true);
  releaseStaleCheckoutOpeningLockIfIdle({
    checkoutInFlight: true,
    razorpayOpen: false,
    minAgeMs: 0,
  });
  assert.equal(isCheckoutOpeningLockHeld(), true);
});

test("stash + consume soft-fail modal survives remount handoff", () => {
  mockSessionStorage();
  globalThis.window = globalThis;
  stashCheckoutResumeSoftFailModal({
    modal: "cancelled",
    detail: null,
  });
  const soft = consumeCheckoutResumeSoftFailModal();
  assert.equal(soft?.modal, "cancelled");
  assert.equal(consumeCheckoutResumeSoftFailModal(), null);
});

test("abandonCheckoutResume clears pending, suppress, and claim", () => {
  mockSessionStorage();
  globalThis.window = globalThis;
  resetCheckoutResumeStateForTests();
  setPendingCheckoutResume({ planSlug: "dual_bundle" });
  prepareCheckoutResumeRetry("dual_bundle");
  abandonCheckoutResume();
  assert.equal(peekPendingCheckoutResume(), null);
  assert.equal(isCheckoutResumeAutoOpenSuppressed(), false);
  assert.equal(isCheckoutResumeClaimed(), false);
});

test("clearCheckoutResumeAutoOpenSuppress allows a later start decision", () => {
  mockSessionStorage();
  globalThis.window = globalThis;
  prepareCheckoutResumeRetry("full_skill_program");
  assert.equal(isCheckoutResumeAutoOpenSuppressed(), true);
  clearCheckoutResumeAutoOpenSuppress();
  assert.equal(
    decideCheckoutResumeStart({
      bootstrapping: false,
      shouldResume: true,
      claimed: false,
      lockAcquired: true,
      autoOpenSuppressed: isCheckoutResumeAutoOpenSuppressed(),
    }),
    "start",
  );
});

test("legacy resume without planSlug defaults to FSP via setPending", () => {
  mockSessionStorage();
  globalThis.window = globalThis;
  setPendingCheckoutResume({ returnTo: DIAGNOSTIC_CHECKOUT_RETURN_PATH });
  assert.equal(peekPendingCheckoutResume()?.planSlug, "full_skill_program");
});

test("resetCheckoutResumeForPostAuth clears claim, suppress, and lock; keeps pending", () => {
  mockSessionStorage();
  globalThis.window = globalThis;
  resetCheckoutResumeStateForTests();
  setPendingCheckoutResume({ planSlug: "writing_skill" });
  prepareCheckoutResumeRetry("writing_skill");
  markCheckoutResumeClaimed();
  assert.equal(tryAcquireCheckoutOpeningLock(), true);
  assert.equal(isCheckoutOpeningLockHeld(), true);
  assert.equal(isCheckoutResumeAutoOpenSuppressed(), true);
  assert.equal(isCheckoutResumeClaimed(), true);

  resetCheckoutResumeForPostAuth();

  assert.equal(isCheckoutResumeClaimed(), false);
  assert.equal(isCheckoutResumeAutoOpenSuppressed(), false);
  assert.equal(isCheckoutOpeningLockHeld(), false);
  assert.equal(peekPendingCheckoutResume()?.planSlug, "writing_skill");
  assert.equal(
    decideCheckoutResumeStart({
      bootstrapping: false,
      shouldResume: true,
      claimed: isCheckoutResumeClaimed(),
      lockAcquired: true,
      autoOpenSuppressed: isCheckoutResumeAutoOpenSuppressed(),
    }),
    "start",
  );
});

console.log("checkout-resume tests passed");
