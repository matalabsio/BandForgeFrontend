"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  subtitle?: string;
  hint?: string;
  children?: ReactNode;
  className?: string;
};

const DEFAULT_HINT = "Almost ready — hang on a moment.";

/**
 * Full-screen loading overlay for exam sections (start / page boot).
 * Prefer pairing with a layout underlay (`children`) for lighter perceived wait.
 */
export function ExamSectionLoader({
  title,
  subtitle,
  hint = DEFAULT_HINT,
  children,
  className,
}: Props) {
  return (
    <div
      className={cn("relative flex min-h-dvh w-full flex-1 flex-col", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white/92 px-6 backdrop-blur-[2px]">
        <div
          className="size-11 animate-spin rounded-full border-[3px] border-teal/20 border-t-teal"
          aria-hidden
        />
        <div className="max-w-md text-center">
          <p className="font-display text-[16px] font-bold text-navy">{title}</p>
          {subtitle ? (
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink/70">
              {subtitle}
            </p>
          ) : null}
          <p className="mt-3 text-[12px] leading-relaxed text-ink/50">{hint}</p>
        </div>
      </div>
      {children ? (
        <div className="pointer-events-none select-none opacity-35" aria-hidden>
          {children}
        </div>
      ) : null}
    </div>
  );
}

type OverlayProps = {
  title: string;
  subtitle?: string;
  hint?: string;
};

/**
 * Blocks interaction while submit / transition requests are in flight.
 */
export function ExamBusyOverlay({
  title,
  subtitle,
  hint = "Almost done…",
}: OverlayProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-[var(--exam-bar)]/40 px-6 backdrop-blur-[3px]"
      role="alertdialog"
      aria-modal="true"
      aria-live="assertive"
      aria-busy="true"
      aria-label={title}
    >
      <div className="flex max-w-md flex-col items-center gap-4 rounded-xl border border-white/20 bg-white px-8 py-7 shadow-xl">
        <div
          className="size-11 animate-spin rounded-full border-[3px] border-teal/20 border-t-teal"
          aria-hidden
        />
        <div className="text-center">
          <p className="font-display text-[16px] font-bold text-navy">{title}</p>
          {subtitle ? (
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink/70">
              {subtitle}
            </p>
          ) : null}
          <p className="mt-3 text-[12px] leading-relaxed text-ink/50">{hint}</p>
        </div>
      </div>
    </div>
  );
}
