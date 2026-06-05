import type { ListeningOption, ListeningQuestion } from "@/modules/listening/types";

export const LETTER_ORDER = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
] as const;

export function normalizeLetter(raw: string): string {
  const letter = raw.trim().toUpperCase().replace(/[^A-G]/g, "");
  return letter.slice(0, 1);
}

export function letterSortIndex(label: string): number {
  const normalized = normalizeLetter(label);
  const idx = LETTER_ORDER.indexOf(normalized as (typeof LETTER_ORDER)[number]);
  return idx === -1 ? LETTER_ORDER.length : idx;
}

export function sortMatchingOptions(options: ListeningOption[]): ListeningOption[] {
  return options.toSorted(
    (a, b) => letterSortIndex(a.label) - letterSortIndex(b.label),
  );
}

export function usedLetterLabels(
  answers: Record<string, string>,
  questions: ListeningQuestion[],
  excludeQuestionId: string,
): Set<string> {
  const used = new Set<string>();
  for (const q of questions) {
    if (q.id === excludeQuestionId) continue;
    const value = normalizeLetter(answers[q.id] ?? "");
    if (value) used.add(value);
  }
  return used;
}

export function isLetterAvailable(
  label: string,
  used: Set<string>,
  currentValue: string,
): boolean {
  const normalized = normalizeLetter(label);
  if (!normalized) return false;
  if (normalizeLetter(currentValue) === normalized) return true;
  return !used.has(normalized);
}
