"use client";

import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { bfPrimaryCtaNavClass } from "@/components/bandforge/bf-primary-cta-styles";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  unlocked?: boolean;
  onUnlock?: () => void;
  unlockBusy?: boolean;
  unlockDisabled?: boolean;
  className?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
};

/**
 * Soft-locks personalised plan details behind a heavy blur until purchase.
 */
export function DiagnosticPersonalizedBlurLock({
  children,
  unlocked = false,
  onUnlock,
  unlockBusy = false,
  unlockDisabled = false,
  className,
  title = "Purchase your plan to unlock it",
  subtitle = "Difficulty tags, day split, and week-by-week path stay private until checkout.",
  ctaLabel,
}: Props) {
  if (unlocked) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={cn(
        "relative min-h-[240px] overflow-hidden rounded-xl sm:min-h-[280px]",
        className,
      )}
    >
      <div
        className="pointer-events-none select-none blur-[16px] saturate-[0.75] contrast-[0.88]"
        aria-hidden
      >
        {children}
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[rgba(248,250,252,0.88)] px-4 py-6 backdrop-blur-[2px] sm:gap-3 sm:px-6">
        <div className="mb-1 flex size-11 items-center justify-center rounded-full bg-[#0B1B33] shadow-[0_8px_20px_rgba(13,31,60,0.30)] sm:mb-2 sm:size-[52px]">
          <Lock className="size-[18px] text-[#2FB8C6] sm:size-[22px]" strokeWidth={2} />
        </div>
        <p className="max-w-md text-center text-[14px] leading-snug font-bold text-balance text-[#0B1B33] sm:text-[17px]">
          {title}
        </p>
        <p className="max-w-[380px] text-center text-[12px] leading-relaxed text-pretty text-[#4B5568] sm:text-[13.5px]">
          {subtitle}
        </p>
        {onUnlock ? (
          <button
            type="button"
            onClick={onUnlock}
            disabled={unlockDisabled || unlockBusy}
            className={cn(
              bfPrimaryCtaNavClass,
              "mt-1 w-full max-w-xs cursor-pointer px-4 text-center text-[13px] disabled:pointer-events-none disabled:opacity-60 sm:w-auto sm:max-w-none sm:text-[0.9375rem]",
            )}
          >
            {unlockBusy
              ? "Opening checkout…"
              : (ctaLabel ?? "Start my plan →")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
