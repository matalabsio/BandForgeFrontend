"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Clock, ShieldCheck } from "lucide-react";
import { DiagnosticChrome } from "@/components/diagnostic/diagnostic-chrome";
import { DiagnosticPerformanceSkillCard } from "@/components/diagnostic/ui/diagnostic-performance-skill-card";
import { DiagnosticScoreAnalysisBlock } from "@/components/diagnostic/ui/diagnostic-score-analysis-block";
import { DiagnosticTrustBadges } from "@/components/diagnostic/ui/diagnostic-trust-badges";
import { aggregateBand } from "@/lib/diagnostic-scoring";
import { calculateWritingBand, wordCount } from "@/lib/diagnostic-scoring";
import { isAnswerCorrect } from "@/lib/diagnostic-scoring";
import { diagnosticPaths } from "@/lib/diagnostic-catalog";
import {
  loadDiagnosticPack,
  type DiagnosticPackQuestion,
  type DiagnosticWritingTask,
} from "@/lib/diagnostic-pack";
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
  readDiagnosticProgress,
} from "@/lib/diagnostic-storage";
import {
  readDiagnosticResults,
  type DiagnosticResultsSnapshot,
} from "@/lib/diagnostic-session";
import { diagnosticToWritingReview } from "@/modules/writing/lib/diagnostic-to-writing-review";
import { WritingResultsView } from "@/modules/writing/components/writing-results-view";
import type { DiagnosticWritingEvaluation } from "@/lib/diagnostic-evaluate-writing";


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

function skillReviewTitle(skill: SkillKey): string {
  return `${skillLabel(skill)} review`;
}

type QuestionReviewRow = {
  id: string;
  number: number;
  prompt: string;
  userAnswer: string;
  correctAnswer: string;
  explanation?: string;
  status: "correct" | "incorrect" | "skipped";
};

