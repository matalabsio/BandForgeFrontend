"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

export type ExamPartFooterVariant = "listening" | "reading" | "writing";

type Props = {
  label: string;
  variant?: ExamPartFooterVariant;
  busy?: boolean;
  disabled?: boolean;
  onAction: () => void;
};

const accentClass: Record<ExamPartFooterVariant, string> = {
  listening: "bg-[var(--exam-accent)] hover:bg-cyan",
  reading: "bg-[var(--reading-accent)] hover:bg-cyan",
  writing: "bg-cyan hover:bg-cyan",
};

const borderClass: Record<ExamPartFooterVariant, string> = {
  listening: "border-[var(--exam-border)]",
  reading: "border-[var(--reading-border)]",
  writing: "border-[var(--reading-border)]",
};

function ExamPartFooterBase({
  label,
  variant = "listening",
  busy,
  disabled,
  onAction,
}: Props) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-20 shrink-0 border-t bg-white/95 backdrop-blur-sm",
        borderClass[variant],
        "px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
      )}
    >
      <div className="flex justify-stretch sm:justify-end">
        <button
          type="button"
          disabled={disabled || busy}
          onClick={onAction}
          className={cn(
            "flex min-h-[44px] w-full cursor-pointer items-center justify-center rounded-xl px-6",
            "text-[14px] font-bold text-white shadow-sm transition-colors sm:w-auto sm:min-w-[10rem]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            accentClass[variant],
          )}
        >
          {busy ? "Submitting…" : label}
        </button>
      </div>
    </div>
  );
}

export const ExamPartFooter = memo(ExamPartFooterBase);
