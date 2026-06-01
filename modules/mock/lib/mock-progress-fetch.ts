import type { MockAttemptProgress } from "@/modules/mock/services/mock-api";
import { mockApi } from "@/modules/mock/services/mock-api";

const inflight = new Map<string, Promise<MockAttemptProgress>>();

/** Dedupe concurrent progress GETs across mock guards (incl. Strict Mode). */
export function fetchMockProgressDeduped(
  mockAttemptId: string,
): Promise<MockAttemptProgress> {
  const existing = inflight.get(mockAttemptId);
  if (existing) return existing;

  const promise = mockApi.progress(mockAttemptId).finally(() => {
    inflight.delete(mockAttemptId);
  });
  inflight.set(mockAttemptId, promise);
  return promise;
}
