"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readModuleResultAttempt } from "@/lib/exam-session-storage";
import type { ResultModule } from "@/lib/exam-session-storage";
import { listeningTestHubPath } from "@/lib/listening-test";
import { readingTestHubPath } from "@/lib/reading-test";
import { ApiError } from "@/lib/api";
import { listeningApi } from "@/modules/listening/services/listening-api";
import type { ListeningScoreReport } from "@/modules/listening/types";
import { readingApi } from "@/modules/reading/services/reading-api";
import type { ReadingScoreReport } from "@/modules/reading/types";
import { PracticeSectionResultsClient } from "@/modules/results/components/practice-section-results-client";
import { SectionResultsShell } from "@/modules/shared/components/section-results";

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
  targetBand: _targetBand,
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
      <SectionResultsShell centered>
        <p className="font-display text-base font-bold text-navy">
          Loading your {moduleLabel.toLowerCase()} result…
        </p>
      </SectionResultsShell>
    );
  }

  if (!attemptId) {
    return (
      <SectionResultsShell centered>
        <p className="max-w-sm text-center text-sm text-muted">
          Open this result from your dashboard or right after you finish a test.
        </p>
        <Link
          href={practiceHref}
          className="mt-4 text-sm font-semibold text-cyan"
        >
          Back to {moduleLabel}
        </Link>
      </SectionResultsShell>
    );
  }

  if (!report || !report.questions?.length) {
    return (
      <SectionResultsShell centered>
        <p className="max-w-sm text-center text-sm text-muted">
          {status === 404
            ? "This attempt has not been scored yet."
            : "Could not load score report. Please try again."}
        </p>
        <Link href={practiceHref} className="mt-4 text-sm font-semibold text-cyan">
          Back to {moduleLabel}
        </Link>
      </SectionResultsShell>
    );
  }

  const title =
    report.test_title?.trim() ||
    (module === "listening" ? "Listening" : "Reading");
  const subtitle = `${report.total_questions} questions · ${moduleLabel} practice`;

  return (
    <PracticeSectionResultsClient
      module={module}
      title={title}
      subtitle={subtitle}
      rawScore={report.raw_score}
      total={report.total_questions}
      questions={report.questions}
      backHref={practiceHref}
      primaryHref={practiceHref}
      primaryLabel={`Back to ${moduleLabel}`}
      showBandNotice={false}
    />
  );
}
