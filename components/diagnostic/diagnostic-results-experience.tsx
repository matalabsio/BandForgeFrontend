"use client";

import { useEffect, useMemo, useState } from "react";
import { DiagnosticSplitShell } from "@/components/diagnostic/diagnostic-split-shell";
import { DIAGNOSTIC_EXAM_STEPS } from "@/components/diagnostic/diagnostic-exam-steps";
import { DiagnosticPlanCheckoutSection } from "@/components/diagnostic/diagnostic-plan-checkout-section";
import { DiagnosticPerformanceSkillCard } from "@/components/diagnostic/ui/diagnostic-performance-skill-card";
import { DiagnosticScoreAnalysisBlock } from "@/components/diagnostic/ui/diagnostic-score-analysis-block";
import { DiagnosticSkillCardReveal } from "@/components/diagnostic/ui/diagnostic-skill-card-reveal";
import { BfEmptyState } from "@/components/bandforge/ui/bf-empty-state";
import { aggregateBand } from "@/lib/diagnostic-scoring";
import { readDiagnosticLead } from "@/lib/diagnostic-lead";
import {
  bandBarPercent,
  bandRange,
  holdingBackNarrative,
  resultsScoreCoaching,
  resultsScoreTone,
  skillLabel,
  type ResultsScoreTone,
  type SkillBands,
  type SkillKey,
} from "@/lib/diagnostic-performance";
import {
  readDiagnosticResults,
  type DiagnosticResultsSnapshot,
} from "@/lib/diagnostic-session";
import { shouldResumeDiagnosticCheckout } from "@/lib/checkout-resume";
import { ProcessingOverlay } from "@/components/pricing/processing-overlay";

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
    <div className="animate-pulse space-y-8">
      <div className="space-y-3">
        <div className="h-3 w-32 rounded bg-navy/8" />
        <div className="h-10 w-2/3 rounded-xl bg-navy/8" />
        <div className="h-16 w-full rounded-xl bg-navy/8" />
      </div>
      <div className="h-28 rounded-2xl bg-navy/8" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="h-40 rounded-2xl bg-navy/8" />
        <div className="h-40 rounded-2xl bg-navy/8" />
        <div className="h-40 rounded-2xl bg-navy/8" />
        <div className="h-40 rounded-2xl bg-navy/8" />
      </div>
      <div className="h-48 rounded-2xl bg-navy/8" />
    </div>
  );
}

const SKILL_ORDER: SkillKey[] = [
  "listening",
  "reading",
  "writing",
  "speaking",
];

/** Lowest scores first; pending last. */
function sortSkillsByScore(
  keys: SkillKey[],
  bands: SkillBands,
  tones: Record<SkillKey, ResultsScoreTone>,
): SkillKey[] {
  const rank: Record<ResultsScoreTone, number> = {
    needs_work: 0,
    room_to_grow: 1,
    strong: 2,
    pending: 3,
  };
  return [...keys].sort((a, b) => {
    const rd = rank[tones[a]] - rank[tones[b]];
    if (rd !== 0) return rd;
    return (bands[a] ?? 99) - (bands[b] ?? 99);
  });
}

