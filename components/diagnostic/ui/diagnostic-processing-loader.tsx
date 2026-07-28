"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

type Props = {
  className?: string;
  /** Visual scale of the spinning mark. */
  size?: "sm" | "md" | "lg";
  label?: ReactNode;
  /** Change each tick (e.g. remaining seconds) to pulse the caption. */
  labelKey?: string | number;
};

const SIZE = {
  sm: {
    wrap: "size-[64px]",
    bar: "w-[5px]",
    gap: "gap-[3px]",
    barsH: "h-5",
    heights: [42, 62, 81, 100],
  },
  md: {
    wrap: "size-[72px]",
    bar: "w-[5.5px]",
    gap: "gap-[3.5px]",
    barsH: "h-[22px]",
    heights: [42, 62, 81, 100],
  },
  lg: {
    wrap: "size-[88px] sm:size-[96px]",
    bar: "w-[7px] sm:w-[8px]",
    gap: "gap-1 sm:gap-1.5",
    barsH: "h-7 sm:h-8",
    heights: [42, 62, 81, 100],
  },
} as const;

/** Animated BandForge bars loader — equalizer + multi-ring motion. */
export function DiagnosticProcessingLoader({
  className,
  size = "md",
  label,
  labelKey,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const cfg = SIZE[size];

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || reduceMotion) return;

      const ringArc = root.querySelector<HTMLElement>("[data-ring-arc]");
      const ringTick = root.querySelector<HTMLElement>("[data-ring-tick]");
      const ringOrbit = root.querySelector<HTMLElement>("[data-ring-orbit]");
      const glow = root.querySelector<HTMLElement>("[data-glow]");
      const mark = root.querySelector<HTMLElement>("[data-mark]");
      const bars = root.querySelectorAll<HTMLElement>("[data-eq-bar]");

      if (ringArc) {
        gsap.to(ringArc, {
          rotate: 360,
          duration: 1.25,
          ease: "none",
          repeat: -1,
        });
      }
      if (ringTick) {
        gsap.to(ringTick, {
          rotate: -360,
          duration: 2.4,
          ease: "none",
          repeat: -1,
        });
      }
      if (ringOrbit) {
        gsap.to(ringOrbit, {
          rotate: 360,
          duration: 5.5,
          ease: "none",
          repeat: -1,
        });
      }
      if (glow) {
        gsap.to(glow, {
          scale: 1.2,
          opacity: 0.5,
          duration: 1.15,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      }
      if (mark) {
        gsap.to(mark, {
          y: -2.5,
          duration: 1.45,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      }

      bars.forEach((bar, i) => {
        const base = cfg.heights[i] ?? 60;
        const peak = Math.min(100, base + 20 + (i % 2) * 10);
        const trough = Math.max(26, base - 24);
        gsap.fromTo(
          bar,
          { scaleY: trough / 100, transformOrigin: "50% 100%" },
          {
            scaleY: peak / 100,
            duration: 0.36 + i * 0.08,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: i * 0.11,
          },
        );
      });

      gsap.from(root.querySelectorAll("[data-enter]"), {
        opacity: 0,
        scale: 0.88,
        y: 8,
        duration: 0.55,
        stagger: 0.05,
        ease: "power3.out",
      });
    },
    { scope: rootRef, dependencies: [reduceMotion, size] },
  );

  return (
    <div ref={rootRef} className={cn("flex flex-col items-center", className)}>
      <div
        data-enter
        className={cn("relative mx-auto", cfg.wrap)}
        role="status"
        aria-live="polite"
        aria-label={typeof label === "string" ? label : "Loading"}
      >
        <div className="absolute inset-0 rounded-full border-[3px] border-navy/[0.07]" />

        <div
          data-ring-orbit
          className="absolute inset-[-4px] rounded-full border border-dashed border-cyan/30"
          aria-hidden
        />

        <div
          data-ring-arc
          className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-teal border-r-cyan"
          aria-hidden
        />

        <div
          data-ring-tick
          className="absolute inset-[6px] rounded-full border-[2px] border-transparent border-b-teal/55 border-l-cyan/40"
          aria-hidden
        />

        <div
          data-glow
          className="absolute inset-[8px] rounded-full bg-[radial-gradient(circle,_rgba(0,188,212,0.24)_0%,_transparent_68%)]"
          aria-hidden
        />

        <div
          data-mark
          className="absolute inset-0 flex items-center justify-center"
          aria-hidden
        >
          <div className={cn("flex items-end", cfg.gap, cfg.barsH)}>
            {cfg.heights.map((h, i) => (
              <div
                key={h}
                data-eq-bar
                className={cn(
                  cfg.bar,
                  "rounded-sm will-change-transform",
                  i < 2 ? "bg-teal" : "bg-cyan",
                )}
                style={{
                  height: `${h}%`,
                  transformOrigin: "50% 100%",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {label ? (
        <motion.p
          data-enter
          key={labelKey ?? "label"}
          className="mt-4 text-center text-[13px] text-[#64748B] sm:text-[14px]"
          initial={reduceMotion ? false : { opacity: 0.45, y: 5, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          {label}
        </motion.p>
      ) : null}
    </div>
  );
}
