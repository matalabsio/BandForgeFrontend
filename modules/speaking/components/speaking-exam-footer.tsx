"use client";

import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  busy?: boolean;
  busyLabel?: string;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
};

/** Sticky exam footer — matches diagnostic module footer styling. */
export function SpeakingExamFooter({
  label,
  busy = false,
  busyLabel = "Submitting…",
  disabled = false,
  onClick,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "shrink-0 border-t border-navy/12 bg-white shadow-[0_-6px_24px_rgb(15_25_35/0.06)]",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-[760px] px-4 sm:px-6">
        <button
          type="button"
          disabled={disabled || busy}
          onClick={onClick}
          className="flex min-h-[var(--spacing-touch,48px)] w-full cursor-pointer items-center justify-center gap-2 rounded-[13px] border border-cyan/40 bg-cyan px-6 font-display text-base font-semibold text-[#06222B] shadow-[0_12px_28px_rgba(0,188,212,0.30)] transition-colors duration-200 hover:bg-brand-sky-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-500 disabled:opacity-100"
        >
          <span>{busy ? busyLabel : label}</span>
          {!busy ? <ArrowRight className="size-4 shrink-0" aria-hidden /> : null}
        </button>
      </div>
    </div>
  );
}
