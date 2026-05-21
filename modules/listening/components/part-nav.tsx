"use client";

import type { ListeningPart } from "@/modules/listening/types";

type Props = {
  parts: ListeningPart[];
  answers: Record<string, string>;
  played: Record<string, true>;
  currentQuestionId: string | null;
  onJump: (questionId: string, partNumber: number) => void;
};

export function PartNav({
  parts,
  answers,
  played,
  currentQuestionId,
  onJump,
}: Props) {
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
                const isPlayed = Boolean(played[q.id]);
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => onJump(q.id, p.part)}
                    aria-current={isCurrent ? "true" : undefined}
                    className={`flex h-8 w-8 items-center justify-center rounded-md border text-[12px] font-semibold transition-colors ${
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
