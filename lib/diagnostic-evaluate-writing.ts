import { ApiError, parseApiError, parseJsonResponse, type ApiErrorBody } from "@/lib/api";
import type {
  GrammarMistake,
  SpellingMistake,
  StrongSpan,
  VocabularyHighlight,
} from "@/modules/writing/types";

export type DiagnosticWritingEvaluation = {
  evaluation_id: string;
  writing_band: number;
  scores: {
    task_achievement: number;
    coherence: number;
    lexical_resource: number;
    grammar: number;
  };
  feedback: {
    strengths: string[];
    weaknesses: string[];
    improvement_tips: string[];
  };
  metadata: {
    word_count: number;
    sentence_count: number;
    paragraph_count: number;
  };
  warnings?: string[];
  spelling_mistakes?: SpellingMistake[];
  grammar_mistakes?: GrammarMistake[];
  provider?: string | null;
  next_band_advice?: string;
  confidence?: number | null;
  vocabulary_highlights?: VocabularyHighlight[];
  strong_spans?: StrongSpan[];
};

type EvaluateWritingBody = {
  client_attempt_id: string;
  task_part: number;
  question: string;
  essay: string;
  visual_description?: string;
  target_band?: number | null;
};

type EvaluateWritingResponse = {
  status: "success";
  evaluation_id: string;
  writing_band: number;
  scores: DiagnosticWritingEvaluation["scores"];
  feedback: DiagnosticWritingEvaluation["feedback"] & {
    next_band_advice?: string;
    vocabulary_highlights?: VocabularyHighlight[];
    strong_spans?: StrongSpan[];
  };
  metadata: DiagnosticWritingEvaluation["metadata"];
  warnings?: string[];
  spelling_mistakes?: SpellingMistake[];
  grammar_mistakes?: GrammarMistake[];
  provider?: string | null;
  next_band_advice?: string;
  confidence?: number | null;
  vocabulary_highlights?: VocabularyHighlight[];
  strong_spans?: StrongSpan[];
};

/** Evaluate diagnostic writing essay via backend (Claude primary, Groq fallback). */
export async function evaluateDiagnosticWriting(
  body: EvaluateWritingBody,
): Promise<DiagnosticWritingEvaluation> {
  const res = await fetch("/api/diagnostic/evaluate-writing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await parseJsonResponse<EvaluateWritingResponse | ApiErrorBody>(res);
  if (!res.ok) {
    throw new ApiError(parseApiError(payload as ApiErrorBody, res.status), res.status);
  }
  const data = payload as EvaluateWritingResponse;
  const nextBand =
    data.next_band_advice?.trim() ||
    data.feedback?.next_band_advice?.trim() ||
    "";
  const vocabulary_highlights =
    data.vocabulary_highlights ?? data.feedback?.vocabulary_highlights ?? [];
  const strong_spans = data.strong_spans ?? data.feedback?.strong_spans ?? [];

  return {
    evaluation_id: data.evaluation_id,
    writing_band: data.writing_band,
    scores: data.scores,
    feedback: {
      strengths: data.feedback.strengths,
      weaknesses: data.feedback.weaknesses,
      improvement_tips: data.feedback.improvement_tips,
    },
    metadata: data.metadata,
    warnings: data.warnings,
    spelling_mistakes: data.spelling_mistakes,
    grammar_mistakes: data.grammar_mistakes,
    provider: data.provider,
    next_band_advice: nextBand || undefined,
    confidence: data.confidence ?? null,
    vocabulary_highlights,
    strong_spans,
  };
}
