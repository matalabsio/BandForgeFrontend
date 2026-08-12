"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { ChevronLeft, Share2, ShieldCheck } from "lucide-react";
import type { WritingFeedback, WritingReview } from "@/modules/writing/types";
import {
  writingTaskPath,
  writingTestHubPath,
} from "@/lib/writing-test";
import { testNumberForMockId, mockApiId } from "@/lib/mock-catalog";
import { mockResultsPathForTest } from "@/lib/module-review-paths";
import { WritingFeedbackPrompt } from "@/modules/writing/components/writing-feedback-prompt";
import { TutorChatPanel } from "@/modules/writing/components/tutor-chat-panel";
import {
  AnnotatedEssay,
  CriteriaGrid,
  FeedbackCtaFooter,
  ImprovementPanel,
  NextBandAdvice,
  ScoreHero,
  StrengthPanel,
  VocabularyHighlights,
} from "@/modules/writing/components/feedback";

export type WritingFeedbackMode = "mock" | "diagnostic";

type Props = {
  review: WritingReview;
  feedback: WritingFeedback;
  mode?: WritingFeedbackMode;
  mockAttemptId?: string | null;
  mockSlug?: string;
  showContinueTask2?: boolean;
  backHref?: string;
  dashboardHref?: string;
  /** Prefer over backHref for SPA shells (e.g. diagnostic results). */
  onBack?: () => void;
  coachOpen?: boolean;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  /** Override H1 (e.g. plan practice — avoid catalog mock exam title). */
  titleOverride?: string | null;
};

