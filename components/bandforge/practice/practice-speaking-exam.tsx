"use client";

import { useMemo, useState } from "react";
import { IeltsExamToolbar } from "@/components/exam/ielts-exam-toolbar";
import { IELTS_EXAM_VARS } from "@/components/exam/ielts-exam-theme";
import { bankExerciseSpeakingPrompts } from "@/lib/bank-exercise-to-exam";
import type { BankExerciseStart } from "@/lib/practice-api";

type Props = {
  exercise: BankExerciseStart;
  hubHref: string;
  hubLabel: string;
  busy: boolean;
  error: string | null;
  onSubmit: (answers: Record<string, string>) => void;
};

export function PracticeSpeakingExam({
  exercise,
  hubHref,
  hubLabel,
  busy,
  error,
  onSubmit,
}: Props) {
  const prompts = useMemo(
    () => bankExerciseSpeakingPrompts(exercise),
    [exercise],
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const answeredCount = prompts.filter((p) =>
    (answers[p.id] ?? "").trim(),
  ).length;

  return (
    <div
      className="ielts-exam-theme fixed inset-0 z-40 flex flex-col overflow-hidden bg-[var(--exam-surface)] text-[var(--exam-ink)]"
      style={IELTS_EXAM_VARS}
    >
      <IeltsExamToolbar
        moduleName="Speaking"
        stageLabel={`Part ${exercise.part}`}
        testTitle={exercise.section.title?.trim() || "Speaking practice"}
        hubHref={hubHref}
        hubLabel={hubLabel}
        remainingSeconds={10 * 60}
        timerActive={false}
        answeredCount={answeredCount}
        totalQuestions={prompts.length}
        busy={busy}
        plainHeader
        onSubmit={() => onSubmit(answers)}
      />
      {error ? (
        <p
          className="shrink-0 border-b border-red-200 bg-red-50 px-4 py-2 text-center text-[13px] text-red-700"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8">
        <ol className="mx-auto max-w-2xl space-y-6">
          {prompts.map((p) => (
            <li
              key={p.id}
              className="rounded-xl border border-[var(--exam-border)] bg-[var(--exam-paper)] p-5"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--exam-ink-muted)]">
                Question {p.number}
              </p>
              <p className="mt-2 text-[15px] font-medium leading-relaxed">
                {p.prompt}
              </p>
              <textarea
                className="mt-4 min-h-28 w-full rounded-lg border border-[var(--exam-border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--exam-accent)]"
                placeholder="Notes or spoken-response script…"
                value={answers[p.id] ?? ""}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [p.id]: e.target.value }))
                }
              />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
