"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  persistExamNavFlags,
  persistMockAttemptId,
  type ResultModule,
} from "@/lib/exam-session-storage";
import {
  mockApiId,
  mockTestIdForNumber,
} from "@/lib/mock-catalog";

function parseShortModulePath(pathname: string): {
  testNumber: number;
  module: ResultModule;
} | null {
  // Active exam only — never results / review / pending (those need mock_attempt in the URL).
  const match = pathname.match(
    /^\/test\/(\d+)\/(listening|reading|writing|speaking)\/?$/,
  );
  if (!match) return null;
  const testNumber = Number.parseInt(match[1], 10);
  if (!Number.isFinite(testNumber) || testNumber < 1) return null;
  return { testNumber, module: match[2] as ResultModule };
}

function isResultsOrReviewPath(pathname: string): boolean {
  return (
    pathname.includes("/results") ||
    pathname.includes("/review") ||
    pathname.includes("/pending") ||
    pathname.includes("/checkpoint")
  );
}

function ExamUrlHydratorInner() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const mockAttempt = searchParams.get("mock_attempt");
  const auto = searchParams.get("auto") === "1";
  const sectionStart = searchParams.get("section_start") === "1";

  useEffect(() => {
    const short = parseShortModulePath(pathname);
    if (short && (auto || sectionStart)) {
      persistExamNavFlags(short.testNumber, short.module, {
        auto: auto || undefined,
        sectionStart: sectionStart || undefined,
      });
    }

    if (mockAttempt) {
      const mockSlugMatch = pathname.match(/^\/mock\/([^/]+)/);
      if (mockSlugMatch) {
        persistMockAttemptId(mockApiId(mockSlugMatch[1]), mockAttempt);
      } else if (short) {
        persistMockAttemptId(mockTestIdForNumber(short.testNumber), mockAttempt);
      } else {
        const resultsMatch = pathname.match(
          /^\/test\/(\d+)\/(listening|reading|writing|speaking)\//,
        );
        if (resultsMatch?.[1]) {
          const testNumber = Number.parseInt(resultsMatch[1], 10);
          if (Number.isFinite(testNumber) && testNumber >= 1) {
            persistMockAttemptId(mockTestIdForNumber(testNumber), mockAttempt);
          }
        } else if (pathname === "/test" || pathname.startsWith("/test/")) {
          const testNumber = Number.parseInt(searchParams.get("test") ?? "1", 10);
          if (Number.isFinite(testNumber) && testNumber >= 1) {
            persistMockAttemptId(mockTestIdForNumber(testNumber), mockAttempt);
          }
        }
      }
    }

    // Keep mock_attempt on results / pending / review — SSR needs it to pick
    // the full-mock continue CTA instead of “Back to Listening” practice UI.
    if (isResultsOrReviewPath(pathname)) return;

    const url = new URL(window.location.href);
    let changed = false;
    for (const key of ["mock_attempt", "auto", "section_start"] as const) {
      if (!url.searchParams.has(key)) continue;
      url.searchParams.delete(key);
      changed = true;
    }
    if (!changed) return;
    window.history.replaceState(
      null,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }, [mockAttempt, auto, sectionStart, pathname, searchParams]);

  return null;
}

/** Strip transient exam query params after persisting them in sessionStorage. */
export function ExamUrlHydrator() {
  return (
    <Suspense fallback={null}>
      <ExamUrlHydratorInner />
    </Suspense>
  );
}
