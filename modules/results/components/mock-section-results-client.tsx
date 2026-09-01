"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BrainCircuit, CheckCircle2, Clock3, Loader2, ShieldCheck } from "lucide-react";
import {
  canonicalMockSlug,
  mockTestNumberPath,
  writingModuleLabel,
} from "@/lib/mock-catalog";
import { persistMockAttemptId, persistModuleResultAttempt } from "@/lib/exam-session-storage";
import {
  getMockSectionContinue,
  type MockSectionContext,
} from "@/lib/mock-section-continue";
import { navigateAfterSectionSubmit } from "@/lib/mock-exam-nav";
import type { ModuleReviewQuestion } from "@/lib/module-review-types";
import { listeningApi } from "@/modules/listening/services/listening-api";
import type { QuestionReviewItem } from "@/modules/listening/types";
import { GREENFIELD_LISTENING_STAGES } from "@/modules/listening/listening-test-stages";
import { readingApi } from "@/modules/reading/services/reading-api";
import { writingApi } from "@/modules/writing/services/writing-api";
import { mockApi } from "@/modules/mock/services/mock-api";
import {
  formatRecordedDuration,
  questionStatus,
  SectionAnswerReview,
  SectionResultsCtaBar,
  SectionResultsShell,
  SectionResultsSummary,
  SectionSubmissionConfirmation,
  type SectionReviewQuestion,
} from "@/modules/shared/components/section-results";
import type { SectionResultsModule } from "@/lib/section-results-path";
import type { SpeakingModuleReviewPayload } from "@/lib/module-review-types";
import { WritingResultsView } from "@/modules/writing/components/writing-results-view";
import { WritingTaskTabs } from "@/modules/writing/components/writing-task-tabs";
import { SpeakingResultsClient } from "@/modules/results/components/speaking-results-client";
import { resolveSectionResultsBackHref } from "@/lib/section-results-back";

const AI_READY_STATUSES = new Set(["ai_complete", "ai_stub"]);
const RESULT_POLL_MS = 30_000;
const WRITING_RESULT_POLL_MS = 5_000;

type Props = {
  testNumber: number;
  /** Published catalog mock UUID for this test number (required for Test 3+). */
  mockTestId: string;
  module: SectionResultsModule;
  attemptId: string | null;
  part: number;
  mockAttemptId: string | null;
  listeningPartCount?: number;
  readingPassageCount?: number;
  writingTaskCount?: number;
  speakingMinutes?: number;
};

type View = "summary" | "review";

function mapQuestions(items: QuestionReviewItem[] | undefined): SectionReviewQuestion[] {
  if (!items?.length) return [];
  return items.map((q) => ({
    ...q,
    status: questionStatus(q as ModuleReviewQuestion),
  }));
}

function listeningSectionCopy(part: number, total: number, reportTitle?: string | null) {
  const stage = GREENFIELD_LISTENING_STAGES.find((s) => s.part === part);
  const title = stage?.title ?? `Listening Part ${part}`;
  const context = stage?.context ?? reportTitle?.trim() ?? "Listening";
  return {
    title,
    subtitle: `${total} questions · ${context}`,
  };
}

function readingSectionCopy(part: number, total: number, reportTitle?: string | null) {
  const title = `Reading Passage ${part}`;
  const label = reportTitle?.trim() || "Reading";
  return {
    title,
    subtitle: `${total} questions · ${label}`,
  };
}

