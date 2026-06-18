export type WritingChartSeries = {
  mode?: string;
  label?: string;
  values: number[];
};

export type WritingChartSpec = {
  type?: string;
  title?: string;
  source?: string;
  y_max?: number;
  y_unit?: string;
  /** Grouped bar chart: category labels on x-axis */
  cities?: string[];
  /** Line graph: year labels on x-axis */
  labels?: string[];
  series: WritingChartSeries[];
};

export type WritingTaskOptions = {
  min_words?: number;
  image_url?: string | null;
  title?: string;
  difficulty?: string;
  figure_label?: string;
  figure_note?: string;
  chart?: WritingChartSpec;
};

export type WritingTask = {
  id: string;
  question_number: number;
  question_type: string;
  prompt: string;
  part: number;
  options?: WritingTaskOptions | null;
};

export type StartWritingPayload = {
  attempt_id: string;
  started_at: string;
  server_time: string;
  status: string;
  module: string;
  part: number;
  duration_seconds: number;
  resumed: boolean;
  test?: { id: string; title: string; description?: string | null };
  task?: WritingTask | null;
  saved_answer?: string | null;
};

export type SubmitWritingPayload = {
  attempt_id: string;
  status: string;
  submitted_at: string;
  part: number;
  word_count: number;
  band: number | null;
  min_words: number;
  saved_for_review: boolean;
  next_part: number | null;
  mock_next_module: string | null;
  mock_next_part: number | null;
  mock_writing_complete: boolean;
};

export type WritingReview = {
  attempt_id: string;
  status: string;
  module: string;
  part: number;
  test_title: string | null;
  question_type: string;
  prompt: string;
  options?: WritingTaskOptions | null;
  user_answer: string;
  word_count: number;
  band: number | null;
  min_words: number;
  submitted_at: string | null;
  saved_for_review: boolean;
};

export type WritingCriterionKey =
  | "task_achievement"
  | "coherence_cohesion"
  | "lexical_resource"
  | "grammar";

export type WritingCriterionScore = {
  key: WritingCriterionKey;
  label: string;
  band: number;
};

export type WritingEssayHighlight = {
  text: string;
  type: "strong" | "improve";
};

export type WritingVocabTag = {
  word: string;
  alternatives?: string[];
};

export type WritingFeedback = {
  overall_band: number;
  criteria: WritingCriterionScore[];
  strengths: string[];
  improvements: string[];
  strong_words: string[];
  weak_words: WritingVocabTag[];
  highlights: WritingEssayHighlight[];
  evaluated_label: string;
};
