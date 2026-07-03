import type { WritingReview, WritingTask } from "@/modules/writing/types";
import { WritingTask1Prompt } from "@/modules/writing/components/writing-task1-prompt";
import { WritingTask2Prompt } from "@/modules/writing/components/writing-task2-prompt";
import { writingMinWords } from "@/lib/writing-test";

function reviewToTask(review: WritingReview): WritingTask {
  return {
    id: review.attempt_id,
    question_number: review.part,
    question_type: review.question_type,
    prompt: review.prompt,
    part: review.part,
    options: review.options,
  };
}

type Props = {
  review: WritingReview;
};

export function WritingFeedbackPrompt({ review }: Props) {
  const task = reviewToTask(review);
  const minWords = review.min_words || writingMinWords(review.part);
  const minutes = review.part === 1 ? 20 : 40;

  if (!review.prompt?.trim()) {
    return (
      <p className="text-[14px] italic text-[#64748B]">
        Task prompt is not available for this submission.
      </p>
    );
  }

  if (review.part === 1) {
    return (
      <WritingTask1Prompt task={task} minutes={minutes} minWords={minWords} />
    );
  }

  return (
    <WritingTask2Prompt
      task={task}
      minutes={minutes}
      minWords={minWords}
      showChecklist={false}
    />
  );
}
