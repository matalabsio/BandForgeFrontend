import type { ReadingQuestion } from "@/modules/reading/types";
import {
  hasInlineBlank,
  INLINE_BLANK_PATTERN,
  splitPromptBlank,
} from "@/modules/listening/lib/inline-blank";

export { INLINE_BLANK_PATTERN, hasInlineBlank, splitPromptBlank };

export function shouldUseReadingInlineBlank(question: ReadingQuestion): boolean {
  const type = question.question_type.toLowerCase();
  if (type !== "sentence_completion") return false;
  return hasInlineBlank(question.prompt);
}
