import {
  persistDiagnosticResults,
  readDiagnosticResults,
  type DiagnosticModuleReview,
  type DiagnosticResultsSnapshot,
} from "@/lib/diagnostic-session";
import type { DiagnosticWritingEvaluation } from "@/lib/diagnostic-evaluate-writing";
import { syncDiagnosticToServer } from "@/lib/diagnostic-sync";
import { readDiagnosticLead } from "@/lib/diagnostic-lead";
import { submitDiagnosticForReview } from "@/lib/diagnostic-review-submit";
import { aggregateBand } from "@/lib/diagnostic-scoring";

export const DIAGNOSTIC_PROGRESS_KEY = "bf-diagnostic-progress";

export type DiagnosticModule =
  | "listening"
  | "reading"
  | "writing"
  | "speaking";

export type DiagnosticSpeakingPart1Answer = {
  durationSec: number;
  completed: boolean;
};

export type DiagnosticSpeakingPart2Answer = {
  prepSec: number;
  recordSec: number;
  completed: boolean;
};

export type DiagnosticSpeakingAnswers = {
  part1: Record<string, DiagnosticSpeakingPart1Answer>;
  part2: DiagnosticSpeakingPart2Answer | null;
};

export type DiagnosticModuleScores = {
  listening_band: number | null;
  reading_band: number | null;
  writing_band: number | null;
  speaking_band: number | null;
  aggregate_band: number | null;
};

export type DiagnosticProgress = {
  attemptId: string;
  startedAt: string;
  status: "in_progress" | "completed";
  currentModule: DiagnosticModule;
  listeningPrepComplete?: boolean;
  listeningAudioPlayed?: boolean;
  answers: {
    listening: Record<string, string>;
    reading: Record<string, string>;
    writing: Record<string, string>;
    speaking: DiagnosticSpeakingAnswers;
  };
  scores?: DiagnosticModuleScores;
  review?: {
    listening?: DiagnosticModuleReview;
    reading?: DiagnosticModuleReview;
  };
  writingEvaluation?: DiagnosticWritingEvaluation;
  /** True while background AI evaluation is still running. */
  writingEvalPending?: boolean;
  writingEvalEssayHash?: string;
  completedAt?: string;
};

function emptySpeakingAnswers(): DiagnosticSpeakingAnswers {
  return { part1: {}, part2: null };
}

function emptyAnswers(): DiagnosticProgress["answers"] {
  return {
    listening: {},
    reading: {},
    writing: {},
    speaking: emptySpeakingAnswers(),
  };
}

export function readDiagnosticProgress(): DiagnosticProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DIAGNOSTIC_PROGRESS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DiagnosticProgress;
    if (!parsed.answers.speaking) {
      parsed.answers.speaking = emptySpeakingAnswers();
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveDiagnosticProgress(progress: DiagnosticProgress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DIAGNOSTIC_PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    /* ignore quota */
  }
}

export function createDiagnosticAttempt(): DiagnosticProgress {
  const progress: DiagnosticProgress = {
    attemptId: crypto.randomUUID(),
    startedAt: new Date().toISOString(),
    status: "in_progress",
    currentModule: "listening",
    listeningPrepComplete: false,
    listeningAudioPlayed: false,
    answers: emptyAnswers(),
  };
  saveDiagnosticProgress(progress);
  return progress;
}

export function clearDiagnosticAttempt(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DIAGNOSTIC_PROGRESS_KEY);
    localStorage.removeItem("bf-diagnostic-results-local");
    sessionStorage.removeItem("bf-diagnostic-results");
  } catch {
    /* ignore */
  }
}

export function hasInProgressDiagnostic(): boolean {
  const p = readDiagnosticProgress();
  return p != null && p.status === "in_progress";
}

export function saveModuleAnswers(
  module: "listening" | "reading" | "writing",
  answers: Record<string, string>,
): DiagnosticProgress | null;
export function saveModuleAnswers(
  module: "speaking",
  answers: DiagnosticSpeakingAnswers,
): DiagnosticProgress | null;
export function saveModuleAnswers(
  module: DiagnosticModule,
  answers: Record<string, string> | DiagnosticSpeakingAnswers,
): DiagnosticProgress | null {
  const progress = readDiagnosticProgress();
  if (!progress || progress.status !== "in_progress") return null;
  const next: DiagnosticProgress = {
    ...progress,
    answers: {
      ...progress.answers,
      [module]:
        module === "speaking"
          ? (answers as DiagnosticSpeakingAnswers)
          : { ...(answers as Record<string, string>) },
    },
  };
  saveDiagnosticProgress(next);
  return next;
}

export function markListeningPrepComplete(): DiagnosticProgress | null {
  const progress = readDiagnosticProgress();
  if (!progress || progress.status !== "in_progress") return null;
  const next: DiagnosticProgress = { ...progress, listeningPrepComplete: true };
  saveDiagnosticProgress(next);
  return next;
}

export function markListeningAudioPlayed(): DiagnosticProgress | null {
  const progress = readDiagnosticProgress();
  if (!progress || progress.status !== "in_progress") return null;
  const next: DiagnosticProgress = {
    ...progress,
    listeningPrepComplete: true,
    listeningAudioPlayed: true,
  };
  saveDiagnosticProgress(next);
  return next;
}

export function isListeningPrepComplete(progress?: DiagnosticProgress | null): boolean {
  const current = progress ?? readDiagnosticProgress();
  if (!current) return false;
  const hasListeningWork = Object.keys(current.answers.listening).length > 0;
  return Boolean(
    current.listeningPrepComplete || current.listeningAudioPlayed || hasListeningWork,
  );
}

