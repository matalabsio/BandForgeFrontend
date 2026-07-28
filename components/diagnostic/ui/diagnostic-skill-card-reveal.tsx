"use client";

import { useRef, useState } from "react";
import { Eye, Sparkles } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

type Props = {
  label: string;
  children: React.ReactNode;
  className?: string;
  /** Stagger delay for entrance. */
  index?: number;
};

/**
 * Blurred skill result with premium click-to-reveal.
 * First click unveils the score; the inner card handles review after reveal.
 */
export function DiagnosticSkillCardReveal({
  label,
  children,
  className,
  index = 0,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  const { contextSafe } = useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce || !rootRef.current) return;
      gsap.fromTo(
        rootRef.current,
        { opacity: 0, y: 18, filter: "blur(4px)" },
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
    if (revealed) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const veil = veilRef.current;
    const content = contentRef.current;
    if (!veil || !content || reduce) {
      setRevealed(true);
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => setRevealed(true),
    });
    tl.to(veil, {
      opacity: 0,
      scale: 1.04,
      filter: "blur(12px)",
      duration: 0.45,
      ease: "power2.inOut",
    })
      .to(
        content,
        {
          filter: "blur(0px)",
          scale: 1,
          duration: 0.65,
          ease: "power3.out",
          clearProps: "filter,transform",
        },
        0.12,
      )
      .fromTo(
        content,
        { y: 10 },
        { y: 0, duration: 0.55, ease: "power3.out" },
        0.12,
      );
  });

  return (
    <div ref={rootRef} className={cn("relative isolate min-w-0", className)}>
      <div
        ref={contentRef}
        className={cn(
          "h-full origin-center will-change-[filter,transform]",
          revealed ? "" : "pointer-events-none select-none",
        )}
        style={
          revealed
            ? undefined
            : { filter: "blur(11px)", transform: "scale(1.02)" }
        }
        aria-hidden={!revealed}
      >
        {children}
      </div>

      {!revealed ? (
        <button
          type="button"
          ref={veilRef}
          onClick={reveal}
          className="absolute inset-0 z-10 flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border border-white/50 bg-[rgba(248,250,252,0.55)] px-2 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-[2px] transition duration-200 hover:bg-[rgba(238,251,253,0.72)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50 sm:gap-2.5 sm:rounded-[18px] sm:px-3"
          aria-label={`Reveal ${label} result`}
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-[#0D1F3C] shadow-[0_10px_28px_rgba(13,31,60,0.35)] sm:size-12">
            <Eye className="size-3.5 text-cyan sm:size-5" strokeWidth={2.2} />
          </span>
          <span className="flex items-center gap-1 text-[11px] font-semibold tracking-wide text-[#0D1F3C] sm:gap-1.5 sm:text-[13.5px]">
            <Sparkles className="size-3 text-[#0097A7] sm:size-3.5" strokeWidth={2.2} />
            Reveal
          </span>
          <span className="hidden max-w-[11rem] text-[12px] leading-snug font-light text-[#64748B] sm:block">
            {label} score & coaching note
          </span>
        </button>
      ) : null}
    </div>
  );
}
