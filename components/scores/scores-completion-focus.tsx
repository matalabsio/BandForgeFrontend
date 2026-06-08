"use client";

import { useEffect, useRef } from "react";
import {
  canonicalMockSlug,
  getMockMeta,
  PUBLISHED_MOCK_SLUGS,
  type MockSlug,
} from "@/lib/mock-catalog";

type Props = {
  fresh: boolean;
  highlightAttemptId?: string | null;
  mockSlug?: MockSlug | null;
};

export function ScoresCompletionFocus({
  fresh,
  highlightAttemptId,
  mockSlug = null,
}: Props) {
  const resolvedSlug = mockSlug
    ? (canonicalMockSlug(mockSlug) as MockSlug)
    : null;
  const completionLabel =
    resolvedSlug && PUBLISHED_MOCK_SLUGS.includes(resolvedSlug)
      ? `${getMockMeta(resolvedSlug).displayLabel} complete`
      : "Mock test complete";
  const didFocus = useRef(false);

  useEffect(() => {
    if (didFocus.current) return;
    if (!fresh && !highlightAttemptId) return;

    const timer = window.setTimeout(() => {
      const target = highlightAttemptId
        ? document.getElementById(`score-attempt-${highlightAttemptId}`)
        : document.getElementById("score-reports");
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
      didFocus.current = true;
      if (fresh || highlightAttemptId) {
        window.history.replaceState(null, "", "/scores");
      }
    }, fresh ? 200 : 80);

    return () => window.clearTimeout(timer);
  }, [fresh, highlightAttemptId]);

  if (!fresh) return null;

  return (
    <output
      className="block rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-[13px] text-emerald-900"
    >
      <p className="font-bold">{completionLabel}</p>
      <p className="mt-0.5 text-emerald-800/85">
        Your latest scores are below. Open a section for question-by-question
        breakdown.
      </p>
    </output>
  );
}
