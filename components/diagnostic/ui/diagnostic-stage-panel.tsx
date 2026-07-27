"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { bfPrimaryCtaDiagClass } from "@/components/bandforge/bf-primary-cta-styles";
import { DiagnosticBookLoader } from "@/components/diagnostic/ui/diagnostic-book-loader";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

type Tip = {
  icon: ReactNode;
  text: string;
};

type Props = {
  title: string;
  description: string;
  remaining: number;
  totalSec: number;
  countdownLabel?: string;
  tips?: Tip[];
  children?: ReactNode;
  ctaLabel?: ReactNode;
  onCta?: () => void;
  ctaDisabled?: boolean;
  alwaysShowCta?: boolean;
  badge?: ReactNode;
  /** `ring` — circular countdown (prep). `book` — flipping book (transitions). */
  loader?: "ring" | "book";
};

export function DiagnosticStagePanel({
  title,
  description,
  remaining,
  totalSec,
  countdownLabel = "Starting in",
  tips,
  children,
  ctaLabel,
  onCta,
  ctaDisabled,
  alwaysShowCta = false,
  badge,
  loader = "book",
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const progressPct = Math.min(
    100,
    Math.max(0, ((totalSec - remaining) / Math.max(1, totalSec)) * 100),
  );
  const showCta = Boolean(ctaLabel && (alwaysShowCta || remaining === 0));
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference * (1 - progressPct / 100);
  const useBook = loader === "book";

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;

      const bits = root.querySelectorAll<HTMLElement>("[data-stage-reveal]");
      gsap.fromTo(
        bits,
        { opacity: 0, y: 22, filter: "blur(8px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.65,
          stagger: 0.09,
          ease: "power3.out",
          clearProps: "filter",
        },
      );
    },
    { scope: rootRef },
  );

  useGSAP(
    () => {
      if (useBook) return;
      const el = rootRef.current?.querySelector<HTMLElement>("[data-countdown-num]");
      if (!el) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;
      gsap.fromTo(
        el,
        { scale: 1.08 },
        { scale: 1, duration: 0.35, ease: "power2.out" },
      );
    },
    { scope: rootRef, dependencies: [remaining, useBook] },
  );

  return (
    <div
      ref={rootRef}
      className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[radial-gradient(ellipse_at_top,_#F0FBFC_0%,_#FFFFFF_55%)]"
    >
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 py-8 sm:px-8 sm:py-10">
        <div data-stage-reveal className="mx-auto flex flex-col items-center">
          {useBook ? (
            <DiagnosticBookLoader
              label={
                <>
                  {countdownLabel}{" "}
                  <span className="font-mono font-semibold text-cyan">
                    {remaining}s
                  </span>
                </>
              }
            />
          ) : (
            <>
              <div className="relative size-[132px] sm:size-[148px]">
                <svg
                  className="size-full -rotate-90"
                  viewBox="0 0 120 120"
                  aria-hidden
                >
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="6"
                    strokeDasharray="2 6"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="url(#diag-ring-grad)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    className="transition-[stroke-dashoffset] duration-1000 ease-linear"
                  />
                  <defs>
                    <linearGradient id="diag-ring-grad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#4DD0E1" />
                      <stop offset="100%" stopColor="#00838F" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    data-countdown-num
                    className="font-mono text-[36px] leading-none font-bold tracking-tight text-navy sm:text-[42px]"
                  >
                    {remaining}
                  </span>
                  <span className="mt-1 font-mono text-[11px] tracking-[0.14em] text-[#94A3B8] uppercase">
                    sec
                  </span>
                </div>
              </div>
              <p className="mt-4 text-center text-[13px] text-[#64748B] sm:text-[14px]">
                {countdownLabel}{" "}
                <span className="font-mono font-semibold text-cyan">{remaining}s</span>
              </p>
              <div className="mt-3 h-1 w-40 overflow-hidden rounded-full bg-[#E2E8F0] sm:w-48">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#0097a7_0%,#00bcd4_50%,#0097a7_100%)] transition-[width] duration-1000 ease-linear"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </>
          )}
        </div>

        <div
          data-stage-reveal
          className="mt-8 rounded-[24px] border border-[#E8EEF4] bg-white p-6 sm:mt-10 sm:p-8"
        >
          {badge ? (
            <div
              data-stage-reveal
              className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#4DD0E1_0%,#00BCD4_42%,#00838F_100%)] text-white"
            >
              {badge}
            </div>
          ) : null}

          <h1
            data-stage-reveal
            className="text-center font-display text-[26px] leading-[1.15] font-bold tracking-[-0.03em] text-navy sm:text-[32px]"
          >
            {title}
          </h1>
          <p
            data-stage-reveal
            className="mx-auto mt-2.5 max-w-[40ch] text-center text-[14px] leading-relaxed text-[#64748B] sm:text-[15px]"
          >
            {description}
          </p>

          {tips && tips.length > 0 ? (
            <ul className="mt-6 space-y-2.5">
              {tips.map((tip) => (
                <li
                  key={tip.text}
                  data-stage-reveal
                  className="flex items-start gap-3 rounded-[14px] border border-[#E8EEF4] bg-[#F8FBFC] px-3.5 py-3.5"
                >
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-cyan/12 text-cyan">
                    {tip.icon}
                  </span>
                  <span className="pt-1 text-[13.5px] leading-snug text-[#1B2B45] sm:text-[14px]">
                    {tip.text}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          {children ? (
            <div data-stage-reveal className="mt-6">
              {children}
            </div>
          ) : null}
        </div>

        {showCta ? (
          <button
            type="button"
            data-stage-reveal
            disabled={ctaDisabled}
            onClick={onCta}
            className={cn(bfPrimaryCtaDiagClass, "mt-7 h-[54px] text-[16px]")}
          >
            <span className="relative z-[1]">{ctaLabel}</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
