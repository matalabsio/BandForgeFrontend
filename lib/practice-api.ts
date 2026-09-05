import { examApiCall } from "@/lib/exam-api-call";
import { ApiError } from "@/lib/api";
import type {
  HubCompleteResult,
  MockUnlock,
  PracticeHub,
  PracticeHubDetail,
  PracticeProgress,
  PracticeSkill,
} from "@/lib/practice-types";

export function getPracticeHubs(skill: PracticeSkill): Promise<PracticeHub[]> {
  return examApiCall<PracticeHub[]>(
    `/api/practice/hubs?skill=${encodeURIComponent(skill)}`,
  );
}

export function getPracticeHub(hubId: string): Promise<PracticeHubDetail> {
  return examApiCall<PracticeHubDetail>(
    `/api/practice/hubs/${encodeURIComponent(hubId)}`,
  );
}

export function completePracticeHub(hubId: string): Promise<HubCompleteResult> {
  return examApiCall<HubCompleteResult>(
    `/api/practice/hubs/${encodeURIComponent(hubId)}/complete`,
    {
      method: "POST",
    },
  );
}

export function getPracticeProgress(): Promise<PracticeProgress> {
  return examApiCall<PracticeProgress>("/api/practice/progress");
}

export function getMockUnlock(skill: PracticeSkill): Promise<MockUnlock> {
  return examApiCall<MockUnlock>(
    `/api/practice/mock-unlock?skill=${encodeURIComponent(skill)}`,
  );
}

export type BankExerciseStart = {
  attempt_id: string;
  hub_id: string;
  practice_set_id: string;
  skill: PracticeSkill;
  part: number;
  section: {
    section_id: string;
    part: number;
    module: PracticeSkill;
    title: string | null;
    instructions: string | null;
    audio_key: string | null;
    audio_url?: string | null;
    passage_text: string | null;
    image_url: string | null;
    questions: Array<{
      id: string;
      question_number: number;
      question_type: string;
      prompt: string;
      options: unknown;
      instructions?: string | null;
      audio_url?: string | null;
      video_url?: string | null;
    }>;
  };
  /** Speaking bank: linked speaking attempt for R2 upload + ASR. */
  speaking_attempt_id?: string | null;
  speaking_manifest_hash?: string | null;
};

export type BankExerciseSubmitResult = {
  attempt_id: string;
  status: "completed";
  /** Objective L/R score, or writing_ai / speaking_ai pending payload. */
  score: Record<string, unknown> | null;
  hub_completed: boolean;
  writing_ai_pending?: boolean;
  writing_part?: number | null;
  speaking_ai_pending?: boolean;
  speaking_attempt_id?: string | null;
};

export type PracticeWritingReview = {
  attempt_id: string;
  hub_id: string;
  status: string;
  module: string;
  part: number;
  test_title: string | null;
  question_type: string;
  prompt: string;
  user_answer: string;
  word_count: number;
  band: number | null;
  ai_band?: number | null;
  ai_available?: boolean;
  ai_status?: string | null;
  band_source?: string;
  human_verified?: boolean;
  reviewer_notes?: string | null;
  ai_criteria?: Record<string, number>;
  ai_strengths?: string[];
  ai_improvements?: string[];
  ai_model_name?: string | null;
  ai_provider?: string | null;
  spelling_mistakes?: Array<{
    original: string;
    correction: string;
    context?: string;
  }>;
  grammar_mistakes?: Array<{
    original: string;
    correction: string;
    issue?: string;
  }>;
  next_band_advice?: string;
  confidence?: number | null;
  vocabulary_highlights?: Array<{
    word: string;
    polarity: "strong" | "weak";
    alternatives?: string[];
  }>;
  strong_spans?: Array<{ text: string; reason?: string }>;
  min_words: number;
  submitted_at: string | null;
  saved_for_review: boolean;
  error?: string | null;
  word_count_estimate?: number | null;
  short_response?: boolean;
};

