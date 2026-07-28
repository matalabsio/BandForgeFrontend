"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DiagnosticSplitShell } from "@/components/diagnostic/diagnostic-split-shell";
import { DIAGNOSTIC_EXAM_STEPS } from "@/components/diagnostic/diagnostic-exam-steps";
import { DiagnosticPlanCheckoutSection } from "@/components/diagnostic/diagnostic-plan-checkout-section";
import { DiagnosticPerformanceSkillCard } from "@/components/diagnostic/ui/diagnostic-performance-skill-card";
import { DiagnosticScoreAnalysisBlock } from "@/components/diagnostic/ui/diagnostic-score-analysis-block";
import { DiagnosticSkillCardReveal } from "@/components/diagnostic/ui/diagnostic-skill-card-reveal";
import { bfPrimaryCtaNavClass } from "@/components/bandforge/bf-primary-cta-styles";
import { aggregateBand } from "@/lib/diagnostic-scoring";
import { calculateWritingBand, wordCount } from "@/lib/diagnostic-scoring";
import { diagnosticPaths } from "@/lib/diagnostic-catalog";
import { cn } from "@/lib/utils";
import { readDiagnosticLead } from "@/lib/diagnostic-lead";
import {
  bandBarPercent,
  bandRange,
  coachingCopy,
  holdingBackNarrative,
  skillLabel,
  skillStatuses,
  type SkillBands,
  type SkillKey,
} from "@/lib/diagnostic-performance";
import { readDiagnosticProgress } from "@/lib/diagnostic-storage";
import {
  readDiagnosticResults,
  type DiagnosticResultsSnapshot,
} from "@/lib/diagnostic-session";

function aggregatePartialBand(snapshot: DiagnosticResultsSnapshot): number {
  const partial = aggregateBand(
    snapshot.listening_band,
    snapshot.reading_band,
    snapshot.writingEvaluation?.writing_band ?? snapshot.writing_band,
    snapshot.speaking_band,
  );
  return partial ?? 0;
}

function bandLabel(
  band: number | null | undefined,
  pendingHuman?: boolean,
): string {
  if (pendingHuman) return "Pending";
  if (band == null || band <= 0) return "—";
  return band.toFixed(1);
}

function ResultsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-32 rounded-2xl bg-navy/8" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="h-36 rounded-2xl bg-navy/8" />
        <div className="h-36 rounded-2xl bg-navy/8" />
        <div className="h-36 rounded-2xl bg-navy/8" />
        <div className="h-36 rounded-2xl bg-navy/8" />
      </div>
      <div className="h-40 rounded-2xl bg-navy/8" />
    </div>
  );
}

const SKILL_ORDER: SkillKey[] = [
  "listening",
  "reading",
  "writing",
  "speaking",
];

