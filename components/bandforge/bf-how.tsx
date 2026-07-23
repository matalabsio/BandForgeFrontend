"use client";

import { useEffect, useRef, useState } from "react";
import {
  BfSectionEyebrow,
  BfSectionHeading,
} from "@/components/bandforge/ui";
import { BfHowScrollStack } from "@/components/bandforge/bf-how-scroll-stack";
import { BRAND_HOW_STEPS } from "@/lib/brand-mock-data";
import { cn } from "@/lib/utils";

const STEP_COUNT = BRAND_HOW_STEPS.length;
const STEP_HOLD_MS = 850;
const LOOP_PAUSE_MS = 1200;

function HowDesktopSteps({ activeStep }: { activeStep: number }) {
  const progressPct =
    STEP_COUNT <= 1 ? 0 : ((activeStep - 1) / (STEP_COUNT - 1)) * 100;

  return (
    <div className="relative">
      {/* Connector stays behind the number badges */}
      <div
        className="pointer-events-none absolute top-[18px] right-[8%] left-[8%] z-0 hidden h-0.5 overflow-hidden rounded-full bg-border-muted lg:block"
        aria-hidden
      >
        <div
          className="bf-how-progress-fill h-full origin-left rounded-full bg-cyan"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <ol className="relative z-10 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 lg:gap-5">
        {BRAND_HOW_STEPS.map((step) => {
          const active = activeStep === step.n;
          const done = step.n < activeStep;
          return (
            <li key={step.n} className="bf-how-step relative text-center">
              <span
                className={cn(
                  "relative z-10 mx-auto mb-4 flex size-[38px] items-center justify-center rounded-full font-mono text-sm transition-[background-color,color,border-color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  active
                    ? "scale-110 border-2 border-cyan bg-cyan text-white shadow-[0_8px_20px_rgb(0_188_212/0.35)]"
                    : done
                      ? "border-2 border-cyan bg-[#e0f7fa] text-cyan"
                      : "border-2 border-cyan bg-white text-cyan",
                )}
              >
                {step.n}
              </span>
              <p
                className={cn(
                  "font-display text-[1.0625rem] font-semibold transition-colors duration-500",
                  active ? "text-navy" : "text-navy/80",
                )}
              >
                {step.title}
              </p>
              <p className="mt-1.5 text-[0.84375rem] leading-normal text-muted">
                {step.body}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function BandForgeHow() {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setInView(true);
      setActiveStep(STEP_COUNT);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.22, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let step = 1;
    let cancelled = false;
    let timer: number | undefined;
    setActiveStep(1);

    const schedule = (fn: () => void, ms: number) => {
      timer = window.setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
    };

    const tick = () => {
      if (step >= STEP_COUNT) {
        schedule(() => {
          step = 1;
          setActiveStep(1);
          schedule(tick, STEP_HOLD_MS);
        }, LOOP_PAUSE_MS);
        return;
      }
      step += 1;
      setActiveStep(step);
      schedule(tick, STEP_HOLD_MS);
    };

    schedule(tick, STEP_HOLD_MS);
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [inView]);

  return (
    <section
      ref={sectionRef}
      id="how"
      className={cn(
        "bf-ambient bf-section bf-how-reveal scroll-mt-20 bg-white",
        inView && "is-inview",
      )}
    >
      <div className="bf-container">
        <div className="bf-how-head bf-section-head mb-7 lg:mb-[54px]">
          <BfSectionEyebrow className="mb-3">How it works</BfSectionEyebrow>
          <BfSectionHeading>Six steps, start to band score</BfSectionHeading>
        </div>

        <div className="hidden lg:block">
          <HowDesktopSteps activeStep={activeStep} />
        </div>
      </div>

      <div className="lg:hidden">
        <div className="bf-container">
          <BfHowScrollStack activeStep={activeStep} />
        </div>
      </div>
    </section>
  );
}
