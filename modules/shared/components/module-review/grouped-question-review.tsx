import { ChevronDown } from "lucide-react";
import { QuestionReviewList } from "@/components/scores/question-review-list";
import type { ModuleReviewGroup } from "@/lib/module-review-types";

type Props = {
  groups: ModuleReviewGroup[];
};

export function GroupedQuestionReview({ groups }: Props) {
  if (groups.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-surface px-3 py-3 text-meta text-ink/55">
        No question details available for this module.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((group, index) => (
        <details
          key={`${group.label}-${index}`}
          className="group overflow-hidden rounded-2xl border border-[#E3E9F1] bg-white shadow-[0_8px_28px_rgba(13,31,60,0.05)]"
          open={index === 0}
        >
          <summary className="flex min-h-[52px] cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 sm:flex-nowrap sm:px-5 [&::-webkit-details-marker]:hidden">
            <span className="min-w-0 flex-1 break-words font-display text-[14px] font-bold leading-snug tracking-tight text-navy sm:text-[15px]">
              {group.label}
            </span>
            <span className="inline-flex shrink-0 items-center gap-2">
              <span className="font-mono text-[13px] font-medium text-cyan">
                {group.raw_score}/{group.total_questions}
              </span>
              <ChevronDown
                className="size-4 text-ink/40 transition-transform group-open:rotate-180"
                aria-hidden
              />
            </span>
          </summary>
          <div className="overflow-x-hidden border-t border-[#EDF1F6] px-3 pb-4 sm:px-5">
            <QuestionReviewList questions={group.questions} />
          </div>
        </details>
      ))}
    </div>
  );
}
