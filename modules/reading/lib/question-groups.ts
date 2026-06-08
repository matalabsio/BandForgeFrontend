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

/** Word-for-word from test/MT1/RT/interface (T2 = passage 1, T3 = passage 2). */
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

const M02_PASSAGE_GROUP_META: Record<
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
        "The passage has six paragraphs, A–F. Choose the correct heading for Paragraphs C–F from the list of headings below. Write the correct number, i–vii.",
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
        "Do the following statements agree with the information given in the passage? Write TRUE if the statement agrees with the information FALSE if the statement contradicts the information NOT GIVEN if there is no information on this",
    },
    matching_headings: {
      order: 2,
      instruction:
        "The passage has five paragraphs, A–E. Choose the correct heading for Paragraphs B–E from the list of headings below. Write the correct number, i–vii.",
    },
    sentence_completion: {
      order: 3,
      instruction:
        "Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
    },
  },
  3: {
    tfng: {
      order: 1,
      instruction:
        "Do the following statements agree with the claims of the writer? Write YES if the statement agrees with the claims of the writer NO if the statement contradicts the claims of the writer NOT GIVEN if it is impossible to say what the writer thinks about this",
    },
    matching_headings: {
      order: 2,
      instruction:
        "The passage has five paragraphs, A–E. Choose the correct heading for Paragraphs B–E from the list of headings below. Write the correct number, i–vii.",
    },
    sentence_completion: {
      order: 3,
      instruction:
        "Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
    },
  },
};

const FALLBACK_META = PASSAGE_GROUP_META[1];

function getPassageGroupMeta(passage: number, mockSlug?: string) {
  if (mockSlug === "m02") {
    return M02_PASSAGE_GROUP_META[passage] ?? M02_PASSAGE_GROUP_META[1];
  }
  return PASSAGE_GROUP_META[passage] ?? FALLBACK_META;
}

/** Intro overlay Part 1 line — TFNG vs YES/NO per passage and mock. */
export function readingTfngIntro(passage: number, mockSlug?: string): string {
  if (mockSlug === "m02" && passage === 3) {
    return "Part 1 — Yes / No / Not Given";
  }
  return "Part 1 — True / False / Not Given";
}

/** Intro overlay Part 2 line — matches matching_headings instruction per passage. */
export function readingMatchingHeadingsIntro(
  passage: number,
  mockSlug?: string,
): string {
  if (mockSlug === "m02") {
    if (passage === 3) return "Part 2 — Matching headings (Paragraphs B–E)";
    if (passage === 2) return "Part 2 — Matching headings (Paragraphs B–E)";
    return "Part 2 — Matching headings (Paragraphs C–F)";
  }
  return passage === 2
    ? "Part 2 — Matching headings (Paragraphs D–G)"
    : "Part 2 — Matching headings (Paragraphs C–F)";
}

export function groupReadingQuestions(
  questions: ReadingQuestion[],
  passage: number,
  mockSlug?: string,
): QuestionGroup[] {
  const passageMeta = getPassageGroupMeta(passage, mockSlug);
  const buckets = new Map<string, ReadingQuestion[]>();
  for (const q of questions) {
    const key = q.question_type.toLowerCase();
    const list = buckets.get(key) ?? [];
    list.push(q);
    buckets.set(key, list);
  }

  return [...buckets.entries()]
    .map(([type, qs]) => {
      const meta = passageMeta[type] ?? {
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
      const ao = passageMeta[a.id]?.order ?? 99;
      const bo = passageMeta[b.id]?.order ?? 99;
      return ao - bo;
    });
}
