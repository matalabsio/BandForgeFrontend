import type { MockAttemptProgress } from "@/modules/mock/services/mock-api";
import { mockApi } from "@/modules/mock/services/mock-api";

const inflight = new Map<string, Promise<MockAttemptProgress | null>>();

/** Dedupe concurrent /session fetches across dashboard, hub, writing hub. */
export function fetchMockSessionDeduped(
  mockTestId: string,
): Promise<MockAttemptProgress | null> {
  const existing = inflight.get(mockTestId);
  if (existing) return existing;

  const promise = mockApi.session(mockTestId).finally(() => {
    inflight.delete(mockTestId);
  });
  inflight.set(mockTestId, promise);
  return promise;
}
