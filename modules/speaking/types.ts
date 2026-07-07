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

export type SpeakingQuestionKind = "question" | "part2_intro";

export type SpeakingQuestionManifest = {
  id: string;
  part: 1 | 2 | 3;
  questionNumber: number;
  prompt: string;
  kind: SpeakingQuestionKind;
  videoUrl?: string;
  audioUrl?: string;
  maxRecordSec?: number;
  prepSec?: number;
  recordSec?: number;
};

export type SpeakingSessionRecording = {
  questionId: string;
  part: 1 | 2 | 3;
  durationSec: number;
  /** Kept in memory during exam; not serialised to storage. */
  blob?: Blob;
};

export type SpeakingExamPhase =
  | "question"
  | "part2_prep"
  | "part2_record"
  | "complete";
