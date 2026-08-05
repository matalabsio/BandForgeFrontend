"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, X } from "lucide-react";
import { motion } from "motion/react";
import { DASH_EASE } from "@/components/bandforge/dashboard/motion";
import type { MissedDay } from "@/lib/study-plan-calendar";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  missed: MissedDay[];
  catchUpHref: string;
  onCatchUp?: () => void;
};

function formatMissedDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(new Date(`${iso}T12:00:00`));
  } catch {
    return iso;
  }
}

export function CatchUpDaysModal({
  open,
  onClose,
  missed,
  catchUpHref,
  onCatchUp,
}: Props) {
  if (!open || missed.length === 0) return null;

  const visible = missed.slice(0, 5);
  const extra = missed.length - visible.length;
  const totalIncomplete = missed.reduce((n, d) => n + d.incompleteCount, 0);

  return (
    <div className="fixed inset-0 z-[85] flex items-end justify-center p-3 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Dismiss catch-up"
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-ink/55 backdrop-blur-[2px]"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="catch-up-heading"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.28, ease: DASH_EASE }}
        className="relative z-10 w-full max-w-[400px] overflow-hidden rounded-[22px] border border-white/70 bg-white shadow-[0_30px_90px_rgba(2,8,23,0.38)]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-ink/[0.06] px-4 py-3">
          <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
            <CalendarDays className="size-3.5 text-teal" aria-hidden />
            Catch up
          </p>
          <button
            type="button"
            aria-label="Close catch-up modal"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1.5 text-muted transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="px-4 py-4 sm:px-5">
          <h2
            id="catch-up-heading"
            className="font-display text-xl font-bold tracking-tight text-ink"
          >
            Today&apos;s done — catch up?
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
            You have {missed.length} incomplete day
            {missed.length === 1 ? "" : "s"}
            {totalIncomplete > 0
              ? ` (${totalIncomplete} task${totalIncomplete === 1 ? "" : "s"})`
              : ""}
            . Finish the oldest first — today&apos;s plan stays complete.
          </p>

          <ul className="mt-4 space-y-2">
            {visible.map((day, i) => (
              <li
                key={day.date}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-xl border border-ink/8 bg-surface/40 px-3 py-2.5",
                  i === 0 && "border-amber-200/80 bg-amber-50/70",
                )}
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-ink">
                    {formatMissedDate(day.date)}
                    {i === 0 ? (
                      <span className="ml-1.5 text-[11px] font-semibold text-amber-800">
                        Oldest
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-muted">
                    {day.incompleteCount} incomplete
                  </p>
                </div>
              </li>
            ))}
          </ul>
          {extra > 0 ? (
            <p className="mt-2 text-[12px] text-muted">
              +{extra} more incomplete day{extra === 1 ? "" : "s"}
            </p>
          ) : null}
        </div>

        <div className="space-y-2 border-t border-ink/[0.06] bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <Link
            href={catchUpHref}
            onClick={() => onCatchUp?.()}
            className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-navy px-4 text-[13px] font-bold text-white transition-colors hover:bg-navy/90"
          >
            Catch up
            <ArrowRight className="size-4" strokeWidth={2.5} aria-hidden />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-10 w-full cursor-pointer items-center justify-center rounded-xl border border-ink/10 bg-white px-4 text-[13px] font-semibold text-muted transition-colors hover:border-cyan/30 hover:text-teal"
          >
            Not now
          </button>
          <Link
            href="/study-plan"
            onClick={() => onCatchUp?.()}
            className="inline-flex w-full cursor-pointer items-center justify-center py-1.5 text-[12.5px] font-semibold text-teal transition-colors hover:text-cyan"
          >
            View full plan
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
