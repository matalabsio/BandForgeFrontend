"use client";

import { useEffect, useState } from "react";
import ScrollStack, {
  ScrollStackItem,
} from "@/components/bandforge/scroll-stack";
import { BRAND_HOW_STEPS } from "@/lib/brand-mock-data";

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
export function BfHowScrollStack() {
  const isMobile = useIsMobileLg();

  if (!isMobile) return null;

  return (
    <ScrollStack
      useWindowScroll
      itemDistance={72}
      itemStackDistance={24}
      itemScale={0.035}
      baseScale={0.9}
      stackPosition="18%"
      scaleEndPosition="8%"
      rotationAmount={0}
      blurAmount={0}
      className="bf-how-scroll-stack"
    >
      {BRAND_HOW_STEPS.map((step) => (
        <ScrollStackItem key={step.n}>
          <div className="flex h-full flex-col items-center justify-center text-center">
            <span
              className={`mb-4 flex size-10 items-center justify-center rounded-full font-mono text-sm ${
                step.n === BRAND_HOW_STEPS.length
                  ? "bg-cyan text-white"
                  : "border-2 border-cyan bg-white text-cyan"
              }`}
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
      ))}
    </ScrollStack>
  );
}
