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
 * Soft-locks personalised plan details behind a blur until purchase.
 */
export function DiagnosticPersonalizedBlurLock({
  children,
  unlocked = false,
  onUnlock,
  unlockBusy = false,
  unlockDisabled = false,
  className,
  title = "Purchase your plan to unlock your personalised study plan",
  subtitle = "Difficulty tags, day split, and week-by-week path stay private until checkout.",
  ctaLabel,
}: Props) {
  if (unlocked) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={cn(
        "relative min-h-[280px] overflow-hidden rounded-2xl border border-[#E8EDF3] bg-white shadow-[0_2px_12px_rgba(13,31,60,0.05)] sm:min-h-[320px] sm:rounded-[18px]",
        className,
      )}
    >
      <div
        className="pointer-events-none select-none space-y-4 p-3 blur-[6px] saturate-[0.9] contrast-[0.95] sm:space-y-5 sm:p-6"
        aria-hidden
      >
        {children}
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[rgba(248,250,252,0.55)] px-4 py-6 backdrop-blur-[0.5px] sm:gap-3.5 sm:px-6">
        <div className="flex size-11 items-center justify-center rounded-full bg-[#0D1F3C] shadow-[0_8px_20px_rgba(13,31,60,0.30)] sm:size-[52px]">
          <Lock className="size-[18px] text-white sm:size-[22px]" strokeWidth={2} />
        </div>
        <p className="max-w-md text-center text-[13px] leading-snug font-semibold text-balance text-[#0D1F3C] sm:text-[15px]">
          {title}
        </p>
        <p className="max-w-sm text-center text-[11.5px] leading-relaxed font-light text-pretty text-[#64748B] sm:text-[13px]">
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
              : (ctaLabel ?? "Unlock with Full Skill Program")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
