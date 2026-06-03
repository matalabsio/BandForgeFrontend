import type { ReadingQuestion } from "@/modules/reading/types";

export type QuestionGroup = {
  id: string;
  title: string;
  instruction: string;
  questions: ReadingQuestion[];
};

function qDisplay(q: ReadingQuestion): number {
  return q.display_number ?? q.question_number;
}

const GROUP_META: Record<
  string,
  { title: string; instruction: string; order: number }
> = {
  tfng: {
    order: 1,
    title: "Questions 1–5",
    instruction:
      "Do the following statements agree with the information given in the passage? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.",
  },
  matching_headings: {
    order: 2,
    title: "Questions 6–9",
    instruction:
      "The passage has seven paragraphs, A–G. Choose the correct heading for Paragraphs C–F from the list of headings below. Write the correct number, i–vii.",
  },
  sentence_completion: {
    order: 3,
    title: "Questions 10–13",
    instruction:
      "Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
  },
};

export function groupReadingQuestions(questions: ReadingQuestion[]): QuestionGroup[] {
  const buckets = new Map<string, ReadingQuestion[]>();
  for (const q of questions) {
    const key = q.question_type.toLowerCase();
    const list = buckets.get(key) ?? [];
    list.push(q);
    buckets.set(key, list);
  }

  return [...buckets.entries()]
    .map(([type, qs]) => {
      const meta = GROUP_META[type] ?? {
        order: 99,
        title: "Questions",
        instruction: "Answer the questions below.",
      };
      const sorted = qs.toSorted((a, b) => qDisplay(a) - qDisplay(b));
      const range =
        sorted.length > 0
          ? `Questions ${qDisplay(sorted[0])}–${qDisplay(sorted[sorted.length - 1])}`
          : meta.title;
      return {
        id: type,
        title: range,
        instruction: meta.instruction,
        questions: sorted,
      };
    })
    .sort((a, b) => {
      const ao = GROUP_META[a.id]?.order ?? 99;
      const bo = GROUP_META[b.id]?.order ?? 99;
      return ao - bo;
    });
}