export function startPracticeExercise(
  hubId: string,
  part?: number,
): Promise<BankExerciseStart> {
  const q =
    part !== undefined ? `?part=${encodeURIComponent(String(part))}` : "";
  return examApiCall<BankExerciseStart>(
    `/api/practice/hubs/${encodeURIComponent(hubId)}/exercise/start${q}`,
    { method: "POST" },
  );
}

export function submitPracticeExercise(
  hubId: string,
  attemptId: string,
  answers: Record<string, unknown>,
): Promise<BankExerciseSubmitResult> {
  return examApiCall<BankExerciseSubmitResult>(
    `/api/practice/hubs/${encodeURIComponent(hubId)}/exercise/${encodeURIComponent(attemptId)}/submit`,
    {
      method: "POST",
      body: JSON.stringify({ answers }),
    },
  );
}

export function getPracticeWritingReview(
  hubId: string,
  attemptId: string,
): Promise<PracticeWritingReview> {
  return examApiCall<PracticeWritingReview>(
    `/api/practice/hubs/${encodeURIComponent(hubId)}/exercise/${encodeURIComponent(attemptId)}/writing-review`,
  );
}

export type PracticeObjectiveReview = {
  attempt_id: string;
  hub_id: string;
  module: "listening" | "reading";
  raw_score: number;
  total_questions: number;
  questions: Array<{
    question_id: string;
    question_number: number;
    question_type: string;
    prompt: string;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
    explanation: string;
  }>;
};

export function getPracticeListeningReview(
  hubId: string,
  attemptId: string,
): Promise<PracticeObjectiveReview> {
  return examApiCall<PracticeObjectiveReview>(
    `/api/practice/hubs/${encodeURIComponent(hubId)}/exercise/${encodeURIComponent(attemptId)}/listening-review`,
  );
}

export function getPracticeReadingReview(
  hubId: string,
  attemptId: string,
): Promise<PracticeObjectiveReview> {
  return examApiCall<PracticeObjectiveReview>(
    `/api/practice/hubs/${encodeURIComponent(hubId)}/exercise/${encodeURIComponent(attemptId)}/reading-review`,
  );
}

export type PracticeSpeakingReview = {
  attempt_id: string;
  hub_id: string;
  speaking_attempt_id?: string | null;
  status: string;
  module: string;
  test_title?: string | null;
  ai_available?: boolean;
  ai_status?: string | null;
  ai_band?: number | null;
  band_source?: string;
  ai_criteria?: Record<string, number>;
  ai_strengths?: string[];
  ai_improvements?: string[];
  next_band_advice?: string | null;
  ai_parts?: Array<{ part: number; note: string; band_estimate: number }>;
  ai_evidence?: Array<Record<string, unknown>>;
  ai_patterns?: Array<Record<string, unknown>>;
  ai_fluency?: Record<string, unknown>;
  responses?: Array<{
    id: string;
    question_id: string;
    part: number;
    sequence: number;
    prompt: string;
    duration_sec: number;
    transcription_status: string;
    transcript: string;
  }>;
  ai_model_name?: string | null;
  ai_provider?: string | null;
  submitted_at?: string | null;
  error?: string | null;
  message?: string | null;
  evaluation_status?: string | null;
};

export function getPracticeSpeakingReview(
  hubId: string,
  attemptId: string,
): Promise<PracticeSpeakingReview> {
  return examApiCall<PracticeSpeakingReview>(
    `/api/practice/hubs/${encodeURIComponent(hubId)}/exercise/${encodeURIComponent(attemptId)}/speaking-review`,
  );
}

export type WritingSkillExamModule = "academic" | "general_training";

export type WritingSkillExamModuleResult = {
  exam_module: WritingSkillExamModule;
  usage_id: string;
  changed: boolean;
};

export function setWritingSkillExamModule(
  examModule: WritingSkillExamModule,
): Promise<WritingSkillExamModuleResult> {
  return examApiCall<WritingSkillExamModuleResult>(
    "/api/practice/writing-skill/exam-module",
    {
      method: "POST",
      body: JSON.stringify({ exam_module: examModule }),
    },
  );
}

export function isExamModuleRequiredError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  if (error.status !== 409) return false;
  return /exam_module/i.test(error.message);
}
