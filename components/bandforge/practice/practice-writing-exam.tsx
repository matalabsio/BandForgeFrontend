"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { bankExerciseWritingPrompt } from "@/lib/bank-exercise-to-exam";
import type { BankExerciseStart } from "@/lib/practice-api";
import {
  estimateWritingBand,
  writingMinWords,
} from "@/lib/writing-test";
import { useListeningTimer } from "@/modules/shared";
import { WritingExamWorkspace } from "@/modules/writing/components/writing-exam-workspace";
import { WritingTask1Prompt } from "@/modules/writing/components/writing-task1-prompt";
import type { WritingTask, WritingTaskOptions } from "@/modules/writing/types";

type Props = {
  exercise: BankExerciseStart;
  hubHref: string;
  busy: boolean;
  error: string | null;
  onSubmit: (answers: Record<string, string>) => void;
};

function durationSecondsForPart(part: 1 | 2): number {
  return part === 1 ? 20 * 60 : 40 * 60;
}

function optionRecord(raw: unknown): WritingTaskOptions {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as WritingTaskOptions;
}

export function PracticeWritingExam({
  exercise,
  busy,
  error,
  onSubmit,
}: Props) {
  const meta = useMemo(() => bankExerciseWritingPrompt(exercise), [exercise]);
  const durationSeconds = durationSecondsForPart(meta.part);
  const [essay, setEssay] = useState("");
  const [startedAtIso, setStartedAtIso] = useState<string | null>(null);
  const submittedRef = useRef(false);
  const essayRef = useRef("");
  const minWords = writingMinWords(meta.part);
  const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;
  const firstQ = exercise.section.questions[0];
  const qid = firstQ?.id ?? "writing";

  const task1 = useMemo((): WritingTask | null => {
    if (meta.part !== 1) return null;
    const opts = optionRecord(firstQ?.options);
    return {
      id: qid,
      question_number: firstQ?.question_number ?? 1,
      question_type: firstQ?.question_type ?? "task1_academic",
      prompt: meta.prompt,
      part: 1,
      options: {
        ...opts,
        image_url: meta.imageUrl ?? opts.image_url ?? null,
        title: opts.title ?? meta.title,
      },
    };
  }, [firstQ, meta.imageUrl, meta.part, meta.prompt, meta.title, qid]);

  useEffect(() => {
    if (startedAtIso) return;
    setStartedAtIso(new Date().toISOString());
  }, [startedAtIso]);

  useEffect(() => {
    essayRef.current = essay;
  }, [essay]);

  useEffect(() => {
    if (!busy) {
      submittedRef.current = false;
    }
  }, [busy]);

  const handleTimerExpire = useCallback(() => {
    if (submittedRef.current || busy) return;
    submittedRef.current = true;
    onSubmit({ [qid]: essayRef.current });
  }, [busy, onSubmit, qid]);

  const remaining = useListeningTimer({
    startedAtIso,
    serverTimeIso: startedAtIso,
    durationSeconds,
    active: Boolean(startedAtIso),
    onExpire: handleTimerExpire,
  });

  const handleSubmit = useCallback(() => {
    if (busy) return;
    onSubmit({ [qid]: essayRef.current });
  }, [busy, onSubmit, qid]);

  return (
    <div className="fixed inset-0 z-40">
      <WritingExamWorkspace
        activePart={meta.part}
        isMock={false}
        displayLabel={meta.title}
        remainingSeconds={remaining}
        durationSeconds={durationSeconds}
        wordCount={wordCount}
        minWords={minWords}
        estimatedBand={estimateWritingBand(wordCount, meta.part)}
        saved
        busy={busy}
        submitLabel="Submit"
        error={error}
        plainHeader
        prompt={
          task1 ? (
            <WritingTask1Prompt task={task1} plainHeader />
          ) : (
            <div className="space-y-4 text-[15px] leading-relaxed text-ink">
              <p className="whitespace-pre-wrap">{meta.prompt}</p>
              {meta.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={meta.imageUrl}
                  alt="Writing task visual"
                  className="max-h-80 w-full rounded-lg border border-border-soft object-contain"
                />
              ) : null}
            </div>
          )
        }
        essay={essay}
        onEssayChange={setEssay}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
