"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  canonicalMockSlug,
  mockHubPath,
  mockResultsPath,
} from "@/lib/mock-catalog";
import { persistMockAttemptId } from "@/lib/exam-session-storage";
import type { SpeakingModuleReviewPayload } from "@/lib/module-review-types";
import { navigateFromProgress } from "@/lib/mock-exam-nav";
import { mockApi } from "@/modules/mock/services/mock-api";
import { useResolvedMockAttemptId } from "@/modules/mock/hooks/use-resolved-mock-attempt";
import { speakingStatusPath } from "@/modules/speaking/lib/speaking-status-routing";
import {
  formatRecordedDuration,
  SectionResultsCtaBar,
  SectionResultsShell,
  SectionSubmissionConfirmation,
} from "@/modules/shared/components/section-results";

type Props = {
  testId: string;
  testNumber: number;
};

function releaseMessage(payload: SpeakingModuleReviewPayload): string {
  if (payload.release_state === "withdrawn") {
    return "Your Speaking report is temporarily unavailable while it is reviewed.";
  }
  if (payload.release_state === "released" && payload.report_available === true) {
    return payload.overall_band != null
      ? `Your examiner-approved Speaking band is ${payload.overall_band.toFixed(1)}. Your report is ready.`
      : "Your examiner-approved Speaking report is now available.";
  }
  if (payload.release_state === "processing") {
    return "Your recording is being prepared for examiner review.";
  }
  if (payload.release_state === "awaiting_examiner") {
    return "Your recording is awaiting examiner review.";
  }
  return "Your Speaking evaluation will be included in your final test results.";
}

export function SpeakingModuleReviewClient({ testId, testNumber }: Props) {
  const router = useRouter();
  const mockSlug = canonicalMockSlug(testId);
  const mockAttemptId = useResolvedMockAttemptId(testId);

  const [payload, setPayload] = useState<SpeakingModuleReviewPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mockAttemptId) return;
    let active = true;
    mockApi
      .speakingModuleReview(mockAttemptId)
      .then((data) => {
        if (active) setPayload(data);
      })
      .catch(() => {
        if (!active) return;
        setError("We couldn't load your speaking review. Taking you to the next step.");
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

  const handleOpenSpeakingStatus = useCallback(() => {
    if (!payload) return;
    router.push(speakingStatusPath(testNumber, payload.attempt_id, payload));
  }, [payload, router, testNumber]);

  const subtitle = useMemo(() => {
    if (!payload) return "";
    const topic =
      payload.prompts[0]?.trim() ||
      "Introduction and interview";
    const short =
      topic.length > 48 ? `${topic.slice(0, 45).trim()}…` : topic;
    return `Speaking Part ${payload.part} · ${short}`;
  }, [payload]);

  const stats = useMemo(() => {
    if (!payload) return [];
    const recorded = formatRecordedDuration(payload.duration_seconds);
    const target =
      payload.duration_hint_seconds != null
        ? `~${formatRecordedDuration(payload.duration_hint_seconds)}`
        : "1–2 min";
    return [
      { value: recorded, label: "Recorded" },
      { value: target, label: "Target length" },
    ];
  }, [payload]);

  if (!payload) {
    return (
      <SectionResultsShell centered scrollResetKey={error ? "error" : "loading"}>
        <p className="font-display text-base font-bold text-navy">
          {error ?? "Preparing your speaking review…"}
        </p>
        {!error ? (
          <p className="mt-2 max-w-sm text-center text-sm font-light text-muted">
            This only takes a moment.
          </p>
        ) : null}
      </SectionResultsShell>
    );
  }

  const ctaLabel = payload.next_module ? "Continue to Next Section" : "Finish Test";

  return (
    <SectionResultsShell
      centered
      scrollResetKey="speaking-submitted"
      footer={
        <SectionResultsCtaBar
          primaryLabel={ctaLabel}
          onPrimary={handleContinue}
          secondaryLabel={
            payload.report_available ? "View Speaking Report" : "Check Review Status"
          }
          onSecondary={handleOpenSpeakingStatus}
        />
      }
    >
      <SectionSubmissionConfirmation
        subtitle={subtitle}
        stats={stats}
        infoMessage={releaseMessage(payload)}
      />
    </SectionResultsShell>
  );
}
