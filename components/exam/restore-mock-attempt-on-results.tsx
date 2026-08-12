"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { readMockAttemptId } from "@/lib/exam-session-storage";
import { mockTestIdForNumber } from "@/lib/mock-catalog";

type Props = {
  testNumber: number;
  mockTestId: string;
  children: React.ReactNode;
};

/**
 * If a section results URL has attempt+part but lost mock_attempt (e.g. old
 * hydrator strip + refresh), restore it from sessionStorage so the full-mock
 * continue CTA renders instead of “Back to Listening”.
 */
export function RestoreMockAttemptOnResults({
  testNumber,
  mockTestId,
  children,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("mock_attempt")?.trim()) return;
    if (!searchParams.get("attempt")?.trim()) return;

    const stored =
      readMockAttemptId(mockTestId) ||
      readMockAttemptId(mockTestIdForNumber(testNumber));
    if (!stored) return;

    const next = new URLSearchParams(searchParams.toString());
    next.set("mock_attempt", stored);
    router.replace(`${pathname}?${next.toString()}`);
  }, [mockTestId, pathname, router, searchParams, testNumber]);

  return children;
}
