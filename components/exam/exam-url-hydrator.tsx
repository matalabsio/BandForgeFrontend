"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { persistMockAttemptId } from "@/lib/exam-session-storage";
import {
  mockApiId,
  mockTestIdForNumber,
} from "@/lib/mock-catalog";

function ExamUrlHydratorInner() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const mockAttempt = searchParams.get("mock_attempt");

  useEffect(() => {
    if (!mockAttempt) return;

    const mockSlugMatch = pathname.match(/^\/mock\/([^/]+)/);
    if (mockSlugMatch) {
      persistMockAttemptId(mockApiId(mockSlugMatch[1]), mockAttempt);
    } else if (pathname === "/test" || pathname.startsWith("/test/")) {
      const testNumber = Number.parseInt(searchParams.get("test") ?? "1", 10);
      if (Number.isFinite(testNumber) && testNumber >= 1) {
        persistMockAttemptId(mockTestIdForNumber(testNumber), mockAttempt);
      }
    }

    const url = new URL(window.location.href);
    if (!url.searchParams.has("mock_attempt")) return;
    url.searchParams.delete("mock_attempt");
    window.history.replaceState(
      null,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }, [mockAttempt, pathname, searchParams]);

  return null;
}

/** Strip `mock_attempt` UUIDs from URLs after persisting them in sessionStorage. */
export function ExamUrlHydrator() {
  return (
    <Suspense fallback={null}>
      <ExamUrlHydratorInner />
    </Suspense>
  );
}
