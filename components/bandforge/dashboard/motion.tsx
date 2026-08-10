"use client";

import { type ReactNode } from "react";
import {
  motion,
  type HTMLMotionProps,
  useReducedMotion,
} from "motion/react";
import { cn } from "@/lib/utils";

/** Shared dashboard easing — soft, premium, never bouncy. */
export const DASH_EASE = [0.22, 1, 0.36, 1] as const;
export const DASH_EASE_CSS = "cubic-bezier(0.22, 1, 0.36, 1)";

export const dashFadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

export const dashStaggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

type DashRevealProps = HTMLMotionProps<"div"> & {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "header" | "article";
};

/** Soft fade-up on scroll into view. Respects prefers-reduced-motion. */
export function DashReveal({
  children,
  className,
  delay = 0,
  as = "div",
  ...rest
}: DashRevealProps) {
  const reduce = useReducedMotion();
  const motionProps = {
    className,
    initial: reduce ? false : { opacity: 0, y: 16 },
    whileInView: reduce ? undefined : { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.18, margin: "0px 0px -40px 0px" },
    transition: {
      duration: 0.5,
      delay,
      ease: DASH_EASE,
    },
    ...rest,
  };

  if (as === "section") {
    return <motion.section {...motionProps}>{children}</motion.section>;
  }
  if (as === "header") {
    return <motion.header {...motionProps}>{children}</motion.header>;
  }
  if (as === "article") {
    return <motion.article {...motionProps}>{children}</motion.article>;
  }
  return <motion.div {...motionProps}>{children}</motion.div>;
}

type DashProgressProps = {
  value: number;
  className?: string;
  fillClassName?: string;
  heightClassName?: string;
  label?: string;
};

/**
 * CSS/Motion progress fill — no ScrollTrigger (hero keeps its own GSAP bar).
 */
export function DashProgressBar({
  value,
  className,
  fillClassName = "bg-gradient-to-r from-teal to-cyan",
  heightClassName = "h-2",
  label,
}: DashProgressProps) {
  const reduce = useReducedMotion();
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div
      className={cn(
        "overflow-hidden rounded-full bg-ink/[0.06]",
        heightClassName,
        className,
      )}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <motion.div
        className={cn("h-full rounded-full", fillClassName)}
        initial={reduce ? false : { width: "0%" }}
        whileInView={reduce ? undefined : { width: `${pct}%` }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.85, ease: DASH_EASE }}
        style={reduce ? { width: `${pct}%` } : undefined}
      />
    </div>
  );
}

type DashPageProps = {
  children: ReactNode;
  className?: string;
};

/** Page-level stagger for above-the-fold dashboard blocks. */
export function DashPageMotion({ children, className }: DashPageProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={cn("relative space-y-5 sm:space-y-7", className)}
      initial={reduce ? false : "hidden"}
      animate={reduce ? undefined : "show"}
      variants={
        reduce
          ? undefined
          : {
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.09,
                  delayChildren: 0.05,
                },
              },
            }
      }
    >
      {children}
    </motion.div>
  );
}

/** Child of DashPageMotion — participates in load stagger. */
export function DashPageItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={cn("relative", className)}
      variants={
        reduce
          ? undefined
          : {
              hidden: { opacity: 0, y: 20 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.55, ease: DASH_EASE },
              },
            }
      }
    >
      {children}
    </motion.div>
  );
}
