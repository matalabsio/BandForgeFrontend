import type { ListeningQuestion } from "@/modules/listening/types";

/** Matches IELTS-style gap markers in prompts (___ or ______). */
export const INLINE_BLANK_PATTERN = /_{3,}/;

export function hasInlineBlank(prompt: string): boolean {
  return INLINE_BLANK_PATTERN.test(prompt);
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
  return hasInlineBlank(question.prompt);
}

export function shouldUseLabelBlank(question: ListeningQuestion): boolean {
  if (hasSelectableOptions(question)) return false;
  const type = question.question_type.toLowerCase();
  if (type === "tfng") return false;
  if (shouldUseInlineBlank(question)) return false;
  if (type === "form_completion") return true;
  return false;
}