export function DiagnosticResultsExperience() {
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<DiagnosticResultsSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progressWritingFallbackBand, setProgressWritingFallbackBand] = useState<
    number | null
  >(null);

  const lead = useMemo(() => readDiagnosticLead(), [snapshot]);
  const targetBand = lead?.targetBand ?? 7.0;

  const pendingHuman = snapshot?.review_status === "pending_human";
  const hasWritingEval = snapshot?.writingEvaluation != null;
  const writingBandFromSnapshot =
    snapshot?.writingEvaluation?.writing_band ?? snapshot?.writing_band ?? null;
  const effectiveWritingBand =
    writingBandFromSnapshot ?? progressWritingFallbackBand;
  const effectiveSpeakingBand = snapshot?.speaking_band ?? null;
  const speakingBandForDisplay = effectiveSpeakingBand;

  const skillBands: SkillBands = useMemo(
    () => ({
      listening: snapshot?.listening_band ?? null,
      reading: snapshot?.reading_band ?? null,
      writing: effectiveWritingBand,
      speaking: speakingBandForDisplay,
    }),
    [snapshot, effectiveWritingBand, speakingBandForDisplay],
  );

  const statuses = useMemo(
    () => skillStatuses(skillBands, targetBand),
    [skillBands, targetBand],
  );

  const analysis = useMemo(
    () => holdingBackNarrative(skillBands, targetBand),
    [skillBands, targetBand],
  );

  useEffect(() => {
    const cached = readDiagnosticResults();
    if (cached) {
      setSnapshot(cached);
      const storedWritingBand =
        cached.writingEvaluation?.writing_band ?? cached.writing_band ?? null;
      if (storedWritingBand == null) {
        const progress = readDiagnosticProgress();
        const writingAnswers = progress?.answers?.writing
          ? Object.values(progress.answers.writing)
          : [];
        const longestEssayWords = writingAnswers.reduce(
          (max, essay) => Math.max(max, wordCount(essay)),
          0,
        );
        setProgressWritingFallbackBand(
          longestEssayWords > 0 ? calculateWritingBand(longestEssayWords, 1) : null,
        );
      } else {
        setProgressWritingFallbackBand(null);
      }
      setLoading(false);
    } else {
      setError(
        "No diagnostic results yet. Complete the free diagnostic first.",
      );
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loading || error || !snapshot) return;
    if (typeof window === "undefined") return;
    const wantsPlan =
      window.location.hash === "#plan-unlock" ||
      new URLSearchParams(window.location.search).get("checkout") === "1";
    if (!wantsPlan) return;
    const el = document.getElementById("plan-unlock");
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => {
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }, 80);
  }, [loading, error, snapshot]);

  const heroBand = snapshot
    ? pendingHuman
      ? bandLabel(aggregatePartialBand(snapshot) || null)
      : bandLabel(snapshot.aggregate_band)
    : "—";

  const personalizedResults = snapshot ? (
    <section className="space-y-5 sm:space-y-6">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.1em] text-[#94A3B8] uppercase">
          Your diagnostic
        </p>
        <h2 className="mt-1.5 font-display text-[22px] leading-tight font-bold tracking-[-0.02em] text-[#0D1F3C] sm:text-[26px]">
          Skill-by-skill results
        </h2>
        <p className="mt-1.5 text-[14px] leading-relaxed text-[#5A6B82] sm:text-[15px]">
          Cards stay private until you reveal them — tap each skill to uncover your
          band and coaching note.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-[18px] lg:grid-cols-4">
        {SKILL_ORDER.map((key, index) => {
          const pending =
            pendingHuman &&
            ((key === "writing" &&
              effectiveWritingBand == null &&
              !hasWritingEval) ||
              (key === "speaking" && effectiveSpeakingBand == null));
          const band = skillBands[key];

          return (
            <DiagnosticSkillCardReveal
              key={key}
              label={skillLabel(key)}
              index={index}
              className="min-h-[148px] sm:min-h-[180px]"
            >
              <DiagnosticPerformanceSkillCard
                label={skillLabel(key)}
                bandRange={pending ? "—" : bandRange(band)}
                status={statuses[key]}
                coaching={coachingCopy(statuses[key])}
                barPercent={bandBarPercent(band)}
                pending={pending}
              />
            </DiagnosticSkillCardReveal>
          );
        })}
      </div>

      {!pendingHuman ? (
        <DiagnosticScoreAnalysisBlock
          narrative={analysis.narrative}
          reachBand={analysis.reachBand}
        />
      ) : null}
    </section>
  ) : null;

  return (
    <DiagnosticSplitShell
      steps={DIAGNOSTIC_EXAM_STEPS}
      currentStep={4}
      heading={pendingHuman ? "Your report is on the way." : "Your results are ready."}
      subtitle="Unlock your plan, then reveal your personalised skill breakdown."
      footerNote="Diagnostic complete"
    >
      <div className="min-h-0 flex-1 overflow-y-auto bg-white">
        <div className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-6 sm:py-10">
          {loading ? (
            <ResultsSkeleton />
          ) : error ? (
            <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-border-soft bg-white p-8 text-center shadow-sm">
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
              <Link
                href={diagnosticPaths.landing}
                className={cn(bfPrimaryCtaNavClass, "mx-auto")}
              >
                Start diagnostic
              </Link>
            </div>
          ) : snapshot ? (
            <div className="space-y-6 sm:space-y-7">
              <div className="flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
                <div className="min-w-0">
                  <h1 className="font-display text-[24px] leading-tight font-bold tracking-[-0.025em] text-[#0D1F3C] sm:text-[36px]">
                    {pendingHuman
                      ? "Your report is on the way."
                      : "Your results are ready."}
                  </h1>
                  <p className="mt-2 text-[14px] leading-relaxed font-light text-[#5A6B82] sm:text-[16.5px]">
                    Unlock the Full Skill Program first — then scroll to reveal your
                    personalised skill scores and study plan.
                  </p>
                </div>

                <div className="flex w-full shrink-0 items-center justify-between gap-4 rounded-[16px] bg-[#0D1F3C] px-4 py-3.5 shadow-[0_12px_30px_rgba(13,31,60,0.25)] sm:w-auto sm:justify-start sm:gap-5 sm:rounded-[18px] sm:px-7 sm:py-[18px]">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold tracking-[0.08em] text-[#9DB0CB] uppercase sm:text-[11px]">
                      Estimated overall band
                    </p>
                    <p className="mt-0.5 text-[11px] font-light text-[#9DB0CB] sm:mt-1 sm:text-[12.5px]">
                      Across all four skills
                    </p>
                  </div>
                  <span className="hidden h-[50px] w-px bg-white/15 sm:block" aria-hidden />
                  <p className="shrink-0 font-mono text-[40px] leading-[0.9] font-medium tracking-[-0.02em] text-cyan sm:text-[50px]">
                    {heroBand}
                  </p>
                </div>
              </div>

              <DiagnosticPlanCheckoutSection
                snapshot={snapshot}
                afterPayment={personalizedResults}
              />
            </div>
          ) : null}
        </div>
      </div>
    </DiagnosticSplitShell>
  );
}
