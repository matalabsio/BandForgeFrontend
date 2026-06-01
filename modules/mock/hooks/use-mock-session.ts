"use client";

import { useCallback, useEffect, useState } from "react";
import { mockAttemptStorageKey } from "@/modules/mock/lib/mock-session-storage";
import { fetchMockSessionDeduped } from "@/modules/mock/lib/mock-session-fetch";
import { formatMockStartError } from "@/lib/api";
import {
  mockApi,
  type MockAttemptProgress,
  type StartMockResponse,
} from "@/modules/mock/services/mock-api";

export type UseMockSessionResult = {
  mockAttemptId: string | null;
  progress: MockAttemptProgress | null;
  loading: boolean;
  busy: boolean;
  error: string | null;
  start: (forceNew?: boolean) => Promise<StartMockResponse>;
  resume: () => Promise<StartMockResponse>;
  refresh: () => Promise<void>;
  clearSession: () => void;
};

type Options = {
  initialProgress?: MockAttemptProgress | null;
};

export function useMockSession(
  mockTestId: string,
  options?: Options,
): UseMockSessionResult {
  const storageKey = mockAttemptStorageKey(mockTestId);
  const initial = options?.initialProgress;
  const [mockAttemptId, setMockAttemptId] = useState<string | null>(
    initial?.mock_attempt_id ?? null,
  );
  const [progress, setProgress] = useState<MockAttemptProgress | null>(
    initial ?? null,
  );
  const [loading, setLoading] = useState(initial === undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applySession = useCallback(
    (session: MockAttemptProgress | null) => {
      if (session) {
        setProgress(session);
        setMockAttemptId(session.mock_attempt_id);
        if (session.status === "in_progress") {
          sessionStorage.setItem(storageKey, session.mock_attempt_id);
        } else {
          sessionStorage.removeItem(storageKey);
        }
        return;
      }
      sessionStorage.removeItem(storageKey);
      setProgress(null);
      setMockAttemptId(null);
    },
    [storageKey],
  );

  const refresh = useCallback(async () => {
    try {
      const session = await fetchMockSessionDeduped(mockTestId);
      applySession(session);
    } catch {
      /* keep existing state */
    }
  }, [mockTestId, applySession]);

  useEffect(() => {
    if (initial !== undefined) {
      applySession(initial);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        const session = await fetchMockSessionDeduped(mockTestId);
        if (cancelled) return;
        applySession(session);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Could not load mock session.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void init();
    return () => {
      cancelled = true;
    };
  }, [mockTestId, initial, applySession]);

  const start = useCallback(
    async (forceNew = false): Promise<StartMockResponse> => {
      setBusy(true);
      setError(null);
      try {
        const res = await mockApi.start(mockTestId, forceNew);
        sessionStorage.setItem(storageKey, res.mock_attempt_id);
        const session = await fetchMockSessionDeduped(mockTestId);
        applySession(session);
        return res;
      } catch (e) {
        const raw =
          e instanceof Error ? e.message : "Could not start mock.";
        const msg = formatMockStartError(raw);
        setError(msg);
        throw e;
      } finally {
        setBusy(false);
      }
    },
    [mockTestId, storageKey, applySession],
  );

  const resume = useCallback(async (): Promise<StartMockResponse> => {
    const id =
      mockAttemptId ?? sessionStorage.getItem(storageKey);
    if (!id) {
      throw new Error("No mock attempt to resume.");
    }
    setBusy(true);
    setError(null);
    try {
      const res = await mockApi.resume(id);
      const session = await fetchMockSessionDeduped(mockTestId);
      applySession(session);
      return res;
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Could not resume mock.";
      setError(msg);
      throw e;
    } finally {
      setBusy(false);
    }
  }, [mockAttemptId, storageKey, mockTestId, applySession]);

  const clearSession = useCallback(() => {
    sessionStorage.removeItem(storageKey);
    setMockAttemptId(null);
    setProgress(null);
  }, [storageKey]);

  return {
    mockAttemptId,
    progress,
    loading,
    busy,
    error,
    start,
    resume,
    refresh,
    clearSession,
  };
}
