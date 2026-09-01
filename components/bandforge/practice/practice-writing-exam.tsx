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
  const qid = exercise.section.questions[0]?.id ?? "writing";

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
        }
        essay={essay}
        onEssayChange={setEssay}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
