"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ModuleReviewQuestion } from "@/lib/module-review-types";
import {
  questionStatus,
  SectionAnswerReview,
  SectionResultsCtaBar,
  SectionResultsShell,
  SectionResultsSummary,
  type SectionReviewQuestion,
} from "@/modules/shared/components/section-results";

type Props = {
  module: "listening" | "reading";
  title: string;
  subtitle: string;
  rawScore: number;
  total: number;
  questions: ModuleReviewQuestion[];
  backHref: string;
  primaryHref: string;
  primaryLabel?: string;
  primaryLoading?: boolean;
  onPrimary?: () => void;
  secondaryLabel?: string;
  secondaryHref?: string;
  onSecondary?: () => void;
  /** Extra node (e.g. plan day-finished modal). */
  extras?: ReactNode;
  /** Hide solo catalog practice link; use plan CTAs. */
  planMode?: boolean;
  showBandNotice?: boolean;
};

type View = "summary" | "review";

function mapQuestions(items: ModuleReviewQuestion[]): SectionReviewQuestion[] {
  return items.map((q) => ({
    ...q,
    status: questionStatus(q),
  }));
}

export function PracticeSectionResultsClient({
  module,
  title,
  subtitle,
  rawScore,
  total,
  questions,
  backHref,
  primaryHref,
  primaryLabel = "Back to practice",
  primaryLoading = false,
  onPrimary,
  secondaryLabel,
  secondaryHref,
  onSecondary,
  extras = null,
  planMode = false,
  showBandNotice = false,
}: Props) {
  const router = useRouter();
  const [view, setView] = useState<View>("summary");
  const [highlightQuestion, setHighlightQuestion] = useState<number | null>(null);

  const mapped = useMemo(() => mapQuestions(questions), [questions]);
  const reviewTitle = `${title} · Review`;

  const openReview = useCallback((questionNumber?: number) => {
    if (questionNumber != null) setHighlightQuestion(questionNumber);
    setView("review");
  }, []);

  const handlePrimary = useCallback(() => {
    if (onPrimary) {
      onPrimary();
      return;
    }
    router.push(primaryHref);
  }, [onPrimary, primaryHref, router]);

  const footer = (
    <SectionResultsCtaBar
      layout="split"
      primaryLabel={primaryLabel}
      onPrimary={handlePrimary}
      primaryLoading={primaryLoading}
      primaryDisabled={primaryLoading}
      secondaryLabel={
        view === "summary"
          ? "Review Answers"
          : secondaryLabel
      }
      onSecondary={
        view === "summary"
          ? () => openReview()
          : onSecondary
            ? onSecondary
            : secondaryHref
              ? () => router.push(secondaryHref)
              : secondaryLabel
                ? () => router.push(secondaryHref ?? backHref)
                : undefined
      }
    />
  );

  if (view === "review") {
    return (
      <>
        <SectionResultsShell
          scrollResetKey="review"
          headerTitle={reviewTitle}
          onBack={() => {
            setView("summary");
            setHighlightQuestion(null);
          }}
          card={false}
          footer={
            <SectionResultsCtaBar
              layout="split"
              primaryLabel={primaryLabel}
              onPrimary={handlePrimary}
              primaryLoading={primaryLoading}
              primaryDisabled={primaryLoading}
              secondaryLabel={secondaryLabel ?? "Back to summary"}
              onSecondary={
                onSecondary
                  ? onSecondary
                  : secondaryHref
                    ? () => router.push(secondaryHref)
                    : () => {
                        setView("summary");
                        setHighlightQuestion(null);
                      }
              }
            />
          }
        >
          <SectionAnswerReview
            questions={mapped}
            highlightQuestion={highlightQuestion}
            onHighlightConsumed={() => setHighlightQuestion(null)}
          />
        </SectionResultsShell>
        {extras}
      </>
    );
  }

  return (
    <>
      <SectionResultsShell
        scrollResetKey="summary"
        backHref={backHref}
        showBrandBar
        logoHref={planMode ? "/study-plan/today" : backHref}
        footer={footer}
      >
        <SectionResultsSummary
          title={title}
          subtitle={subtitle}
          rawScore={rawScore}
          total={total}
          questions={mapped}
          showBandNotice={showBandNotice}
          allCorrectMessage="Nice work — every question correct."
          onQuestionClick={(n) => openReview(n)}
        />
        {planMode ? null : (
          <p className="mt-4 text-center text-[12.5px] text-muted">
            <Link href={primaryHref} className="font-semibold text-cyan">
              {module === "listening"
                ? "Continue listening practice"
                : "Continue reading practice"}
            </Link>
          </p>
        )}
      </SectionResultsShell>
      {extras}
    </>
  );
}
