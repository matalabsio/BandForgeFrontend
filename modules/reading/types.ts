export type ReadingQuestion = {
  id: string;
  question_number: number;
  display_number?: number | null;
  question_type: string;
  prompt: string;
  options?: { label: string; text: string }[] | null;
  skill_tag?: string | null;
};

export type StartReadingPayload = {
  attempt_id: string;
  started_at: string;
  server_time: string;
  status: string;
  module: string;
  duration_seconds: number;
  resumed?: boolean;
  test?: { id: string; title: string; description?: string | null };
  passage_text?: string | null;
  questions?: ReadingQuestion[];
  saved_answers?: Record<string, string>;
};

export type ReadingQuestionsPayload = {
  test: { id: string; title: string; description?: string | null };
  module: string;
  passage_text: string | null;
  questions: ReadingQuestion[];
  duration_seconds: number;
};

export type SubmitReadingPayload = {
  attempt_id: string;
  status: string;
  submitted_at: string;
  raw_score: number;
  total_questions: number;
  band: number;
  late_submission: boolean;
  skill_breakdown: Record<string, { correct: number; total: number; pct: number }>;
  mock_next_module?: string | null;
  mock_next_part?: number | null;
  mock_reading_complete?: boolean;
};

export type ReadingScoreReport = {
  attempt_id: string;
  status: string;
  module: string;
  test_title: string | null;
  submitted_at: string | null;
  raw_score: number;
  total_questions: number;
  band: number;
  late_submission: boolean;
  skill_breakdown: Record<string, { correct: number; total: number; pct: number }>;
  questions: {
    question_id: string;
    question_number: number;
    question_type: string;
    prompt: string;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
    explanation: string;
  }[];
};
