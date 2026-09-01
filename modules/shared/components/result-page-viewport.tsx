"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useUnlockPageScroll } from "@/lib/use-unlock-page-scroll";

/** Single scroll owner — do not add overflow-y-auto children inside the scroll region. */
export const RESULT_VIEWPORT_SCROLL_CLASS =
  "min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]";

type Props = {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  /** Vertically center content in the scroll region (loading / empty states). */
  centered?: boolean;
  className?: string;
  scrollClassName?: string;
  contentClassName?: string;
  /** Passed to useUnlockPageScroll so scroll resets when content changes. */
  unlockKey?: unknown;
};

/**
 * Full-viewport shell for pending / loading / aggregate result pages.
 * One fixed inset-0 frame with a single scroll region and document unlock on mount.
 */
export function ResultPageViewport({
  children,
  header,
  footer,
  centered = false,
  className,
  scrollClassName,
  contentClassName,
  unlockKey,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useUnlockPageScroll(scrollRef, [unlockKey, header, footer, centered, children]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#F4F7FB] text-ink",
        className,
      )}
    >
      {header ? <div className="shrink-0">{header}</div> : null}

      <div
        ref={scrollRef}
        className={cn(
          RESULT_VIEWPORT_SCROLL_CLASS,
          centered && "flex flex-col",
          scrollClassName,
        )}
      >
        <div
          className={cn(
            "mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 sm:py-6 lg:max-w-4xl",
            centered &&
              "flex min-h-min flex-1 flex-col items-center justify-center py-8 sm:py-10",
            footer ? "pb-6 sm:pb-8" : "",
            contentClassName,
          )}
        >
          {children}
        </div>
      </div>

      {footer ? (
        <div
          className="shrink-0 border-t border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90"
          style={{ paddingBottom: "max(0.875rem, env(safe-area-inset-bottom))" }}
        >
          <div className="mx-auto w-full max-w-3xl px-4 pt-3.5 sm:px-6 lg:max-w-4xl">
            {footer}
          </div>
        </div>
      ) : null}
    </div>
  );
}
