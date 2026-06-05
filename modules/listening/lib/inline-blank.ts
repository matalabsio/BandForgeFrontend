import type { ListeningQuestion } from "@/modules/listening/types";

/** Matches IELTS-style gap markers in prompts (___ or ______). */
export const INLINE_BLANK_PATTERN = /_{3,}/;

const GAP_FILL_TYPES = new Set(["sentence_completion", "note_completion"]);

export function hasInlineBlank(prompt: string): boolean {
  return INLINE_BLANK_PATTERN.test(prompt);
}

function isGapFillType(questionType: string): boolean {
  return GAP_FILL_TYPES.has(questionType.toLowerCase());
}

/**
 * Splits on the first blank marker only (one answer per question).
 * Returns null when no marker is present.
 */
export function splitPromptBlank(
  prompt: string,
): { before: string; after: string } | null {
  const match = prompt.match(INLINE_BLANK_PATTERN);
  if (!match || match.index === undefined) return null;
  const before = prompt.slice(0, match.index).trimEnd();
  const after = prompt.slice(match.index + match[0].length).trimStart();
  return { before, after };
}

function hasSelectableOptions(question: ListeningQuestion): boolean {
  const opts = question.options;
  return Boolean(opts && opts.length > 0);
}

export function shouldUseInlineBlank(question: ListeningQuestion): boolean {
  if (hasSelectableOptions(question)) return false;
  const type = question.question_type.toLowerCase();
  if (type === "tfng") return false;
  if (hasInlineBlank(question.prompt)) return true;
  return (
    isGapFillType(type) &&
    (hasInlineBlank(question.prompt) || splitPromptBlank(question.prompt) !== null)
  );
}

export function shouldUseLabelBlank(question: ListeningQuestion): boolean {
  if (hasSelectableOptions(question)) return false;
  const type = question.question_type.toLowerCase();
  if (type === "tfng") return false;
  if (shouldUseInlineBlank(question)) return false;
  if (type === "form_completion") return true;
  return false;
}

/** Inline layout when gap marker present or gap-fill type with splittable prompt. */
export function usesInlineAnswerLayout(question: ListeningQuestion): boolean {
  return (
    shouldUseInlineBlank(question) ||
    shouldUseLabelBlank(question)
  );
}
