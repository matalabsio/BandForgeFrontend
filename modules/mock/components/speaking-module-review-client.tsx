"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Mic } from "lucide-react";
import {
  canonicalMockSlug,
  mockHubPath,
  mockResultsPath,
  shortModuleSpeakingPendingPath,
  mockTestNumberPath,
} from "@/lib/mock-catalog";
import type { SpeakingModuleReviewPayload } from "@/lib/module-review-types";
import { navigateFromProgress } from "@/lib/mock-exam-nav";
import { mockApi } from "@/modules/mock/services/mock-api";
import { useResolvedMockAttemptId } from "@/modules/mock/hooks/use-resolved-mock-attempt";
import { ModuleReviewPanel } from "@/modules/shared/components/module-review/module-review-panel";

type Props = {
  testId: string;
  testNumber: number;
};

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
    if (!payload.next_module) {
      router.replace(
        shortModuleSpeakingPendingPath(testNumber, payload.attempt_id),
      );
      return;
    }
    navigateFromProgress(router, mockSlug, mockAttemptId, {
      status: "in_progress",
      next_module: payload.next_module,
      next_part: payload.next_part,
    });
  }, [mockAttemptId, payload, mockSlug, router, testNumber]);

  if (!payload) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="font-display text-base font-bold text-navy">
          {error ?? "Preparing your speaking review…"}
        </p>
        {!error ? (
          <p className="mt-2 max-w-sm text-sm font-light text-[#64748B]">
            This only takes a moment.
          </p>
        ) : null}
      </div>
    );
  }

  const ctaLabel = payload.next_module
    ? "Continue"
    : "View pending review";

  return (
    <ModuleReviewPanel
      pageTitle={`Speaking review · Test ${testNumber}`}
      backHref={mockTestNumberPath(testNumber)}
      coachTitle="MATA Coach · Speaking"
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
              A certified examiner confirms your official band within 24 hours.
            </p>
          </div>
        </div>
      }
      ctaLabel={ctaLabel}
      onContinue={handleContinue}
    >
      <div className="space-y-4">
        <section className="overflow-hidden rounded-2xl border border-[#E3E9F1] bg-white shadow-[0_8px_28px_rgba(13,31,60,0.05)]">
          <div className="flex items-center gap-3 border-b border-[#EDF1F6] px-5 py-4">
            <span className="flex size-10 items-center justify-center rounded-full bg-cyan/10 text-cyan">
              <Mic className="size-5" aria-hidden />
            </span>
            <div>
              <h3 className="font-display text-[16px] font-bold text-navy">
                Part {payload.part} recording
              </h3>
              <p className="font-mono text-[11px] uppercase tracking-wide text-[#94A3B8]">
                {payload.duration_seconds != null
                  ? `${payload.duration_seconds}s recorded`
                  : "Duration not measured"}
                {payload.duration_hint_seconds != null
                  ? ` · ~${payload.duration_hint_seconds}s target`
                  : ""}
              </p>
            </div>
          </div>
          <div className="space-y-4 px-5 py-5">
            {payload.prompts.length > 0 ? (
              <div>
                <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.1em] text-[#94A3B8]">
                  Prompts covered
                </p>
                <ul className="space-y-2">
                  {payload.prompts.map((prompt) => (
                    <li
                      key={prompt}
                      className="break-words rounded-[12px] bg-[#F8FAFC] px-4 py-3 font-sans text-[13.5px] leading-relaxed text-[#475569]"
                    >
                      {prompt}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {payload.delivery_notes.length > 0 ? (
              <div>
                <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.1em] text-[#94A3B8]">
                  Delivery notes
                </p>
                <ul className="space-y-2">
                  {payload.delivery_notes.map((note) => (
                    <li
                      key={note}
                      className="rounded-[12px] border border-[#EEF2F7] bg-white px-4 py-3 font-sans text-[13.5px] leading-relaxed text-[#334155]"
                    >
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </ModuleReviewPanel>
  );
}
