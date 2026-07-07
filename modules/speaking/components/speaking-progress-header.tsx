"use client";

import { cn } from "@/lib/utils";

type Props = {
  stepIndex: number;
  totalSteps: number;
  part: 1 | 2 | 3;
  partLabel: string;
  className?: string;
};

export function SpeakingProgressHeader({
  stepIndex,
  totalSteps,
  part,
  partLabel,
  className,
}: Props) {
  const progress = totalSteps > 0 ? ((stepIndex + 1) / totalSteps) * 100 : 0;

  return (
    <div className={cn("shrink-0 border-b border-navy/8 bg-white px-4 py-3 sm:px-6", className)}>
      <div className="mx-auto w-full max-w-[760px]">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[10px] tracking-wider text-teal uppercase sm:text-[10.5px]">
            Part {part}
          </p>
          <p className="font-mono text-[10px] text-[#6E83A0] sm:text-[11px]">
            {stepIndex + 1} / {totalSteps}
          </p>
        </div>
        <p className="mt-1 truncate font-display text-sm font-semibold text-navy sm:text-base">
          {partLabel}
        </p>
        <div
          className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-navy/8"
          role="progressbar"
          aria-valuenow={stepIndex + 1}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-label="Speaking progress"
        >
          <div
            className="h-full rounded-full bg-cyan transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
