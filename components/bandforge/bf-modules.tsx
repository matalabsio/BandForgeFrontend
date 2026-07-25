"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { gsap } from "gsap";
import { ArrowUpRight } from "lucide-react";
import { BRAND_MODULES, type ModuleIcon } from "@/lib/brand-mock-data";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

type ModuleCardProps = {
  title: string;
  description: string;
  highlights: readonly string[];
  Icon: ModuleIcon;
  band: string | null;
  index: number;
  className?: string;
  reduceMotion: boolean | null;
};

function ModuleCard({
  title,
  description,
  highlights,
  Icon,
  band,
  index,
  className,
  reduceMotion,
}: ModuleCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const rotateXTo = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const rotateYTo = useRef<ReturnType<typeof gsap.quickTo> | null>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || reduceMotion) return;

    gsap.set(el, { transformPerspective: 900, transformStyle: "preserve-3d" });
    rotateXTo.current = gsap.quickTo(el, "rotationX", {
      duration: 0.5,
      ease: "power3.out",
    });
    rotateYTo.current = gsap.quickTo(el, "rotationY", {
      duration: 0.5,
      ease: "power3.out",
    });
  }, [reduceMotion]);

  const onMove = (e: ReactMouseEvent<HTMLElement>) => {
    const el = cardRef.current;
    if (!el || reduceMotion) return;

    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    rotateXTo.current?.((0.5 - py) * 5);
    rotateYTo.current?.((px - 0.5) * 5);

    if (shineRef.current) {
      gsap.to(shineRef.current, {
        opacity: 1,
        background: `radial-gradient(420px circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,0.5), transparent 42%)`,
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  };

  const onEnter = () => {
    setHovered(true);
    if (reduceMotion) return;
    if (iconRef.current) {
      gsap.to(iconRef.current, {
        y: -3,
        rotate: 5,
        scale: 1.08,
        duration: 0.4,
        ease: "power3.out",
        overwrite: "auto",
      });
    }
  };

  const onLeave = () => {
    setHovered(false);
    if (reduceMotion) return;
    rotateXTo.current?.(0);
    rotateYTo.current?.(0);
    if (shineRef.current) {
      gsap.to(shineRef.current, { opacity: 0, duration: 0.35, overwrite: "auto" });
    }
    if (iconRef.current) {
      gsap.to(iconRef.current, {
        y: 0,
        rotate: 0,
        scale: 1,
        duration: 0.4,
        ease: "power3.out",
        overwrite: "auto",
      });
    }
  };

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: 0.65,
        delay: 0.1 + index * 0.08,
        ease: EASE,
      }}
      className={cn("h-full", className)}
    >
      <article
        ref={cardRef}
        onMouseMove={onMove}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        className={cn(
          "group relative h-full rounded-2xl p-px will-change-transform lg:rounded-[1.25rem]",
          hovered && "shadow-[0_18px_40px_-22px_rgb(0_151_167/0.32)]",
          !hovered && "shadow-[0_8px_28px_-22px_rgb(13_31_60/0.28)]",
        )}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Default border */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[#ececec] transition-opacity duration-500"
          aria-hidden
        />
        {/* Smooth gradient outer border on hover */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(135deg,#0097a7_0%,#00bcd4_45%,#7dd3fc_100%)] opacity-0 transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            hovered && "opacity-100",
          )}
          aria-hidden
        />

        <div className="relative z-[1] flex h-full flex-col overflow-hidden rounded-[calc(1rem-1px)] bg-white/95 backdrop-blur-[10px] sm:rounded-[calc(1.125rem-1px)] lg:rounded-[calc(1.25rem-1px)]">
          <div
            ref={shineRef}
            className="pointer-events-none absolute inset-0 z-[1] opacity-0 mix-blend-soft-light"
            aria-hidden
          />

          <div className="relative z-[2] flex h-full flex-col p-5 sm:p-6">
            <div
              ref={iconRef}
              className="mb-4 inline-flex size-10 shrink-0 items-center justify-center self-start rounded-xl bg-[linear-gradient(145deg,#e8f7f9_0%,#ffffff_60%,#eef9fb_100%)] text-cyan shadow-[inset_0_1px_0_rgb(255_255_255/0.8)] lg:size-11 lg:rounded-2xl"
            >
              <Icon className="size-5" strokeWidth={1.85} />
            </div>

            <h3 className="shrink-0 font-display text-[1.125rem] leading-none font-bold tracking-[-0.02em] text-navy transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 lg:text-[1.25rem]">
              {title}
            </h3>

            <ul className="mt-4 flex shrink-0 flex-col gap-1.5">
              {highlights.map((item) => (
                <li
                  key={item}
                  className="text-[0.8125rem] leading-[1.45] text-muted lg:text-[0.875rem]"
                >
                  {item}
                </li>
              ))}
            </ul>

            <p className="mt-3 shrink-0 text-[0.8125rem] leading-[1.5] text-muted/90 lg:text-[0.875rem]">
              {description}
            </p>

            <div className="mt-auto flex shrink-0 items-end justify-between gap-2 pt-5">
              <div>
                <p className="font-mono text-[0.5625rem] tracking-[0.16em] text-muted uppercase">
                  Estimated band
                </p>
                <p className="mt-0.5 font-display text-[0.9375rem] leading-tight font-semibold text-navy">
                  {band ?? <span className="text-muted">Coming soon</span>}
                </p>
              </div>
              <span
                className={cn(
                  "inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-[#ececec] text-navy/45 transition-[border-color,color,transform,background-color] duration-500",
                  hovered &&
                    "translate-x-0.5 -translate-y-0.5 border-[#d5e9ff] bg-cyan/5 text-cyan",
                )}
                aria-hidden
              >
                <ArrowUpRight className="size-3.5" strokeWidth={1.75} />
              </span>
            </div>
          </div>
        </div>
      </article>
    </motion.div>
  );
}

