/** Shared types for module-complete review (mirrors backend ModuleReviewResponse). */

export type ModuleReviewQuestion = {
  question_id: string;
  question_number: number;
  question_type: string;
  prompt: string;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
  explanation: string;
};

export type ModuleReviewGroup = {
  label: string;
  raw_score: number;
  total_questions: number;
  questions: ModuleReviewQuestion[];
};

export type ObjectiveModule = "listening" | "reading";

export type ModuleReviewPayload = {
  module: ObjectiveModule;
  mock_attempt_id: string;
  raw_score: number;
  total_questions: number;
  groups: ModuleReviewGroup[];
  next_module: string | null;
  next_part: number | null;
};

export type WritingTaskReview = {
  attempt_id: string;
  part: number;
  prompt: string;
  essay: string;
  word_count: number;
  ai_band: number | null;
  criteria: Record<string, number>;
  strengths: string[];
  improvements: string[];
};

export type WritingModuleReviewPayload = {
  mock_attempt_id: string;
  tasks: WritingTaskReview[];
  ai_band: number | null;
  persona_message: string;
  ai_available: boolean;
  next_module: string | null;
  next_part: number | null;
};

export type SpeakingModuleReviewPayload = {
  mock_attempt_id: string;
  attempt_id: string;
  part: number;
  duration_seconds: number | null;
  duration_hint_seconds: number | null;
  ai_band: number | null;
  prompts: string[];
  delivery_notes: string[];
  persona_message: string;
  next_module: string | null;
  next_part: number | null;
};
