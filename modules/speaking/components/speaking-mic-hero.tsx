"use client";

import { useRef } from "react";
import { Check } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

export type SpeakingMicHeroPhase = "idle" | "recording" | "playback" | "confirmed";

type Props = {
  phase: SpeakingMicHeroPhase;
  /** Light diagnostic card vs dark standalone mock shell. */
  variant?: "diagnostic" | "standalone";
  className?: string;
};

/** Same BandForge equalizer mark as DiagnosticProcessingLoader. */
const BF_BAR_HEIGHTS = [42, 62, 81, 100] as const;

/**
 * Premium mic-check hero — BandForge loader bars + Motion/GSAP orbit & blink-up.
 */
export function SpeakingMicHero({
  phase,
  variant = "diagnostic",
  className,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const isDark = variant === "standalone";
  const confirmed = phase === "confirmed";
  const recording = phase === "recording";
  const live = recording && !reduceMotion;

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || reduceMotion) return;

      const glow = root.querySelector<HTMLElement>("[data-mic-glow]");
      const orbit = root.querySelector<HTMLElement>("[data-mic-orbit]");
      const arc = root.querySelector<HTMLElement>("[data-mic-arc]");
      const tick = root.querySelector<HTMLElement>("[data-mic-tick]");
      const mark = root.querySelector<HTMLElement>("[data-mic-mark]");
      const bars = gsap.utils.toArray<HTMLElement>(
        root.querySelectorAll("[data-eq-bar]"),
      );
      const rings = gsap.utils.toArray<HTMLElement>(
        root.querySelectorAll("[data-mic-ring]"),
      );

      gsap.set(rings, { scale: 1, opacity: 0, transformOrigin: "50% 50%" });
      gsap.set([glow, mark].filter(Boolean), { transformOrigin: "50% 50%" });

      if (orbit) {
        gsap.to(orbit, {
          rotate: 360,
          duration: recording ? 4.5 : 12,
          ease: "none",
          repeat: -1,
        });
      }
      if (arc) {
        gsap.to(arc, {
          rotate: -360,
          duration: recording ? 2.8 : 8,
          ease: "none",
          repeat: -1,
        });
      }
      if (tick) {
        gsap.to(tick, {
          rotate: 360,
          duration: recording ? 6 : 16,
          ease: "none",
          repeat: -1,
        });
      }

      if (glow) {
        gsap.fromTo(
          glow,
          { scale: 1, opacity: isDark ? 0.28 : 0.32 },
          {
            scale: recording ? 1.22 : 1.1,
            opacity: recording ? (isDark ? 0.72 : 0.7) : isDark ? 0.48 : 0.5,
            duration: recording ? 1.1 : 2.2,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          },
        );
      }

      // BandForge equalizer bars — always animate; peppier while recording
      bars.forEach((bar, i) => {
        const base = BF_BAR_HEIGHTS[i] ?? 60;
        const peak = recording
          ? Math.min(100, base + 22 + (i % 2) * 10)
          : Math.min(100, base + 12 + (i % 2) * 6);
        const trough = recording
          ? Math.max(22, base - 28)
          : Math.max(30, base - 16);

        gsap.fromTo(
          bar,
          { scaleY: trough / 100, transformOrigin: "50% 100%" },
          {
            scaleY: peak / 100,
            duration: recording ? 0.34 + i * 0.07 : 0.55 + i * 0.09,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: i * (recording ? 0.08 : 0.12),
          },
        );
      });

      if (!recording) return;

      if (mark) {
        gsap.to(mark, {
          scale: 1.04,
          duration: 1.15,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      }

      rings.forEach((ring, i) => {
        const ringTl = gsap.timeline({ repeat: -1, delay: i * 0.48 });
        ringTl.fromTo(
          ring,
          { scale: 0.88, opacity: 0 },
          {
            scale: 1.02,
            opacity: 0.62 - i * 0.1,
            duration: 0.42,
            ease: "sine.out",
          },
        );
        ringTl.to(ring, {
          scale: 1.55 + i * 0.1,
          opacity: 0,
          duration: 1.55,
          ease: "power2.out",
        });
      });
    },
    {
      dependencies: [recording, reduceMotion, isDark, phase],
      scope: rootRef,
      revertOnUpdate: true,
    },
  );

  return (
    <motion.div
      ref={rootRef}
      className={cn(
        "relative mx-auto flex items-center justify-center",
        !className && (isDark ? "size-[120px]" : "size-[108px] sm:size-[116px]"),
        className,
      )}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.86 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden
    >
      <span
        className={cn(
          "pointer-events-none absolute inset-[-6%] rounded-full",
          isDark
            ? "bg-[radial-gradient(circle,rgba(0,188,212,0.18)_0%,transparent_70%)]"
            : "bg-[radial-gradient(circle,rgba(0,188,212,0.14)_0%,transparent_70%)]",
        )}
      />

      {[0, 1, 2].map((i) => (
        <span
          key={i}
          data-mic-ring
          className={cn(
            "pointer-events-none absolute inset-[8%] rounded-full border will-change-transform",
            isDark ? "border-cyan/60" : "border-cyan/55",
            !live && "hidden",
          )}
          style={{
            opacity: 0,
            borderWidth: i === 0 ? 2 : 1.5,
          }}
        />
      ))}

      <span
        data-mic-orbit
        className={cn(
          "pointer-events-none absolute inset-[4%] rounded-full border border-dashed will-change-transform",
          isDark ? "border-cyan/35" : "border-cyan/30",
        )}
      />

      <span
        data-mic-arc
        className={cn(
          "pointer-events-none absolute inset-[10%] rounded-full border-[2.5px] border-transparent will-change-transform",
          isDark
            ? "border-t-cyan border-r-teal/70"
            : "border-t-cyan border-r-teal/60",
        )}
      />

      <span
        data-mic-tick
        className={cn(
          "pointer-events-none absolute inset-[16%] rounded-full border-[1.5px] border-transparent will-change-transform",
          "border-b-cyan/45 border-l-teal/35",
        )}
      />

      <span
        data-mic-glow
        className={cn(
          "pointer-events-none absolute inset-[18%] rounded-full blur-md will-change-transform",
          isDark
            ? "bg-[radial-gradient(circle,rgba(0,188,212,0.55)_0%,transparent_72%)]"
            : "bg-[radial-gradient(circle,rgba(0,188,212,0.42)_0%,transparent_72%)]",
        )}
      />

      <div
        data-mic-disc
        className={cn(
          "relative z-[1] flex size-[68%] items-center justify-center rounded-full border-2 shadow-[0_8px_28px_rgb(0_151_167/0.18)]",
          isDark
            ? "border-cyan/80 bg-[radial-gradient(circle_at_50%_35%,rgba(0,188,212,0.32),rgba(8,20,38,0.9)_70%)]"
            : "border-cyan/45 bg-[radial-gradient(circle_at_50%_35%,rgba(224,247,250,0.95),rgba(240,251,252,0.9)_65%,#fff_100%)]",
        )}
      >
        {/* BandForge loader bars mark */}
        <div
          data-mic-mark
          className="flex h-7 items-end gap-[3px] will-change-transform sm:h-8 sm:gap-[3.5px]"
        >
          {BF_BAR_HEIGHTS.map((h, i) => (
            <div
              key={h}
              data-eq-bar
              className={cn(
                "w-[5px] rounded-sm will-change-transform sm:w-[5.5px]",
                i < 2 ? "bg-teal" : "bg-cyan",
              )}
              style={{
                height: `${h}%`,
                transformOrigin: "50% 100%",
              }}
            />
          ))}
        </div>

        <AnimatePresence>
          {confirmed ? (
            <motion.span
              className={cn(
                "absolute -bottom-0.5 -right-0.5 flex size-7 items-center justify-center rounded-full border-2 text-white shadow-md",
                isDark
                  ? "border-[#122747] bg-[#3ECF8E]"
                  : "border-white bg-[#059669]",
              )}
              initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 22 }}
            >
              <Check className="size-3.5" strokeWidth={2.5} />
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
