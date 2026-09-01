export type SpeakingTestSummary = {
  id: string;
  title: string;
  description?: string | null;
};

export type SpeakingQuestion = {
  id: string;
  question_number: number;
  sequence_number: number;
  question_type: string;
  prompt: string;
  part: number;
  kind: SpeakingQuestionKind;
  prep_sec: number | null;
  record_sec: number | null;
  max_record_sec: number | null;
  prep_seconds: number;
  max_recording_seconds: number;
  duration_hint_sec: number | null;
  part_label: string | null;
  video_url?: string | null;
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
  questions: SpeakingQuestion[];
  manifest_hash: string;
  expected_response_count: number;
  student_name: string | null;
};

export type SpeakingResponseStatus =
  | "session"
  | "uploading"
  | "uploaded"
  | "confirmed"
  | "processing"
  | "completed"
  | "failed";

export type SpeakingResponsePayload = {
  id: string;
  attempt_id: string;
  question_id: string;
  part: 1 | 2 | 3;
  sequence_number: number;
  duration_sec: number | null;
  size_bytes?: number | null;
  content_type: string;
  status: SpeakingResponseStatus;
  created_at: string;
  confirmed_at?: string | null;
  expires_at?: string | null;
  idempotency_key?: string | null;
  idempotent_replay?: boolean;
};

export type SpeakingResponsesPayload = SpeakingResponsePayload[];

export type UploadSpeakingResponsePayload = SpeakingResponsePayload;

export type SpeakingResponseUploadSessionPayload = {
  response_id: string;
  upload_url: string;
  expires_at: string;
  idempotency_key: string;
  idempotent_replay: boolean;
};

export type FinalizeSpeakingPayload = SubmitSpeakingPayload;

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

export type SpeakingReleaseState =
  | "processing"
  | "awaiting_examiner"
  | "released"
  | "withdrawn";

export type SpeakingReviewer = {
  display_name: string;
  credential_label: string | null;
};

export type SpeakingReleaseMetadata = {
  release_state: SpeakingReleaseState;
  report_available: boolean;
  released_at: string | null;
  approval_version: number;
  reviewer: SpeakingReviewer | null;
};

export type SpeakingTranscriptionProgress = {
  total: number;
  queued: number;
  processing: number;
  completed: number;
  failed: number;
};

export type SpeakingPendingTranscriptResponse = {
  id: string;
  question_id: string;
  part: number;
  sequence: number;
  prompt: string;
  duration_sec: number;
  transcription_status: string;
  transcript: string;
  transcription_error: string | null;
};

export type SpeakingPendingPayload = {
  attempt_id: string;
  status: string;
  review_status: string;
  human_band: number | null;
  ai_status?: string | null;
  evaluation_status?: string | null;
  score_source:
    | "human"
    | "ai_estimate"
    | "processing"
    | "failed"
    | "unavailable"
    | "insufficient_speech";
  ai_band: number | null;
  ai_criteria: Record<string, number>;
  ai_strengths: string[];
  ai_improvements: string[];
  next_band_advice: string | null;
  ai_parts: Array<{
    part: number;
    note: string;
    band_estimate: number;
  }>;
  ai_evidence: Array<{
    quote: string;
    criterion: "FC" | "LR" | "GRA" | "P";
    polarity: "strength" | "weakness";
    part: number;
    issue?: string | null;
    title?: string | null;
    explanation?: string | null;
    suggestion?: string | null;
  }>;
  ai_patterns: Array<{
    pattern: string;
    criterion: "FC" | "LR" | "GRA" | "P";
    frequency: "rare" | "sometimes" | "often";
    examples: string[];
  }>;
  ai_fluency: SpeakingFluencyMetrics;
  ai_part_metrics: Record<string, SpeakingFluencyMetrics>;
  responses: SpeakingPendingTranscriptResponse[];
  submitted_at: string | null;
  student_name: string | null;
  message: string;
  transcription_progress: SpeakingTranscriptionProgress | null;
} & SpeakingReleaseMetadata;

