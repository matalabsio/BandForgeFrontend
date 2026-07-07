"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  canonicalMockSlug,
  mockTestIdForNumber,
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

type Props = {
  testNumber: number;
  module: SectionResultsModule;
  attemptId: string | null;
  part: number;
  mockAttemptId: string | null;
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
  module,
  attemptId,
  part,
  mockAttemptId,
}: Props) {
  const router = useRouter();
  const mockSlug = canonicalMockSlug(mockTestIdForNumber(testNumber));
  const [view, setView] = useState<View>("summary");
  const [highlightQuestion, setHighlightQuestion] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [lrReport, setLrReport] = useState<{
    raw_score: number;
    total_questions: number;
    questions: SectionReviewQuestion[];
    test_title?: string | null;
  } | null>(null);

  const [writingReview, setWritingReview] = useState<Awaited<
    ReturnType<typeof writingApi.review>
  > | null>(null);

  const [speakingMeta, setSpeakingMeta] = useState<{
    subtitle: string;
    durationSeconds: number | null;
    hintSeconds: number | null;
  } | null>(null);

  useEffect(() => {
    if (!attemptId || !mockAttemptId) {
      setLoading(false);
      return;
    }
    persistModuleResultAttempt(testNumber, module, attemptId);
    persistMockAttemptId(mockTestIdForNumber(testNumber), mockAttemptId);

    let cancelled = false;
    const load = async () => {
      setLoading(true);
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
          const topic =
            data.prompts[0]?.trim() || "Introduction and interview";
          const short =
            topic.length > 48 ? `${topic.slice(0, 45).trim()}…` : topic;
          setSpeakingMeta({
            subtitle: `Speaking Part ${data.part} · ${short}`,
            durationSeconds: data.duration_seconds,
            hintSeconds: data.duration_hint_seconds,
          });
        }
      } catch {
        if (!cancelled) {
          setError("We couldn't load this section result. Try again from your test hub.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [attemptId, mockAttemptId, module, testNumber]);

  const continueCtx: MockSectionContext | null = useMemo(() => {
    if (!mockAttemptId) return null;
    return { testNumber, mockAttemptId, module, part };
  }, [testNumber, mockAttemptId, module, part]);

  const continueAction = useMemo(() => {
    if (!continueCtx) return null;
    return getMockSectionContinue(continueCtx);
  }, [continueCtx]);

  const handleContinue = useCallback(() => {
    if (!mockAttemptId || !continueAction) return;
    persistMockAttemptId(mockTestIdForNumber(testNumber), mockAttemptId);
    if (continueAction.path.includes("/results")) {
      router.replace(continueAction.path);
      return;
    }
    navigateAfterSectionSubmit(router, mockSlug, mockAttemptId, continueAction.path, {
      replace: true,
    });
  }, [mockAttemptId, continueAction, mockSlug, router, testNumber]);

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
              primaryLabel="Review Answers"
              onPrimary={() => openReview()}
              secondaryLabel={continueAction.label}
              onSecondary={handleContinue}
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
    const promptShort = writingReview.prompt?.trim() ?? "";
    const short =
      promptShort.length > 40
        ? `${promptShort.slice(0, 37).trim()}…`
        : promptShort;
    const subtitle = `${writingModuleLabel(writingReview.part)}${short ? ` · ${short}` : ""}`;
    const stats = [
      { value: String(writingReview.word_count), label: "Words written" },
      {
        value: String(writingReview.part),
        label: "Task submitted",
      },
    ];

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
          infoMessage="Your Writing evaluation will be included in your final test results."
        />
      </SectionResultsShell>
    );
  }

  if (module === "speaking" && speakingMeta) {
    const stats = [
      {
        value: formatRecordedDuration(speakingMeta.durationSeconds),
        label: "Recorded",
      },
      {
        value:
          speakingMeta.hintSeconds != null
            ? `~${formatRecordedDuration(speakingMeta.hintSeconds)}`
            : "1–2 min",
        label: "Target length",
      },
    ];

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
          subtitle={speakingMeta.subtitle}
          stats={stats}
          infoMessage="Your Speaking evaluation will be included in your final test results."
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