export function DiagnosticResultsExperience() {
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<DiagnosticResultsSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Must start false so SSR HTML matches the first client render; read URL/storage after mount.
  const [checkoutResumeGate, setCheckoutResumeGate] = useState(false);

  const lead = useMemo(() => readDiagnosticLead(), [snapshot]);
  const targetBand = lead?.targetBand ?? 7.0;

  const pendingHuman = snapshot?.review_status === "pending_human";
  const hasWritingEval = snapshot?.writingEvaluation != null;
  const effectiveWritingBand =
    snapshot?.writingEvaluation?.writing_band ?? snapshot?.writing_band ?? null;
  const effectiveSpeakingBand = snapshot?.speaking_band ?? null;

  const skillBands: SkillBands = useMemo(
    () => ({
      listening: snapshot?.listening_band ?? null,
      reading: snapshot?.reading_band ?? null,
      writing: effectiveWritingBand,
      speaking: effectiveSpeakingBand,
    }),
    [snapshot, effectiveWritingBand, effectiveSpeakingBand],
  );

  const scoreTones = useMemo(() => {
    const pendingFor = (key: SkillKey) =>
      pendingHuman &&
      ((key === "writing" &&
        effectiveWritingBand == null &&
        !hasWritingEval) ||
        (key === "speaking" && effectiveSpeakingBand == null));

    return {
      listening: resultsScoreTone(skillBands.listening, pendingFor("listening")),
      reading: resultsScoreTone(skillBands.reading, pendingFor("reading")),
      writing: resultsScoreTone(skillBands.writing, pendingFor("writing")),
      speaking: resultsScoreTone(skillBands.speaking, pendingFor("speaking")),
    } satisfies Record<SkillKey, ResultsScoreTone>;
  }, [
    skillBands,
    pendingHuman,
    effectiveWritingBand,
    hasWritingEval,
    effectiveSpeakingBand,
  ]);

  const analysis = useMemo(
    () => holdingBackNarrative(skillBands, targetBand),
    [skillBands, targetBand],
  );

  useEffect(() => {
    if (shouldResumeDiagnosticCheckout()) {
      setCheckoutResumeGate(true);
    }
  }, []);

  useEffect(() => {
    const cached = readDiagnosticResults();
    if (cached) {
      setSnapshot(cached);
      setLoading(false);
    } else {
      setError("missing_results");
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (loading || error || !snapshot || checkoutResumeGate) return;
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
  }, [loading, error, snapshot, checkoutResumeGate]);

  const heroBand = snapshot
    ? pendingHuman
      ? bandLabel(aggregatePartialBand(snapshot) || null)
      : bandLabel(snapshot.aggregate_band)
    : "—";

  const skillsSection = snapshot ? (
    <section className="space-y-4 sm:space-y-5">
      <div>
        <h2 className="font-display text-[20px] leading-tight font-bold tracking-[-0.02em] text-[#0B1B33] sm:text-[22px]">
          Skill-by-skill results
        </h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-[#4B5568] sm:text-[14px]">
          Click each blurred card to reveal your band and coaching note.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {sortSkillsByScore(SKILL_ORDER, skillBands, scoreTones).map((key, index) => {
          const pending =
            pendingHuman &&
            ((key === "writing" &&
              effectiveWritingBand == null &&
              !hasWritingEval) ||
              (key === "speaking" && effectiveSpeakingBand == null));
          const band = skillBands[key];
          const tone = scoreTones[key];

          return (
            <DiagnosticSkillCardReveal
              key={key}
              label={skillLabel(key)}
              index={index}
              className="min-h-[120px] sm:min-h-[140px]"
            >
              <DiagnosticPerformanceSkillCard
                variant="results"
                label={skillLabel(key)}
                bandRange={bandRange(band)}
                status="on_track"
                scoreTone={tone}
                coaching={resultsScoreCoaching(tone)}
                barPercent={bandBarPercent(band)}
                pending={pending || tone === "pending"}
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

  // Post-login checkout: BandForge loader only — never paint results under Razorpay.
  if (checkoutResumeGate && snapshot) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#F7F8FA]">
        <DiagnosticPlanCheckoutSection
          snapshot={snapshot}
          resumeGate
          onResumeSettled={() => setCheckoutResumeGate(false)}
        />
      </div>
    );
  }

  if (checkoutResumeGate && loading) {
    return <ProcessingOverlay variant="creating" />;
  }

  return (
    <DiagnosticSplitShell
      steps={DIAGNOSTIC_EXAM_STEPS}
      currentStep={error ? 0 : 4}
      heading={
        error
          ? "Take your free diagnostic"
          : pendingHuman
            ? "Your report is on the way."
            : "Your results are in."
      }
      subtitle={
        error
          ? "Get a baseline across Listening, Reading, Writing, and Speaking before unlocking your plan."
          : "Your personalised skill breakdown and study plan, built from your diagnostic."
      }
      footerNote={error ? "About 45 minutes" : "Diagnostic complete"}
    >
      <div className="min-h-0 flex-1 overflow-y-auto bg-[#F7F8FA]">
        <div className="mx-auto w-full max-w-[920px] px-4 py-6 sm:px-8 sm:py-10">
          {loading ? (
            <ResultsSkeleton />
          ) : error ? (
            <BfEmptyState
              variant="no-tests"
              className="mx-auto max-w-lg border-0 bg-transparent px-2 py-4 shadow-none sm:py-8"
              secondaryLabel="Back to dashboard"
              secondaryHref="/dashboard"
            />
          ) : snapshot ? (
            <div className="space-y-8 sm:space-y-10">
              <header className="min-w-0">
                <p className="mb-2 text-[11px] font-bold tracking-[0.08em] text-[#0F6E56] uppercase sm:text-xs">
                  Diagnostic complete
                </p>
                <h1 className="font-display text-[28px] leading-tight font-bold tracking-[-0.02em] text-[#0B1B33] sm:text-[42px]">
                  {pendingHuman
                    ? "Your report is on the way."
                    : "Your results are in."}
                </h1>
                <p className="mt-3 max-w-[640px] text-[15px] leading-relaxed text-[#4B5568] sm:text-[18px]">
                  {pendingHuman ? (
                    <>
                      We&apos;re finishing examiner review on remaining skills.
                      Your target is{" "}
                      <strong className="font-bold text-[#0B1B33]">
                        Band {targetBand.toFixed(1)}
                      </strong>
                      .
                    </>
                  ) : (
                    <>
                      You&apos;re currently at{" "}
                      <strong className="font-bold text-[#0B1B33]">
                        Band {heroBand}
                      </strong>
                      . Your target is{" "}
                      <strong className="font-bold text-[#0B1B33]">
                        Band {targetBand.toFixed(1)}
                      </strong>{" "}
                      — here&apos;s exactly what&apos;s holding you back, skill by
                      skill, and the plan to close it.
                    </>
                  )}
                </p>
              </header>

              <DiagnosticPlanCheckoutSection
                snapshot={snapshot}
                skillsSection={skillsSection}
              />
            </div>
          ) : null}
        </div>
      </div>
    </DiagnosticSplitShell>
  );
}