export type SpeakingNotificationPreferences = {
  email_enabled: boolean;
  plan_reminders_email: boolean;
  whatsapp_enabled: boolean;
  whatsapp_eligible: boolean;
  masked_phone: string | null;
  consent_version: string | null;
};

export type SpeakingNotificationPreferencesPatch =
  | {
      whatsapp_enabled: true;
      consent_confirmation: "speaking_release_whatsapp_v1";
    }
  | {
      whatsapp_enabled: false;
    }
  | {
      email_enabled: boolean;
    }
  | {
      plan_reminders_email: boolean;
    };

export type SpeakingHumanCriteria = {
  fluency: number;
  lexical: number;
  grammar: number;
  pronunciation: number;
};

export type SpeakingFluencyMetrics = {
  words_per_minute?: number | null;
  total_speaking_seconds?: number | null;
  long_pauses?: number | null;
  response_count?: number | null;
  questions_asked?: number | null;
  word_count?: number | null;
  [key: string]: number | string | boolean | null | undefined;
};

export type SpeakingPauseMarker = {
  after_word?: string;
  gap_sec?: number;
  start_char?: number;
  end_char?: number;
  start_ms?: number;
  end_ms?: number;
};

export type SpeakingCriterionKey = "fluency" | "lexical" | "grammar" | "pronunciation";
export type SpeakingEvidenceCriterion = "FC" | "LR" | "GRA" | "P";

export type SpeakingReportCriterion = {
  band: number;
  target_band: number | null;
  target_gap: number | null;
};

export type SpeakingTranscriptWord = {
  text: string;
  start_ms: number;
  end_ms: number;
};

export type SpeakingResponsePause = {
  after_word_index: number;
  start_ms: number;
  end_ms: number;
  duration_ms: number;
};

export type SpeakingReportResponseItem = {
  id: string;
  question_id: string;
  part: number;
  sequence: number;
  prompt: string;
  duration_sec: number;
  transcript: string;
  transcript_words: SpeakingTranscriptWord[];
  pause_markers: SpeakingResponsePause[];
  audio_url: string | null;
  audio_expires_at: string | null;
  metrics?: SpeakingFluencyMetrics | null;
};

export type SpeakingEvidenceSpan = {
  char_start: number;
  char_end: number;
  start_ms: number;
  end_ms: number;
};

export type SpeakingReportEvidence = {
  response_id: string;
  question_id: string;
  part: number;
  criterion: SpeakingEvidenceCriterion;
  polarity: "strength" | "weakness";
  quote: string;
  issue: string;
  title: string;
  explanation: string;
  suggestion: string;
  span: SpeakingEvidenceSpan | null;
  advisory_only: boolean;
  inference_source: "audio" | "transcript_inferred" | null;
  confidence: number | null;
};

export type SpeakingPatternExample = {
  text: string;
  response_id: string | null;
};

export type SpeakingReportPattern = {
  pattern: string;
  criterion: SpeakingEvidenceCriterion;
  frequency: "rare" | "sometimes" | "often";
  occurrence_count: number | null;
  occurrence_count_semantics: "grounded_example_matches" | null;
  frequency_is_model_estimate: boolean;
  examples: SpeakingPatternExample[];
};

export type SpeakingResponseMetrics = SpeakingFluencyMetrics & {
  response_id: string;
  part: number;
  sequence_number: number;
};

export type SpeakingReportFluency = {
  overall: SpeakingFluencyMetrics | null;
  parts: Record<string, SpeakingFluencyMetrics>;
  responses: SpeakingResponseMetrics[];
  source: "response_metrics" | "evaluation_snapshot" | "unavailable";
  complete: boolean;
};

export type SpeakingPronunciationAdvisory = {
  score_authority: "human_examiner";
  ai_inference_source: "transcript_inferred";
  ai_advisory_only: true;
  ai_confidence: number | null;
  ai_low_confidence: boolean;
};

