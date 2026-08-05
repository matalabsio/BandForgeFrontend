"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { SectionResultsBrandBar } from "./section-results-brand-bar";

type Props = {
  children: ReactNode;
  footer?: ReactNode;
  /** Centered confirmation layout (writing/speaking). */
  centered?: boolean;
  backHref?: string;
  onBack?: () => void;
  headerTitle?: string;
  /** Summary / confirmation: logo + section submitted badge above card. */
  showBrandBar?: boolean;
  logoHref?: string;
  badgeVariant?: "submitted" | "time-expired" | "all-correct";
  /** Wrap main content in a white card on the review page background. */
  card?: boolean;
};

export function SectionResultsShell({
  children,
  footer,
  centered = false,
  backHref,
  onBack,
  headerTitle,
  showBrandBar = false,
  logoHref,
  badgeVariant = "submitted",
  card = true,
}: Props) {
  const showHeader = Boolean(headerTitle || backHref || onBack);
  const useCard = card && !showHeader;

  return (
    <div className="flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden bg-[#F4F7FB]">
      {showHeader ? (
        <header className="shrink-0 border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
          <div className="mx-auto flex h-12 w-full max-w-3xl items-center gap-2 px-4 sm:h-14 sm:gap-3 sm:px-6 lg:max-w-4xl">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                aria-label="Go back"
                className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#EEF2F7] bg-[#F8FAFC] text-navy transition-colors hover:bg-[#F4F7FB] sm:size-10"
              >
                <ChevronLeft className="size-5" aria-hidden />
              </button>
            ) : backHref ? (
              <Link
                href={backHref}
                aria-label="Go back"
                className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#EEF2F7] bg-[#F8FAFC] text-navy transition-colors hover:bg-[#F4F7FB] sm:size-10"
              >
                <ChevronLeft className="size-5" aria-hidden />
              </Link>
            ) : (
              <div className="size-9 shrink-0 sm:size-10" aria-hidden />
            )}
            {headerTitle ? (
              <h1 className="min-w-0 flex-1 truncate text-center font-display text-[15px] font-bold tracking-tight text-navy sm:text-base">
                {headerTitle}
              </h1>
            ) : (
              <div className="flex-1" />
            )}
            <div className="size-9 shrink-0 sm:size-10" aria-hidden />
          </div>
        </header>
      ) : null}

      <div
        className={`min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] ${
          centered ? "flex flex-col" : ""
        }`}
      >
        <div
          className={`mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 sm:py-6 lg:max-w-4xl ${
            centered
              ? "flex flex-1 flex-col items-center justify-center py-8 sm:py-10"
              : ""
          } ${showHeader || footer ? "pb-6 sm:pb-8" : ""}`}
        >
          {showBrandBar ? (
            <SectionResultsBrandBar logoHref={logoHref} badgeVariant={badgeVariant} />
          ) : null}

          {useCard ? (
            <div className="rounded-[20px] border border-border-soft bg-white p-5 shadow-[0_8px_22px_rgb(13_31_60/0.05)] sm:p-6 lg:p-7">
              {children}
            </div>
          ) : showHeader ? (
            <div className="rounded-[20px] border border-border-soft bg-white p-5 shadow-[0_8px_22px_rgb(13_31_60/0.05)] sm:p-6 lg:p-7">
              {children}
            </div>
          ) : (
            children
          )}
        </div>
      </div>

      {footer ? (
        <div
          className="shrink-0 border-t border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90"
          style={{ paddingBottom: "max(0.875rem, env(safe-area-inset-bottom))" }}
        >
          <div className="mx-auto w-full max-w-3xl px-4 pt-3.5 sm:px-6 lg:max-w-4xl">{footer}</div>
        </div>
      ) : null}
    </div>
  );
}
