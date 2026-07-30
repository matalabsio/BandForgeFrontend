"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  mockApiId,
  mockTestNumberPath,
  testNumberForMockId,
} from "@/lib/mock-catalog";
import {
  persistMockAttemptId,
  readMockAttemptId,
} from "@/lib/exam-session-storage";
import { navigateFromProgress } from "@/lib/mock-exam-nav";
import { fetchMockSessionDeduped } from "@/modules/mock/lib/mock-session-fetch";
import { mockApi } from "@/modules/mock/services/mock-api";
import type { MockAttemptSummary } from "@/modules/mock/services/mock-api";
import { MockResults } from "@/modules/mock/components/mock-results";

type Props = {
  mockSlug: string;
  testNumber?: number;
  initialSummary: MockAttemptSummary | null;
};

type GatePhase = "loading" | "ready" | "in_progress" | "missing";

function MockResultsGateInner({ mockSlug, testNumber, initialSummary }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mockTestId = mockApiId(mockSlug);
  const resolvedTestNumber = testNumber ?? testNumberForMockId(mockTestId);
  const urlParam = searchParams.get("mock_attempt");
  const [mockAttemptId, setMockAttemptId] = useState<string | null>(null);
  const [phase, setPhase] = useState<GatePhase>("loading");
  const [resumeModule, setResumeModule] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const resolve = async () => {
      setPhase("loading");

      let attemptId = urlParam ?? readMockAttemptId(mockTestId);

      if (!attemptId) {
        try {
          const session = await fetchMockSessionDeduped(mockTestId);
          if (cancelled) return;
          if (session?.mock_attempt_id) {
            attemptId = session.mock_attempt_id;
          }
        } catch {
          /* fall through */
        }
      }

      if (!attemptId) {
        setMockAttemptId(null);
        setPhase("missing");
        return;
      }

      persistMockAttemptId(mockTestId, attemptId);
      setMockAttemptId(attemptId);

      try {
        const progress = await mockApi.progress(attemptId);
        if (cancelled) return;
        if (progress.status === "completed") {
          setPhase("ready");
          return;
        }
        setResumeModule(progress.next_module ?? progress.current_module ?? null);
        setPhase("in_progress");
      } catch {
        if (!cancelled) {
          setPhase("ready");
        }
      }
    };

    void resolve();
    return () => {
      cancelled = true;
    };
  }, [urlParam, mockTestId]);

  if (phase === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8 text-sm text-ink/60">
        Loading results…
      </div>
    );
  }

  if (phase === "missing") {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-display text-lg font-bold text-navy">No results yet</p>
        <p className="text-sm leading-relaxed text-ink/65">
          Start or resume Test {resolvedTestNumber} from the hub. Final results appear
          after you finish every module.
        </p>
        <Link
          href={mockTestNumberPath(resolvedTestNumber)}
          className="rounded-xl bg-navy px-5 py-3 text-sm font-semibold text-white hover:bg-navy/90"
        >
          Go to Test {resolvedTestNumber}
        </Link>
      </div>
    );
  }

  if (phase === "in_progress" && mockAttemptId) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-display text-lg font-bold text-navy">Mock not finished</p>
        <p className="text-sm leading-relaxed text-ink/65">
          Final band results are available after you complete all modules
          {resumeModule ? ` — you are on ${resumeModule}.` : "."}
        </p>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => {
              void mockApi.progress(mockAttemptId).then((progress) => {
                navigateFromProgress(
                  router,
                  mockSlug,
                  mockAttemptId,
                  {
                    status: progress.status,
                    next_module: progress.next_module,
                    next_part: progress.next_part,
                  },
                  undefined,
                  { testNumber: resolvedTestNumber },
                );
              });
            }}
            className="rounded-xl bg-navy px-5 py-3 text-sm font-semibold text-white hover:bg-navy/90"
          >
            Resume test
          </button>
          <Link
            href={mockTestNumberPath(resolvedTestNumber)}
            className="rounded-xl border border-border bg-white px-5 py-3 text-sm font-semibold text-navy hover:bg-surface"
          >
            Test hub
          </Link>
        </div>
      </div>
    );
  }

  if (!mockAttemptId) {
    return null;
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
        <div className="flex min-h-[50vh] items-center justify-center p-8 text-sm text-ink/60">
          Loading results…
        </div>
      }
    >
      <MockResultsGateInner {...props} />
    </Suspense>
  );
}