export function MockSectionResultsClient({
  testNumber,
  mockTestId,
  module,
  attemptId,
  part,
  mockAttemptId,
  listeningPartCount,
  readingPassageCount,
  writingTaskCount,
  speakingMinutes,
}: Props) {
  const router = useRouter();
  const mockSlug = canonicalMockSlug(mockTestId);
  const [view, setView] = useState<View>("summary");
  const [highlightQuestion, setHighlightQuestion] = useState<number | null>(null);
  const [loading, setLoading] = useState(Boolean(attemptId && mockAttemptId));
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const hasLoadedRef = useRef(false);

  const [lrReport, setLrReport] = useState<{
    raw_score: number;
    total_questions: number;
    questions: SectionReviewQuestion[];
    test_title?: string | null;
  } | null>(null);

  const [writingReview, setWritingReview] = useState<Awaited<
    ReturnType<typeof writingApi.review>
  > | null>(null);

  const [speakingReview, setSpeakingReview] =
    useState<SpeakingModuleReviewPayload | null>(null);

  useEffect(() => {
    if (!attemptId || !mockAttemptId) {
      return;
    }
    persistModuleResultAttempt(testNumber, module, attemptId);
    persistMockAttemptId(mockTestId, mockAttemptId);

    let cancelled = false;
    const load = async () => {
      if (!hasLoadedRef.current) setLoading(true);
      setError(null);
      try {
        if (module === "listening") {
          const report = await listeningApi.scoreReport(attemptId);
          if (cancelled) return;
          setLrReport({
            raw_score: report.raw_score,
            total_questions: report.total_questions,
            questions: mapQuestions(report.questions),
            test_title: report.test_title,
          });
        } else if (module === "reading") {
          const report = await readingApi.scoreReport(attemptId);
          if (cancelled) return;
          setLrReport({
            raw_score: report.raw_score,
            total_questions: report.total_questions,
            questions: mapQuestions(report.questions),
            test_title: report.test_title,
          });
        } else if (module === "writing") {
          const review = await writingApi.review(attemptId);
          if (cancelled) return;
          setWritingReview(review);
        } else {
          const data = await mockApi.speakingModuleReview(mockAttemptId);
          if (cancelled) return;
          setSpeakingReview(data);
        }
      } catch {
        if (!cancelled) {
          setError("We couldn't load this section result. Try again from your test hub.");
        }
      } finally {
        if (!cancelled) {
          hasLoadedRef.current = true;
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [attemptId, mockAttemptId, mockTestId, module, refreshToken, testNumber]);

  const aiProcessing =
    (module === "writing" &&
      writingReview != null &&
      !AI_READY_STATUSES.has(writingReview.ai_status ?? "") &&
      writingReview.band_source !== "human" &&
      writingReview.band_source !== "module_score" &&
      writingReview.ai_status !== "ai_failed") ||
    (module === "speaking" && speakingReview?.score_source === "processing");

  useEffect(() => {
    if (!aiProcessing) return;
    const pollMs = module === "writing" ? WRITING_RESULT_POLL_MS : RESULT_POLL_MS;
    let timer: number | null = null;
    const schedule = () => {
      if (document.visibilityState === "hidden") return;
      timer = window.setTimeout(() => setRefreshToken((value) => value + 1), pollMs);
    };
    const onVisibility = () => {
      if (timer != null) window.clearTimeout(timer);
      if (document.visibilityState === "visible") {
        setRefreshToken((value) => value + 1);
      }
    };
    schedule();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      if (timer != null) window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [aiProcessing, module]);

  const continueCtx: MockSectionContext | null = useMemo(() => {
    if (!mockAttemptId) return null;
    return {
      testNumber,
      mockAttemptId,
      module,
      part,
      mockTestId,
      listeningPartCount,
      readingPassageCount,
      writingTaskCount,
      speakingMinutes,
    };
  }, [
    testNumber,
    mockAttemptId,
    module,
    part,
    mockTestId,
    listeningPartCount,
    readingPassageCount,
    writingTaskCount,
    speakingMinutes,
  ]);

  const continueAction = useMemo(() => {
    if (!continueCtx) return null;
    return getMockSectionContinue(continueCtx);
  }, [continueCtx]);

  const handleContinue = useCallback(() => {
    if (!mockAttemptId || !continueAction) return;
    persistMockAttemptId(mockTestId, mockAttemptId);
    if (continueAction.path.includes("/results")) {
      router.replace(continueAction.path);
      return;
    }
    navigateAfterSectionSubmit(router, mockSlug, mockAttemptId, continueAction.path, {
      replace: true,
    });
  }, [mockAttemptId, continueAction, mockSlug, mockTestId, router]);

  const openReview = useCallback((questionNumber?: number) => {
    if (questionNumber != null) setHighlightQuestion(questionNumber);
    setView("review");
  }, []);

  if (!attemptId || !mockAttemptId) {
    return (
      <SectionResultsShell centered>
        <p className="text-center text-sm text-muted">
          Missing attempt context. Open this page right after submitting a section.
        </p>
        <Link
          href={mockTestNumberPath(testNumber)}
          className="mt-4 text-sm font-semibold text-cyan"
        >
          Back to Test {testNumber}
        </Link>
      </SectionResultsShell>
    );
  }

  if (loading) {
    return (
      <SectionResultsShell centered>
        <p className="font-display text-base font-bold text-navy">Loading section results…</p>
      </SectionResultsShell>
    );
  }

  if (error) {
    return (
      <SectionResultsShell centered>
        <p className="max-w-sm text-center text-sm text-muted">{error}</p>
        <Link
          href={mockTestNumberPath(testNumber)}
          className="mt-4 text-sm font-semibold text-cyan"
        >
          Back to Test {testNumber}
        </Link>
      </SectionResultsShell>
    );
  }

  const isObjective = module === "listening" || module === "reading";

  if (isObjective && lrReport) {
    const copy =
      module === "listening"
        ? listeningSectionCopy(part, lrReport.total_questions, lrReport.test_title)
        : readingSectionCopy(part, lrReport.total_questions, lrReport.test_title);

    const reviewHeader =
      module === "listening"
        ? `${copy.title} · Review`
        : `${copy.title} · Review`;

    if (view === "review") {
      return (
        <SectionResultsShell
          headerTitle={reviewHeader}
          onBack={() => {
            setView("summary");
            setHighlightQuestion(null);
          }}
          card={false}
          footer={
            continueAction ? (
              <SectionResultsCtaBar
                primaryLabel={continueAction.label}
                onPrimary={handleContinue}
              />
            ) : null
          }
        >
          <SectionAnswerReview
            questions={lrReport.questions}
            highlightQuestion={highlightQuestion}
            onHighlightConsumed={() => setHighlightQuestion(null)}
          />
        </SectionResultsShell>
      );
    }

    return (
      <SectionResultsShell
        backHref={mockTestNumberPath(testNumber)}
        showBrandBar
        logoHref={mockTestNumberPath(testNumber)}
        footer={
          continueAction ? (
            <SectionResultsCtaBar
              layout="split"
              primaryLabel={continueAction.label}
              onPrimary={handleContinue}
              secondaryLabel="Review Answers"
              onSecondary={() => openReview()}
            />
          ) : null
        }
      >
        <SectionResultsSummary
          title={copy.title}
          subtitle={copy.subtitle}
          rawScore={lrReport.raw_score}
          total={lrReport.total_questions}
          questions={lrReport.questions}
          allCorrectMessage="Nice work — every question correct."
          onQuestionClick={(n) => openReview(n)}
        />
      </SectionResultsShell>
    );
  }

  if (module === "writing" && writingReview) {
    const writingBack = resolveSectionResultsBackHref({
      testNumber,
      mockAttemptId,
    });
    const sessionTasks = writingReview.session_tasks ?? [];
    const writingResultReady =
      writingReview.band != null &&
      (AI_READY_STATUSES.has(writingReview.ai_status ?? "") ||
        writingReview.band_source === "human" ||
        writingReview.band_source === "module_score");
    const showCombinedShell = sessionTasks.length > 1;

    if (writingResultReady) {
      return (
        <div className="h-full min-h-0 overflow-y-auto overscroll-y-contain">
          {showCombinedShell ? (
            <div className="border-b border-ink/8 bg-white px-4 py-4 md:px-8">
              <WritingTaskTabs
                testNumber={testNumber}
                currentAttemptId={writingReview.attempt_id}
                tasks={sessionTasks}
                mockAttemptId={mockAttemptId}
              />
            </div>
          ) : null}
          <WritingResultsView
            review={writingReview}
            mockAttemptId={mockAttemptId}
            mockSlug={mockSlug}
            backHref={writingBack.href}
            primaryActionLabel={continueAction?.label}
            onPrimaryAction={continueAction ? handleContinue : undefined}
          />
        </div>
      );
    }

    const writingFailed = writingReview.ai_status === "ai_failed";
    const analyzingLabel = showCombinedShell
      ? "Evaluating Task 1 and Task 2…"
      : `Analyzing ${writingModuleLabel(writingReview.part)}…`;

    // Keep a full-page loader until AI (or human) band is ready — no
    // "section submitted" confirmation with empty stats.
    if (!writingFailed) {
      return (
        <SectionResultsShell centered card={false}>
          <div
            className="flex w-full max-w-md flex-col items-center px-4 text-center"
            aria-busy
            aria-live="polite"
          >
            <div className="flex size-20 items-center justify-center rounded-full border border-teal/20 bg-cyan-soft">
              <Loader2 className="size-9 animate-spin text-teal" aria-hidden />
            </div>
            <p className="mt-6 text-meta font-semibold uppercase tracking-[0.14em] text-teal">
              Writing submitted
            </p>
            <h2 className="mt-2 font-display text-[22px] font-bold tracking-tight text-navy sm:text-[28px]">
              {analyzingLabel}
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
              Your essay is saved. We&apos;re generating your full AI band and
              feedback — this usually takes under a minute. This page will open
              your results automatically.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm text-ink/70">
              <Loader2 className="size-4 animate-spin text-teal" aria-hidden />
              <span>Waiting for complete AI result…</span>
            </div>
          </div>
        </SectionResultsShell>
      );
    }

    return (
      <SectionResultsShell
        centered
        showBrandBar
        logoHref={mockTestNumberPath(testNumber)}
        footer={
          continueAction ? (
            <SectionResultsCtaBar
              primaryLabel={continueAction.label}
              onPrimary={handleContinue}
            />
          ) : null
        }
      >
        <SectionSubmissionConfirmation
          subtitle={writingModuleLabel(writingReview.part)}
          stats={[
            { value: String(writingReview.word_count), label: "Words written" },
            { value: String(writingReview.part), label: "Task submitted" },
          ]}
          infoMessage="AI feedback could not finish, but your essay is safe and remains queued for examiner review."
        />
      </SectionResultsShell>
    );
  }

  if (module === "speaking" && speakingReview) {
    const topic = speakingReview.prompts[0]?.trim() || "Introduction and interview";
    const shortTopic =
      topic.length > 72 ? `${topic.slice(0, 69).trim()}…` : topic;
    const subtitle = `Speaking · ${shortTopic}`;
    const stats = [
      {
        value: formatRecordedDuration(speakingReview.duration_seconds),
        label: "Recorded",
      },
      {
        value:
          speakingReview.duration_hint_seconds != null
            ? `~${formatRecordedDuration(speakingReview.duration_hint_seconds)}`
            : "1–2 min",
        label: "Target length",
      },
    ];
    const released =
      speakingReview.score_source === "human" &&
      speakingReview.overall_band != null;
    const aiReady =
      (speakingReview.score_source === "ai_estimate" &&
        speakingReview.ai_band != null) ||
      speakingReview.score_source === "insufficient_speech" ||
      speakingReview.ai_status === "insufficient_speech";

    if (released || aiReady) {
      return (
        <div className="h-full min-h-0 overflow-y-auto overscroll-y-contain">
          <SpeakingResultsClient
            testNumber={testNumber}
            mockTestId={mockTestId}
            attemptFromQuery={speakingReview.attempt_id}
            mockAttemptId={mockAttemptId}
            primaryActionLabel={continueAction?.label}
            onPrimaryAction={continueAction ? handleContinue : undefined}
            secondaryActionLabel={
              released && speakingReview.report_available
                ? "View examiner report"
                : undefined
            }
            onSecondaryAction={
              released && speakingReview.report_available
                ? () =>
                    router.push(
                      `/test/${testNumber}/speaking/results?attempt=${encodeURIComponent(speakingReview.attempt_id)}`,
                    )
                : undefined
            }
          />
        </div>
      );
    }

    const infoMessage =
      speakingReview.release_state === "withdrawn"
        ? "Your Speaking report is temporarily unavailable while it is reviewed."
        : speakingReview.score_source === "failed"
          ? "AI analysis could not finish, but your recording is safe and remains queued for examiner review."
          : speakingReview.release_state === "released" &&
              speakingReview.report_available === true
          ? "Your examiner-approved Speaking report is now available."
          : "AI is analyzing all recorded responses. This page updates automatically when your provisional result is ready.";

    return (
      <SectionResultsShell
        centered
        showBrandBar
        logoHref={mockTestNumberPath(testNumber)}
        footer={
          continueAction ? (
            <SectionResultsCtaBar
              primaryLabel={continueAction.label}
              onPrimary={handleContinue}
            />
          ) : null
        }
      >
        <SectionSubmissionConfirmation
          subtitle={subtitle}
          stats={stats}
          infoMessage={infoMessage}
        />
      </SectionResultsShell>
    );
  }

  return (
    <SectionResultsShell centered>
      <p className="text-sm text-muted">No section data available.</p>
    </SectionResultsShell>
  );
}
