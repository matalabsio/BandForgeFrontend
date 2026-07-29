"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

type Props = {
  label: string;
  children: React.ReactNode;
  className?: string;
  index?: number;
};

/** Top flap — full width, jagged bottom edge. */
const CLIP_TOP =
  "polygon(0% 0%, 100% 0%, 100% 49%, 96% 52.5%, 91% 48%, 85% 53%, 79% 48.5%, 73% 53.5%, 67% 48%, 61% 53%, 55% 49%, 49% 54%, 43% 48.5%, 37% 53%, 31% 49%, 25% 54%, 19% 48%, 13% 52.5%, 7% 49%, 0% 53%)";

/** Bottom flap — matching jagged top edge. */
const CLIP_BOTTOM =
  "polygon(0% 53%, 7% 49%, 13% 52.5%, 19% 48%, 25% 54%, 31% 49%, 37% 53%, 43% 48.5%, 49% 54%, 55% 49%, 61% 53%, 67% 48%, 73% 53.5%, 79% 48.5%, 85% 53%, 91% 48%, 96% 52.5%, 100% 49%, 100% 100%, 0% 100%)";

/**
 * Premium paper tear: top sheet peels up, bottom peels down.
 */
export function DiagnosticSkillCardReveal({
  label,
  children,
  className,
  index = 0,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLButtonElement>(null);
  const topFlapRef = useRef<HTMLSpanElement>(null);
  const bottomFlapRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLSpanElement>(null);
  const seamGlowRef = useRef<HTMLSpanElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [tearing, setTearing] = useState(false);

  const { contextSafe } = useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce || !rootRef.current) return;

      gsap.fromTo(
        rootRef.current,
        { opacity: 0, y: 16, filter: "blur(3px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.55,
          delay: 0.08 + index * 0.07,
          ease: "power3.out",
          clearProps: "filter",
        },
      );
    },
    { scope: rootRef, dependencies: [index] },
  );

  const reveal = contextSafe(() => {
    if (revealed || tearing) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seal = sealRef.current;
    const content = contentRef.current;
    const top = topFlapRef.current;
    const bottom = bottomFlapRef.current;
    const hint = hintRef.current;
    const glow = seamGlowRef.current;

    if (reduce || !seal || !content || !top || !bottom) {
      setRevealed(true);
      return;
    }

    setTearing(true);
    gsap.set(seal, { pointerEvents: "none" });
    gsap.set([top, bottom], { force3D: true });
    gsap.set(top, { transformOrigin: "50% 0%" });
    gsap.set(bottom, { transformOrigin: "50% 100%" });

    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      onComplete: () => {
        setRevealed(true);
        setTearing(false);
      },
    });

    tl.to(hint, { opacity: 0, y: -4, duration: 0.45, ease: "power2.out" }, 0)
      .to(glow, { opacity: 0.7, duration: 0.5, ease: "sine.out" }, 0.08)
      .to(
        top,
        {
          yPercent: -108,
          rotateX: -28,
          rotateZ: -2,
          opacity: 0,
          duration: 1.7,
          ease: "power2.inOut",
        },
        0.25,
      )
      .to(
        bottom,
        {
          yPercent: 108,
          rotateX: 28,
          rotateZ: 2,
          opacity: 0,
          duration: 1.7,
          ease: "power2.inOut",
        },
        0.3,
      )
      .to(
        content,
        {
          filter: "blur(0px)",
          scale: 1,
          duration: 1.35,
          ease: "power2.out",
          clearProps: "filter,transform",
        },
        0.4,
      )
      .fromTo(
        content,
        { y: 8 },
        { y: 0, duration: 1.2, ease: "power2.out" },
        0.4,
      )
      .to(glow, { opacity: 0, duration: 0.5, ease: "sine.out" }, 1.6);
  });

  const showCover = !revealed;

  const paperTexture =
    "before:pointer-events-none before:absolute before:inset-0 before:opacity-[0.38] before:[background-image:repeating-linear-gradient(0deg,transparent,transparent_11px,rgba(120,90,50,0.045)_11px,rgba(120,90,50,0.045)_12px)]";

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative isolate min-w-0 overflow-hidden rounded-[14px] [perspective:1200px]",
        className,
      )}
    >
      <div
        ref={contentRef}
        className={cn(
          "h-full origin-center will-change-[filter,transform]",
          revealed ? "" : "pointer-events-none select-none",
        )}
        style={
          revealed
            ? undefined
            : { filter: "blur(7px)", transform: "scale(1.01)" }
        }
        aria-hidden={!revealed}
      >
        {children}
      </div>

      {showCover ? (
        <button
          type="button"
          ref={sealRef}
          onClick={reveal}
          disabled={tearing}
          className="absolute inset-0 z-10 cursor-pointer overflow-hidden rounded-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50 disabled:cursor-default"
          aria-label={`Open ${label} result`}
        >
          <span
            ref={topFlapRef}
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 will-change-transform",
              "bg-[linear-gradient(180deg,#FCFAF6_0%,#F3EDE2_100%)]",
              "shadow-[0_8px_20px_rgba(11,27,51,0.08)]",
              paperTexture,
            )}
            style={{ clipPath: CLIP_TOP }}
          />

          <span
            ref={bottomFlapRef}
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 will-change-transform",
              "bg-[linear-gradient(0deg,#E8DFD0_0%,#F3EDE2_100%)]",
              "shadow-[0_-8px_20px_rgba(11,27,51,0.08)]",
              paperTexture,
            )}
            style={{ clipPath: CLIP_BOTTOM }}
          />

          <span
            ref={seamGlowRef}
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-1/2 z-[3] h-12 -translate-y-1/2 opacity-0"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, rgba(255,248,235,0.55) 45%, rgba(0,188,212,0.12) 50%, rgba(255,248,235,0.45) 55%, transparent 100%)",
            }}
          />

          <span
            ref={hintRef}
            className="pointer-events-none absolute inset-0 z-[2] flex flex-col items-center justify-center gap-0.5 px-4 text-center"
          >
            <span className="text-[11px] leading-tight font-semibold tracking-wide text-[#0D1F3C] sm:text-[13.5px]">
              Click to open
            </span>
            <span className="hidden max-w-[12rem] text-[12px] leading-snug font-light text-[#7A6A52] sm:block">
              {label} score & coaching note
            </span>
          </span>
        </button>
      ) : null}
    </div>
  );
}
