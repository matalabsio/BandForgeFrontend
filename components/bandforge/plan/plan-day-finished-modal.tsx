"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, X } from "lucide-react";
import { motion } from "motion/react";
import { DASH_EASE } from "@/components/bandforge/dashboard/motion";
import { cn } from "@/lib/utils";

export type PlanDayFinishOption = {
  kind: "catch_up" | "tomorrow" | "today";
  href: string;
  label: string;
  hint: string;
  onNavigate?: () => void;
};

type Props = {
  open: boolean;
  onClose: () => void;
  catchUp: PlanDayFinishOption | null;
  tomorrow: PlanDayFinishOption | null;
  onGoToday: () => void;
};

export function PlanDayFinishedModal({
  open,
  onClose,
  catchUp,
  tomorrow,
  onGoToday,
}: Props) {
  if (!open) return null;

  const primary = catchUp ?? tomorrow;
  const secondary = catchUp && tomorrow ? tomorrow : null;

  return (
    <div className="fixed inset-0 z-[85] flex items-end justify-center p-3 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-ink/55 backdrop-blur-[2px]"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="plan-day-finished-heading"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.28, ease: DASH_EASE }}
        className="relative z-10 w-full max-w-[400px] overflow-hidden rounded-[22px] border border-white/70 bg-white shadow-[0_30px_90px_rgba(2,8,23,0.38)]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-ink/[0.06] px-4 py-3">
          <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
            <CheckCircle2 className="size-3.5 text-teal" aria-hidden />
            Day complete
          </p>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1.5 text-muted transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="px-4 py-4 sm:px-5">
          <h2
            id="plan-day-finished-heading"
            className="font-display text-xl font-bold tracking-tight text-ink"
          >
            What&apos;s next?
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
            {catchUp
              ? "You still have unfinished previous days. Catch up first, or open today&apos;s plan overview."
              : tomorrow
                ? "Today&apos;s plan is done. Start tomorrow early, or head back to today&apos;s overview."
                : "Today&apos;s plan is done. Head back to your study plan overview."}
          </p>

          {catchUp ? (
            <div className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50/70 px-3 py-2.5">
              <p className="flex items-center gap-1.5 text-[12px] font-semibold text-amber-900">
                <CalendarDays className="size-3.5" aria-hidden />
                Previous days incomplete
              </p>
              <p className="mt-0.5 text-[11.5px] text-amber-900/80">
                {catchUp.hint}
              </p>
            </div>
          ) : null}
        </div>

        <div className="space-y-2 border-t border-ink/[0.06] bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {primary ? (
            <Link
              href={primary.href}
              onClick={() => {
                primary.onNavigate?.();
                onClose();
              }}
              className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-navy px-4 text-[13px] font-bold text-white transition-colors hover:bg-navy/90"
            >
              {primary.label}
              <ArrowRight className="size-4" strokeWidth={2.5} aria-hidden />
            </Link>
          ) : null}

          {secondary ? (
            <Link
              href={secondary.href}
              onClick={() => {
                secondary.onNavigate?.();
                onClose();
              }}
              className={cn(
                "inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 text-[13px] font-semibold transition-colors",
                "border-teal/30 bg-cyan-soft/40 text-navy hover:bg-cyan-soft",
              )}
            >
              {secondary.label}
            </Link>
          ) : null}

          <button
            type="button"
            onClick={() => {
              onGoToday();
              onClose();
            }}
            className="inline-flex min-h-10 w-full cursor-pointer items-center justify-center rounded-xl border border-ink/10 bg-white px-4 text-[13px] font-semibold text-muted transition-colors hover:border-cyan/30 hover:text-teal"
          >
            Back to Today&apos;s plan
          </button>

          <Link
            href="/study-plan"
            onClick={onClose}
            className="inline-flex w-full cursor-pointer items-center justify-center py-1.5 text-[12.5px] font-semibold text-teal transition-colors hover:text-cyan"
          >
            View full plan
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
