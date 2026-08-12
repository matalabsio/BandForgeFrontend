import type { ReadingQuestion } from "@/modules/reading/types";
import type { QuestionGroup } from "@/modules/reading/lib/question-groups";

export type HeadingOption = { label: string; text: string };

const MATCHING_TYPES = new Set([
  "matching_headings",
  "matching_information",
  "matching_features",
  "matching_sentence_endings",
  "matching",
]);

export function isReadingMatchingType(type: string): boolean {
  return MATCHING_TYPES.has(type.trim().toLowerCase());
}

export function matchingLabelFormat(
  type: string,
): "roman" | "letter" {
  return type.trim().toLowerCase() === "matching_headings" ? "roman" : "letter";
}

export const ROMAN_ORDER = [
  "i",
  "ii",
  "iii",
  "iv",
  "v",
  "vi",
  "vii",
] as const;

const ROMAN_LONGEST_FIRST = ["vii", "iii", "vi", "iv", "ii", "i", "v"] as const;

export function normalizeRoman(raw: string): string {
  const t = raw.trim().toLowerCase().replace(/\./g, "");
  if (!t) return "";
  for (const roman of ROMAN_LONGEST_FIRST) {
    if (t === roman || t.startsWith(roman)) return roman;
  }
  return t.slice(0, 3);
}

export function romanSortIndex(label: string): number {
  const normalized = normalizeRoman(label);
  const idx = ROMAN_ORDER.indexOf(normalized as (typeof ROMAN_ORDER)[number]);
  return idx === -1 ? ROMAN_ORDER.length : idx;
}

export function sortHeadingOptions(options: HeadingOption[]): HeadingOption[] {
  return options.toSorted(
    (a, b) => romanSortIndex(a.label) - romanSortIndex(b.label),
  );
}

export function extractHeadingOptions(group: QuestionGroup): HeadingOption[] {
  const raw =
    group.questions.find((q) => q.options && q.options.length > 0)?.options ??
    [];
  return sortHeadingOptions(
    raw.map((o) => ({
      label: normalizeRoman(o.label) || o.label.trim().toLowerCase(),
      text: o.text,
    })),
  );
}

export function normalizeReadingLetter(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z]/g, "").slice(0, 1);
}

export function extractLetterMatchingOptions(
  group: QuestionGroup,
): HeadingOption[] {
  const raw =
    group.questions.find((q) => q.options && q.options.length > 0)?.options ??
    [];
  return raw
    .map((o) => {
      const label = normalizeReadingLetter(o.label || "");
      return {
        label: label || (o.label || "").trim(),
        text: (o.text || "").trim() || o.label,
      };
    })
    .toSorted((a, b) => a.label.localeCompare(b.label));
}

export function usedHeadingLabels(
  answers: Record<string, string>,
  questions: ReadingQuestion[],
  excludeQuestionId: string,
): Set<string> {
  const used = new Set<string>();
  for (const q of questions) {
    if (q.id === excludeQuestionId) continue;
    const value = normalizeRoman(answers[q.id] ?? "");
    if (value) used.add(value);
  }
  return used;
}

export function isHeadingAvailable(
  label: string,
  used: Set<string>,
  currentValue: string,
): boolean {
  const normalized = normalizeRoman(label);
  if (!normalized) return false;
  if (normalizeRoman(currentValue) === normalized) return true;
  return !used.has(normalized);
}

export function matchingHeadingsTitle(title: string): string {
  if (/matching/i.test(title)) return title;
  return title.replace(/^Questions\s+(\d+–\d+)$/i, "Questions $1: Matching headings");
}
