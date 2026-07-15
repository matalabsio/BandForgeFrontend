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
  ai_status?: string | null;
  submitted_at: string | null;
  student_name: string | null;
  message: string;
};

export type SpeakingHumanCriteria = {
  fluency: number;
  lexical: number;
  grammar: number;
  pronunciation: number;
};

export type SpeakingBandScores = {
  FC: number;
  LR: number;
  GRA: number;
  P: number;
  P_confidence: number;
  overall: number;
};

export type SpeakingPartPerformance = {
  part: number;
  note: string;
  band_estimate: number;
};

export type SpeakingEvidenceQuote = {
  quote: string;
  criterion: "FC" | "LR" | "GRA" | "P";
  polarity: "strength" | "weakness";
  part: number;
};

export type SpeakingRecurringPattern = {
  pattern: string;
  criterion: "FC" | "LR" | "GRA" | "P";
  frequency: "rare" | "sometimes" | "often";
  examples: string[];
};

export type SpeakingEvaluationPayload = {
  band_scores: SpeakingBandScores;
  part_performance: SpeakingPartPerformance[];
  evidence_quotes: SpeakingEvidenceQuote[];
  recurring_patterns: SpeakingRecurringPattern[];
  strengths: string[];
  improvements: string[];
  vocabulary_highlights: string[];
  reviewer_flags?: string[];
  next_band_advice: string;
};

export type SpeakingFluencyMetrics = {
  words_per_minute?: number | null;
  total_speaking_seconds?: number | null;
  long_pauses?: number | null;
  response_count?: number | null;
  questions_asked?: number | null;
};

export type SpeakingPauseMarker = {
  after_word: string;
  gap_sec: number;
};

export type SpeakingReportPayload = {
  attempt_id: string;
  status: string;
  review_status: string;
  overall_band: number;
  human_verified: boolean;
  human_criteria_scores: SpeakingHumanCriteria | null;
  ai_band: number | null;
  fluency: number | null;
  lexical: number | null;
  grammar: number | null;
  pronunciation: number | null;
  evaluation: SpeakingEvaluationPayload | null;
  fluency_metrics: SpeakingFluencyMetrics | null;
  pause_markers?: SpeakingPauseMarker[];
  transcript: string | null;
  audio_play_url: string | null;
  ai_status: string | null;
  prompt_version: string | null;
  provider_asr: string | null;
  provider_eval: string | null;
  model_asr: string | null;
  model_eval: string | null;
  submitted_at: string | null;
  student_name: string | null;
  reviewer_notes: string | null;
  part: number;
};

export type SpeakingCriterionKey = "fluency" | "lexical" | "grammar" | "pronunciation";

export type SpeakingCriterionScore = {
  key: SpeakingCriterionKey;
  label: string;
  band: number;
};

export type SpeakingTranscriptHighlight = {
  text: string;
  polarity: "strength" | "weakness";
  criterion: string;
  kind?:
    | "evidence_strength"
    | "evidence_weakness"
    | "pronunciation"
    | "fluency_pause";
  title?: string;
  body?: string;
  suggestion?: string;
};

export type SpeakingPartCard = {
  part: number;
  note: string;
  band_estimate: number;
};

export type SpeakingPatternCard = {
  pattern: string;
  criterion: string;
  frequency: string;
  examples: string[];
};

export type SpeakingFeedback = {
  overall_band: number;
  human_verified: boolean;
  criteria: SpeakingCriterionScore[];
  criterion_gap_label: string;
  target_band: number;
  strengths: string[];
  improvements: string[];
  next_band_advice: string;
  vocabulary_highlights: string[];
  part_cards: SpeakingPartCard[];
  fluency_metrics: SpeakingFluencyMetrics | null;
  patterns: SpeakingPatternCard[];
  transcript: string | null;
  highlights: SpeakingTranscriptHighlight[];
  audio_play_url: string | null;
  pronunciation_confidence_label: string | null;
  evaluated_label: string;
  reviewer_notes: string | null;
  student_name: string | null;
  submitted_at: string | null;
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