function nextModuleAfter(module: DiagnosticModule): DiagnosticModule {
  switch (module) {
    case "listening":
      return "reading";
    case "reading":
      return "writing";
    case "writing":
      return "speaking";
    default:
      return "speaking";
  }
}

export function advanceDiagnosticModule(
  module: DiagnosticModule,
  partial?: {
    scores?: DiagnosticModuleScores;
    moduleAnswers?:
      | { module: "listening" | "reading" | "writing"; answers: Record<string, string> }
      | { module: "speaking"; answers: DiagnosticSpeakingAnswers };
    review?: DiagnosticProgress["review"];
    writingEvaluation?: DiagnosticWritingEvaluation;
    writingEvalPending?: boolean;
    writingEvalEssayHash?: string;
  },
): DiagnosticProgress | null {
  const progress = readDiagnosticProgress();
  if (!progress || progress.status !== "in_progress") return null;

  const nextAnswers = { ...progress.answers };
  if (partial?.moduleAnswers) {
    const { module: answerModule, answers } = partial.moduleAnswers;
    if (answerModule === "speaking") {
      nextAnswers.speaking = answers;
    } else {
      nextAnswers[answerModule] = { ...answers };
    }
  }

  const next: DiagnosticProgress = {
    ...progress,
    currentModule: nextModuleAfter(module),
    answers: nextAnswers,
    scores: partial?.scores ?? progress.scores,
    review: partial?.review ?? progress.review,
    writingEvaluation: partial?.writingEvaluation ?? progress.writingEvaluation,
    writingEvalPending:
      partial?.writingEvalPending ?? progress.writingEvalPending,
    writingEvalEssayHash:
      partial?.writingEvalEssayHash ?? progress.writingEvalEssayHash,
  };
  saveDiagnosticProgress(next);
  return next;
}

/** Clear pending Writing eval flags after failure or timeout (band stays null). */
export function clearWritingEvalPending(): DiagnosticProgress | null {
  const progress = readDiagnosticProgress();
  if (!progress) return null;
  if (!progress.writingEvalPending && !progress.writingEvalEssayHash) {
    return progress;
  }
  const next: DiagnosticProgress = {
    ...progress,
    writingEvalPending: false,
    writingEvalEssayHash: undefined,
  };
  saveDiagnosticProgress(next);
  return next;
}

/** Apply a finished background Writing evaluation to progress + results snapshot. */
export function applyWritingEvaluationResult(
  evaluation: DiagnosticWritingEvaluation,
): DiagnosticProgress | null {
  const progress = readDiagnosticProgress();
  if (!progress) return null;

  const writingBand = evaluation.writing_band;
  const scores: DiagnosticModuleScores = {
    listening_band: progress.scores?.listening_band ?? null,
    reading_band: progress.scores?.reading_band ?? null,
    writing_band: writingBand,
    speaking_band: progress.scores?.speaking_band ?? null,
    aggregate_band: aggregateBand(
      progress.scores?.listening_band ?? null,
      progress.scores?.reading_band ?? null,
      writingBand,
      progress.scores?.speaking_band ?? null,
    ),
  };

  const next: DiagnosticProgress = {
    ...progress,
    scores,
    writingEvaluation: evaluation,
    writingEvalPending: false,
    writingEvalEssayHash: undefined,
  };
  saveDiagnosticProgress(next);

  const existing = readDiagnosticResults();
  if (existing) {
    const snapshot: DiagnosticResultsSnapshot = {
      ...existing,
      writing_band: writingBand,
      aggregate_band: scores.aggregate_band,
      writingEvaluation: evaluation,
    };
    persistDiagnosticResults(snapshot);
    void syncDiagnosticToServer(snapshot, progress.startedAt);
  }

  return next;
}

export type CompleteDiagnosticResult = {
  progress: DiagnosticProgress;
  /** True when POST /api/diagnostic/complete succeeded for a full account. */
  synced: boolean;
};

type CompleteDiagnosticOptions = {
  /** Test seam — defaults to syncDiagnosticToServer. */
  sync?: (
    snapshot: DiagnosticResultsSnapshot,
    startedAt?: string,
  ) => Promise<boolean>;
};

/**
 * Mark the diagnostic complete locally, then await server persistence.
 * Local results are always kept even when sync fails.
 */
export async function completeDiagnostic(
  scores: DiagnosticModuleScores,
  review?: DiagnosticProgress["review"],
  options?: CompleteDiagnosticOptions,
): Promise<CompleteDiagnosticResult | null> {
  const progress = readDiagnosticProgress();
  if (!progress) return null;

  const completedAt = new Date().toISOString();
  const finalProgress: DiagnosticProgress = {
    ...progress,
    status: "completed",
    currentModule: "speaking",
    scores,
    review: review ?? progress.review,
    completedAt,
  };
  saveDiagnosticProgress(finalProgress);

  const snapshot: DiagnosticResultsSnapshot = {
    mock_attempt_id: progress.attemptId,
    aggregate_band: scores.aggregate_band,
    listening_band: scores.listening_band,
    reading_band: scores.reading_band,
    writing_band: scores.writing_band,
    speaking_band: scores.speaking_band,
    completed_at: completedAt,
    review_status: "pending_human",
    review: review ?? progress.review,
    writingEvaluation: progress.writingEvaluation,
  };
  persistDiagnosticResults(snapshot);

  const sync = options?.sync ?? syncDiagnosticToServer;
  let synced = false;
  try {
    synced = await sync(snapshot, progress.startedAt);
  } catch {
    synced = false;
  }

  const lead = readDiagnosticLead();
  if (lead) {
    submitDiagnosticForReview(lead, finalProgress, snapshot);
  }
  return { progress: finalProgress, synced };
}
