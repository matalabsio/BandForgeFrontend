"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  canonicalMockSlug,
  mockHubPath,
  mockResultsPath,
} from "@/lib/mock-catalog";
import { persistMockAttemptId } from "@/lib/exam-session-storage";
import type { WritingModuleReviewPayload } from "@/lib/module-review-types";
import { navigateFromProgress } from "@/lib/mock-exam-nav";
import { mockApi } from "@/modules/mock/services/mock-api";
import { useResolvedMockAttemptId } from "@/modules/mock/hooks/use-resolved-mock-attempt";
import {
  SectionResultsCtaBar,
  SectionResultsShell,
  SectionSubmissionConfirmation,
} from "@/modules/shared/components/section-results";

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
  }, [mockAttemptId, payload, mockSlug, router, testId]);

  const subtitle = useMemo(() => {
    if (!payload?.tasks.length) return "Writing module";
    if (payload.tasks.length === 1) {
      const t = payload.tasks[0];
      const label = t.prompt.trim();
      const short = label.length > 40 ? `${label.slice(0, 37).trim()}…` : label;
      return `Writing Task ${t.part}${short ? ` · ${short}` : ""}`;
    }
    return `Writing · ${payload.tasks.length} tasks submitted`;
  }, [payload]);

  const stats = useMemo(() => {
    if (!payload?.tasks.length) return [];
    const totalWords = payload.tasks.reduce((sum, t) => sum + t.word_count, 0);
    const items = [
      { value: String(totalWords), label: "Words written" },
    ];
    if (payload.ai_band != null) {
      items.push({
        value: payload.ai_band.toFixed(1),
        label: "AI estimate",
      });
    } else {
      items.push({ value: String(payload.tasks.length), label: "Tasks submitted" });
    }
    return items;
  }, [payload]);

  if (!payload) {
    return (
      <SectionResultsShell centered>
        <p className="font-display text-base font-bold text-navy">
          {error ?? "Saving your essays…"}
        </p>
        {!error ? (
          <p className="mt-2 max-w-sm text-center text-sm font-light text-muted">
            This only takes a moment.
          </p>
        ) : null}
      </SectionResultsShell>
    );
  }

  const ctaLabel =
    payload.next_module === "speaking"
      ? "Continue to Speaking"
      : payload.next_module
        ? "Continue to Next Section"
        : "Finish Test";

  return (
    <SectionResultsShell
      centered
      footer={
        <SectionResultsCtaBar primaryLabel={ctaLabel} onPrimary={handleContinue} />
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
