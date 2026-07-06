"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ChevronLeft, Loader2 } from "lucide-react";
import { ModuleCoachCard } from "./module-coach-card";

type Props = {
  pageTitle: string;
  backHref?: string;
  coachTitle: string;
  coachMessage: string;
  /** Score hero for L/R, or an AI-estimate badge area for W/S. */
  hero?: ReactNode;
  /** Grouped question review, or writing/speaking task cards. */
  children: ReactNode;
  ctaLabel: string;
  onContinue: () => void;
  ctaLoading?: boolean;
  ctaDisabled?: boolean;
};

export function ModuleReviewPanel({
  pageTitle,
  backHref = "/test",
  coachTitle,
  coachMessage,
  hero,
  children,
  ctaLabel,
  onContinue,
  ctaLoading = false,
  ctaDisabled = false,
}: Props) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <header className="shrink-0 border-b border-[#E3E9F1] bg-white">
        <div className="mx-auto flex h-12 w-full max-w-3xl items-center gap-2 px-4 sm:h-14 sm:gap-3 sm:px-6">
          <Link
            href={backHref}
            aria-label="Back to test"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-[#E3E9F1] bg-white text-navy transition-colors hover:bg-[#F4F7FB] sm:size-10"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </Link>
          <h1 className="min-w-0 flex-1 truncate font-display text-[14px] font-bold tracking-tight text-navy sm:text-base">
            {pageTitle}
          </h1>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
        <div className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-4 sm:gap-5">
            <ModuleCoachCard title={coachTitle} message={coachMessage} />
            {hero}
            {children}
          </div>
          {/* Space so the last card is not hidden behind the sticky footer */}
          <div className="h-4 shrink-0 sm:h-6" aria-hidden />
        </div>
      </div>

      <div
        className="shrink-0 border-t border-[#E3E9F1] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80"
        style={{ paddingBottom: "max(0.875rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto w-full max-w-3xl px-4 pt-3.5 sm:px-6">
          <button
            type="button"
            onClick={onContinue}
            disabled={ctaLoading || ctaDisabled}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy px-5 py-3.5 font-display text-[15px] font-semibold text-white transition-colors hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {ctaLoading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : null}
            {ctaLabel}
            {!ctaLoading ? <ArrowRight className="size-4" aria-hidden /> : null}
          </button>
        </div>
      </div>
    </div>
  );
}
