"use client";

import { memo } from "react";
import { bfPrimaryCtaExamFooterClass } from "@/components/bandforge/bf-primary-cta-styles";
import { cn } from "@/lib/utils";

export type ExamPartFooterVariant = "listening" | "reading" | "writing";

type Props = {
  label: string;
  variant?: ExamPartFooterVariant;
  busy?: boolean;
  disabled?: boolean;
  onAction: () => void;
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
          className={bfPrimaryCtaExamFooterClass}
        >
          {busy ? "Submitting…" : label}
        </button>
      </div>
    </div>
  );
}

export const ExamPartFooter = memo(ExamPartFooterBase);
