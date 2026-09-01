"use client";

import { useLayoutEffect, type RefObject } from "react";

/** Clear inline styles exam/diagnostic shells may leave on the document. */
export function clearDocumentScrollLock(): void {
  if (typeof document === "undefined") return;
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
  document.documentElement.style.height = "";
  document.body.style.height = "";
  document.documentElement.style.position = "";
  document.body.style.position = "";
  document.documentElement.style.touchAction = "";
  document.body.style.touchAction = "";
}

type ScrollIntoViewOptions = {
  behavior?: ScrollBehavior;
  block?: ScrollLogicalPosition;
};

/** Scroll a target into view within a scroll container (not the document). */
export function scrollElementIntoView(
  container: HTMLElement | null | undefined,
  target: HTMLElement | null | undefined,
  options: ScrollIntoViewOptions = {},
): void {
  if (!container || !target) return;
  const { behavior = "smooth", block = "center" } = options;

  const containerRect = container.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const offsetTop = targetRect.top - containerRect.top + container.scrollTop;

  let nextTop = offsetTop;
  if (block === "center") {
    nextTop =
      offsetTop - container.clientHeight / 2 + targetRect.height / 2;
  } else if (block === "end") {
    nextTop = offsetTop - container.clientHeight + targetRect.height;
  }

  container.scrollTo({
    top: Math.max(0, nextTop),
    behavior,
  });
}

/** Clear document scroll locks left by exam/diagnostic shells; reset inner scroll region. */
export function useUnlockPageScroll(
  scrollRef?: RefObject<HTMLElement | null>,
  deps: readonly unknown[] = [],
): void {
  useLayoutEffect(() => {
    clearDocumentScrollLock();

    const scrollToTop = () => {
      scrollRef?.current?.scrollTo({ top: 0, left: 0 });
    };

    scrollToTop();
    const frame1 = window.requestAnimationFrame(scrollToTop);
    const frame2 = window.requestAnimationFrame(scrollToTop);
    return () => {
      window.cancelAnimationFrame(frame1);
      window.cancelAnimationFrame(frame2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- explicit deps for content-driven relayout
  }, deps);
}
