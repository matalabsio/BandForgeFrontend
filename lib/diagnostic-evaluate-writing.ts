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

type EvaluateWritingCompleteResponse = {
  status: "success" | "complete";
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
  essay_hash?: string | null;
};

type EvaluateWritingPendingResponse = {
  status: "pending";
  essay_hash: string;
  client_attempt_id: string;
};

type EvaluateWritingFailedResponse = {
  status: "failed";
  essay_hash?: string | null;
  client_attempt_id: string;
  error?: string;
};

export type StartDiagnosticWritingResult =
  | { status: "complete"; evaluation: DiagnosticWritingEvaluation }
  | { status: "pending"; essayHash: string };

export type PollDiagnosticWritingResult =
  | { status: "complete"; evaluation: DiagnosticWritingEvaluation }
  | { status: "pending"; essayHash?: string }
  | { status: "failed"; error?: string };

function normalizeEvaluation(
  data: EvaluateWritingCompleteResponse,
): DiagnosticWritingEvaluation {
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

function throwIfNotOk(
  res: Response,
  payload: unknown,
): asserts payload is Record<string, unknown> {
  if (!res.ok && res.status !== 202) {
    throw new ApiError(parseApiError(payload as ApiErrorBody, res.status), res.status);
  }
}

/**
 * Start diagnostic writing evaluation.
 * Returns immediately with a completed evaluation on cache hit, otherwise pending.
 */
export async function startDiagnosticWritingEvaluation(
  body: EvaluateWritingBody,
): Promise<StartDiagnosticWritingResult> {
  const res = await fetch("/api/diagnostic/evaluate-writing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await parseJsonResponse<
    | EvaluateWritingCompleteResponse
    | EvaluateWritingPendingResponse
    | ApiErrorBody
  >(res);
  throwIfNotOk(res, payload);

  const data = payload as
    | EvaluateWritingCompleteResponse
    | EvaluateWritingPendingResponse;

  if (data.status === "pending" || res.status === 202) {
    const pending = data as EvaluateWritingPendingResponse;
    return {
      status: "pending",
      essayHash: pending.essay_hash ?? "",
    };
  }

  return {
    status: "complete",
    evaluation: normalizeEvaluation(data as EvaluateWritingCompleteResponse),
  };
}

/** Poll background diagnostic writing evaluation status. */
export async function pollDiagnosticWritingStatus(
  clientAttemptId: string,
  essayHash?: string | null,
): Promise<PollDiagnosticWritingResult> {
  const params = new URLSearchParams({
    client_attempt_id: clientAttemptId,
  });
  if (essayHash) params.set("essay_hash", essayHash);

  const res = await fetch(
    `/api/diagnostic/evaluate-writing/status?${params.toString()}`,
    { method: "GET", credentials: "include" },
  );
  const payload = await parseJsonResponse<
    | EvaluateWritingCompleteResponse
    | EvaluateWritingPendingResponse
    | EvaluateWritingFailedResponse
    | ApiErrorBody
  >(res);
  throwIfNotOk(res, payload);

  const data = payload as
    | EvaluateWritingCompleteResponse
    | EvaluateWritingPendingResponse
    | EvaluateWritingFailedResponse;

  if (data.status === "failed") {
    return { status: "failed", error: data.error };
  }
  if (data.status === "pending" || res.status === 202) {
    return {
      status: "pending",
      essayHash: (data as EvaluateWritingPendingResponse).essay_hash,
    };
  }
  return {
    status: "complete",
    evaluation: normalizeEvaluation(data as EvaluateWritingCompleteResponse),
  };
}

/**
 * @deprecated Prefer startDiagnosticWritingEvaluation — kept for callers that
 * still expect a blocking completed evaluation.
 */
export async function evaluateDiagnosticWriting(
  body: EvaluateWritingBody,
): Promise<DiagnosticWritingEvaluation> {
  const started = await startDiagnosticWritingEvaluation(body);
  if (started.status === "complete") {
    return started.evaluation;
  }

  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 2000));
    const polled = await pollDiagnosticWritingStatus(
      body.client_attempt_id,
      started.essayHash,
    );
    if (polled.status === "complete") return polled.evaluation;
    if (polled.status === "failed") {
      throw new ApiError(polled.error || "AI evaluation failed.", 503);
    }
  }
  throw new ApiError("AI evaluation timed out. Please try again.", 503);
}
