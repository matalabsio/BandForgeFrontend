"use client";

import { useEffect, useState } from "react";
import ScrollStack, {
  ScrollStackItem,
} from "@/components/bandforge/scroll-stack";
import { BRAND_HOW_STEPS } from "@/lib/brand-mock-data";
import { cn } from "@/lib/utils";

function useIsMobileLg() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return isMobile;
}

/** Mobile-only ScrollStack for the six How-it-works steps. */
export function BfHowScrollStack({ activeStep = 1 }: { activeStep?: number }) {
  const isMobile = useIsMobileLg();

  if (!isMobile) return null;

  return (
    <ScrollStack
      useWindowScroll
      itemDistance={56}
      itemStackDistance={20}
      itemScale={0.028}
      baseScale={0.92}
      stackPosition="16%"
      scaleEndPosition="6%"
      rotationAmount={0}
      blurAmount={0}
      className="bf-how-scroll-stack"
    >
      {BRAND_HOW_STEPS.map((step) => {
        const active = activeStep === step.n;
        const done = step.n < activeStep;
        return (
          <ScrollStackItem key={step.n}>
            <div className="flex h-full flex-col items-center justify-center text-center">
              <span
                className={cn(
                  "mb-4 flex size-10 items-center justify-center rounded-full font-mono text-sm transition-[background-color,color,border-color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  active
                    ? "scale-110 border-2 border-cyan bg-cyan text-white shadow-[0_8px_20px_rgb(0_188_212/0.35)]"
                    : done
                      ? "border-2 border-cyan/40 bg-cyan/15 text-cyan"
                      : "border-2 border-cyan bg-white text-cyan",
                )}
              >
                {step.n}
              </span>
              <h3 className="font-display text-[1.375rem] font-bold text-navy">
                {step.title}
              </h3>
              <p className="mt-2 max-w-[28ch] text-[0.9375rem] leading-relaxed text-muted">
                {step.body}
              </p>
            </div>
          </ScrollStackItem>
        );
      })}
    </ScrollStack>
  );
}
