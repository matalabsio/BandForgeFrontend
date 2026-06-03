export type WritingTaskStage = {
  part: 1 | 2;
  title: string;
  /** Examiner pack heading shown on dashboard */
  examinerTitle?: string;
  subtitle: string;
  minutes: number;
  minWords: number;
  live: boolean;
};

export const WRITING_TASK_STAGES: WritingTaskStage[] = [
  {
    part: 1,
    title: "Writing Task 1",
    examinerTitle: "WRITING TASK 1 — BAR CHART — COMMUTER TRANSPORT MODES",
    subtitle: "Band 6–7 · Tokyo, Berlin, São Paulo, Toronto",
    minutes: 20,
    minWords: 150,
    live: true,
  },
  {
    part: 2,
    title: "Writing Task 2",
    subtitle: "Opinion essay · examinations in education (≥250 words)",
    minutes: 40,
    minWords: 250,
    live: true,
  },
];
