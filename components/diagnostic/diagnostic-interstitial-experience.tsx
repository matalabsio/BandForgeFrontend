"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Star } from "lucide-react";
import { DiagnosticSplitShell } from "@/components/diagnostic/diagnostic-split-shell";
import { DIAGNOSTIC_EXAM_STEPS } from "@/components/diagnostic/diagnostic-exam-steps";
import { DiagnosticStagePanel } from "@/components/diagnostic/ui/diagnostic-stage-panel";
import { useCountdown } from "@/hooks/use-countdown";
import {
  DIAGNOSTIC_TRANSITIONS,
  type DiagnosticTransitionSlug,
} from "@/lib/diagnostic-transitions";
import { hasInProgressDiagnostic } from "@/lib/diagnostic-storage";

const SLUG_TO_STEP: Record<DiagnosticTransitionSlug, number> = {
  "listening-reading": 1,
  "reading-writing": 2,
  "writing-speaking": 3,
};

type Props = {
  slug: DiagnosticTransitionSlug;
};

export function DiagnosticInterstitialExperience({ slug }: Props) {
  const router = useRouter();
  const config = DIAGNOSTIC_TRANSITIONS[slug];
  const remaining = useCountdown(config.countdownSec);
  const canContinue = remaining === 0;

  useEffect(() => {
    if (!hasInProgressDiagnostic()) {
      router.replace("/diagnostic");
    }
  }, [router]);

  useEffect(() => {
    if (remaining !== 0) return;
    router.replace(config.nextPath);
  }, [remaining, router, config.nextPath]);

  return (
    <DiagnosticSplitShell
      steps={DIAGNOSTIC_EXAM_STEPS}
      currentStep={SLUG_TO_STEP[slug]}
      heading={config.completedLabel}
      subtitle={`${config.nextLabel} is next.`}
      footerNote={`${config.nextLabel} begins in ${remaining}s`}
      fillViewport
    >
      <DiagnosticStagePanel
        title={`${config.nextLabel} is next`}
        description="Take a breath — you’re making steady progress through your diagnostic."
        remaining={remaining}
        totalSec={config.countdownSec}
        countdownLabel={`${config.nextLabel} begins in`}
        loader="book"
        alwaysShowCta
        ctaLabel={
          canContinue ? (
            <>
              {config.ctaLabel}
              <ArrowRight className="size-4" aria-hidden />
            </>
          ) : (
            `Ready in ${remaining}s`
          )
        }
        ctaDisabled={!canContinue}
        onCta={() => router.replace(config.nextPath)}
      >
        <div className="rounded-[18px] border border-[#E8EEF4] bg-[#F8FBFC] p-5">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="rgba(0,188,212,0.2)"
            className="mb-3"
            aria-hidden
          >
            <path d="M7 7h4v4c0 2.2-1.4 3.7-3.5 4.2l-.5-1.4c1.1-.3 1.7-.9 1.8-1.8H7zm8 0h4v4c0 2.2-1.4 3.7-3.5 4.2l-.5-1.4c1.1-.3 1.7-.9 1.8-1.8H15z" />
          </svg>
          <blockquote className="font-display text-[17px] leading-snug font-medium tracking-tight text-pretty text-navy sm:text-xl">
            &ldquo;{config.quote}&rdquo;
          </blockquote>
          <div className="mt-4 flex items-center gap-2.5">
            <div
              className="flex size-10 items-center justify-center rounded-full font-display text-[14px] font-bold text-white"
              style={{
                background:
                  "linear-gradient(135deg, #4DD0E1 0%, #00BCD4 45%, #00838F 100%)",
              }}
            >
              {config.quoteInitials}
            </div>
            <div>
              <p className="text-sm font-semibold text-navy">
                {config.quoteAttribution}
              </p>
              <p className="font-mono text-[11.5px] text-[#6E83A0]">
                {config.quoteLocation}
              </p>
            </div>
          </div>
          <div className="mt-3.5 flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-4 fill-cyan text-cyan" aria-hidden />
            ))}
          </div>
        </div>
      </DiagnosticStagePanel>
    </DiagnosticSplitShell>
  );
}
