"use client";

import { cn } from "@/lib/utils";

type Props = {
  stepIndex: number;
  totalSteps: number;
  partStepIndex: number;
  partTotalSteps: number;
  part: 1 | 2 | 3;
  partLabel: string;
  className?: string;
};

export function SpeakingProgressHeader({
  stepIndex,
  totalSteps,
  partStepIndex,
  partTotalSteps,
  part,
  partLabel,
  className,
}: Props) {
  return (
    <header
      className={cn("shrink-0 border-b border-navy/10 bg-white px-4 py-3 sm:px-6 lg:px-10 lg:py-5", className)}
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex shrink-0 items-center gap-2" aria-label="BandForge">
            <span className="flex h-5 items-end gap-[3px]" aria-hidden>
              {[40, 60, 80, 100].map((height, index) => (
                <span
                  key={height}
                  className={cn("w-1 rounded-sm", index < 2 ? "bg-teal" : "bg-cyan")}
                  style={{ height: `${height}%` }}
                />
              ))}
            </span>
            <span className="font-display text-sm font-extrabold tracking-tight text-navy sm:text-base">
              Band<span className="text-teal">Forge</span>
            </span>
          </div>
          <p className="text-right font-mono text-[10px] tracking-[0.07em] text-[#5A6B82] uppercase sm:text-xs">
            Part {part} ·{" "}
            {part === 2 ? "Cue card" : `Question ${partStepIndex + 1} of ${partTotalSteps}`}
          </p>
        </div>
        <div
          className="mt-3 flex h-1 w-full gap-1.5 sm:mt-4 sm:h-[5px]"
          role="progressbar"
          aria-valuenow={stepIndex + 1}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-label={`${partLabel}, question ${stepIndex + 1} of ${totalSteps}`}
        >
          {Array.from({ length: partTotalSteps }).map((_, index) => (
            <span
              key={index}
              className={cn(
                "h-full min-w-0 flex-1 rounded-full transition-colors duration-200",
                index < partStepIndex
                  ? "bg-teal"
                  : index === partStepIndex
                    ? "bg-cyan shadow-[0_0_0_2.5px_rgba(0,188,212,0.18)]"
                    : "bg-navy/10",
              )}
              aria-hidden
            />
          ))}
        </div>
      </div>
    </header>
  );
}
