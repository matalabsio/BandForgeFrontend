"use client";

import { useEffect } from "react";
import { mockHubPath } from "@/lib/mock-catalog";
import { redirectIfMockCompleted } from "@/lib/mock-completed-nav";
import { shouldSkipMockGuard } from "@/lib/mock-nav-cache";
import { syncExamRoute } from "@/lib/mock-exam-nav";
import { fetchMockProgressDeduped } from "@/modules/mock/lib/mock-progress-fetch";

type Args = {
  enabled: boolean;
  mockAttemptId: string | null;
  mockSlug: string;
  part: number;
  sectionStart: boolean;
  replace: (url: string) => void;
};

/** Redirect when mock session is invalid or URL part disagrees with server progress. */
export function useListeningMockGuard({
  enabled,
  mockAttemptId,
  mockSlug,
  part,
  sectionStart,
  replace,
}: Args) {
  useEffect(() => {
    if (!enabled || !mockAttemptId) return;
    if (shouldSkipMockGuard(mockAttemptId, sectionStart)) return;

    let cancelled = false;
    void (async () => {
      try {
        const p = await fetchMockProgressDeduped(mockAttemptId);
        if (cancelled) return;
        if (redirectIfMockCompleted(p.status, replace)) {
          return;
        }
        if (p.status !== "in_progress") {
          replace(mockHubPath(mockSlug));
          return;
        }
        syncExamRoute({ replace }, mockSlug, mockAttemptId, { module: "listening", part }, p);
      } catch {
        if (!cancelled) replace(mockHubPath(mockSlug));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, mockAttemptId, mockSlug, part, sectionStart, replace]);
}
