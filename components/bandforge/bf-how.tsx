"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
import { GlowCard, type GlowColor } from "@/components/ui/spotlight-card";
import { BRAND_HOW_STEPS } from "@/lib/brand-mock-data";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const STEP_COUNT = BRAND_HOW_STEPS.length;
const STEP_HOLD_MS = 3200;
const LOOP_PAUSE_MS = 1800;

/** Soft, slightly slow LTR content swap */
const stepContentEase = [0.22, 1, 0.36, 1] as const;

const STEP_GLOW: Record<number, GlowColor> = {
  1: "teal",
  2: "cyan",
  3: "navy",
  4: "teal",
  5: "cyan",
  6: "navy",
};

const STEP_ICONS: Record<number, ComponentType<LucideProps>> = {
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

  const active =
    BRAND_HOW_STEPS.find((s) => s.n === activeStep) ?? BRAND_HOW_STEPS[0];
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
      gsap.set([markers, labels, track, stage], {
        clearProps: "all",
        opacity: 1,
        y: 0,
        scale: 1,
      });
      if (fill) gsap.set(fill, { scaleX: progressPct / 100 });
      enteredRef.current = true;
      return;
    }

    enteredRef.current = true;
    const ctx = gsap.context(() => {
      gsap.set(markers, { opacity: 0, y: 28, scale: 0.78 });
      gsap.set(labels, { opacity: 0, y: 16 });
      gsap.set(track, {
        opacity: 0,
        scaleX: 0.35,
        transformOrigin: "left center",
      });
      gsap.set(stage, { opacity: 0, y: 36, scale: 0.98 });
      if (fill) gsap.set(fill, { scaleX: 0, transformOrigin: "left center" });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        delay: 0.35,
      });

      tl.to(track, { opacity: 1, scaleX: 1, duration: 0.85 })
        .to(
          markers,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            stagger: { each: 0.08, from: "start" },
          },
          "-=0.55",
        )
        .to(
          labels,
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            stagger: { each: 0.07, from: "start" },
          },
          "-=0.5",
        )
        .to(
          stage,
          { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: "power3.out" },
          "-=0.25",
        );

      if (fill) {
        tl.to(
          fill,
          { scaleX: progressPct / 100, duration: 0.9, ease: "power2.inOut" },
          "-=0.7",
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
      duration: reduceMotion ? 0 : 1.25,
      ease: "power2.inOut",
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
          style={reduceMotion ? undefined : { opacity: 0 }}
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
                  style={reduceMotion ? undefined : { opacity: 0 }}
                  className={cn(
                    "relative z-10 flex size-14 cursor-pointer items-center justify-center rounded-2xl border transition-[border-color,background-color,color,box-shadow,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40 focus-visible:ring-offset-2",
                    isActive
                      ? "scale-105 border-cyan bg-cyan text-white shadow-[0_12px_28px_-10px_rgb(0_188_212/0.55)]"
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
                      transition={{
                        type: "spring",
                        stiffness: 140,
                        damping: 28,
                        mass: 1.05,
                      }}
                      aria-hidden
                    />
                  ) : null}
                  <Icon
                    className="relative size-[1.15rem]"
                    strokeWidth={2.1}
                    aria-hidden
                  />
                </button>

                <div
                  data-how-label
                  style={reduceMotion ? undefined : { opacity: 0 }}
                  className="mt-4 flex w-full flex-col items-center px-2 text-center"
                >
                  <span
                    className={cn(
                      "font-mono text-[0.6875rem] tracking-[0.14em] transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      isActive ? "text-cyan" : "text-muted",
                    )}
                  >
                    {String(step.n).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "mt-1.5 font-display text-[0.9375rem] font-semibold transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
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

      {/* Featured stage — liquid glass + spotlight */}
      <div
        data-how-stage
        className="mt-10"
        style={reduceMotion ? undefined : { opacity: 0 }}
      >
        <GlowCard
          glass
          inkBorder
          customSize
          glowColor={STEP_GLOW[active.n] ?? "cyan"}
          className="group bf-liquid-glass relative min-h-[168px] w-full !rounded-[1.5rem] !p-6 sm:!p-7"
        >
          <div
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
            aria-hidden
          >
            <div className="absolute -top-1/3 left-[-10%] h-[70%] w-[120%] rotate-[-8deg] bg-[linear-gradient(180deg,rgb(255_255_255/0.55)_0%,rgb(255_255_255/0.08)_45%,transparent_70%)] opacity-80" />
            <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
          </div>

          <div className="relative z-[1] overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.n}
                initial={
                  reduceMotion
                    ? false
                    : { opacity: 0, x: -18, filter: "blur(4px)" }
                }
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={
                  reduceMotion
                    ? undefined
                    : { opacity: 0, x: 18, filter: "blur(4px)" }
                }
                transition={{
                  duration: 0.7,
                  ease: stepContentEase,
                  opacity: { duration: 0.45, ease: "easeInOut" },
                }}
                className="grid grid-cols-[auto_1fr] items-center gap-8"
              >
                <div className="flex size-[4.5rem] items-center justify-center rounded-2xl bg-cyan/10 text-cyan">
                  <ActiveIcon
                    className="size-8"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </div>

                <div className="min-w-0 text-left">
                  <p className="font-mono text-[0.75rem] tracking-[0.16em] text-cyan">
                    STEP {String(active.n).padStart(2, "0")} /{" "}
                    {String(STEP_COUNT).padStart(2, "0")}
                  </p>
                  <h3 className="font-display mt-2 text-[1.625rem] leading-tight font-bold tracking-[-0.02em] text-navy">
                    {active.title}
                  </h3>
                  <p className="mt-2 max-w-[48ch] line-clamp-2 text-[1.0625rem] leading-snug text-muted">
                    {active.body}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </GlowCard>
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
  const [isDesktop, setIsDesktop] = useState(false);
  const reduceMotion = useReducedMotion();
  const headAnimated = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    if (reduceMotion) {
      setInView(true);
      setActiveStep(STEP_COUNT);
      return;
    }

    const trigger = ScrollTrigger.create({
      trigger: node,
      start: "top 78%",
      once: true,
      onEnter: () => setInView(true),
    });

    return () => trigger.kill();
  }, [reduceMotion]);

  useEffect(() => {
    if (!inView || reduceMotion || headAnimated.current) return;
    const head = headRef.current;
    if (!head) return;

    headAnimated.current = true;
    const pieces = head.querySelectorAll<HTMLElement>("[data-how-head]");

    const ctx = gsap.context(() => {
      gsap.set(pieces, { opacity: 0, y: 28 });
      gsap.to(pieces, {
        opacity: 1,
        y: 0,
        duration: 0.85,
        stagger: 0.14,
        ease: "power3.out",
        delay: 0.05,
      });
    }, head);

    return () => ctx.revert();
  }, [inView, reduceMotion]);

  useEffect(() => {
    if (!inView || reduceMotion || paused || !isDesktop) return;

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
  }, [inView, reduceMotion, paused, isDesktop]);

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
        "bf-ambient bf-section relative z-[2] scroll-mt-20",
        hideHeading && "!pt-8 sm:!pt-10 lg:!pt-12",
      )}
    >
      <div className="bf-container">
        {!hideHeading ? (
          <div ref={headRef} className="bf-section-head mb-8 lg:mb-12">
            <div data-how-head style={reduceMotion ? undefined : { opacity: 0 }}>
              <BfSectionEyebrow className="mb-3">
                The BandForge Method
              </BfSectionEyebrow>
            </div>
            <div data-how-head style={reduceMotion ? undefined : { opacity: 0 }}>
              <BfSectionHeading className="max-w-[22ch] sm:max-w-[28ch] lg:max-w-[32ch]">
                No two students prep the same way. A personalised study plan in
                six steps
              </BfSectionHeading>
            </div>
            <p
              data-how-head
              className="mx-auto mt-4 max-w-[52ch] text-[0.9375rem] leading-relaxed text-muted sm:mt-5 sm:text-base lg:max-w-[58ch] lg:text-[1.0625rem]"
              style={reduceMotion ? undefined : { opacity: 0 }}
            >
              Built by a Gold Medallist and Band 9 scorer with a decade of
              training students face to face. Every step below exists because
              we&apos;ve watched exactly where students plateau — and built a
              system that catches it before you waste weeks on the wrong thing.
            </p>
          </div>
        ) : null}

        <div className="hidden lg:block">
          <HowDesktopSteps
            activeStep={activeStep}
            inView={inView}
            onSelect={handleSelect}
          />
        </div>

        <div className="lg:hidden">
          <BfHowScrollStack activeStep={activeStep} />
        </div>
      </div>
    </section>
  );
}