export function DiagnosticResultsExperience() {
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<DiagnosticResultsSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progressWritingFallbackBand, setProgressWritingFallbackBand] = useState<number | null>(null);
  const [activeReviewSkill, setActiveReviewSkill] = useState<SkillKey | null>(null);
  const [listeningQuestions, setListeningQuestions] = useState<DiagnosticPackQuestion[]>([]);
  const [readingQuestions, setReadingQuestions] = useState<DiagnosticPackQuestion[]>([]);
  const [writingTasks, setWritingTasks] = useState<DiagnosticWritingTask[]>([]);
  const [answersByModule, setAnswersByModule] = useState<{
    listening: Record<string, string>;
    reading: Record<string, string>;
    writing: Record<string, string>;
  }>({ listening: {}, reading: {}, writing: {} });

  const lead = useMemo(() => readDiagnosticLead(), [snapshot]);
  const targetBand = lead?.targetBand ?? 7.0;

  const pendingHuman = snapshot?.review_status === "pending_human";
  const hasWritingEval = snapshot?.writingEvaluation != null;
  const writingBandFromSnapshot =
    snapshot?.writingEvaluation?.writing_band ?? snapshot?.writing_band ?? null;
  const effectiveWritingBand =
    writingBandFromSnapshot ?? progressWritingFallbackBand;
  const effectiveSpeakingBand = snapshot?.speaking_band ?? null;
  const writingPending = pendingHuman && effectiveWritingBand == null;
  const speakingPending = pendingHuman;
  const speakingBandForDisplay = speakingPending ? null : effectiveSpeakingBand;

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
    const progress = readDiagnosticProgress();
    if (progress?.answers) {
      setAnswersByModule({
        listening: progress.answers.listening ?? {},
        reading: progress.answers.reading ?? {},
        writing: progress.answers.writing ?? {},
      });
    }
    void loadDiagnosticPack()
      .then((pack) => {
        setListeningQuestions(pack.listening.questions ?? []);
        setReadingQuestions(pack.reading.questions ?? []);
        setWritingTasks(pack.writing.tasks ?? []);
      })
      .catch(() => {
        setListeningQuestions([]);
        setReadingQuestions([]);
        setWritingTasks([]);
      });
  }, []);

  const diagnosticWritingReview = useMemo(() => {
    const evaluation = snapshot?.writingEvaluation as
      | DiagnosticWritingEvaluation
      | undefined;
    if (!evaluation) return null;

    const essays = answersByModule.writing;
    let essay = "";
    let taskId = "";
    for (const [id, text] of Object.entries(essays)) {
      if ((text?.trim().length ?? 0) > essay.trim().length) {
        essay = text;
        taskId = id;
      }
    }
    if (!essay.trim()) return null;

    const task =
      writingTasks.find((t) => t.id === taskId) ?? writingTasks[0] ?? null;
    return diagnosticToWritingReview({
      evaluation,
      essay,
      question: task?.prompt?.trim() || "Diagnostic writing task",
      taskPart: task?.part ?? 1,
      testTitle: task?.title ?? "Free Diagnostic",
      attemptId: evaluation.evaluation_id,
    });
  }, [snapshot?.writingEvaluation, answersByModule.writing, writingTasks]);

  const currentBand =
    snapshot?.aggregate_band ??
    (snapshot?.writingEvaluation ? aggregatePartialBand(snapshot) : 0);

  const heroBand = pendingHuman
    ? snapshot?.writingEvaluation
      ? bandLabel(aggregatePartialBand(snapshot) || null)
      : "—"
    : bandLabel(snapshot?.aggregate_band);

  const leadPhone = lead?.phone;
  const activeReviewItems: QuestionReviewRow[] = useMemo(() => {
    const sectionQuestions =
      activeReviewSkill === "listening"
        ? listeningQuestions
        : activeReviewSkill === "reading"
          ? readingQuestions
          : [];
    const answers =
      activeReviewSkill === "listening"
        ? answersByModule.listening
        : activeReviewSkill === "reading"
          ? answersByModule.reading
          : {};
    return sectionQuestions.map((q) => {
      const userAnswer = answers[q.id] ?? "";
      const isCorrect = isAnswerCorrect(userAnswer, q.answer);
      const status: QuestionReviewRow["status"] = userAnswer.trim()
        ? (isCorrect ? "correct" : "incorrect")
        : "skipped";
      return {
        id: q.id,
        number: q.number,
        prompt: q.prompt,
        userAnswer: userAnswer.trim() || "—",
        correctAnswer: q.answer || "—",
        explanation: q.skill ? `Skill focus: ${q.skill}` : undefined,
        status,
      };
    });
  }, [activeReviewSkill, listeningQuestions, readingQuestions, answersByModule]);

  if (activeReviewSkill === "writing" && diagnosticWritingReview) {
    return (
      <WritingResultsView
        mode="diagnostic"
        review={diagnosticWritingReview}
        onBack={() => setActiveReviewSkill(null)}
        backHref={diagnosticPaths.results}
        dashboardHref="/dashboard"
        targetBand={targetBand}
      />
    );
  }

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
                    ? writingPending
                      ? "Listening and Reading are scored. Writing and Speaking are with a certified examiner — full report within 24–48 hours."
                      : speakingPending
                        ? "Listening, Reading, and Writing are scored. Speaking is with a certified examiner — full report within 24–48 hours."
                        : "All skills have AI-estimated scores now. Certified examiner review is in progress for final confirmation."
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
                  ((key === "writing" &&
                    effectiveWritingBand == null &&
                    !hasWritingEval) ||
                    key === "speaking");
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
                    onClick={() => setActiveReviewSkill(key)}
                  />
                );
              })}
            </div>

            {activeReviewSkill ? (
              <section className="rounded-[20px] border border-border-soft bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold text-navy">
                    {skillReviewTitle(activeReviewSkill)}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveReviewSkill(null)}
                    className="cursor-pointer rounded-full border border-border-soft px-3 py-1.5 text-xs font-medium text-[#5A6B82] hover:bg-[#F4F7FB]"
                  >
                    Close
                  </button>
                </div>

                {activeReviewSkill === "writing" ? (
                  <p className="text-sm leading-relaxed text-[#5A6B82]">
                    {hasWritingEval
                      ? "We could not load your essay for detailed feedback. Re-open this page after completing Writing, or check that your diagnostic progress is still saved."
                      : "Writing AI feedback is not available yet for this attempt. If your essay was under the minimum length, it was not evaluated."}
                  </p>
                ) : activeReviewSkill === "speaking" ? (
                  <p className="text-sm leading-relaxed text-[#5A6B82]">
                    Speaking answer transcript and examiner notes are not available yet while review is pending.
                  </p>
                ) : activeReviewItems.length === 0 ? (
                  <p className="text-sm leading-relaxed text-[#5A6B82]">
                    We could not load question data for this section yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {activeReviewItems.map((item) => (
                      <article
                        key={item.id}
                        className="rounded-xl border border-border-soft bg-[#FAFCFF] p-3.5 sm:p-4"
                      >
                        <p className="text-xs font-semibold tracking-wide text-teal uppercase">
                          Question {item.number} · {item.status}
                        </p>
                        <p className="mt-1.5 text-sm font-medium text-navy">
                          {item.prompt}
                        </p>
                        <p className="mt-2 text-sm text-[#5A6B82]">
                          <span className="font-semibold text-navy">Your answer:</span>{" "}
                          {item.userAnswer || "—"}
                        </p>
                        <p className="mt-1 text-sm text-[#5A6B82]">
                          <span className="font-semibold text-navy">Correct answer:</span>{" "}
                          {item.correctAnswer || "—"}
                        </p>
                        {item.explanation ? (
                          <p className="mt-1 text-sm text-[#5A6B82]">
                            <span className="font-semibold text-navy">Explanation:</span>{" "}
                            {item.explanation}
                          </p>
                        ) : null}
                      </article>
                    ))}
                  </div>
                )}
              </section>
            ) : null}

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
                    Your Listening and Reading are already scored.{" "}
                    {writingPending
                      ? "A certified examiner is reviewing your Writing and Speaking now."
                      : speakingPending
                        ? "Your Writing AI estimate is ready, and a certified examiner is reviewing your Speaking now."
                        : "Your Writing and Speaking AI estimates are ready, and certified examiner confirmation is in progress."}{" "}
                    In the meantime, preview the personalised study plan we&apos;ve
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

            {pendingHuman && leadPhone ? (
              <p className="text-center text-[12.5px] font-light text-[#6E83A0]">
                Full report will be sent on WhatsApp to{" "}
                <span className="font-medium text-navy">+91 {leadPhone}</span> within
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
