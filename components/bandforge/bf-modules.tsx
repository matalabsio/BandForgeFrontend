"use client";

import { useCallback, useEffect, useRef, type MouseEvent as ReactMouseEvent } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { gsap } from "gsap";
import { ArrowUpRight } from "lucide-react";
import { useBfSectionReveal } from "@/components/bandforge/use-bf-section-reveal";
import { GlowCard, type GlowColor } from "@/components/ui/spotlight-card";
import { BRAND_MODULES, type ModuleIcon } from "@/lib/brand-mock-data";

/** Brand primary glow cycle — cyan / teal / navy / cyan */
const MODULE_GLOW: readonly GlowColor[] = ["cyan", "teal", "navy", "cyan"];

/** Cards: left / right / up / down for variety on scroll-in */
const CARD_REVEAL = ["left", "right", "up", "down"] as const;

type ModuleCardProps = {
  title: string;
  description: string;
  highlights: readonly string[];
  Icon: ModuleIcon;
  footer: string;
  index: number;
  glowColor: GlowColor;
};

function ModuleCard({
  title,
  description,
  highlights,
  Icon,
  footer,
  index,
  glowColor,
}: ModuleCardProps) {
  return (
    <div
      className="h-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform hover:-translate-y-1"
      data-bf-reveal={CARD_REVEAL[index] ?? "up"}
      data-bf-reveal-delay={String(0.12 + index * 0.09)}
    >
      <GlowCard
        customSize
        glowColor={glowColor}
        className="group h-full min-h-[280px] w-full"
      >
        <div className="relative z-[1] flex h-full flex-col">
          <div className="mb-4 inline-flex size-10 shrink-0 items-center justify-center self-start rounded-xl bg-white/90 text-cyan shadow-[inset_0_1px_0_rgb(255_255_255/0.8)] lg:size-11 lg:rounded-2xl">
            <Icon className="size-5" strokeWidth={1.85} />
          </div>

          <h3 className="shrink-0 font-display text-[1.125rem] leading-none font-bold tracking-[-0.02em] text-navy lg:text-[1.25rem]">
            {title}
          </h3>

          <ul className="mt-4 flex shrink-0 flex-col gap-2">
            {highlights.map((item) => (
              <li
                key={item}
                className="text-[0.8125rem] leading-[1.45] text-muted lg:text-[0.875rem]"
              >
                {item}
              </li>
            ))}
          </ul>

          {description ? (
            <p className="mt-3 shrink-0 text-[0.8125rem] leading-[1.5] text-muted/90 lg:text-[0.875rem]">
              {description}
            </p>
          ) : null}

          <div className="mt-auto flex shrink-0 items-end justify-between gap-2 pt-5">
            <p className="font-display text-[0.875rem] leading-snug font-semibold text-navy lg:text-[0.9375rem]">
              {footer}
            </p>
            <span
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-navy/10 bg-white/70 text-navy/45 transition-[border-color,color,transform,background-color] duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:border-cyan/35 group-hover:text-cyan"
              aria-hidden
            >
              <ArrowUpRight className="size-3.5" strokeWidth={1.75} />
            </span>
          </div>
        </div>
      </GlowCard>
    </div>
  );
}

export function BandForgeModules() {
  const sectionRef = useRef<HTMLElement>(null);
  const blobsRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  useBfSectionReveal(sectionRef, { reduceMotion, start: "top 88%" });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 90, damping: 24, mass: 0.35 });
  const springY = useSpring(mouseY, { stiffness: 90, damping: 24, mass: 0.35 });
  const spotlight = useMotionTemplate`radial-gradient(480px circle at ${springX}px ${springY}px, rgba(0,188,212,0.06), transparent 55%)`;

  const onSectionMove = useCallback(
    (e: ReactMouseEvent<HTMLElement>) => {
      if (reduceMotion) return;
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY, reduceMotion],
  );

  useEffect(() => {
    const root = blobsRef.current;
    if (!root || reduceMotion) return;

    const blobs = root.querySelectorAll<HTMLElement>("[data-blob]");
    const ctx = gsap.context(() => {
      blobs.forEach((blob, i) => {
        const amp = [5, 4, 3][i] ?? 4;
        gsap.to(blob, {
          x: amp,
          y: -amp * 0.65,
          duration: 24 + i * 3,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      });
    }, root);

    return () => ctx.revert();
  }, [reduceMotion]);

  return (
    <section
      ref={sectionRef}
      id="modules"
      onMouseMove={onSectionMove}
      className="bf-modules-section relative z-[2] flex min-h-dvh scroll-mt-20 flex-col overflow-x-clip lg:min-h-dvh"
      style={{
        backgroundImage: [
          "radial-gradient(circle at 12% 18%, rgba(0,151,167,0.035), transparent 40%)",
          "radial-gradient(circle at 88% 22%, rgba(0,188,212,0.028), transparent 38%)",
          "radial-gradient(circle at 78% 78%, rgba(0,151,167,0.025), transparent 36%)",
        ].join(", "),
      }}
    >
      <div
        ref={blobsRef}
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <div
          data-blob
          className="absolute -top-20 left-[6%] size-[240px] rounded-full bg-[rgb(0_151_167/0.04)] blur-[90px] sm:size-[300px]"
        />
        <div
          data-blob
          className="absolute top-[38%] right-[-8%] size-[260px] rounded-full bg-[rgb(0_188_212/0.035)] blur-[100px] sm:size-[320px]"
        />
        <div
          data-blob
          className="absolute bottom-[-12%] left-[32%] size-[220px] rounded-full bg-[rgb(0_151_167/0.03)] blur-[95px] sm:size-[280px]"
        />
      </div>

      {!reduceMotion ? (
        <motion.div
          className="pointer-events-none absolute inset-0 z-[1] hidden lg:block"
          style={{ background: spotlight }}
          aria-hidden
        />
      ) : null}

      <div className="bf-container relative z-[2] flex flex-1 flex-col justify-center py-10 sm:py-12 lg:py-12">
        <div className="bf-section-head mb-8 shrink-0 lg:mb-12">
          <p
            className="font-mono text-[0.6875rem] tracking-[0.16em] text-cyan uppercase sm:text-xs"
            data-bf-reveal="fade"
            data-bf-reveal-delay="0"
          >
            Skill Practice
          </p>
          <h2
            className="font-display mt-3 max-w-[20ch] text-[1.875rem] leading-[1.08] font-bold tracking-[-0.035em] text-balance text-navy sm:mt-4 sm:max-w-[24ch] sm:text-[2.5rem] lg:text-[clamp(2.25rem,4.2vw,3.25rem)]"
            data-bf-reveal="left"
            data-bf-reveal-delay="0.08"
          >
            Every question format the exam actually uses
          </h2>
          <p
            className="mx-auto mt-3 max-w-[42ch] text-[0.9375rem] leading-relaxed text-muted sm:mt-4 sm:max-w-[48ch] sm:text-base lg:text-[1.0625rem]"
            data-bf-reveal="up"
            data-bf-reveal-delay="0.16"
          >
            Real exam simulations, not generic quizzes — built from years of
            tracking what actually shows up on test day.
          </p>
        </div>

        <div className="mx-auto grid w-full grid-cols-1 items-stretch gap-5 sm:grid-cols-2 sm:gap-6 lg:gap-7">
          {BRAND_MODULES.map((mod, index) => (
            <ModuleCard
              key={mod.key}
              title={mod.title}
              description={mod.description}
              highlights={mod.highlights}
              Icon={mod.Icon}
              footer={mod.footer}
              index={index}
              glowColor={MODULE_GLOW[index] ?? "cyan"}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