export function WritingFeedbackView({
  review,
  feedback,
  mode = "mock",
  mockAttemptId,
  mockSlug = "m01",
  showContinueTask2 = false,
  backHref,
  dashboardHref = "/dashboard",
  onBack,
  coachOpen = false,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  titleOverride = null,
}: Props) {
  const router = useRouter();
  const isDiagnostic = mode === "diagnostic";
  const showVerified = !isDiagnostic;
  const showExaminerNotes = !isDiagnostic;
  const showCoach = !isDiagnostic;
  const [tutorSelection, setTutorSelection] = useState<string | null>(null);

  const taskTitle =
    titleOverride?.trim() ||
    review.test_title?.trim() ||
    (isDiagnostic
      ? `Writing Task ${review.part} — Free Diagnostic`
      : `Writing Task ${review.part} — Mock Test`);

  const resolvedBack =
    backHref ??
    (mockAttemptId
      ? mockResultsPathForTest(
          testNumberForMockId(mockApiId(mockSlug)),
          mockAttemptId,
        )
      : writingTestHubPath());

  const nextHref = showContinueTask2
    ? writingTaskPath(2, {
        mockSlug,
        mockAttemptId: mockAttemptId ?? undefined,
        auto: true,
      })
    : resolvedBack;

  const nextLabel = showContinueTask2
    ? "Begin Next Writing Test"
    : mockAttemptId
      ? "Back to scores"
      : "Practice Writing Again";

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
      return;
    }
    router.push(resolvedBack);
  }, [onBack, resolvedBack, router]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    const title = `Writing Feedback — Task ${review.part}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
    } catch {
      /* user cancelled or clipboard denied */
    }
  }, [review.part]);

  return (
    <div className="min-h-dvh bg-surface-alt text-ink">
      <header className="sticky top-0 z-20 border-b border-border-soft bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-border-soft bg-surface-alt text-navy transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
            aria-label="Back to scores"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>

          <h1 className="font-display truncate text-center text-base font-bold tracking-tight text-navy sm:text-[1.0625rem]">
            Writing Feedback
          </h1>

          <button
            type="button"
            onClick={() => void handleShare()}
            className="inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 text-[14px] font-semibold text-[#334155] transition-colors hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
            aria-label="Share feedback"
          >
            <Share2 className="size-[18px]" aria-hidden />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] lg:items-start lg:gap-8">
          <div className="min-w-0 space-y-5">
            <ScoreHero
              part={review.part}
              taskTitle={taskTitle}
              feedback={feedback}
              showVerifiedBadge={showVerified}
            />

            <CriteriaGrid criteria={feedback.criteria} />

            <section className="grid gap-4 sm:grid-cols-2">
              <StrengthPanel items={feedback.strengths} />
              <ImprovementPanel items={feedback.improvements} />
            </section>

            {feedback.spelling_mistakes.length > 0 ? (
              <section className="rounded-2xl border border-[#FECACA] border-l-4 border-l-[#EF4444] bg-[#FEF2F2] p-5 shadow-sm sm:p-6">
                <h3 className="text-[14px] font-bold text-ink">
                  Spelling mistakes ({feedback.spelling_mistakes.length})
                </h3>
                <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-[#334155]">
                  {feedback.spelling_mistakes.map((item) => (
                    <li
                      key={`${item.original}-${item.correction}`}
                      className="flex flex-wrap gap-2"
                    >
                      <span className="font-medium text-[#DC2626] line-through">
                        {item.original}
                      </span>
                      <span className="text-[#94A3B8]" aria-hidden>
                        →
                      </span>
                      <span className="font-semibold text-[#0D1F3C]">
                        {item.correction}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {feedback.grammar_mistakes.length > 0 ? (
              <section className="rounded-2xl border border-[#FDE68A] border-l-4 border-l-[#F59E0B] bg-[#FFFBEB] p-5 shadow-sm sm:p-6">
                <h3 className="text-[14px] font-bold text-ink">
                  Grammar issues ({feedback.grammar_mistakes.length})
                </h3>
                <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-[#334155]">
                  {feedback.grammar_mistakes.map((item) => (
                    <li key={`${item.original}-${item.correction}`}>
                      {showCoach ? (
                        <button
                          type="button"
                          className="w-full text-left transition hover:opacity-80"
                          onClick={() => setTutorSelection(item.original)}
                        >
                          <span className="font-medium text-[#B45309]">
                            {item.original}
                          </span>
                          <span className="text-[#94A3B8]" aria-hidden>
                            {" "}
                            →{" "}
                          </span>
                          <span className="font-semibold text-[#0D1F3C]">
                            {item.correction}
                          </span>
                          {item.issue ? (
                            <span className="text-[#64748B]"> · {item.issue}</span>
                          ) : null}
                          <span className="mt-0.5 block text-[11px] font-semibold text-cyan">
                            Ask coach about this
                          </span>
                        </button>
                      ) : (
                        <div>
                          <span className="font-medium text-[#B45309]">
                            {item.original}
                          </span>
                          <span className="text-[#94A3B8]" aria-hidden>
                            {" "}
                            →{" "}
                          </span>
                          <span className="font-semibold text-[#0D1F3C]">
                            {item.correction}
                          </span>
                          {item.issue ? (
                            <span className="text-[#64748B]"> · {item.issue}</span>
                          ) : null}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <NextBandAdvice
              advice={feedback.next_band_advice}
              reviewerNotes={feedback.reviewer_notes}
              showExaminerNotes={showExaminerNotes}
            />

            <VocabularyHighlights
              strongWords={feedback.strong_words}
              weakWords={feedback.weak_words}
              onWeakWordClick={
                showCoach ? (word) => setTutorSelection(word) : undefined
              }
            />
          </div>

          <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-[4.5rem] lg:max-h-[calc(100dvh-5.5rem)]">
            {showVerified && feedback.human_verified ? (
              <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-teal" aria-hidden />
                  <p className="text-[12px] font-semibold text-teal">
                    Verified by trainer
                  </p>
                </div>
                <p className="mt-2 text-[13px] text-[#475569]">
                  Your overall band is human-verified. Criterion detail and
                  essay insights use AI evaluation where available.
                </p>
              </section>
            ) : null}

            <section className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
              <div className="border-b border-[#E2E8F0] px-4 py-3 sm:px-5">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#94A3B8]">
                  Task question
                </h2>
              </div>
              <div className="max-h-[min(42vh,420px)] overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
                <WritingFeedbackPrompt review={review} />
              </div>
            </section>

            <AnnotatedEssay
              text={review.user_answer}
              highlights={feedback.highlights}
            />

            {isDiagnostic ? (
              <FeedbackCtaFooter
                primaryHref={resolvedBack}
                primaryLabel="Back to scores"
                secondaryHref={dashboardHref}
                secondaryLabel="Back to Dashboard"
                onPrimaryClick={onBack}
              />
            ) : (
              <FeedbackCtaFooter
                primaryHref={nextHref}
                primaryLabel={primaryActionLabel ?? nextLabel}
                secondaryHref={dashboardHref}
                secondaryLabel={secondaryActionLabel ?? "Back to Dashboard"}
                onPrimaryClick={onPrimaryAction}
                onSecondaryClick={onSecondaryAction}
              />
            )}
          </aside>
        </div>
      </main>
      {showCoach ? (
        <TutorChatPanel
          attemptId={review.attempt_id}
          selection={tutorSelection}
          onClearSelection={() => setTutorSelection(null)}
          defaultOpen={coachOpen || Boolean(tutorSelection)}
        />
      ) : null}
    </div>
  );
}
