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

/** Word-for-word from test/reading/interface (T2 = passage 1, T3 = passage 2). */
const PASSAGE_GROUP_META: Record<
  number,
  Record<string, { order: number; instruction: string }>
> = {
  1: {
    tfng: {
      order: 1,
      instruction:
        "Do the following statements agree with the information given in the passage? Write TRUE if the statement agrees with the information FALSE if the statement contradicts the information NOT GIVEN if there is no information on this",
    },
    matching_headings: {
      order: 2,
      instruction:
        "The passage has seven paragraphs, A–G. Choose the correct heading for Paragraphs C–F from the list of headings below. Write the correct number, i–vii.",
    },
    sentence_completion: {
      order: 3,
      instruction:
        "Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
    },
  },
  2: {
    tfng: {
      order: 1,
      instruction:
        "Do the following statements agree with the information given in the passage? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.",
    },
    matching_headings: {
      order: 2,
      instruction:
        "The passage has seven paragraphs, A–G. Choose the correct heading for Paragraphs D–G from the list of headings below. Write the correct number, i–vii.",
    },
    sentence_completion: {
      order: 3,
      instruction:
        "Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
    },
  },
};

const FALLBACK_META = PASSAGE_GROUP_META[1];

/** Intro overlay Part 2 line — matches matching_headings instruction per passage. */
export function readingMatchingHeadingsIntro(passage: number): string {
  return passage === 2
    ? "Part 2 — Matching headings (Paragraphs D–G)"
    : "Part 2 — Matching headings (Paragraphs C–F)";
}

export function groupReadingQuestions(
  questions: ReadingQuestion[],
  passage: number,
): QuestionGroup[] {
  const metaForPassage = PASSAGE_GROUP_META[passage] ?? FALLBACK_META;
  const buckets = new Map<string, ReadingQuestion[]>();
  for (const q of questions) {
    const key = q.question_type.toLowerCase();
    const list = buckets.get(key) ?? [];
    list.push(q);
    buckets.set(key, list);
  }

  return [...buckets.entries()]
    .map(([type, qs]) => {
      const meta = metaForPassage[type] ?? {
        order: 99,
        instruction: "Answer the questions below.",
      };
      const sorted = qs.toSorted((a, b) => qDisplay(a) - qDisplay(b));
      const range =
        sorted.length > 0
          ? `Questions ${qDisplay(sorted[0])}–${qDisplay(sorted[sorted.length - 1])}`
          : "Questions";
      return {
        id: type,
        title: range,
        instruction: meta.instruction,
        questions: sorted,
      };
    })
    .sort((a, b) => {
      const ao = metaForPassage[a.id]?.order ?? 99;
      const bo = metaForPassage[b.id]?.order ?? 99;
      return ao - bo;
    });
}
