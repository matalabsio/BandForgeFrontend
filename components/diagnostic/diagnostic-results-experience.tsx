"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Clock, ShieldCheck } from "lucide-react";
import { DiagnosticChrome } from "@/components/diagnostic/diagnostic-chrome";
import { DiagnosticPerformanceSkillCard } from "@/components/diagnostic/ui/diagnostic-performance-skill-card";
import { DiagnosticScoreAnalysisBlock } from "@/components/diagnostic/ui/diagnostic-score-analysis-block";
import { DiagnosticTrustBadges } from "@/components/diagnostic/ui/diagnostic-trust-badges";
import { aggregateBand } from "@/lib/diagnostic-scoring";
import { diagnosticPaths } from "@/lib/diagnostic-catalog";
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
import {
  readDiagnosticResults,
  type DiagnosticResultsSnapshot,
} from "@/lib/diagnostic-session";

function aggregatePartialBand(snapshot: DiagnosticResultsSnapshot): number {
  const partial = aggregateBand(
    snapshot.listening_band,
    snapshot.reading_band,
    snapshot.writingEvaluation?.writing_band ?? snapshot.writing_band,
    null,
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

  const lead = useMemo(() => readDiagnosticLead(), [snapshot]);
  const targetBand = lead?.targetBand ?? 7.0;

  const pendingHuman = snapshot?.review_status === "pending_human";
  const hasWritingEval = snapshot?.writingEvaluation != null;
  const effectiveWritingBand =
    snapshot?.writingEvaluation?.writing_band ?? snapshot?.writing_band ?? null;

  const skillBands: SkillBands = useMemo(
    () => ({
      listening: snapshot?.listening_band ?? null,
      reading: snapshot?.reading_band ?? null,
      writing: effectiveWritingBand,
      speaking: pendingHuman ? null : (snapshot?.speaking_band ?? null),
    }),
    [snapshot, effectiveWritingBand, pendingHuman],
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
      setLoading(false);
    } else {
      setError(
        "No diagnostic results yet. Complete the free diagnostic first.",
      );
      setLoading(false);
    }
  }, []);

  const currentBand =
    snapshot?.aggregate_band ??
    (snapshot?.writingEvaluation ? aggregatePartialBand(snapshot) : 0);

  const heroBand = pendingHuman
    ? snapshot?.writingEvaluation
      ? bandLabel(aggregatePartialBand(snapshot) || null)
      : "—"
    : bandLabel(snapshot?.aggregate_band);

  const leadEmail = lead?.email;

  return (
    <DiagnosticChrome variant="report">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        {loading ? (
          <ResultsSkeleton />
        ) : error ? (
          <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-border-soft bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
            <Link
              href={diagnosticPaths.landing}
              className="inline-flex min-h-[var(--spacing-touch)] cursor-pointer items-center justify-center rounded-full bg-cyan px-6 text-sm font-semibold text-white hover:bg-brand-sky-hover"
            >
              Start diagnostic
            </Link>
          </div>
        ) : snapshot ? (
          <div className="space-y-6 sm:space-y-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
              <div className="min-w-0">
                <h1 className="font-display text-[28px] leading-tight font-bold tracking-[-0.025em] text-[#0D1F3C] sm:text-[36px]">
                  {pendingHuman
                    ? "Your report is on the way."
                    : "Here's how you performed."}
                </h1>
                <p className="mt-2 text-[15px] leading-relaxed font-light text-[#5A6B82] sm:text-[16.5px]">
                  {pendingHuman
                    ? "Listening and Reading are scored. Writing and Speaking are with a certified examiner — full report within 24–48 hours."
                    : "Based on your responses, here's an honest picture of where you stand."}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-5 rounded-[18px] bg-[#0D1F3C] px-6 py-[18px] shadow-[0_12px_30px_rgba(13,31,60,0.25)] sm:px-7">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.08em] text-[#9DB0CB] uppercase">
                    Estimated overall band
                  </p>
                  <p className="mt-1 text-[12.5px] font-light text-[#9DB0CB]">
                    Across all four skills
                  </p>
                </div>
                <span className="h-[50px] w-px bg-white/15" aria-hidden />
                <p className="font-mono text-[50px] leading-[0.9] font-medium tracking-[-0.02em] text-cyan">
                  {heroBand}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-[18px] lg:grid-cols-4">
              {SKILL_ORDER.map((key) => {
                const pending =
                  pendingHuman &&
                  (key === "speaking" ||
                    (key === "writing" && !hasWritingEval));
                const band = skillBands[key];

                return (
                  <DiagnosticPerformanceSkillCard
                    key={key}
                    label={skillLabel(key)}
                    bandRange={pending ? "—" : bandRange(band)}
                    status={statuses[key]}
                    coaching={coachingCopy(statuses[key])}
                    barPercent={bandBarPercent(band)}
                    pending={pending}
                  />
                );
              })}
            </div>

            {pendingHuman ? (
              <div className="flex flex-col gap-4 rounded-[20px] bg-[#0D1F3C] p-6 shadow-[0_18px_44px_rgba(13,31,60,0.28)] sm:flex-row sm:items-start sm:gap-[22px] sm:p-7 sm:px-8">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[rgba(0,188,212,0.16)]">
                  <Clock className="size-[22px] text-cyan" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg font-bold tracking-tight text-white">
                    While your report is finalised
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed font-light text-[#C6D2E4]">
                    Your Listening and Reading are already scored. A certified
                    examiner is reviewing your Writing and Speaking now. In the
                    meantime, preview the personalised study plan we&apos;ve
                    started building for your{" "}
                    <span className="font-medium text-cyan">
                      Band {targetBand.toFixed(1)}
                    </span>{" "}
                    goal.
                  </p>
                </div>
              </div>
            ) : (
              <DiagnosticScoreAnalysisBlock
                narrative={analysis.narrative}
                reachBand={analysis.reachBand}
              />
            )}

            {pendingHuman && leadEmail ? (
              <p className="text-center text-[12.5px] font-light text-[#6E83A0]">
                Full report will be emailed to{" "}
                <span className="font-medium text-navy">{leadEmail}</span> within
                24–48 hours.
              </p>
            ) : null}

            <div className="rounded-[20px] border border-cyan/30 bg-gradient-to-br from-[#EEFBFD] to-[#F6FAFC] px-5 py-7 text-center sm:px-8 sm:py-8">
              <h3 className="font-display text-[22px] leading-tight font-bold tracking-[-0.02em] text-[#0D1F3C] sm:text-[26px]">
                Turn this into a Band {targetBand.toFixed(1)} plan
              </h3>
              <p className="mx-auto mt-2.5 max-w-xl text-[14px] leading-relaxed font-light text-[#5A6B82] sm:text-[15.5px]">
                Get a week-by-week study plan built around your weakest skills —
                with Band 9 model answers, AI essay feedback and examiner-scored
                mock tests.
              </p>
              <Link
                href={diagnosticPaths.planReveal}
                className="mt-5 inline-flex w-full max-w-md cursor-pointer items-center justify-center gap-2.5 rounded-full bg-cyan px-9 py-4 text-base font-semibold text-white shadow-[0_12px_28px_rgba(0,151,167,0.32)] transition-colors hover:bg-brand-sky-hover sm:w-auto"
              >
                Build My Personalised Study Plan
                <ArrowRight className="size-[18px]" aria-hidden />
              </Link>
              <p className="mt-3.5 flex items-center justify-center gap-1.5 text-[12.5px] font-light text-[#6E83A0]">
                <ShieldCheck className="size-3.5 text-teal" strokeWidth={2} />
                Free to preview · No card required
              </p>
            </div>

            <DiagnosticTrustBadges variant="results" />
          </div>
        ) : null}
      </div>
    </DiagnosticChrome>
  );
}
