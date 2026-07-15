import type { DiagnosticWritingEvaluation } from "@/lib/diagnostic-evaluate-writing";
import type { WritingReview } from "@/modules/writing/types";

export type DiagnosticToWritingReviewInput = {
  evaluation: DiagnosticWritingEvaluation;
  essay: string;
  question: string;
  taskPart: number;
  /** Optional display title; defaults to Free Diagnostic. */
  testTitle?: string | null;
  /** Synthetic attempt id when not provided (coach disabled in diagnostic mode). */
  attemptId?: string;
};

/**
 * Map diagnostic AI evaluation + essay context into WritingReview so
 * buildWritingFeedback() can power WritingFeedbackView without a second path.
 */
export function diagnosticToWritingReview(
  input: DiagnosticToWritingReviewInput,
): WritingReview {
  const { evaluation, essay, question, taskPart } = input;
  const wordCount =
    evaluation.metadata?.word_count > 0
      ? evaluation.metadata.word_count
      : essay.trim().split(/\s+/).filter(Boolean).length;

  const improvements = [
    ...(evaluation.feedback.weaknesses ?? []),
    ...(evaluation.feedback.improvement_tips ?? []),
  ];

  return {
    attempt_id: input.attemptId ?? evaluation.evaluation_id,
    status: "completed",
    module: "writing",
    part: taskPart === 2 ? 2 : 1,
    test_title: input.testTitle?.trim() || "Free Diagnostic",
    question_type: taskPart === 2 ? "task2" : "task1",
    prompt: question,
    user_answer: essay,
    word_count: wordCount,
    band: evaluation.writing_band,
    ai_band: evaluation.writing_band,
    ai_available: true,
    ai_status: "ai_complete",
    band_source: "ai",
    human_verified: false,
    reviewer_notes: null,
    ai_criteria: {
      task_achievement: evaluation.scores.task_achievement,
      coherence: evaluation.scores.coherence,
      lexical_resource: evaluation.scores.lexical_resource,
      grammar: evaluation.scores.grammar,
    },
    ai_strengths: evaluation.feedback.strengths ?? [],
    ai_improvements: improvements,
    ai_provider: evaluation.provider ?? null,
    spelling_mistakes: evaluation.spelling_mistakes ?? [],
    grammar_mistakes: evaluation.grammar_mistakes ?? [],
    next_band_advice: evaluation.next_band_advice ?? "",
    confidence: evaluation.confidence ?? null,
    vocabulary_highlights: evaluation.vocabulary_highlights ?? [],
    strong_spans: evaluation.strong_spans ?? [],
    min_words: taskPart === 2 ? 250 : 150,
    submitted_at: null,
    saved_for_review: false,
  };
}
