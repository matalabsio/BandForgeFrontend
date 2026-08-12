"use client";

import { bfPrimaryCtaExamFooterClass } from "@/components/bandforge/bf-primary-cta-styles";
import { formatTimer } from "@/lib/utils";

type Props = {
  open: boolean;
  remainingSeconds: number;
  onDismiss: () => void;
};

export function ExamTimeWarningDialog({
  open,
  remainingSeconds,
  onDismiss,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[var(--exam-bar,#0D1F3C)]/70 p-4 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="exam-time-warning-title"
      aria-describedby="exam-time-warning-desc"
    >
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-white p-6 shadow-xl sm:p-7">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#DC2626]">
          Time warning
        </p>
        <h2
          id="exam-time-warning-title"
          className="mt-1.5 font-display text-[22px] font-bold text-navy"
        >
          2 minutes left
        </h2>
        <p
          id="exam-time-warning-desc"
          className="mt-2 text-[14px] leading-relaxed text-ink/70"
        >
          The timer stays red until the section ends. Your answers will submit
          automatically at 0:00.
        </p>
        <p className="mt-4 font-mono text-[20px] font-bold tabular-nums text-[#DC2626]">
          {formatTimer(remainingSeconds)}
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className={`${bfPrimaryCtaExamFooterClass} mt-5 w-full sm:w-full`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
