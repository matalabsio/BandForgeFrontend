"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { IeltsExamShell } from "@/components/exam/ielts-exam-shell";
import { IeltsHubSkeleton } from "@/components/exam/ielts-exam-skeleton";

function MockRouteInner({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const isExam =
    searchParams.has("part") ||
    searchParams.has("passage") ||
    searchParams.has("auto");

  return (
    <IeltsExamShell layout={isExam ? "exam" : "hub"} moduleLabel="Mock Test">
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
