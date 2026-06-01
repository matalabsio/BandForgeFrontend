"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MOCK_DISPLAY_LABEL,
  mockApiId,
  mockCheckpointPath,
  mockHubPath,
} from "@/lib/mock-catalog";
import { navigateAfterMockStart } from "@/lib/mock-exam-nav";
import { formatMockStartError } from "@/lib/api";
import { mockAttemptStorageKey } from "@/modules/mock/lib/mock-session-storage";
import { listeningModuleResultsPath } from "@/lib/listening-test";
import { readingModuleResultsPath } from "@/lib/reading-test";
import { MockAttemptHistory } from "@/modules/mock/components/mock-attempt-history";
import {
  mockApi,
  type MockAttemptSummary,
} from "@/modules/mock/services/mock-api";
import { Test1FlowStepper } from "@/modules/mock/components/test1-flow-stepper";

type Props = {
  mockSlug: string;
  mockAttemptId: string;
  initialSummary?: MockAttemptSummary | null;
};

function bandLabel(band: number | null | undefined): string {
  if (band == null || band <= 0) return "—";
  return band.toFixed(1);
}

function MockResultsBody({
  mockSlug,
  mockAttemptId,
  initialSummary = null,
}: Props) {
  const { push, replace } = useRouter();
  const mockTestId = mockApiId(mockSlug);
  const storageKey = mockAttemptStorageKey(mockTestId);
  const [loading, setLoading] = useState(!initialSummary);
  const [summary, setSummary] = useState<MockAttemptSummary | null>(
    initialSummary,
  );
  const [error, setError] = useState<string | null>(null);
  const [retestBusy, setRetestBusy] = useState(false);
  const [retestError, setRetestError] = useState<string | null>(null);

  const startRetest = async () => {
    setRetestBusy(true);
    setRetestError(null);
    try {
      const res = await mockApi.start(mockTestId, true);
      sessionStorage.setItem(storageKey, res.mock_attempt_id);
      navigateAfterMockStart({ push, replace }, mockSlug, res);
    } catch (e) {
      const raw = e instanceof Error ? e.message : "Could not start a new attempt.";
      setRetestError(formatMockStartError(raw));
    } finally {
      setRetestBusy(false);
    }
  };

  useEffect(() => {
    if (initialSummary) return;
    setLoading(true);
    setError(null);
    void mockApi
      .summary(mockAttemptId)
      .then((s) => {
        setSummary(s);
        setLoading(false);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Could not load mock results.");
        setLoading(false);
      });
  }, [mockAttemptId, initialSummary]);

  return (
    <div className="px-4 py-8 sm:px-6 sm:py-10">
      <div className="bf-dash-enter mx-auto max-w-2xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--exam-accent)]">
          Report card
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold text-[var(--exam-ink)]">
          {MOCK_DISPLAY_LABEL}: Results
        </h1>

        {loading ? (
          <p className="mt-4 text-[14px] text-[var(--exam-ink-muted)]">Loading…</p>
        ) : error ? (
          <p className="mt-4 text-[14px] text-red-600" role="alert">
            {error}
          </p>
        ) : summary ? (
          <>
            <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--exam-border)] bg-gradient-to-br from-[var(--exam-bar)] to-[#1e293b] p-6 text-white shadow-md">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">
                Overall band
              </p>
              <p className="mt-2 font-display text-5xl font-bold tabular-nums">
                {bandLabel(summary.aggregate_band)}
              </p>
              <p className="mt-2 text-[13px] text-white/75">
                Average of Listening, Reading, and Writing bands
              </p>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-[var(--exam-border)] bg-white p-5 shadow-sm">
                <p className="text-[11px] font-bold uppercase text-[var(--exam-ink-muted)]">
                  Listening
                </p>
                <p className="mt-1 font-display text-3xl font-bold text-[var(--exam-ink)]">
                  {bandLabel(summary.listening_band)}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--exam-border)] bg-white p-5 shadow-sm">
                <p className="text-[11px] font-bold uppercase text-[var(--exam-ink-muted)]">
                  Reading
                </p>
                <p className="mt-1 font-display text-3xl font-bold text-[var(--exam-ink)]">
                  {bandLabel(summary.reading_band)}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--exam-border)] bg-white p-5 shadow-sm">
                <p className="text-[11px] font-bold uppercase text-[var(--exam-ink-muted)]">
                  Writing
                </p>
                {summary.writing_band != null ? (
                  <>
                    <p className="mt-1 font-display text-3xl font-bold text-[var(--exam-ink)]">
                      {bandLabel(summary.writing_band)}
                    </p>
                    <p className="mt-1 text-[12px] text-[var(--exam-ink-muted)]">
                      Word-count estimate
                    </p>
                  </>
                ) : (
                  <p className="mt-1 text-[14px] font-medium text-[var(--exam-ink)]">
                    {summary.modules.find((m) => m.module === "writing")?.status ===
                    "completed"
                      ? "Submitted"
                      : "Not completed"}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6">
              {retestError ? (
                <p
                  className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-800"
                  role="alert"
                >
                  {retestError}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={retestBusy}
                  onClick={() => void startRetest()}
                  className="cursor-pointer rounded-xl bg-[var(--exam-accent)] px-5 py-2.5 text-[14px] font-bold text-white hover:bg-[#0891B2] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {retestBusy ? "Starting…" : `Retake ${MOCK_DISPLAY_LABEL}`}
                </button>
                <Link
                  href={mockHubPath(mockSlug)}
                  className="inline-flex items-center rounded-xl border border-[var(--exam-border)] px-5 py-2.5 text-[14px] font-semibold text-[var(--exam-ink-muted)] hover:border-[var(--exam-ink-muted)]"
                >
                  Back to hub
                </Link>
              </div>
              <p className="mt-2 text-[12px] text-[var(--exam-ink-muted)]">
                Retaking starts a new run. This report stays saved in past attempts.
              </p>
            </div>

            <div className="mt-8">
              <h2 className="text-[13px] font-bold uppercase tracking-wide text-[var(--exam-ink-muted)]">
                Test journey
              </h2>
              <div className="mt-3">
                <Test1FlowStepper
                  mockSlug={mockSlug}
                  modules={summary.modules}
                  mockAttemptId={mockAttemptId}
                  mockStatus={summary.status}
                />
              </div>
            </div>

            {summary.sections.some(
              (s) =>
                s.module === "reading" ||
                s.module === "listening" ||
                s.module === "writing",
            ) ? (
              <section className="mt-8">
                <h2 className="text-[13px] font-bold uppercase tracking-wide text-[var(--exam-ink-muted)]">
                  Section breakdown
                </h2>
                <ul className="mt-3 space-y-3">
                  {summary.sections
                    .filter(
                      (s) =>
                        s.module === "reading" ||
                        s.module === "listening" ||
                        s.module === "writing",
                    )
                    .map((s) => {
                    const label =
                      s.module === "reading"
                        ? "Reading"
                        : s.module === "writing"
                          ? "Writing"
                          : "Listening";
                    const checkpointHref =
                      s.module === "reading" || s.module === "listening"
                        ? mockCheckpointPath(mockSlug, {
                            mockAttemptId,
                            attempt: s.test_attempt_id,
                            from: s.module as "reading" | "listening",
                          })
                        : null;
                    const detailHref =
                      s.module === "reading"
                        ? readingModuleResultsPath(mockTestId, s.test_attempt_id)
                        : s.module === "writing"
                          ? `/test/writing/results/${encodeURIComponent(s.test_attempt_id)}`
                          : listeningModuleResultsPath(mockTestId, s.test_attempt_id);
                    return (
                      <li
                        key={s.test_attempt_id}
                        className="rounded-xl border border-[var(--exam-border)] bg-white px-4 py-4 shadow-sm"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-[14px] font-bold text-[var(--exam-ink)]">
                              {label}
                            </p>
                            {s.module === "writing" && s.raw_score != null ? (
                              <p className="mt-0.5 text-[13px] text-[var(--exam-ink-muted)]">
                                {s.raw_score} words
                              </p>
                            ) : s.raw_score != null && s.total_questions != null ? (
                              <p className="mt-0.5 text-[13px] text-[var(--exam-ink-muted)]">
                                {s.raw_score} / {s.total_questions} correct
                              </p>
                            ) : null}
                          </div>
                          <p className="font-display text-2xl font-bold text-[var(--exam-accent)]">
                            {bandLabel(s.band)}
                          </p>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-3">
                          {checkpointHref ? (
                            <Link
                              href={checkpointHref}
                              className="text-[12px] font-semibold text-[var(--exam-accent)] hover:underline"
                            >
                              Section summary
                            </Link>
                          ) : null}
                          <Link
                            href={detailHref}
                            className="text-[12px] font-semibold text-[var(--exam-ink-muted)] hover:text-[var(--exam-ink)]"
                          >
                            {s.module === "writing" ? "View essay" : "Question review"}
                          </Link>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}

            <MockAttemptHistory
              mockSlug={mockSlug}
              mockTestId={mockTestId}
              currentMockAttemptId={mockAttemptId}
            />

          </>
        ) : null}
      </div>
    </div>
  );
}

export function MockResults(props: Props) {
  return <MockResultsBody key={props.mockAttemptId} {...props} />;
}
