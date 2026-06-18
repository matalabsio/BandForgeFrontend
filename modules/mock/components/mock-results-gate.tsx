"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { mockApiId, mockHubPath } from "@/lib/mock-catalog";
import {
  persistMockAttemptId,
  readMockAttemptId,
} from "@/lib/exam-session-storage";
import type { MockAttemptSummary } from "@/modules/mock/services/mock-api";
import { MockResults } from "@/modules/mock/components/mock-results";

type Props = {
  mockSlug: string;
  initialSummary: MockAttemptSummary | null;
};

function MockResultsGateInner({ mockSlug, initialSummary }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mockTestId = mockApiId(mockSlug);
  const urlParam = searchParams.get("mock_attempt");
  const [mockAttemptId, setMockAttemptId] = useState<string | null>(
    urlParam ?? null,
  );

  useEffect(() => {
    if (urlParam) {
      persistMockAttemptId(mockTestId, urlParam);
      setMockAttemptId(urlParam);
      const url = new URL(window.location.href);
      if (url.searchParams.has("mock_attempt")) {
        url.searchParams.delete("mock_attempt");
        window.history.replaceState(null, "", url.pathname);
      }
      return;
    }
    const stored = readMockAttemptId(mockTestId);
    setMockAttemptId(stored);
  }, [urlParam, mockTestId]);

  useEffect(() => {
    if (mockAttemptId === null && urlParam === null) {
      const stored = readMockAttemptId(mockTestId);
      if (!stored) {
        router.replace(mockHubPath(mockSlug));
      }
    }
  }, [mockAttemptId, urlParam, mockTestId, mockSlug, router]);

  if (!mockAttemptId) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-8 text-sm text-ink/60">
        Loading results…
      </div>
    );
  }

  return (
    <MockResults
      key={mockAttemptId}
      mockSlug={mockSlug}
      mockAttemptId={mockAttemptId}
      initialSummary={initialSummary}
    />
  );
}

export function MockResultsGate(props: Props) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center p-8 text-sm text-ink/60">
          Loading results…
        </div>
      }
    >
      <MockResultsGateInner {...props} />
    </Suspense>
  );
}
