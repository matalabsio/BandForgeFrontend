"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  persistMockAttemptId,
  readMockAttemptId,
} from "@/lib/exam-session-storage";

/** Resolve mock_attempt from URL (once) or sessionStorage; strip UUID from the address bar. */
export function useResolvedMockAttemptId(mockTestId: string): string | null {
  const searchParams = useSearchParams();
  const urlParam = searchParams.get("mock_attempt");

  useEffect(() => {
    if (!urlParam) return;
    persistMockAttemptId(mockTestId, urlParam);
    const url = new URL(window.location.href);
    if (!url.searchParams.has("mock_attempt")) return;
    url.searchParams.delete("mock_attempt");
    const next = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState(null, "", next);
  }, [urlParam, mockTestId]);

  return useMemo(
    () => urlParam ?? readMockAttemptId(mockTestId),
    [urlParam, mockTestId],
  );
}
