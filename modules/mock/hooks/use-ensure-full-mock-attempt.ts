"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  persistMockAttemptId,
  readMockAttemptId,
} from "@/lib/exam-session-storage";
import { cacheMockNavHint } from "@/lib/mock-nav-cache";
import { fetchMockSessionDeduped } from "@/modules/mock/lib/mock-session-fetch";
import { mockApi } from "@/modules/mock/services/mock-api";

type Args = {
  /** When false, only resolve URL/sessionStorage (plan / diagnostic / practice). */
  enabled: boolean;
  mockTestId: string;
};

type Result = {
  mockAttemptId: string | null;
  ensuring: boolean;
  error: string | null;
};

/**
 * Full mock exam deep-links (`/test/1/listening`, etc.) need a mock_attempt
 * orchestrator ID so L→R→W→S continue works. Without it, submit falls back to
 * a single-skill “Back to Listening” results screen.
 */
export function useEnsureFullMockAttempt({
  enabled,
  mockTestId,
}: Args): Result {
  const searchParams = useSearchParams();
  const urlParam = searchParams.get("mock_attempt")?.trim() || null;
  const [ensuredId, setEnsuredId] = useState<string | null>(null);
  const [ensuring, setEnsuring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bootRef = useRef(false);

  useEffect(() => {
    if (!urlParam) return;
    persistMockAttemptId(mockTestId, urlParam);
    const url = new URL(window.location.href);
    if (!url.searchParams.has("mock_attempt")) return;
    url.searchParams.delete("mock_attempt");
    window.history.replaceState(
      null,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }, [urlParam, mockTestId]);

  useEffect(() => {
    if (!enabled) {
      bootRef.current = false;
      return;
    }
    if (urlParam) {
      setEnsuredId(urlParam);
      return;
    }
    const stored = readMockAttemptId(mockTestId);
    if (stored) {
      setEnsuredId(stored);
      return;
    }
    if (bootRef.current) return;
    bootRef.current = true;

    let cancelled = false;
    setEnsuring(true);
    setError(null);

    void (async () => {
      try {
        const session = await fetchMockSessionDeduped(mockTestId);
        if (cancelled) return;
        if (session?.status === "in_progress" && session.mock_attempt_id) {
          persistMockAttemptId(mockTestId, session.mock_attempt_id);
          setEnsuredId(session.mock_attempt_id);
          return;
        }
        const res = await mockApi.start(mockTestId, false);
        if (cancelled) return;
        persistMockAttemptId(mockTestId, res.mock_attempt_id);
        cacheMockNavHint({
          mock_attempt_id: res.mock_attempt_id,
          next_module: res.current_module,
          next_part: res.part,
        });
        setEnsuredId(res.mock_attempt_id);
      } catch (e) {
        if (cancelled) return;
        bootRef.current = false;
        setError(
          e instanceof Error
            ? e.message
            : "Could not start the full mock test session.",
        );
      } finally {
        if (!cancelled) setEnsuring(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, mockTestId, urlParam]);

  if (!enabled) {
    return {
      mockAttemptId: urlParam ?? readMockAttemptId(mockTestId),
      ensuring: false,
      error: null,
    };
  }

  return {
    mockAttemptId: urlParam ?? ensuredId,
    ensuring: ensuring || (!urlParam && !ensuredId && !error),
    error,
  };
}
