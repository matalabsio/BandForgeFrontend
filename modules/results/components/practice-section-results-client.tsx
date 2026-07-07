"use client";

import { useCallback, useMemo, useState } from "react";
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

  if (view === "review") {
    return (
      <SectionResultsShell
        headerTitle={reviewTitle}
        onBack={() => {
          setView("summary");
          setHighlightQuestion(null);
        }}
        card={false}
        footer={
          <SectionResultsCtaBar
            primaryLabel={primaryLabel}
            onPrimary={() => router.push(primaryHref)}
          />
        }
      >
        <SectionAnswerReview
          questions={mapped}
          highlightQuestion={highlightQuestion}
          onHighlightConsumed={() => setHighlightQuestion(null)}
        />
      </SectionResultsShell>
    );
  }

  return (
    <SectionResultsShell
      backHref={backHref}
      showBrandBar
      logoHref={backHref}
      footer={
        <SectionResultsCtaBar
          layout="split"
          primaryLabel="Review Answers"
          onPrimary={() => openReview()}
          secondaryLabel={primaryLabel}
          onSecondary={() => router.push(primaryHref)}
        />
      }
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
      <p className="mt-4 text-center text-[12.5px] text-muted">
        <Link href={primaryHref} className="font-semibold text-cyan">
          {module === "listening" ? "Continue listening practice" : "Continue reading practice"}
        </Link>
      </p>
    </SectionResultsShell>
  );
}
