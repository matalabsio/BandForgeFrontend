"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { ComponentType, SVGProps } from "react";
import { Check } from "lucide-react";
import { DASH_EASE } from "@/components/bandforge/dashboard/motion";
import { cn } from "@/lib/utils";

export type SkillStepperStep = {
  id: string;
  label: string;
  detail?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  state: "done" | "current" | "upcoming";
  href?: string | null;
};

type Props = {
  steps: SkillStepperStep[];
  className?: string;
  compact?: boolean;
  animate?: boolean;
  /** Default css — Motion fill. Pass gsap only if a parent still needs it (unused on dashboard). */
  engine?: "css" | "gsap";
};

/**
 * Reference-style horizontal stepper: icons above, connected nodes, labels below.
 */
export function SkillProgressStepper({
  steps,
  className,
  compact = false,
  animate = true,
  engine = "css",
}: Props) {
  const reduce = useReducedMotion();
  const fillRef = useRef<HTMLDivElement>(null);
  const n = steps.length;

  const lastReached = (() => {
    let idx = -1;
    steps.forEach((s, i) => {
      if (s.state === "done" || s.state === "current") idx = i;
    });
    return idx;
  })();

  const fillPct =
    n <= 1 || lastReached < 0
      ? 0
      : (lastReached / Math.max(1, n - 1)) * 100;

  useEffect(() => {
    if (!animate || engine !== "css" || reduce) return;
    const fill = fillRef.current;
    if (!fill) return;
    fill.style.width = "0%";
    const id = requestAnimationFrame(() => {
      fill.style.transition = `width 0.85s ${DASH_EASE_CSS_LOCAL}`;
      fill.style.width = `${fillPct}%`;
    });
    return () => cancelAnimationFrame(id);
  }, [animate, engine, fillPct, reduce, n]);

  if (n === 0) return null;

  return (
    <div
      className={cn("w-full select-none", className)}
      role="list"
      aria-label="Skill progress"
    >
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
      >
        {steps.map((step, i) => {
          const Icon = step.icon;
          const active = step.state !== "upcoming";
          const iconEl = (
            <motion.span
              className={cn(
                "inline-flex items-center justify-center",
                compact ? "size-7" : "size-8",
                active ? "text-teal" : "text-ink/25",
              )}
              initial={
                !animate || reduce ? false : { opacity: 0, y: 6 }
              }
              whileInView={
                !animate || reduce ? undefined : { opacity: 1, y: 0 }
              }
              viewport={{ once: true }}
              transition={{
                duration: 0.35,
                delay: 0.04 + i * 0.05,
                ease: DASH_EASE,
              }}
              whileHover={
                reduce || !step.href ? undefined : { y: -2, scale: 1.06 }
              }
            >
              <Icon
                className={compact ? "size-4" : "size-[18px]"}
                strokeWidth={2.1}
                aria-hidden
              />
            </motion.span>
          );

          return (
            <div key={`icon-${step.id}`} className="flex justify-center">
              {step.href && step.state !== "done" ? (
                <a
                  href={step.href}
                  className="cursor-pointer rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-cyan/40"
                  aria-label={step.label}
                >
                  {iconEl}
                </a>
              ) : (
                iconEl
              )}
            </div>
          );
        })}
      </div>

      <div className={cn("relative", compact ? "my-2" : "my-2.5")}>
        <div
          className="pointer-events-none absolute top-1/2 left-0 right-0 -translate-y-1/2"
          style={{
            paddingLeft: `calc(100% / ${n} / 2)`,
            paddingRight: `calc(100% / ${n} / 2)`,
          }}
          aria-hidden
        >
          <div
            className={cn(
              "relative w-full overflow-hidden rounded-full bg-ink/[0.08]",
              compact ? "h-[3px]" : "h-1",
            )}
          >
            <div
              ref={fillRef}
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-teal to-cyan"
              style={{
                width: reduce || !animate ? `${fillPct}%` : "0%",
              }}
            />
          </div>
        </div>

        <div
          className="relative z-[1] grid"
          style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
        >
          {steps.map((step, i) => {
            const isCurrent = step.state === "current";
            const isDone = step.state === "done";

            return (
              <div
                key={`node-${step.id}`}
                className="flex justify-center"
                role="listitem"
                aria-current={isCurrent ? "step" : undefined}
              >
                <motion.span
                  className={cn(
                    "flex items-center justify-center rounded-full border-2 bg-white",
                    compact ? "size-4" : "size-5",
                    isDone && "border-teal bg-teal text-white",
                    isCurrent &&
                      "border-teal bg-white shadow-[0_0_0_3px_rgba(0,188,212,0.22)]",
                    step.state === "upcoming" &&
                      "border-ink/15 bg-[#e8eef3]",
                  )}
                  initial={
                    !animate || reduce ? false : { scale: 0.6, opacity: 0.4 }
                  }
                  whileInView={
                    !animate || reduce
                      ? undefined
                      : { scale: 1, opacity: 1 }
                  }
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: 0.06 + i * 0.06,
                    ease: DASH_EASE,
                  }}
                >
                  {isDone ? (
                    <Check
                      className={compact ? "size-2.5" : "size-3"}
                      strokeWidth={3}
                      aria-hidden
                    />
                  ) : isCurrent ? (
                    <span
                      className={cn(
                        "rounded-full bg-teal",
                        compact ? "size-1.5" : "size-2",
                      )}
                      aria-hidden
                    />
                  ) : null}
                </motion.span>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
      >
        {steps.map((step) => {
          const active = step.state !== "upcoming";
          return (
            <div key={`label-${step.id}`} className="px-0.5 text-center">
              <p
                className={cn(
                  "font-semibold leading-tight",
                  compact ? "text-[10px]" : "text-[11px]",
                  active ? "text-teal" : "text-ink/35",
                )}
              >
                {step.label}
              </p>
              {step.detail ? (
                <p
                  className={cn(
                    "mt-0.5 font-mono tabular-nums",
                    compact ? "text-[9px]" : "text-[10px]",
                    active ? "text-ink/55" : "text-ink/30",
                  )}
                >
                  {step.detail}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const DASH_EASE_CSS_LOCAL = "cubic-bezier(0.22, 1, 0.36, 1)";
