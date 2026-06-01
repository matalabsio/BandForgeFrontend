export type ReadingPassageStage = {
  passage: number;
  title: string;
  context: string;
  description: string;
  questionRange: string;
  questionCount: number;
  durationMinutes: number;
  live: boolean;
};

export const READING_PASSAGE_STAGES: ReadingPassageStage[] = [
  {
    passage: 1,
    title: "Passage 1",
    context: "The Hidden Forces Behind Everyday Choices",
    description: "Behavioural economics — TFNG, matching headings, sentence completion",
    questionRange: "Questions 1–13",
    questionCount: 13,
    durationMinutes: 60,
    live: true,
  },
  {
    passage: 2,
    title: "Passage 2",
    context: "When the Rainforests of the Sea Fall Silent",
    description: "Coral reefs and climate — TFNG, matching headings, sentence completion",
    questionRange: "Questions 14–26",
    questionCount: 13,
    durationMinutes: 60,
    live: true,
  },
];
