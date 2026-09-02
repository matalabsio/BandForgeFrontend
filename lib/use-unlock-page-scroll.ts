"use client";

import { useEffect, useLayoutEffect, type RefObject } from "react";

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

/** Whether a wheel event on target should be forwarded to the scroll container. */
export function shouldForwardWheelToScroll(
  scrollEl: HTMLElement,
  target: EventTarget | null,
): boolean {
  if (!target || typeof target !== "object" || !("nodeType" in target)) {
    return true;
  }
  return !scrollEl.contains(target as Node);
}

/** Apply wheel delta to a scroll container when it can still scroll in that direction. */
export function forwardWheelToScrollContainer(
  scrollEl: Pick<HTMLElement, "scrollTop" | "scrollHeight" | "clientHeight"> & {
    scrollTop: number;
  },
  deltaY: number,
): boolean {
  const { scrollTop, scrollHeight, clientHeight } = scrollEl;
  const canScrollUp = scrollTop > 0;
  const canScrollDown = scrollTop + clientHeight < scrollHeight - 1;

  if ((deltaY < 0 && canScrollUp) || (deltaY > 0 && canScrollDown)) {
    scrollEl.scrollTop += deltaY;
    return true;
  }
  return false;
}

/** Clear document scroll locks on mount (exam/diagnostic leftovers). */
export function useClearDocumentScrollLock(): void {
  useLayoutEffect(() => {
    clearDocumentScrollLock();
  }, []);
}

type UseResultScrollViewportOptions = {
  scrollRef: RefObject<HTMLElement | null>;
  outerRef: RefObject<HTMLElement | null>;
  /** When this value changes, the scroll region resets to the top. */
  resetKey?: unknown;
};

/**
 * Result viewport scroll: unlock document, reset on stable key changes,
 * forward desktop wheel events from header/footer to the scroll region.
 */
export function useResultScrollViewport({
  scrollRef,
  outerRef,
  resetKey,
}: UseResultScrollViewportOptions): void {
  useLayoutEffect(() => {
    clearDocumentScrollLock();
  }, []);

  useLayoutEffect(() => {
    const scrollToTop = () => {
      scrollRef.current?.scrollTo({ top: 0, left: 0 });
    };

    scrollToTop();
    const frame1 = window.requestAnimationFrame(scrollToTop);
    const frame2 = window.requestAnimationFrame(scrollToTop);
    return () => {
      window.cancelAnimationFrame(frame1);
      window.cancelAnimationFrame(frame2);
    };
  }, [resetKey, scrollRef]);

  useEffect(() => {
    const outer = outerRef.current;
    const scroll = scrollRef.current;
    if (!outer || !scroll) return;

    const onWheel = (event: WheelEvent) => {
      if (!shouldForwardWheelToScroll(scroll, event.target)) return;
      if (forwardWheelToScrollContainer(scroll, event.deltaY)) {
        event.preventDefault();
      }
    };

    outer.addEventListener("wheel", onWheel, { passive: false });
    return () => outer.removeEventListener("wheel", onWheel);
  }, [outerRef, scrollRef, resetKey]);
}

/**
 * @deprecated Prefer useResultScrollViewport with a stable resetKey.
 * Clear document scroll locks left by exam/diagnostic shells; reset inner scroll region.
 */
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
