"use client";

import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { IeltsExamShell } from "@/components/exam/ielts-exam-shell";
import { IeltsHubSkeleton } from "@/components/exam/ielts-exam-skeleton";
import { useExamSessionGuard } from "@/modules/shared/hooks/use-exam-session-refresh";

/** Active L/R/W/S exam surfaces — no content-library chrome (logo / search). */
function isActiveExamPath(pathname: string): boolean {
  if (
    pathname.includes("/results") ||
    pathname.includes("/review") ||
    pathname.includes("/pending") ||
    pathname.includes("/checkpoint")
  ) {
    return false;
  }
  if (/\/test\/\d+\/(listening|reading|writing|speaking)(\/|$)/.test(pathname)) {
    return true;
  }
  if (/\/test\/(listening|reading|writing|speaking)(\/|$)/.test(pathname)) {
    return true;
  }
  if (/\/test\/writing\/task\//.test(pathname)) {
    return true;
  }
  if (/\/mock\/[^/]+\/(listening|reading|writing|speaking)(\/|$)/.test(pathname)) {
    return true;
  }
  return false;
}

function MockRouteInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isReview =
    pathname.includes("/review") ||
    /\/test\/\d+\/(listening|reading|writing|speaking)\/results/.test(pathname) ||
    pathname.includes("/pending");
  const isExam =
    isActiveExamPath(pathname) ||
    (!isReview &&
      (searchParams.has("part") ||
        searchParams.has("passage") ||
        searchParams.has("auto")));
  const mockAttemptActive = searchParams.has("mock_attempt");

  useExamSessionGuard(isExam || mockAttemptActive || isReview);

  const layout = isReview ? "review" : isExam ? "exam" : "hub";

  return (
    <IeltsExamShell
      layout={layout}
      moduleLabel="Mock Test"
      hubTitle="Mock tests"
      hubVariant="library"
    >
      {children}
    </IeltsExamShell>
  );
}

export function MockRouteShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<IeltsHubSkeleton />}>
      <MockRouteInner>{children}</MockRouteInner>
    </Suspense>
  );
}
