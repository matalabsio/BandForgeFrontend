"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  canonicalMockSlug,
  mockHubPath,
  mockResultsPath,
  mockTestNumberPath,
} from "@/lib/mock-catalog";
import { cacheModuleReview, readModuleReview } from "@/lib/module-review-cache";
import type { ModuleReviewPayload, ObjectiveModule } from "@/lib/module-review-types";
import { persistMockAttemptId } from "@/lib/exam-session-storage";
import { navigateFromProgress } from "@/lib/mock-exam-nav";
import { mockApi } from "@/modules/mock/services/mock-api";
import { useResolvedMockAttemptId } from "@/modules/mock/hooks/use-resolved-mock-attempt";
import {
  flattenModuleQuestions,
  SectionAnswerReview,
  SectionResultsCtaBar,
  SectionResultsShell,
  SectionResultsSummary,
} from "@/modules/shared/components/section-results";

type Props = {
  testId: string;
  module: ObjectiveModule;
  testNumber: number;
};

type View = "summary" | "review";

const NEXT_LABEL: Record<string, string> = {
  listening: "Continue to Listening",
  reading: "Continue to Reading",
  writing: "Continue to Writing",
  speaking: "Continue to Speaking",
};

function continueLabel(nextModule: string | null): string {
  if (nextModule && NEXT_LABEL[nextModule]) return NEXT_LABEL[nextModule];
  return "Finish Test";
}

const MODULE_META: Record<
  ObjectiveModule,
  { title: string; subtitle: (total: number, groups: number) => string }
> = {
  listening: {
    title: "Listening",
    subtitle: (total, groups) =>
      `${total} questions · ${groups} parts completed`,
  },
  reading: {
    title: "Reading",
    subtitle: (total, groups) => {
      const passages = new Set(
        Array.from({ length: groups }, (_, i) => i + 1),
      ).size;
      return `${total} questions · ${passages} passage${passages === 1 ? "" : "s"}`;
    },
  },
};

export function ObjectiveModuleReviewClient({ testId, module, testNumber }: Props) {
  const router = useRouter();
  const mockSlug = canonicalMockSlug(testId);
  const mockAttemptId = useResolvedMockAttemptId(testId);

  const [payload, setPayload] = useState<ModuleReviewPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>("summary");
  const [highlightQuestion, setHighlightQuestion] = useState<number | null>(null);

  useEffect(() => {
    if (!mockAttemptId) return;
    const cached = readModuleReview(mockAttemptId, module);
    if (cached) {
      setPayload(cached);
      return;
    }
    let active = true;
    const fetcher =
      module === "listening"
        ? mockApi.listeningModuleReview
        : mockApi.readingModuleReview;
    fetcher(mockAttemptId)
      .then((data) => {
        if (!active) return;
        cacheModuleReview(mockAttemptId, module, data);
        setPayload(data);
      })
      .catch(() => {
        if (!active) return;
        setError("We couldn't load your review. Continuing to the next section.");
        router.replace(mockHubPath(mockSlug, mockAttemptId));
      });
    return () => {
      active = false;
    };
  }, [mockAttemptId, module, mockSlug, router]);

  const questions = useMemo(
    () => (payload ? flattenModuleQuestions(payload.groups) : []),
    [payload],
  );

  const passageCount = useMemo(() => {
    if (!payload) return 0;
    return new Set(
      payload.groups.map((g) => {
        const match = g.label.match(/Passage\s+(\d+)/i);
        return match ? match[1] : g.label.split(" · ")[0] ?? g.label;
      }),
    ).size;
  }, [payload]);

  const handleContinue = useCallback(() => {
    if (!mockAttemptId || !payload) return;
    persistMockAttemptId(testId, mockAttemptId);
    if (!payload.next_module) {
      router.replace(mockResultsPath(mockSlug, mockAttemptId));
      return;
    }
    navigateFromProgress(router, mockSlug, mockAttemptId, {
      status: "in_progress",
      next_module: payload.next_module,
      next_part: payload.next_part,
    });
  }, [mockAttemptId, payload, mockSlug, router, testId]);

  const openReview = useCallback((questionNumber?: number) => {
    if (questionNumber != null) {
      setHighlightQuestion(questionNumber);
    }
    setView("review");
  }, []);

  if (!payload) {
    return (
      <SectionResultsShell centered scrollResetKey={error ? "error" : "loading"}>
        <p className="font-display text-base font-bold text-navy">
          {error ?? "Loading your review…"}
        </p>
        {!error ? (
          <p className="mt-2 max-w-sm text-center text-sm font-light text-muted">
            Gathering your answers.
          </p>
        ) : null}
      </SectionResultsShell>
    );
  }

  const meta = MODULE_META[module];
  const reviewTitle = `${meta.title} · Review`;
  const summarySubtitle =
    module === "listening"
      ? meta.subtitle(payload.total_questions, payload.groups.length)
      : meta.subtitle(payload.total_questions, passageCount);

  if (view === "review") {
    return (
      <SectionResultsShell
        scrollResetKey={`${module}-review`}
        headerTitle={reviewTitle}
        onBack={() => {
          setView("summary");
          setHighlightQuestion(null);
        }}
        card={false}
        footer={
          <SectionResultsCtaBar
            primaryLabel={continueLabel(payload.next_module)}
            onPrimary={handleContinue}
          />
        }
      >
        <SectionAnswerReview
          questions={questions}
          highlightQuestion={highlightQuestion}
          onHighlightConsumed={() => setHighlightQuestion(null)}
        />
      </SectionResultsShell>
    );
  }

  return (
    <SectionResultsShell
      scrollResetKey={`${module}-summary`}
      backHref={mockTestNumberPath(testNumber)}
      showBrandBar
      logoHref={mockTestNumberPath(testNumber)}
      footer={
        <SectionResultsCtaBar
          layout="split"
          primaryLabel={continueLabel(payload.next_module)}
          onPrimary={handleContinue}
          secondaryLabel="Review Answers"
          onSecondary={() => openReview()}
        />
      }
    >
      <SectionResultsSummary
        title={meta.title}
        subtitle={summarySubtitle}
        rawScore={payload.raw_score}
        total={payload.total_questions}
        questions={questions}
        allCorrectMessage="Nice work — every question correct."
        onQuestionClick={(n) => openReview(n)}
      />
    </SectionResultsShell>
  );
}
