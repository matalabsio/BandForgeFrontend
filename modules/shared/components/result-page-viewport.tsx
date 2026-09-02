"use client";

import { useRef, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/utils";
import { useResultScrollViewport } from "@/lib/use-unlock-page-scroll";

/** Single scroll owner — do not add overflow-y-auto children inside the scroll region. */
export const RESULT_VIEWPORT_SCROLL_CLASS =
  "min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch]";

export type ResultScrollMaxWidth = "section" | "report" | "writing" | "full";

const MAX_WIDTH_CLASS: Record<ResultScrollMaxWidth, string> = {
  section: "max-w-3xl lg:max-w-4xl",
  report: "max-w-[1240px]",
  writing: "max-w-7xl",
  full: "max-w-none",
};

const FOOTER_MAX_WIDTH_CLASS: Record<ResultScrollMaxWidth, string> = {
  section: "max-w-3xl lg:max-w-4xl",
  report: "max-w-[1240px]",
  writing: "max-w-7xl",
  full: "max-w-none",
};

type Props = {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  /** Vertically center content in the scroll region (loading / empty states). */
  centered?: boolean;
  className?: string;
  scrollClassName?: string;
  contentClassName?: string;
  /** When this value changes, the scroll region resets to the top. */
  scrollResetKey?: unknown;
  /** @deprecated Use scrollResetKey */
  unlockKey?: unknown;
  maxWidth?: ResultScrollMaxWidth;
  /** When false, children render directly in the scroll region (no inner content wrapper). */
  wrapContent?: boolean;
  /** Optional external ref for the scroll region (e.g. review highlight scrolling). */
  scrollRef?: RefObject<HTMLDivElement | null>;
};

/**
 * Full-viewport result shell with a single scroll region and document unlock on mount.
 */
export function ResultScrollShell({
  children,
  header,
  footer,
  centered = false,
  className,
  scrollClassName,
  contentClassName,
  scrollResetKey,
  unlockKey,
  maxWidth = "section",
  wrapContent = true,
  scrollRef: scrollRefProp,
}: Props) {
  const outerRef = useRef<HTMLDivElement>(null);
  const internalScrollRef = useRef<HTMLDivElement>(null);
  const scrollRef = scrollRefProp ?? internalScrollRef;
  const resetKey = scrollResetKey ?? unlockKey;

  useResultScrollViewport({ scrollRef, outerRef, resetKey });

  const contentWidthClass = MAX_WIDTH_CLASS[maxWidth];
  const footerWidthClass = FOOTER_MAX_WIDTH_CLASS[maxWidth];

  return (
    <div
      ref={outerRef}
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
        {wrapContent ? (
          <div
            className={cn(
              "mx-auto w-full px-4 py-4 sm:px-6 sm:py-6",
              contentWidthClass,
              centered &&
                "flex min-h-min flex-1 flex-col items-center justify-center py-8 sm:py-10",
              footer ? "pb-6 sm:pb-8" : "",
              contentClassName,
            )}
          >
            {children}
          </div>
        ) : (
          children
        )}
      </div>

      {footer ? (
        <div
          className="shrink-0 border-t border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90"
          style={{ paddingBottom: "max(0.875rem, env(safe-area-inset-bottom))" }}
        >
          <div
            className={cn(
              "mx-auto w-full px-4 pt-3.5 sm:px-6",
              footerWidthClass,
            )}
          >
            {footer}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** @deprecated Use ResultScrollShell */
export const ResultPageViewport = ResultScrollShell;
