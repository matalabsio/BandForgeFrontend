import {
  persistDiagnosticResults,
  type DiagnosticModuleReview,
  type DiagnosticResultsSnapshot,
} from "@/lib/diagnostic-session";
import { syncDiagnosticToServer } from "@/lib/diagnostic-sync";

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
  };
  saveDiagnosticProgress(next);
  return next;
}

export function completeDiagnostic(
  scores: DiagnosticModuleScores,
  review?: DiagnosticProgress["review"],
): DiagnosticProgress | null {
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
    review: review ?? progress.review,
  };
  persistDiagnosticResults(snapshot);
  syncDiagnosticToServer(snapshot, progress.startedAt);
  return finalProgress;
}
