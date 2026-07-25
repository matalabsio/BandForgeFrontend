"use client";

import { useEffect, useState } from "react";
import ScrollStack, {
  ScrollStackItem,
} from "@/components/bandforge/scroll-stack";
import { GlowCard, type GlowColor } from "@/components/ui/spotlight-card";
import { BRAND_HOW_STEPS } from "@/lib/brand-mock-data";
import { cn } from "@/lib/utils";

const STEP_GLOW: Record<number, GlowColor> = {
  1: "teal",
  2: "cyan",
  3: "navy",
  4: "teal",
  5: "cyan",
  6: "navy",
};

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
            <GlowCard
              glass
              inkBorder
              customSize
              glowColor={STEP_GLOW[step.n] ?? "cyan"}
              className="group bf-liquid-glass flex h-full w-full flex-col items-center justify-center !rounded-[1.25rem] !p-6"
            >
              <div
                className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
                aria-hidden
              >
                <div className="absolute -top-1/3 left-[-10%] h-[70%] w-[120%] rotate-[-8deg] bg-[linear-gradient(180deg,rgb(255_255_255/0.55)_0%,rgb(255_255_255/0.08)_45%,transparent_70%)] opacity-80" />
                <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
              </div>
              <div className="relative z-[1] flex h-full flex-col items-center justify-center text-center">
                <span
                  className={cn(
                    "mb-4 flex size-10 items-center justify-center rounded-full font-mono text-sm transition-[background-color,color,border-color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    active
                      ? "scale-110 border-2 border-cyan bg-cyan text-white shadow-[0_8px_20px_rgb(0_188_212/0.35)]"
                      : done
                        ? "border-2 border-cyan/40 bg-cyan/15 text-cyan"
                        : "border-2 border-cyan bg-white/80 text-cyan",
                  )}
                >
                  {step.n}
                </span>
                <h3 className="font-display text-[1.375rem] font-bold text-navy">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-[28ch] line-clamp-2 text-[0.9375rem] leading-snug text-muted">
                  {step.body}
                </p>
              </div>
            </GlowCard>
          </ScrollStackItem>
        );
      })}
    </ScrollStack>
  );
}
