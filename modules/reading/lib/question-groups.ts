import type { ReadingQuestion } from "@/modules/reading/types";

export type QuestionGroup = {
  id: string;
  title: string;
  instruction: string;
  questions: ReadingQuestion[];
};

const GROUP_META: Record<
  string,
  { title: string; instruction: string; order: number }
> = {
  tfng: {
    order: 1,
    title: "Questions 1–5",
    instruction:
      "Do the following statements agree with the information in the passage? Write TRUE, FALSE, or NOT GIVEN.",
  },
  matching_headings: {
    order: 2,
    title: "Questions 6–9",
    instruction:
      "Choose the correct heading for each paragraph from the list of headings below.",
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
      const sorted = qs.toSorted((a, b) => a.question_number - b.question_number);
      const range =
        sorted.length > 0
          ? `Questions ${sorted[0].question_number}–${sorted[sorted.length - 1].question_number}`
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
