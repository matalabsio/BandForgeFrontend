"use client";

import { useRef } from "react";
import { Check, Mic } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

export type SpeakingMicHeroPhase = "idle" | "recording" | "playback" | "confirmed";

type Props = {
  phase: SpeakingMicHeroPhase;
  /** Light diagnostic card vs dark standalone mock shell. */
  variant?: "diagnostic" | "standalone";
  className?: string;
};

/**
 * Mic-check hero — static until recording; smooth GSAP blink-up rings while recording.
 * Respects prefers-reduced-motion.
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

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const glow = root.querySelector<HTMLElement>("[data-mic-glow]");
      const rings = gsap.utils.toArray<HTMLElement>(
        root.querySelectorAll("[data-mic-ring]"),
      );
      const icon = root.querySelector<HTMLElement>("[data-mic-icon]");
      const disc = root.querySelector<HTMLElement>("[data-mic-disc]");

      gsap.set(rings, { scale: 1, opacity: 0, transformOrigin: "50% 50%" });
      gsap.set(glow, {
        scale: 1,
        opacity: isDark ? 0.26 : 0.3,
        transformOrigin: "50% 50%",
      });
      gsap.set([icon, disc].filter(Boolean), { scale: 1, transformOrigin: "50% 50%" });

      if (!recording || reduceMotion) return;

      // Soft breath on glow
      if (glow) {
        gsap.to(glow, {
          scale: 1.18,
          opacity: isDark ? 0.58 : 0.62,
          duration: 1.4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      }

      // Gentle icon pulse (no vertical bob)
      if (icon) {
        gsap.to(icon, {
          scale: 1.05,
          duration: 1.4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      }

      // Staggered blink-up rings — slow expand + soft fade
      rings.forEach((ring, i) => {
        const ringTl = gsap.timeline({ repeat: -1, delay: i * 0.55 });
        ringTl.fromTo(
          ring,
          { scale: 0.92, opacity: 0 },
          {
            scale: 1.08,
            opacity: 0.55 - i * 0.08,
            duration: 0.5,
            ease: "sine.out",
          },
        );
        ringTl.to(ring, {
          scale: 1.72 + i * 0.08,
          opacity: 0,
          duration: 1.7,
          ease: "power1.out",
        });
      });
    },
    {
      dependencies: [recording, reduceMotion, isDark],
      scope: rootRef,
      revertOnUpdate: true,
    },
  );

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative mx-auto flex items-center justify-center",
        !className && (isDark ? "size-[104px]" : "size-[88px] sm:size-[100px]"),
        className,
      )}
      aria-hidden
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          data-mic-ring
          className={cn(
            "pointer-events-none absolute inset-0 rounded-full border-2 will-change-transform",
            isDark ? "border-cyan/50" : "border-cyan/45",
            (!recording || reduceMotion) && "hidden",
          )}
          style={{ opacity: 0 }}
        />
      ))}

      <span
        data-mic-glow
        className={cn(
          "pointer-events-none absolute inset-[8%] rounded-full blur-lg will-change-transform",
          isDark ? "bg-cyan/30" : "bg-cyan/28",
        )}
      />

      <div
        data-mic-disc
        className={cn(
          "relative z-[1] flex size-full items-center justify-center rounded-full border-2",
          isDark
            ? "border-cyan bg-[radial-gradient(circle_at_50%_40%,rgba(0,188,212,0.25),rgba(0,151,167,0.05))]"
            : "border-cyan/40 bg-cyan/10",
        )}
      >
        <span data-mic-icon className="inline-flex will-change-transform">
          <Mic
            className={cn(
              "text-cyan",
              isDark ? "size-10" : "size-8 sm:size-9",
            )}
            strokeWidth={1.8}
          />
        </span>

        {confirmed ? (
          <span
            className={cn(
              "absolute -bottom-0.5 -right-0.5 flex size-7 items-center justify-center rounded-full border-2 text-white",
              isDark
                ? "border-[#122747] bg-[#3ECF8E]"
                : "border-white bg-[#059669]",
            )}
          >
            <Check className="size-3.5" strokeWidth={2.5} />
          </span>
        ) : null}
      </div>
    </div>
  );
}
