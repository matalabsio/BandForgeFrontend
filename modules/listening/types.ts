export type ListeningOption = { label: string; text: string };

export type ListeningQuestion = {
  id: string;
  part: 1 | 2 | 3 | 4;
  question_number: number;
  question_type: string;
  prompt: string;
  instructions?: string | null;
  options?: ListeningOption[] | null;
  skill_tag?: string | null;
  audio_url?: string | null;
  audio_duration_seconds?: number | null;
};

export type ListeningPart = {
  part: 1 | 2 | 3 | 4;
  title: string;
  context: string;
  common_question_type: string;
  questions: ListeningQuestion[];
};

export type ListeningTestSummary = {
  id: string;
  title: string;
  description?: string | null;
};

export type ListeningQuestionsPayload = {
  test: ListeningTestSummary;
  module: "listening";
  parts: ListeningPart[];
  duration_seconds: number;
};

export type StartListeningPayload = {
  attempt_id: string;
  started_at: string;
  server_time: string;
  status: string;
  module: "listening";
  duration_seconds: number;
};

export type AutosavePayload = {
  ok: boolean;
  question_id: string;
  saved_at: string;
};

export type SkillBreakdownEntry = {
  correct: number;
  total: number;
  pct: number;
};

export type SubmitListeningPayload = {
  attempt_id: string;
  status: string;
  submitted_at: string;
  raw_score: number;
  total_questions: number;
  band: number;
  late_submission: boolean;
  skill_breakdown: Record<string, SkillBreakdownEntry>;
};

export type ListeningScoreReport = {
  attempt_id: string;
  status: string;
  submitted_at: string | null;
  raw_score: number;
  total_questions: number;
  band: number;
  late_submission: boolean;
  skill_breakdown: Record<string, SkillBreakdownEntry>;
};

export type RecoverySnapshot = {
  attempt_id: string;
  started_at: string;
  answers: Record<string, string>;
  played: Record<string, true>;
  played_parts?: Record<number, true>;
  remaining_time: number;
  saved_at: string;
};

export type AutosaveQueueItem = {
  question_id: string;
  user_answer: string;
  queued_at: string;
};
