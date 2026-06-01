import type { QuestionReviewItem } from "@/modules/listening/types";

type Props = {
  questions: QuestionReviewItem[];
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
    <ul className="mt-4 space-y-2">
      {questions.map((q) => (
        <li key={q.question_id}>
          <details className="group rounded-xl border border-border bg-surface/50 open:bg-white">
            <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 text-meta [&::-webkit-details-marker]:hidden">
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
              <span className="min-w-0 flex-1 font-medium text-navy">
                {q.prompt}
              </span>
              <span
                className={`shrink-0 text-[11px] font-semibold uppercase tracking-wide ${
                  q.is_correct ? "text-emerald-700" : "text-red-700"
                }`}
              >
                {q.is_correct ? "Correct" : "Incorrect"}
              </span>
            </summary>
            <div className="border-t border-border px-4 pb-4 pt-2 text-[13px] leading-relaxed text-ink/80">
              <p>
                <span className="font-semibold text-navy">Your answer: </span>
                <span className={q.is_correct ? "text-emerald-800" : "text-red-800"}>
                  {q.user_answer.trim() || "—"}
                </span>
              </p>
              {!q.is_correct ? (
                <p className="mt-2">
                  <span className="font-semibold text-navy">Correct answer: </span>
                  <span className="text-emerald-800">{q.correct_answer}</span>
                </p>
              ) : null}
              <p className="mt-2 text-ink/65">{q.explanation}</p>
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
