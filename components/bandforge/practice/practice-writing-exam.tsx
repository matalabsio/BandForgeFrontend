"use client";

import { useMemo, useState } from "react";
import { bankExerciseWritingPrompt } from "@/lib/bank-exercise-to-exam";
import type { BankExerciseStart } from "@/lib/practice-api";
import {
  estimateWritingBand,
  writingMinWords,
} from "@/lib/writing-test";
import { WritingExamWorkspace } from "@/modules/writing/components/writing-exam-workspace";

type Props = {
  exercise: BankExerciseStart;
  hubHref: string;
  busy: boolean;
  error: string | null;
  onSubmit: (answers: Record<string, string>) => void;
};

export function PracticeWritingExam({
  exercise,
  busy,
  error,
  onSubmit,
}: Props) {
  const meta = useMemo(() => bankExerciseWritingPrompt(exercise), [exercise]);
  const [essay, setEssay] = useState("");
  const minWords = writingMinWords(meta.part);
  const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;
  const qid = exercise.section.questions[0]?.id ?? "writing";

  return (
    <div className="fixed inset-0 z-40">
    <WritingExamWorkspace
      activePart={meta.part}
      isMock={false}
      displayLabel={meta.title}
      remainingSeconds={20 * 60}
      durationSeconds={20 * 60}
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
      onSubmit={() => onSubmit({ [qid]: essay })}
    />
    </div>
  );
}
