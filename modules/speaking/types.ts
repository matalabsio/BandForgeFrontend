export type SpeakingTestSummary = {
  id: string;
  title: string;
  description?: string | null;
};

export type SpeakingQuestion = {
  id: string;
  question_number: number;
  question_type: string;
  prompt: string;
  part: number;
  duration_hint_sec: number | null;
  part_label: string | null;
};

export type StartSpeakingPayload = {
  attempt_id: string;
  started_at: string;
  server_time: string;
  status: string;
  part: number;
  duration_seconds: number;
  resumed: boolean;
  test: SpeakingTestSummary;
  question: SpeakingQuestion;
  student_name: string | null;
};

export type SubmitSpeakingPayload = {
  attempt_id: string;
  status: string;
  submitted_at: string;
  review_id: string;
  mock_next_module: string | null;
  mock_next_part: number | null;
  mock_speaking_complete: boolean;
  message: string;
};

export type SpeakingPendingPayload = {
  attempt_id: string;
  status: string;
  review_status: string;
  human_band: number | null;
  submitted_at: string | null;
  student_name: string | null;
  message: string;
};
