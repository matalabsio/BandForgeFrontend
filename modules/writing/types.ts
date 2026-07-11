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

export type WritingSessionTask = {
  attempt_id: string;
  part: number;
  human_band: number | null;
  review_status: string;
};

export type SpellingMistake = {
  original: string;
  correction: string;
  context?: string;
};

export type GrammarMistake = {
  original: string;
  correction: string;
  issue?: string;
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
  ai_band?: number | null;
  ai_available?: boolean;
  band_source?: string;
  ai_criteria?: Record<string, number>;
  ai_strengths?: string[];
  ai_improvements?: string[];
  ai_model_name?: string | null;
  ai_provider?: string | null;
  spelling_mistakes?: SpellingMistake[];
  grammar_mistakes?: GrammarMistake[];
  min_words: number;
  submitted_at: string | null;
  saved_for_review: boolean;
  session_tasks?: WritingSessionTask[];
};

export type WritingPendingPayload = {
  attempt_id: string;
  status: string;
  review_status: string;
  human_band: number | null;
  submitted_at: string | null;
  message: string;
  session_tasks?: WritingSessionTask[];
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
  type: "strong" | "improve" | "spelling" | "grammar";
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
  next_band_advice: string;
  target_band: number;
  criterion_gap_label: string;
  strong_words: string[];
  weak_words: WritingVocabTag[];
  highlights: WritingEssayHighlight[];
  spelling_mistakes: SpellingMistake[];
  grammar_mistakes: GrammarMistake[];
  evaluated_label: string;
};