export function BandForgeModules() {
  const sectionRef = useRef<HTMLElement>(null);
  const blobsRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const inView = useInView(sectionRef, { once: true, amount: 0.18 });

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
      className="bf-modules-section relative flex min-h-dvh scroll-mt-20 flex-col overflow-x-clip lg:min-h-dvh"
      style={{
        backgroundColor: "#ffffff",
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

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #0d1f3c 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
        aria-hidden
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />

      {!reduceMotion ? (
        <motion.div
          className="pointer-events-none absolute inset-0 z-[1] hidden lg:block"
          style={{ background: spotlight }}
          aria-hidden
        />
      ) : null}

      <div className="bf-container relative z-[2] flex flex-1 flex-col justify-center py-10 sm:py-12 lg:py-12">
        <motion.div
          className="bf-section-head mb-8 shrink-0 lg:mb-12"
          initial={reduceMotion ? false : { opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.75, ease: EASE }}
        >
          <p className="text-[0.6875rem] font-semibold tracking-[0.35em] text-muted uppercase sm:text-[0.75rem]">
            Four modules
          </p>
          <h2 className="font-display mt-3 text-[1.875rem] leading-[1.08] font-bold tracking-[-0.035em] text-balance text-navy sm:mt-4 sm:text-[2.5rem] lg:text-[clamp(2.25rem,4.2vw,3.25rem)]">
            Every section,
            <br className="hidden sm:block" /> measured.
          </h2>
          <p className="mx-auto mt-3 max-w-[34ch] text-[0.9375rem] leading-relaxed text-muted sm:mt-4 sm:text-base lg:text-[1.0625rem]">
            Real exam simulations with AI feedback.
          </p>
        </motion.div>

        <div className="mx-auto grid w-full grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-[22px]">
          {BRAND_MODULES.map((mod, index) => (
            <ModuleCard
              key={mod.key}
              title={mod.title}
              description={mod.description}
              highlights={mod.highlights}
              Icon={mod.Icon}
              band={mod.band}
              index={index}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
