"use client";

import type { ReactNode } from "react";
import type { ListeningPart } from "@/modules/listening/types";

type Props = {
  parts: ListeningPart[];
  answers: Record<string, string>;
  played: Record<string, true>;
  playedParts: Record<number, true>;
  currentQuestionId: string | null;
  onJump: (questionId: string, partNumber: number) => void;
  variant?: "default" | "exam";
  timerSlot?: ReactNode;
};

export function PartNav({
  parts,
  answers,
  played,
  playedParts,
  currentQuestionId,
  onJump,
  variant = "default",
  timerSlot,
}: Props) {
  const isExam = variant === "exam";

  if (isExam) {
    const allQuestions = parts.flatMap((p) =>
      p.questions.map((q) => ({ ...q, part: p.part })),
    );
    const answeredTotal = allQuestions.filter(
      (q) => (answers[q.id] ?? "").trim().length > 0,
    ).length;

    return (
      <nav
        aria-label="Questions"
        className="sticky top-12 z-10 -mx-4 border-b border-[#e4e4e7] bg-white px-4 py-3 sm:-mx-6 sm:px-6"
      >
        <div className="flex items-center justify-between gap-3">
          {timerSlot}
          <div className="flex flex-1 flex-wrap justify-center gap-1 sm:justify-end">
            {allQuestions.map((q) => {
              const answered = (answers[q.id] ?? "").trim().length > 0;
              const isCurrent = currentQuestionId === q.id;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => onJump(q.id, q.part)}
                  aria-current={isCurrent ? "true" : undefined}
                  aria-label={`Question ${q.question_number}${answered ? ", answered" : ""}`}
                  className={`flex h-7 w-7 cursor-pointer items-center justify-center border text-[11px] font-semibold transition-colors ${
                    isCurrent
                      ? "border-[#18181b] bg-[#18181b] text-white"
                      : answered
                        ? "border-[#18181b] bg-white text-[#18181b]"
                        : "border-[#d4d4d8] bg-white text-[#71717a] hover:border-[#a1a1aa]"
                  }`}
                >
                  {q.question_number}
                </button>
              );
            })}
          </div>
        </div>
        <p className="mt-2 text-center text-[11px] text-[#a1a1aa] sm:text-left">
          {answeredTotal} of {allQuestions.length} answered
        </p>
      </nav>
    );
  }

  return (
    <nav
      aria-label="Question navigator"
      className="sticky top-2 z-10 rounded-2xl border border-border bg-white/95 p-3 shadow-sm backdrop-blur"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-6">
        {parts.map((p) => (
          <div key={p.part} className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-teal">
                Part {p.part}
              </p>
              <a
                href={`#part-${p.part}`}
                className="text-[11px] font-semibold text-navy underline-offset-2 hover:underline"
              >
                jump
              </a>
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {p.questions.map((q) => {
                const answered = (answers[q.id] ?? "").trim().length > 0;
                const isCurrent = currentQuestionId === q.id;
                const isPlayed =
                  Boolean(playedParts[p.part]) || Boolean(played[q.id]);
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => onJump(q.id, p.part)}
                    aria-current={isCurrent ? "true" : undefined}
                    className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border text-[12px] font-semibold transition-colors ${
                      isCurrent
                        ? "border-teal bg-teal text-white"
                        : answered
                          ? "border-teal/40 bg-teal/10 text-navy"
                          : isPlayed
                            ? "border-border bg-surface text-ink"
                            : "border-border bg-white text-ink/70"
                    }`}
                    title={`Q${q.question_number}${answered ? " · answered" : ""}${isPlayed ? " · audio played" : ""}`}
                  >
                    {q.question_number}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}
