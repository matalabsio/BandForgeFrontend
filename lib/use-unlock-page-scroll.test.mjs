/**
 * Tests for document scroll unlock helpers used by result viewports.
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  clearDocumentScrollLock,
  forwardWheelToScrollContainer,
  scrollElementIntoView,
  shouldForwardWheelToScroll,
} from "./use-unlock-page-scroll.ts";

test("clearDocumentScrollLock clears inline styles on html and body", () => {
  const makeEl = () => ({
    style: {
      overflow: "hidden",
      height: "100%",
      position: "fixed",
      touchAction: "none",
    },
  });
  const previousDocument = globalThis.document;
  globalThis.document = {
    documentElement: makeEl(),
    body: makeEl(),
  };

  try {
    clearDocumentScrollLock();

    assert.equal(globalThis.document.documentElement.style.overflow, "");
    assert.equal(globalThis.document.documentElement.style.height, "");
    assert.equal(globalThis.document.documentElement.style.position, "");
    assert.equal(globalThis.document.documentElement.style.touchAction, "");
    assert.equal(globalThis.document.body.style.overflow, "");
    assert.equal(globalThis.document.body.style.height, "");
    assert.equal(globalThis.document.body.style.position, "");
    assert.equal(globalThis.document.body.style.touchAction, "");
  } finally {
    globalThis.document = previousDocument;
  }
});

test("scrollElementIntoView scrolls within container, not document", () => {
  const container = {
    clientHeight: 400,
    scrollTop: 0,
    scrollTo({ top }) {
      this.scrollTop = top;
    },
    getBoundingClientRect() {
      return { top: 100, left: 0, width: 320, height: 400 };
    },
  };

  const target = {
    getBoundingClientRect() {
      return { top: 500, left: 0, width: 280, height: 40 };
    },
  };

  scrollElementIntoView(container, target, { behavior: "auto", block: "center" });

  assert.equal(container.scrollTop, 220);
});

test("scrollElementIntoView no-ops when container or target is missing", () => {
  assert.doesNotThrow(() => scrollElementIntoView(null, null));
});

test("shouldForwardWheelToScroll returns false when target is inside scroll region", () => {
  const child = { nodeType: 1 };
  const scrollEl = {
    contains(node) {
      return node === child;
    },
  };

  assert.equal(shouldForwardWheelToScroll(scrollEl, child), false);
  assert.equal(shouldForwardWheelToScroll(scrollEl, { nodeType: 1 }), true);
});

test("forwardWheelToScrollContainer scrolls down when content overflows", () => {
  const scrollEl = {
    scrollTop: 0,
    scrollHeight: 1000,
    clientHeight: 400,
  };

  assert.equal(forwardWheelToScrollContainer(scrollEl, 40), true);
  assert.equal(scrollEl.scrollTop, 40);
});

test("forwardWheelToScrollContainer scrolls up when not at top", () => {
  const scrollEl = {
    scrollTop: 100,
    scrollHeight: 1000,
    clientHeight: 400,
  };

  assert.equal(forwardWheelToScrollContainer(scrollEl, -30), true);
  assert.equal(scrollEl.scrollTop, 70);
});

test("forwardWheelToScrollContainer no-ops at scroll boundaries", () => {
  const atTop = {
    scrollTop: 0,
    scrollHeight: 1000,
    clientHeight: 400,
  };
  assert.equal(forwardWheelToScrollContainer(atTop, -10), false);
  assert.equal(atTop.scrollTop, 0);

  const atBottom = {
    scrollTop: 600,
    scrollHeight: 1000,
    clientHeight: 400,
  };
  assert.equal(forwardWheelToScrollContainer(atBottom, 10), false);
  assert.equal(atBottom.scrollTop, 600);
});
