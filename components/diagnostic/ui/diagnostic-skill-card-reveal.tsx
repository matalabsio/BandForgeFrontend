"use client";

import { useRef, useState } from "react";
import { Headphones, BookOpen, Pencil, Mic, MousePointerClick } from "lucide-react";
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

const SKILL_ICONS: Record<string, typeof Headphones> = {
  Listening: Headphones,
  Reading: BookOpen,
  Writing: Pencil,
  Speaking: Mic,
};

/**
 * Blurred skill card — click to reveal with a smooth unblur animation.
 * Shows relevant skill icon on the overlay.
 */
export function DiagnosticSkillCardReveal({
  label,
  children,
  className,
  index = 0,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLSpanElement>(null);
  const [revealed, setRevealed] = useState(false);

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
    if (revealed) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const content = contentRef.current;
    const hint = hintRef.current;

    if (reduce || !content) {
      setRevealed(true);
      return;
    }

    setRevealed(true);

    const tl = gsap.timeline();

    if (hint) {
      tl.to(hint, { opacity: 0, scale: 0.92, duration: 0.3, ease: "power2.in" }, 0);
    }

    tl.to(
      content,
      {
        filter: "blur(0px)",
        scale: 1,
        duration: 1.1,
        ease: "power2.out",
        clearProps: "filter,transform",
      },
      0.08,
    ).fromTo(
      content,
      { y: 4 },
      { y: 0, duration: 0.8, ease: "power2.out" },
      0.08,
    );
  });

  const SkillIcon = SKILL_ICONS[label] ?? null;

  return (
    <div
      ref={rootRef}
      className={cn("relative isolate min-w-0 rounded-[14px]", className)}
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
            : { filter: "blur(8px)", transform: "scale(1.01)" }
        }
        aria-hidden={!revealed}
      >
        {children}
      </div>

      {!revealed ? (
        <button
          type="button"
          onClick={reveal}
          className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center rounded-[14px] bg-white/25 backdrop-blur-[1px] transition duration-200 hover:bg-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50"
          aria-label={`Reveal ${label} result`}
        >
          <span
            ref={hintRef}
            className="flex flex-col items-center gap-2 text-center"
          >
            {SkillIcon ? (
              <span className="flex size-10 items-center justify-center rounded-full bg-[#0B1B33]/90 shadow-lg sm:size-12">
                <SkillIcon className="size-4 text-[#2FB8C6] sm:size-5" strokeWidth={2} />
              </span>
            ) : null}
            <span className="flex items-center gap-1.5 text-[12px] font-semibold tracking-wide text-[#0B1B33] sm:text-[14px]">
              <MousePointerClick className="size-3.5 text-[#64748B]" strokeWidth={2} />
              Click to reveal
            </span>
            <span className="text-[11px] font-light text-[#64748B] sm:text-[12px]">
              {label}
            </span>
          </span>
        </button>
      ) : null}
    </div>
  );
}
