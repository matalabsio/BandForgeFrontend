"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { gsap } from "gsap";
import {
  BookOpen,
  ClipboardCheck,
  MessageSquareText,
  Target,
  TrendingUp,
  Layers,
  type LucideProps,
} from "lucide-react";
import {
  BfSectionEyebrow,
  BfSectionHeading,
} from "@/components/bandforge/ui";
import { BfHowScrollStack } from "@/components/bandforge/bf-how-scroll-stack";
import { BRAND_HOW_STEPS } from "@/lib/brand-mock-data";
import { cn } from "@/lib/utils";

const STEP_COUNT = BRAND_HOW_STEPS.length;
const STEP_HOLD_MS = 2000;
const LOOP_PAUSE_MS = 1200;

const easeOut = [0.22, 1, 0.36, 1] as const;

const STEP_ICONS: Record<
  number,
  ComponentType<LucideProps>
> = {
  1: Target,
  2: ClipboardCheck,
  3: BookOpen,
  4: Layers,
  5: MessageSquareText,
  6: TrendingUp,
};

function HowDesktopSteps({
  activeStep,
  inView,
  onSelect,
}: {
  activeStep: number;
  inView: boolean;
  onSelect: (n: number) => void;
}) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const enteredRef = useRef(false);

  const progressPct =
    STEP_COUNT <= 1 ? 0 : ((activeStep - 1) / (STEP_COUNT - 1)) * 100;

  const active = BRAND_HOW_STEPS.find((s) => s.n === activeStep) ?? BRAND_HOW_STEPS[0];
  const ActiveIcon = STEP_ICONS[active.n] ?? Target;

  useEffect(() => {
    if (!inView || enteredRef.current) return;
    const root = rootRef.current;
    if (!root) return;

    const markers = root.querySelectorAll<HTMLElement>("[data-how-marker]");
    const labels = root.querySelectorAll<HTMLElement>("[data-how-label]");
    const track = root.querySelector<HTMLElement>("[data-how-track]");
    const stage = root.querySelector<HTMLElement>("[data-how-stage]");
    const fill = fillRef.current;

    if (reduceMotion) {
      gsap.set([markers, labels, track, stage], { clearProps: "all", opacity: 1, y: 0 });
      if (fill) gsap.set(fill, { scaleX: progressPct / 100 });
      enteredRef.current = true;
      return;
    }

    enteredRef.current = true;
    const ctx = gsap.context(() => {
      gsap.set(markers, { opacity: 0, y: 20, scale: 0.85 });
      gsap.set(labels, { opacity: 0, y: 12 });
      gsap.set(track, { opacity: 0, scaleX: 0.6, transformOrigin: "left center" });
      gsap.set(stage, { opacity: 0, y: 24 });
      if (fill) gsap.set(fill, { scaleX: 0, transformOrigin: "left center" });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(track, { opacity: 1, scaleX: 1, duration: 0.55 })
        .to(
          markers,
          { opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.06 },
          "-=0.28",
        )
        .to(
          labels,
          { opacity: 1, y: 0, duration: 0.45, stagger: 0.05 },
          "-=0.35",
        )
        .to(stage, { opacity: 1, y: 0, duration: 0.55 }, "-=0.2");

      if (fill) {
        tl.to(
          fill,
          { scaleX: progressPct / 100, duration: 0.55, ease: "power2.out" },
          "-=0.45",
        );
      }
    }, root);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduceMotion]);

  useEffect(() => {
    if (!enteredRef.current) return;
    const fill = fillRef.current;
    if (!fill) return;

    gsap.to(fill, {
      scaleX: progressPct / 100,
      duration: reduceMotion ? 0 : 0.85,
      ease: "power3.inOut",
      overwrite: "auto",
    });
  }, [progressPct, reduceMotion]);

  return (
    <div ref={rootRef} className="mx-auto w-full">
      {/* Progress rail + markers */}
      <div className="relative px-3">
        <div
          data-how-track
          className="pointer-events-none absolute top-7 right-[calc(8.333%-14px)] left-[calc(8.333%-14px)] h-px bg-[#d7e4ea]"
          aria-hidden
        >
          <div
            ref={fillRef}
            className="h-full w-full origin-left bg-gradient-to-r from-teal via-cyan to-cyan"
            style={{ transform: "scaleX(0)" }}
          />
        </div>

        <ol className="relative grid grid-cols-6 gap-0">
          {BRAND_HOW_STEPS.map((step) => {
            const Icon = STEP_ICONS[step.n] ?? Target;
            const isActive = activeStep === step.n;
            const isDone = step.n < activeStep;

            return (
              <li key={step.n} className="flex flex-col items-center">
                <button
                  type="button"
                  data-how-marker
                  onClick={() => onSelect(step.n)}
                  className={cn(
                    "relative z-10 flex size-14 cursor-pointer items-center justify-center rounded-2xl border transition-[border-color,background-color,color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40 focus-visible:ring-offset-2",
                    isActive
                      ? "border-cyan bg-cyan text-white shadow-[0_12px_28px_-10px_rgb(0_188_212/0.55)]"
                      : isDone
                        ? "border-cyan/40 bg-[#e8f8fa] text-cyan"
                        : "border-[#d5e3ea] bg-white text-navy/55 hover:border-cyan/50 hover:text-cyan",
                  )}
                  aria-current={isActive ? "step" : undefined}
                  aria-label={`Step ${step.n}: ${step.title}`}
                >
                  {isActive ? (
                    <motion.span
                      layoutId="bf-how-marker-glow"
                      className="pointer-events-none absolute inset-0 rounded-2xl bg-cyan/20"
                      transition={{ type: "spring", stiffness: 280, damping: 28, mass: 0.85 }}
                      aria-hidden
                    />
                  ) : null}
                  <Icon className="relative size-[1.15rem]" strokeWidth={2.1} aria-hidden />
                </button>

                <div
                  data-how-label
                  className="mt-4 flex w-full flex-col items-center px-2 text-center"
                >
                  <span
                    className={cn(
                      "font-mono text-[0.6875rem] tracking-[0.14em] transition-colors duration-500",
                      isActive ? "text-cyan" : "text-muted",
                    )}
                  >
                    {String(step.n).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "mt-1.5 font-display text-[0.9375rem] font-semibold transition-colors duration-500",
                      isActive ? "text-navy" : "text-navy/70",
                    )}
                  >
                    {step.title}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Featured stage — aligned detail for the active step */}
      <div
        data-how-stage
        className="relative mt-10 overflow-hidden rounded-[1.5rem] border border-[#e2ecf1] bg-[linear-gradient(180deg,#f7fbfd_0%,#ffffff_55%)]"
      >
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-teal via-cyan to-cyan"
          aria-hidden
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={active.n}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.55, ease: easeOut }}
            className="grid min-h-[168px] grid-cols-[auto_1fr] items-center gap-8 px-10 py-9"
          >
            <div className="flex size-[4.5rem] items-center justify-center rounded-2xl bg-cyan/10 text-cyan">
              <ActiveIcon className="size-8" strokeWidth={1.75} aria-hidden />
            </div>

            <div className="min-w-0 text-left">
              <p className="font-mono text-[0.75rem] tracking-[0.16em] text-cyan">
                STEP {String(active.n).padStart(2, "0")} / {String(STEP_COUNT).padStart(2, "0")}
              </p>
              <h3 className="font-display mt-2 text-[1.625rem] leading-tight font-bold tracking-[-0.02em] text-navy">
                {active.title}
              </h3>
              <p className="mt-2 max-w-[42ch] text-[1.0625rem] leading-relaxed text-muted">
                {active.body}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

type BandForgeHowProps = {
  hideHeading?: boolean;
  sectionId?: string;
};

export function BandForgeHow({
  hideHeading = false,
  sectionId = "how",
}: BandForgeHowProps = {}) {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    if (reduceMotion) {
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
      { threshold: 0.2, rootMargin: "0px 0px -6% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [reduceMotion]);

  useEffect(() => {
    if (!inView || reduceMotion) return;
    const head = headRef.current;
    if (!head) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        head,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.65, ease: "power3.out" },
      );
    }, head);

    return () => ctx.revert();
  }, [inView, reduceMotion]);

  useEffect(() => {
    if (!inView || reduceMotion || paused) return;

    let step = activeStep;
    let cancelled = false;
    let timer: number | undefined;

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
    // Intentionally omit activeStep — loop owns its own cursor; user picks reset via paused
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduceMotion, paused]);

  const handleSelect = (n: number) => {
    setPaused(true);
    setActiveStep(n);
    window.setTimeout(() => setPaused(false), STEP_HOLD_MS * 2.2);
  };

  return (
    <section
      ref={sectionRef}
      id={sectionId}
      className={cn(
        "bf-ambient bf-section scroll-mt-20 bg-white",
        hideHeading && "!pt-8 sm:!pt-10 lg:!pt-12",
      )}
    >
      <div className="bf-container">
        {!hideHeading ? (
          <div
            ref={headRef}
            className="bf-section-head mb-8 lg:mb-12"
            style={reduceMotion ? undefined : { opacity: 0 }}
          >
            <BfSectionEyebrow className="mb-3">How it works</BfSectionEyebrow>
            <BfSectionHeading>Six steps, start to band score</BfSectionHeading>
          </div>
        ) : null}

        <div className="hidden lg:block">
          <HowDesktopSteps
            activeStep={activeStep}
            inView={inView}
            onSelect={handleSelect}
          />
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
