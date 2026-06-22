"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SkillBar } from "@/components/scores/skill-bar";
import { mockHubPath, mockModulePath } from "@/lib/mock-catalog";
import { navigateToExamPath } from "@/lib/mock-exam-nav";
import { scoresAfterMockCompletePath } from "@/lib/scores-path";
import {
  clearCheckpointSubmit,
  readCheckpointSubmit,
  type CheckpointSubmitCache,
} from "@/lib/mock-checkpoint-cache";
import {
  mockApi,
  type MockCheckpointResponse,
} from "@/modules/mock/services/mock-api";
import { Test1FlowStepper } from "@/modules/mock/components/test1-flow-stepper";

type Props = {
  mockSlug: string;
  mockAttemptId: string;
  attemptId: string;
  from?: "reading" | "listening";
};

function bandLabel(band: number | null | undefined): string {
  if (band == null || band <= 0) return "—";
  return band.toFixed(1);
}

function continueLabel(data: MockCheckpointResponse): string | null {
  if (data.status === "completed") {
    return "View performance";
  }
  const mod = data.next_module;
  if (!mod) return null;
  if (mod === "reading") {
    return "Continue to Reading";
  }
  if (mod === "listening") {
    return "Continue to Listening";
  }
  return "Continue";
}

function MockCheckpointBody({ mockSlug, mockAttemptId, attemptId, from }: Props) {
  const { push, replace } = useRouter();
  const initialCache = readCheckpointSubmit(attemptId);
  const [loading, setLoading] = useState(!initialCache);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MockCheckpointResponse | null>(null);
  const [cached, setCached] = useState<CheckpointSubmitCache | null>(initialCache);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const checkpoint = await mockApi.checkpoint(mockAttemptId, attemptId);
        if (cancelled) return;
        setData(checkpoint);
        clearCheckpointSubmit(attemptId);
      } catch (e) {
        if (cancelled) return;
        if (!initialCache) {
          setError(e instanceof Error ? e.message : "Could not load results.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mockAttemptId, attemptId]);

  const display = data ?? (cached
    ? {
        band: cached.band,
        raw_score: cached.raw_score,
        total_questions: cached.total_questions,
        skill_breakdown: cached.skill_breakdown,
        status: "in_progress",
        next_module: null,
        next_part: null,
        reading_band: null,
        listening_band: null,
        modules: [],
        attempt_id: attemptId,
      }
    : null);

  const onContinue = () => {
    if (!data) return;
    if (data.status === "completed") {
      replace(scoresAfterMockCompletePath(attemptId));
      return;
    }
    const mod = data.next_module;
    if (!mod || (mod !== "reading" && mod !== "listening")) return;
    navigateToExamPath(
      { push, replace },
      mockSlug,
      mockModulePath(mockSlug, mod, {
        part: data.next_part ?? 1,
        passage: data.next_part ?? 1,
      }),
      { mockAttemptId, auto: true, sectionStart: true },
    );
  };

  const sectionBand = display?.band;
  const sectionRaw = display?.raw_score;
  const sectionTotal = display?.total_questions;
  const breakdown = display?.skill_breakdown;

  const readingModuleDone =
    data?.modules.find((m) => m.module === "reading")?.status === "completed";
  const listeningModuleDone =
    data?.modules.find((m) => m.module === "listening")?.status === "completed";

  const showLoading = loading && !display;

  return (
    <div className="px-4 py-8 sm:px-6 sm:py-10">
      <div className="bf-dash-enter mx-auto max-w-2xl">
        {showLoading ? (
          <p className="text-[14px] text-[var(--exam-ink-muted)]">Loading your score…</p>
        ) : error && !display ? (
          <p className="text-[14px] text-red-600" role="alert">
            {error}
          </p>
        ) : display ? (
          <>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--exam-accent)]">
              Section complete
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold text-[var(--exam-ink)]">
              {from === "listening" ? "Listening" : "Reading"}: Band {bandLabel(sectionBand)}
            </h1>
            <p className="mt-2 text-[14px] text-[var(--exam-ink-muted)]">
              {sectionRaw != null && sectionTotal != null
                ? `${sectionRaw} / ${sectionTotal} correct`
                : null}
            </p>

            {data?.modules && data.modules.length > 0 ? (
              <section className="mt-6">
                <h2 className="text-[13px] font-bold uppercase tracking-wide text-[var(--exam-ink-muted)]">
                  Progress
                </h2>
                <div className="mt-3">
                  <Test1FlowStepper
                    mockSlug={mockSlug}
                    modules={data.modules}
                    mockAttemptId={mockAttemptId}
                    mockStatus={data.status}
                  />
                </div>
              </section>
            ) : null}

            {breakdown && Object.keys(breakdown).length > 0 ? (
              <section className="mt-6 rounded-xl border border-[var(--exam-border)] bg-white p-5">
                <h2 className="text-[13px] font-bold uppercase tracking-wide text-[var(--exam-ink-muted)]">
                  Skill breakdown
                </h2>
                <ul className="mt-4 space-y-3">
                  {Object.entries(breakdown).map(([skill, row]) => (
                    <SkillBar key={skill} skill={skill} entry={row} />
                  ))}
                </ul>
              </section>
            ) : null}

            {(readingModuleDone && data?.reading_band != null) ||
            (listeningModuleDone && data?.listening_band != null) ? (
              <section className="mt-6 rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-5">
                <h2 className="text-[13px] font-bold uppercase tracking-wide text-emerald-800">
                  Module summary
                </h2>
                <ul className="mt-3 space-y-2 text-[14px] text-emerald-900">
                  {readingModuleDone && data?.reading_band != null ? (
                    <li>
                      Reading overall: Band {bandLabel(data.reading_band)}
                    </li>
                  ) : null}
                  {listeningModuleDone && data?.listening_band != null ? (
                    <li>
                      Listening overall: Band {bandLabel(data.listening_band)}
                    </li>
                  ) : null}
                </ul>
              </section>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-3">
              {data && continueLabel(data) ? (
                <button
                  type="button"
                  onClick={onContinue}
                  className="cursor-pointer rounded-xl bg-[var(--exam-accent)] px-5 py-2.5 text-[14px] font-bold text-white hover:bg-cyan"
                >
                  {continueLabel(data)}
                </button>
              ) : null}
              <Link
                href={mockHubPath(mockSlug, mockAttemptId)}
                className="inline-flex min-h-[44px] cursor-pointer items-center rounded-xl border border-[var(--exam-border)] px-4 py-2.5 text-[13px] font-semibold text-[var(--exam-ink-muted)]"
              >
                Back to mock hub
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export function MockCheckpoint(props: Props) {
  return (
    <MockCheckpointBody
      key={`${props.mockAttemptId}-${props.attemptId}`}
      {...props}
    />
  );
}
