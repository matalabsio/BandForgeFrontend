export type ListeningStage = {
  part: number;
  title: string;
  context: string;
  description: string;
  questionRange: string;
  questionCount: number;
  durationMinutes: number;
  live: boolean;
};

/** M01 (Test 1) listening stage labels — fallback only when DB instructions are absent. */
export const GREENFIELD_LISTENING_STAGES: ListeningStage[] = [
  {
    part: 1,
    title: "Part 1",
    context: "Greenfield College",
    description: "Form completion — conversation in an everyday context",
    questionRange: "Questions 1–10",
    questionCount: 10,
    durationMinutes: 30,
    live: true,
  },
  {
    part: 2,
    title: "Part 2",
    context: "Leisure Centre Orientation",
    description: "Monologue — MCQ and matching (founder Section 2)",
    questionRange: "Questions 1–10",
    questionCount: 10,
    durationMinutes: 30,
    live: true,
  },
  {
    part: 3,
    title: "Part 3",
    context: "Tutorial Discussion",
    description: "Academic conversation — MCQ and sentence completion (founder Section 3)",
    questionRange: "Questions 1–10",
    questionCount: 10,
    durationMinutes: 30,
    live: true,
  },
  {
    part: 4,
    title: "Part 4",
    context: "Public Transit & CO2",
    description: "Academic lecture — note completion (founder Section 4)",
    questionRange: "Questions 1–10",
    questionCount: 10,
    durationMinutes: 30,
    live: true,
  },
];
