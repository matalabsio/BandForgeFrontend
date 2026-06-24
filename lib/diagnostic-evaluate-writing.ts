import { ApiError, parseApiError, parseJsonResponse, type ApiErrorBody } from "@/lib/api";

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
};

type EvaluateWritingBody = {
  client_attempt_id: string;
  task_part: number;
  question: string;
  essay: string;
};

type EvaluateWritingResponse = {
  status: "success";
  evaluation_id: string;
  writing_band: number;
  scores: DiagnosticWritingEvaluation["scores"];
  feedback: DiagnosticWritingEvaluation["feedback"];
  metadata: DiagnosticWritingEvaluation["metadata"];
  warnings?: string[];
};

/** Evaluate diagnostic writing essay via backend (Groq hidden behind BFF). */
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
  return {
    evaluation_id: data.evaluation_id,
    writing_band: data.writing_band,
    scores: data.scores,
    feedback: data.feedback,
    metadata: data.metadata,
    warnings: data.warnings,
  };
}
