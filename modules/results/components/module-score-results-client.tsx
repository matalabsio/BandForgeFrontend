"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  persistModuleResultAttempt,
  readModuleResultAttempt,
} from "@/lib/exam-session-storage";
import type { ResultModule } from "@/lib/exam-session-storage";
import { listeningTestHubPath } from "@/lib/listening-test";
import { readingTestHubPath } from "@/lib/reading-test";
import {
  type PlanResultContext,
} from "@/lib/plan-day-tasks";
import { ApiError } from "@/lib/api";
import { listeningApi } from "@/modules/listening/services/listening-api";
import type { ListeningScoreReport } from "@/modules/listening/types";
import { readingApi } from "@/modules/reading/services/reading-api";
import type { ReadingScoreReport } from "@/modules/reading/types";
import { PracticeSectionResultsClient } from "@/modules/results/components/practice-section-results-client";
import { SectionResultsShell } from "@/modules/shared/components/section-results";
import { usePlanResultsNav } from "@/components/bandforge/plan/plan-results-cta-bar";

type Props = {
  testNumber: number;
  module: "listening" | "reading";
  targetBand: number | null;
  attemptFromQuery?: string;
  plan?: PlanResultContext | null;
};

function hubPath(module: ResultModule): string {
  if (module === "reading") return readingTestHubPath();
  return listeningTestHubPath();
}

export function ModuleScoreResultsClient({
  testNumber,
  module,
  targetBand: _targetBand,
  attemptFromQuery,
  plan = null,
}: Props) {
  const planNav = usePlanResultsNav(plan);
  const queryAttempt = attemptFromQuery?.trim() || null;
  const [attemptId, setAttemptId] = useState<string | null>(queryAttempt);
  const [report, setReport] = useState<
    ListeningScoreReport | ReadingScoreReport | null
  >(null);
  const [status, setStatus] = useState(0);
  const [loading, setLoading] = useState(Boolean(queryAttempt));

  useEffect(() => {
    const fromSession = readModuleResultAttempt(testNumber, module);
    const next = queryAttempt || fromSession;
    setAttemptId(next);
  }, [queryAttempt, testNumber, module]);

  useEffect(() => {
    if (attemptId) {
      persistModuleResultAttempt(testNumber, module, attemptId);
    }
  }, [attemptId, testNumber, module]);

  useEffect(() => {
    if (!attemptId) {
      setReport(null);
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
            ? await listeningApi.scoreReport(attemptId)
            : await readingApi.scoreReport(attemptId);
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
  }, [attemptId, module]);

  const moduleLabel = module === "listening" ? "Listening" : "Reading";
  const practiceHref = planNav?.todayHref ?? hubPath(module);
  const fallbackHref = hubPath(module);

  if (loading) {
    return (
      <SectionResultsShell centered scrollResetKey="loading">
        <p className="font-display text-base font-bold text-navy">
          Loading your {moduleLabel.toLowerCase()} result…
        </p>
      </SectionResultsShell>
    );
  }

  if (!attemptId) {
    return (
      <SectionResultsShell centered scrollResetKey="missing-attempt">
        <p className="max-w-sm text-center text-sm text-muted">
          Open this result from your dashboard or right after you finish a test.
        </p>
        <Link
          href={practiceHref}
          className="mt-4 text-sm font-semibold text-cyan"
        >
          {planNav ? "Back to Today's plan" : `Back to ${moduleLabel}`}
        </Link>
      </SectionResultsShell>
    );
  }

  if (!report || !report.questions?.length) {
    return (
      <SectionResultsShell centered scrollResetKey={`error-${status}`}>
        <p className="max-w-sm text-center text-sm text-muted">
          {status === 404
            ? "This attempt has not been scored yet."
            : "Could not load score report. Please try again."}
        </p>
        <Link href={practiceHref} className="mt-4 text-sm font-semibold text-cyan">
          {planNav ? "Back to Today's plan" : `Back to ${moduleLabel}`}
        </Link>
      </SectionResultsShell>
    );
  }

  const title = `${moduleLabel} practice`;
  const subtitle = `${report.total_questions} questions · ${moduleLabel}`;

  return (
    <PracticeSectionResultsClient
      module={module}
      title={title}
      subtitle={subtitle}
      rawScore={report.raw_score}
      total={report.total_questions}
      questions={report.questions}
      backHref={planNav?.hasPrevious ? planNav.previousHref : practiceHref}
      primaryHref={planNav?.continueHref ?? fallbackHref}
      primaryLabel={
        planNav?.continueLabel ?? `Back to ${moduleLabel}`
      }
      primaryLoading={Boolean(planNav && !planNav.ready)}
      secondaryLabel={
        planNav?.showSecondaryBack ? "Back to Today's plan" : undefined
      }
      secondaryHref={planNav?.showSecondaryBack ? planNav.todayHref : undefined}
      planMode={Boolean(planNav)}
      showBandNotice={false}
    />
  );
}
