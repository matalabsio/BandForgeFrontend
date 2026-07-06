"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { buildModuleCoachMessage, moduleCoachTitle } from "@/lib/module-coach-copy";
import { canonicalMockSlug, mockHubPath, mockResultsPath, mockTestNumberPath } from "@/lib/mock-catalog";
import { cacheModuleReview, readModuleReview } from "@/lib/module-review-cache";
import type { ModuleReviewPayload, ObjectiveModule } from "@/lib/module-review-types";
import { persistMockAttemptId } from "@/lib/exam-session-storage";
import { navigateFromProgress } from "@/lib/mock-exam-nav";
import { mockApi } from "@/modules/mock/services/mock-api";
import { useResolvedMockAttemptId } from "@/modules/mock/hooks/use-resolved-mock-attempt";
import { GroupedQuestionReview } from "@/modules/shared/components/module-review/grouped-question-review";
import { ModuleReviewPanel } from "@/modules/shared/components/module-review/module-review-panel";
import { ModuleScoreHero } from "@/modules/shared/components/module-review/module-score-hero";

type Props = {
  testId: string;
  module: ObjectiveModule;
  testNumber: number;
};

const NEXT_LABEL: Record<string, string> = {
  listening: "Continue to Listening",
  reading: "Continue to Reading",
  writing: "Continue to Writing",
  speaking: "Continue to Speaking",
};

function ctaLabelFor(nextModule: string | null): string {
  if (nextModule && NEXT_LABEL[nextModule]) return NEXT_LABEL[nextModule];
  return "View your results";
}

const MODULE_PAGE_TITLE: Record<ObjectiveModule, string> = {
  listening: "Listening review",
  reading: "Reading review",
};

export function ObjectiveModuleReviewClient({ testId, module, testNumber }: Props) {
  const router = useRouter();
  const mockSlug = canonicalMockSlug(testId);
  const mockAttemptId = useResolvedMockAttemptId(testId);

  const [payload, setPayload] = useState<ModuleReviewPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

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
  }, [mockAttemptId, payload, mockSlug, router]);

  if (!payload) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="font-display text-base font-bold text-navy">
          {error ?? "Loading your review…"}
        </p>
        {!error ? (
          <p className="mt-2 max-w-sm text-sm font-light text-[#64748B]">
            Gathering your answers and coach feedback.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <ModuleReviewPanel
      pageTitle={`${MODULE_PAGE_TITLE[module]} · Test ${testNumber}`}
      backHref={mockTestNumberPath(testNumber)}
      coachTitle={moduleCoachTitle(module)}
      coachMessage={buildModuleCoachMessage({
        module,
        rawScore: payload.raw_score,
        total: payload.total_questions,
        groups: payload.groups,
      })}
      hero={
        <ModuleScoreHero
          rawScore={payload.raw_score}
          total={payload.total_questions}
        />
      }
      ctaLabel={ctaLabelFor(payload.next_module)}
      onContinue={handleContinue}
    >
      <GroupedQuestionReview groups={payload.groups} />
    </ModuleReviewPanel>
  );
}