export type SpeakingReportPart = {
  part: number;
  label: string;
  ai_band: number | null;
  ai_note: string | null;
  metrics?: SpeakingFluencyMetrics | null;
  response_ids: string[];
};

export type SpeakingReportV2 = {
  schema_version: "speaking-report.v2";
  attempt: {
    id: string;
    mock_test_id?: string | null;
    mock_attempt_id?: string | null;
    mock_title?: string | null;
    test_number?: number | null;
    submitted_at: string | null;
  };
  student: {
    display_name?: string | null;
    target_band_at_release?: number | null;
  };
  release: {
    released_at: string;
    approval_version: number;
    human_verified: boolean;
    reviewer?: SpeakingReviewer | null;
  };
  scores: {
    overall: number;
    criteria: Record<SpeakingCriterionKey, SpeakingReportCriterion>;
    biggest_gap?: { criterion: SpeakingCriterionKey; gap: number } | null;
  };
  parts: SpeakingReportPart[];
  responses: SpeakingReportResponseItem[];
  fluency_summary: SpeakingReportFluency;
  pronunciation_advisory: SpeakingPronunciationAdvisory;
  evidence: SpeakingReportEvidence[];
  patterns: SpeakingReportPattern[];
  summary: {
    strengths: string[];
    improvements: string[];
    vocabulary: string[];
    next_advice?: string | null;
    examiner_note?: string | null;
  };
  analysis: {
    status: string;
    unavailable_sections: string[];
  };
};

/** The endpoint may retain these legacy fields during rollout; report UI ignores them. */
export type SpeakingReportPayload = SpeakingReportV2 &
  SpeakingReleaseMetadata & {
  attempt_id?: string;
  overall_band?: number;
  human_criteria_scores?: SpeakingHumanCriteria | null;
};

export type SpeakingCriterionScore = {
  key: SpeakingCriterionKey;
  label: string;
  shortLabel: string;
  band: number;
  targetGap: number | null;
};

export type SpeakingResponseReport = SpeakingReportResponseItem & {
  sequence_number: number;
  duration_seconds: number;
  audioUrl: string | null;
  pauseMarkers: SpeakingPauseMarker[];
  evidence: SpeakingUiEvidence[];
};

export type SpeakingUiEvidence = SpeakingReportEvidence & {
  start_char?: number;
  end_char?: number;
  start_ms?: number;
  end_ms?: number;
};

export type SpeakingPartReport = SpeakingReportPart & {
  band_estimate: number | null;
  note: string | null;
  responses: SpeakingResponseReport[];
  evidence: SpeakingUiEvidence[];
};

export type SpeakingPatternFeedback = Omit<SpeakingReportPattern, "examples"> & {
  examples: string[];
};

export type SpeakingSummaryFeedback = {
  strengths: string[];
  improvements: string[];
  vocabulary_highlights: string[];
  next_band_advice: string | null;
  public_examiner_note: string | null;
};

export type SpeakingFeedback = {
  schemaVersion: "speaking-report.v2";
  attempt: SpeakingReportV2["attempt"];
  student: SpeakingReportV2["student"];
  release: SpeakingReportV2["release"];
  overallBand: number;
  descriptor: string;
  criteria: SpeakingCriterionScore[];
  targetBand: number | null;
  biggestGap: SpeakingCriterionScore | null;
  parts: SpeakingPartReport[];
  fluencySummary: SpeakingReportFluency;
  pronunciationAdvisory: SpeakingPronunciationAdvisory;
  patterns: SpeakingPatternFeedback[];
  summary: SpeakingSummaryFeedback;
  analysis: SpeakingReportV2["analysis"];
};

export type SpeakingQuestionKind = "question" | "part2_intro";

export type SpeakingQuestionManifest = {
  id: string;
  part: 1 | 2 | 3;
  questionNumber: number;
  sequence?: number;
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
