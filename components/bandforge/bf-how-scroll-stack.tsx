"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { BRAND_HOW_STEPS } from "@/lib/brand-mock-data";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Mobile How steps — minimal premium vertical timeline.
 * Scroll-spy highlights the step in view; entrance is staggered fade/slide.
 * Desktop rail + stage lives in bf-how.tsx.
 */
export function BfHowScrollStack() {
  const reduceMotion = useReducedMotion();
  const listRef = useRef<HTMLOListElement>(null);
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    const root = listRef.current;
    if (!root || reduceMotion) return;

    const items = root.querySelectorAll<HTMLElement>("[data-how-mobile-step]");
    if (!items.length) return;

    const ratios = new Map<number, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const n = Number(entry.target.getAttribute("data-how-mobile-step"));
          if (!Number.isFinite(n)) continue;
          ratios.set(n, entry.isIntersecting ? entry.intersectionRatio : 0);
        }

        let best = 1;
        let bestRatio = -1;
        for (const [n, ratio] of ratios) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = n;
          }
        }
        if (bestRatio > 0) setActiveStep(best);
      },
      {
        root: null,
        threshold: [0.2, 0.4, 0.55, 0.7],
        rootMargin: "-18% 0px -42% 0px",
      },
    );

    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [reduceMotion]);

  // Rescue: never leave steps stuck at opacity 0 if Motion misses whileInView
  useEffect(() => {
    if (reduceMotion) return;
    const root = listRef.current;
    if (!root) return;

    const timers: number[] = [];
    const items = root.querySelectorAll<HTMLElement>("[data-how-mobile-step]");

    const rescueObs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          const id = window.setTimeout(() => {
            const opacity = Number.parseFloat(getComputedStyle(el).opacity);
            if (!Number.isFinite(opacity) || opacity < 0.15) {
              el.style.opacity = "1";
              el.style.transform = "none";
            }
          }, 900);
          timers.push(id);
        }
      },
      { threshold: 0.25 },
    );

    items.forEach((el) => rescueObs.observe(el));
    return () => {
      rescueObs.disconnect();
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [reduceMotion]);

  const fillPct =
    BRAND_HOW_STEPS.length <= 1
      ? 100
      : ((activeStep - 1) / (BRAND_HOW_STEPS.length - 1)) * 100;

  return (
    <ol
      ref={listRef}
      className="bf-how-mobile-list relative mx-auto max-w-[22rem] list-none pl-0 sm:max-w-md"
    >
      {/* Timeline spine + progress fill */}
      <div
        className="pointer-events-none absolute top-4 bottom-4 left-[15px] w-px overflow-hidden bg-navy/[0.08] sm:left-[17px]"
        aria-hidden
      >
        <motion.div
          className="absolute inset-x-0 top-0 origin-top bg-gradient-to-b from-cyan via-teal to-teal/40"
          style={{ height: "100%" }}
          initial={false}
          animate={{
            scaleY: reduceMotion ? 1 : Math.max(fillPct / 100, 0.06),
          }}
          transition={{ duration: 0.45, ease: EASE }}
        />
      </div>

      {BRAND_HOW_STEPS.map((step, index) => {
        const active = activeStep === step.n;
        const done = step.n < activeStep;
        const isLast = index === BRAND_HOW_STEPS.length - 1;

        return (
          <motion.li
            key={step.n}
            data-how-mobile-step={step.n}
            className={cn(
              "relative flex gap-4 sm:gap-5",
              !isLast && "pb-8 sm:pb-9",
            )}
            initial={reduceMotion ? false : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4, margin: "0px 0px -6% 0px" }}
            transition={{
              duration: 0.5,
              delay: reduceMotion ? 0 : Math.min(index * 0.05, 0.25),
              ease: EASE,
            }}
          >
            {/* Marker */}
            <div className="relative z-[1] flex w-8 shrink-0 justify-center sm:w-9">
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full font-mono text-[0.6875rem] tabular-nums tracking-wide transition-[background-color,color,border-color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:size-9 sm:text-xs",
                  active
                    ? "scale-[1.06] border border-cyan bg-cyan text-white shadow-[0_8px_20px_-8px_rgb(0_188_212/0.55)]"
                    : done
                      ? "border border-teal/35 bg-[#eef9fa] text-teal"
                      : "border border-navy/10 bg-white text-navy/45",
                )}
                aria-current={active ? "step" : undefined}
              >
                {String(step.n).padStart(2, "0")}
              </span>
            </div>

            {/* Copy */}
            <div className="min-w-0 flex-1 pt-1">
              <h3
                className={cn(
                  "font-display text-[1.1875rem] leading-[1.15] font-bold tracking-[-0.025em] transition-colors duration-500 sm:text-[1.3125rem]",
                  active ? "text-navy" : "text-navy/70",
                )}
              >
                {step.title}
              </h3>
              <p
                className={cn(
                  "mt-1.5 max-w-[34ch] text-[0.875rem] leading-[1.55] transition-colors duration-500 sm:mt-2 sm:text-[0.9375rem]",
                  active ? "text-muted" : "text-muted-light",
                )}
              >
                {step.body}
              </p>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
