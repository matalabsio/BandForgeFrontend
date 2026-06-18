"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BfScoreReportShell } from "@/components/bandforge/bf-score-report-shell";
import { readModuleResultAttempt } from "@/lib/exam-session-storage";
import type { ResultModule } from "@/lib/exam-session-storage";
import { listeningTestHubPath } from "@/lib/listening-test";
import { readingTestHubPath } from "@/lib/reading-test";
import { ApiError } from "@/lib/api";
import { listeningApi } from "@/modules/listening/services/listening-api";
import { ListeningResultsView } from "@/modules/listening/components/listening-results-view";
import type { ListeningScoreReport } from "@/modules/listening/types";
import { readingApi } from "@/modules/reading/services/reading-api";
import type { ReadingScoreReport } from "@/modules/reading/types";

type Props = {
  testNumber: number;
  module: "listening" | "reading";
  targetBand: number | null;
};

function hubPath(module: ResultModule): string {
  if (module === "reading") return readingTestHubPath();
  return listeningTestHubPath();
}

export function ModuleScoreResultsClient({
  testNumber,
  module,
  targetBand,
}: Props) {
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [report, setReport] = useState<
    ListeningScoreReport | ReadingScoreReport | null
  >(null);
  const [status, setStatus] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = readModuleResultAttempt(testNumber, module);
    setAttemptId(stored);
    if (!stored) {
      setLoading(false);
      setStatus(404);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data =
          module === "listening"
            ? await listeningApi.scoreReport(stored)
            : await readingApi.scoreReport(stored);
        if (cancelled) return;
        setReport(data);
        setStatus(200);
      } catch (e) {
        if (cancelled) return;
        setReport(null);
        setStatus(e instanceof ApiError ? e.status : 500);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [testNumber, module]);

  const moduleLabel = module === "listening" ? "Listening" : "Reading";
  const practiceHref = hubPath(module);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-8 text-sm text-ink/60">
        Loading your {moduleLabel.toLowerCase()} result…
      </div>
    );
  }

  if (!attemptId) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-surface p-8 text-center">
        <p className="text-[14px] text-ink/70">
          Open this result from your dashboard or right after you finish a test.
        </p>
        <Link
          href={practiceHref}
          className="mt-4 inline-flex min-h-[44px] items-center text-cyan font-semibold"
        >
          Back to {moduleLabel}
        </Link>
      </div>
    );
  }

  return (
    <BfScoreReportShell
      module={moduleLabel}
      band={report?.band ?? 0}
      targetBand={targetBand}
      practiceHref={practiceHref}
      nextTestHref={practiceHref}
      testsSubtitle={report?.test_title ?? undefined}
    >
      <ListeningResultsView
        attemptId={attemptId}
        report={report}
        status={status}
        backHref={practiceHref}
        retakeHref={practiceHref}
        scoresHref="/scores"
        scoresLabel="View performance"
      />
    </BfScoreReportShell>
  );
}
