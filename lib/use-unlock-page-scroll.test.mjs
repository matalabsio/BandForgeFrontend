/**
 * Tests for document scroll unlock helpers used by result viewports.
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  clearDocumentScrollLock,
  scrollElementIntoView,
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
