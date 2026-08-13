"use client";

import { ArrowRight } from "lucide-react";
import {
  bfPrimaryCtaDiagClass,
  bfPrimaryCtaDiagInnerClass,
} from "@/components/bandforge/bf-primary-cta-styles";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  busy?: boolean;
  busyLabel?: string;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
};

/** Sticky exam footer — one Next / Submit control. */
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
        "shrink-0 border-t border-border-soft bg-white/95 shadow-[0_-4px_24px_rgb(15_25_35/0.06)] backdrop-blur-md",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-[760px] px-4 sm:px-6">
        <button
          type="button"
          disabled={disabled || busy}
          onClick={onClick}
          className={bfPrimaryCtaDiagClass}
        >
          <span className={bfPrimaryCtaDiagInnerClass}>
            {busy ? busyLabel : label}
            {!busy ? (
              <ArrowRight className="size-4 shrink-0" aria-hidden />
            ) : null}
          </span>
        </button>
      </div>
    </div>
  );
}
