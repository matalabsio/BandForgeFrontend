"use client";

import { useMemo, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import {
  bfPrimaryCtaDiagClass,
  bfPrimaryCtaDiagInnerClass,
} from "@/components/bandforge/bf-primary-cta-styles";
import { DiagnosticProcessingLoader } from "@/components/diagnostic/ui/diagnostic-processing-loader";
import { TextType } from "@/components/ui/text-type";
import { planTimedTextType } from "@/lib/timed-text-type";
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
  /**
   * Extra copy typed outside this panel (e.g. interstitial quote) that must
   * still finish inside `totalSec` — included only in the typing budget.
   */
  typeBudgetExtraTexts?: string[];
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
  typeBudgetExtraTexts,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const progressPct = Math.min(
    100,
    Math.max(0, ((totalSec - remaining) / Math.max(1, totalSec)) * 100),
  );
  const showCta = Boolean(ctaLabel && (alwaysShowCta || remaining === 0));

  const tipTexts = tips?.map((t) => t.text) ?? [];
  const tipTextsKey = tipTexts.join("\0");
  const extraTextsKey = (typeBudgetExtraTexts ?? []).join("\0");

  const typePlan = useMemo(() => {
    const segments = [
      { text: title },
      { text: description },
      ...tipTexts.map((text) => ({ text })),
      ...(typeBudgetExtraTexts ?? []).map((text) => ({ text })),
    ];
    return planTimedTextType(segments, totalSec);
    // tipTexts / extras keyed by content so countdown re-renders don't reset typing
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tipTextsKey / extraTextsKey
  }, [title, description, tipTextsKey, extraTextsKey, totalSec]);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;

      const bits = root.querySelectorAll<HTMLElement>("[data-stage-reveal]");
      gsap.fromTo(
        bits,
        { opacity: 0, y: 18, filter: "blur(6px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.65,
          stagger: 0.1,
          ease: "power3.out",
          clearProps: "filter",
        },
      );
    },
    { scope: rootRef },
  );

  const countdownCaption = (
    <>
      {countdownLabel}{" "}
      <span className="font-mono font-semibold text-cyan">{remaining}s</span>
    </>
  );

  const tipDelayOffset = 2;

  return (
    <div
      ref={rootRef}
      className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[radial-gradient(ellipse_at_top,_#F0FBFC_0%,_#FFFFFF_55%)]"
    >
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 py-8 sm:px-8 sm:py-10">
        <div data-stage-reveal className="mx-auto flex flex-col items-center">
          <DiagnosticProcessingLoader
            size="lg"
            label={countdownCaption}
            labelKey={remaining}
          />
          <div className="mt-3 h-1 w-40 overflow-hidden rounded-full bg-[#E2E8F0] sm:w-48">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#0097a7_0%,#00bcd4_50%,#0097a7_100%)] transition-[width] duration-1000 ease-linear"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div
          data-stage-reveal
          className="mt-8 rounded-[24px] bg-white/90 p-6 shadow-[0_1px_0_rgba(15,23,42,0.04)] sm:mt-10 sm:p-8"
        >
          {badge ? (
            <div
              data-stage-reveal
              className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#4DD0E1_0%,#00BCD4_42%,#00838F_100%)] text-white"
            >
              {badge}
            </div>
          ) : null}

          <TextType
            as="h1"
            text={title}
            loop={false}
            typingSpeed={typePlan.typingSpeed}
            variableSpeed={typePlan.variableSpeed}
            initialDelay={typePlan.delays[0] ?? 0}
            showCursor
            cursorCharacter="|"
            cursorBlinkDuration={0.55}
            className="w-full text-center font-display text-[26px] leading-[1.25] font-bold tracking-[-0.03em] text-navy sm:text-[32px]"
          />
          <TextType
            as="p"
            text={description}
            loop={false}
            typingSpeed={typePlan.typingSpeed}
            variableSpeed={typePlan.variableSpeed}
            initialDelay={typePlan.delays[1] ?? 0}
            showCursor
            cursorCharacter="|"
            cursorBlinkDuration={0.55}
            className="mx-auto mt-3 max-w-[42ch] text-center text-[15px] leading-relaxed text-[#64748B] sm:text-[16px]"
          />

          {tips && tips.length > 0 ? (
            <ul className="mt-6 space-y-2.5">
              {tips.map((tip, tipIndex) => (
                <li
                  key={tip.text}
                  data-stage-reveal
                  className="flex items-start gap-3 rounded-[14px] bg-[#F4F8FA] px-3.5 py-3.5"
                >
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-cyan/12 text-cyan">
                    {tip.icon}
                  </span>
                  <TextType
                    as="span"
                    text={tip.text}
                    loop={false}
                    typingSpeed={typePlan.typingSpeed}
                    variableSpeed={typePlan.variableSpeed}
                    initialDelay={
                      typePlan.delays[tipDelayOffset + tipIndex] ?? 0
                    }
                    showCursor
                    cursorCharacter="|"
                    cursorBlinkDuration={0.55}
                    className="min-w-0 flex-1 pt-1 text-[15px] leading-snug text-[#1B2B45] sm:text-[16px]"
                  />
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
            className={cn(
              "mt-7",
              ctaDisabled
                ? "relative inline-flex h-[54px] w-full cursor-not-allowed items-center justify-center overflow-hidden rounded-full bg-transparent px-6 font-display text-[16px] font-semibold text-navy disabled:opacity-100"
                : bfPrimaryCtaDiagClass,
            )}
          >
            {ctaDisabled ? (
              <span className="bf-diag-cta-wait-ring" aria-hidden>
                <span />
              </span>
            ) : null}
            <span className={cn(bfPrimaryCtaDiagInnerClass, ctaDisabled && "text-navy")}>
              {ctaLabel}
            </span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
