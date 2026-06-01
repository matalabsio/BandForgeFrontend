"use client";

import { useEffect, useRef } from "react";
import { MOCK_DISPLAY_LABEL } from "@/lib/mock-catalog";

type Props = {
  fresh: boolean;
  highlightAttemptId?: string | null;
};

export function ScoresCompletionFocus({
  fresh,
  highlightAttemptId,
}: Props) {
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
      <p className="font-bold">{MOCK_DISPLAY_LABEL} complete</p>
      <p className="mt-0.5 text-emerald-800/85">
        Your latest scores are below. Open a section for question-by-question
        breakdown.
      </p>
    </output>
  );
}
