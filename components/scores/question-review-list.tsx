import type { ModuleReviewQuestion } from "@/lib/module-review-types";

type Props = {
  questions: ModuleReviewQuestion[];
};

export function QuestionReviewList({ questions }: Props) {
  if (questions.length === 0) {
    return (
      <p className="mt-4 rounded-lg border border-dashed border-border bg-surface px-3 py-2 text-meta text-ink/55">
        No question details available for this attempt.
      </p>
    );
  }

  return (
    <ul className="mt-3 space-y-2 sm:mt-4">
      {questions.map((q) => (
        <li key={q.question_id} className="min-w-0">
          <details className="group overflow-hidden rounded-xl border border-border bg-surface/50 open:bg-white">
            <summary className="flex cursor-pointer list-none flex-col gap-2 px-3 py-3 sm:flex-row sm:items-start sm:gap-3 sm:px-4 [&::-webkit-details-marker]:hidden">
              <div className="flex min-w-0 flex-1 items-start gap-2.5 sm:gap-3">
                <span
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                    q.is_correct
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-red-100 text-red-800"
                  }`}
                  aria-hidden
                >
                  {q.question_number}
                </span>
                <span className="min-w-0 flex-1 break-words text-[13px] font-medium leading-snug text-navy sm:text-meta">
                  {q.prompt}
                </span>
              </div>
              <span
                className={`shrink-0 self-start pl-9 text-[11px] font-semibold uppercase tracking-wide sm:pl-0 ${
                  q.is_correct ? "text-emerald-700" : "text-red-700"
                }`}
              >
                {q.is_correct ? "Correct" : "Incorrect"}
              </span>
            </summary>
            <div className="overflow-x-hidden border-t border-border px-3 pb-4 pt-2 text-[13px] leading-relaxed text-ink/80 sm:px-4">
              <p className="break-words">
                <span className="font-semibold text-navy">Your answer: </span>
                <span className={q.is_correct ? "text-emerald-800" : "text-red-800"}>
                  {q.user_answer.trim() || "—"}
                </span>
              </p>
              {!q.is_correct ? (
                <p className="mt-2 break-words">
                  <span className="font-semibold text-navy">Correct answer: </span>
                  <span className="text-emerald-800">{q.correct_answer}</span>
                </p>
              ) : null}
              <p className="mt-2 break-words text-ink/65">{q.explanation}</p>
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
