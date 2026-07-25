"use client";

import { BRAND_HOW_STEPS } from "@/lib/brand-mock-data";
import { cn } from "@/lib/utils";

/**
 * Mobile How steps — light vertical list (no ScrollStack / Lenis / spotlight).
 * Desktop uses the rail + stage in bf-how.tsx.
 */
export function BfHowScrollStack({ activeStep = 1 }: { activeStep?: number }) {
  return (
    <ol className="bf-how-mobile-list flex flex-col gap-3 sm:gap-4">
      {BRAND_HOW_STEPS.map((step) => {
        const active = activeStep === step.n;
        const done = step.n < activeStep;
        return (
          <li key={step.n}>
            <article
              className={cn(
                "rounded-[1.25rem] border bg-white px-5 py-5 shadow-[0_8px_24px_-16px_rgb(13_31_60/0.12)] transition-[border-color,box-shadow] duration-300 sm:px-6 sm:py-6",
                active
                  ? "border-cyan/45 shadow-[0_10px_28px_-14px_rgb(0_188_212/0.28)]"
                  : done
                    ? "border-cyan/25"
                    : "border-navy/10",
              )}
            >
              <div className="flex items-start gap-4 text-left">
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-full font-mono text-sm transition-[background-color,color,border-color] duration-300",
                    active
                      ? "border-2 border-cyan bg-cyan text-white"
                      : done
                        ? "border-2 border-cyan/40 bg-cyan/12 text-cyan"
                        : "border-2 border-cyan/50 bg-white text-cyan",
                  )}
                >
                  {step.n}
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="font-mono text-[0.6875rem] tracking-[0.14em] text-cyan">
                    STEP {String(step.n).padStart(2, "0")} / 06
                  </p>
                  <h3 className="font-display mt-1 text-[1.25rem] font-bold text-navy sm:text-[1.375rem]">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-[0.9375rem] leading-snug text-muted">
                    {step.body}
                  </p>
                </div>
              </div>
            </article>
          </li>
        );
      })}
    </ol>
  );
}
