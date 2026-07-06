"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import { canonicalMockSlug, mockHubPath, mockResultsPath, mockTestNumberPath } from "@/lib/mock-catalog";
import { persistMockAttemptId } from "@/lib/exam-session-storage";
import type { WritingModuleReviewPayload } from "@/lib/module-review-types";
import { navigateFromProgress } from "@/lib/mock-exam-nav";
import { mockApi } from "@/modules/mock/services/mock-api";
import { useResolvedMockAttemptId } from "@/modules/mock/hooks/use-resolved-mock-attempt";
import { ModuleReviewPanel } from "@/modules/shared/components/module-review/module-review-panel";
import { WritingTaskReviewCard } from "@/modules/shared/components/module-review/writing-task-review-card";

type Props = {
  testId: string;
  testNumber: number;
};

export function WritingModuleReviewClient({ testId, testNumber }: Props) {
  const router = useRouter();
  const mockSlug = canonicalMockSlug(testId);
  const mockAttemptId = useResolvedMockAttemptId(testId);

  const [payload, setPayload] = useState<WritingModuleReviewPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mockAttemptId) return;
    let active = true;
    mockApi
      .writingModuleReview(mockAttemptId)
      .then((data) => {
        if (active) setPayload(data);
      })
      .catch(() => {
        if (!active) return;
        setError("We couldn't load your writing review. Taking you to the next step.");
        router.replace(mockHubPath(mockSlug, mockAttemptId));
      });
    return () => {
      active = false;
    };
  }, [mockAttemptId, mockSlug, router]);

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
          {error ?? "Evaluating your essays…"}
        </p>
        {!error ? (
          <p className="mt-2 max-w-sm text-sm font-light text-[#64748B]">
            This can take a few seconds.
          </p>
        ) : null}
      </div>
    );
  }

  const ctaLabel = payload.next_module === "speaking"
    ? "Continue to Speaking"
    : payload.next_module
      ? "Continue"
      : "View your results";

  return (
    <ModuleReviewPanel
      pageTitle={`Writing review · Test ${testNumber}`}
      backHref={mockTestNumberPath(testNumber)}
      coachTitle="MATA Coach · Writing"
      coachMessage={payload.persona_message}
      hero={
        <div className="flex items-center gap-3 rounded-2xl border border-[#F8E6BE] bg-[#FEF8EC] px-4 py-3.5">
          <Clock className="size-5 shrink-0 text-[#D98309]" aria-hidden />
          <div>
            <p className="font-display text-[14px] font-bold text-navy">
              {payload.ai_band != null
                ? `AI estimate · Band ${payload.ai_band.toFixed(1)}`
                : "AI estimate pending"}
            </p>
            <p className="font-sans text-[12.5px] font-light text-[#5C4A2E]">
              A certified examiner sends your official band within 24–48 hours.
            </p>
          </div>
        </div>
      }
      ctaLabel={ctaLabel}
      onContinue={handleContinue}
    >
      <div className="space-y-4">
        {payload.tasks.map((task) => (
          <WritingTaskReviewCard key={task.attempt_id} task={task} />
        ))}
      </div>
    </ModuleReviewPanel>
  );
}
