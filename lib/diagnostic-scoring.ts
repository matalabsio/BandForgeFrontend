import type { DiagnosticPackQuestion } from "@/lib/diagnostic-pack";
import type {
  DiagnosticModuleReview,
  DiagnosticReviewItem,
} from "@/lib/diagnostic-session";
import type { DiagnosticSpeakingAnswers } from "@/lib/diagnostic-storage";

const LISTENING_BAND_TABLE: ReadonlyArray<readonly [number, number]> = [
  [39, 9.0],
  [37, 8.5],
  [35, 8.0],
  [32, 7.5],
  [30, 7.0],
  [26, 6.5],
  [23, 6.0],
  [18, 5.5],
  [16, 5.0],
  [13, 4.5],
  [11, 4.0],
  [8, 3.5],
  [6, 3.0],
  [4, 2.5],
  [3, 2.0],
  [2, 1.5],
  [1, 1.0],
  [0, 0.0],
];

const READING_BAND_TABLE: ReadonlyArray<readonly [number, number]> = [
  [39, 9.0],
  [37, 8.5],
  [35, 8.0],
  [33, 7.5],
  [30, 7.0],
  [27, 6.5],
  [23, 6.0],
  [19, 5.5],
  [15, 5.0],
  [13, 4.5],
  [10, 4.0],
  [8, 3.5],
  [6, 3.0],
  [4, 2.5],
  [3, 2.0],
  [2, 1.5],
  [1, 1.0],
  [0, 0.0],
];

const WRITING_MIN_WORDS: Record<number, number> = {
  1: 150,
  2: 250,
};

const BASE_BAND_AT_MINIMUM = 7.8;
const MAX_OVER_BONUS = 0.5;
const WORDS_FOR_FULL_BONUS = 100;
const UNDER_FLOOR_BAND = 3.0;

export type ModuleScoreResult = {
  raw: number;
  total: number;
  band: number;
};

/**
 * Client mirror of backend `app.scoring.answers.is_answer_correct`.
 * Keep rules in lockstep: lowercase, collapse whitespace, `/` = OR alternatives.
 * Tests: `diagnostic-scoring.test.mjs` + `backend/tests/scoring/`.
 */
function normalize(value: string | null | undefined): string {
  if (value == null) return "";
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function isAnswerCorrect(
  userAnswer: string | null | undefined,
  correctAnswer: string | null | undefined,
): boolean {
  if (correctAnswer == null || correctAnswer === "") return false;
  const userNorm = normalize(userAnswer);
  if (!userNorm) return false;
  const alternatives = correctAnswer.split("/").map((part) => normalize(part));
  return alternatives.includes(userNorm);
}

function bandFromTable(
  rawScore: number,
  total: number,
  table: ReadonlyArray<readonly [number, number]>,
): number {
  const safeTotal = Math.max(1, total);
  const scaled =
    safeTotal !== 40 ? Math.round((rawScore / safeTotal) * 40) : rawScore;
  const clamped = Math.max(0, Math.min(40, scaled));
  for (const [threshold, band] of table) {
    if (clamped >= threshold) return band;
  }
  return 0;
}

export function scoreModule(
  questions: DiagnosticPackQuestion[],
  answers: Record<string, string>,
  module: "listening" | "reading",
): ModuleScoreResult {
  let raw = 0;
  const total = questions.length;
  for (const q of questions) {
    if (isAnswerCorrect(answers[q.id] ?? "", q.answer)) raw += 1;
  }
  const table = module === "listening" ? LISTENING_BAND_TABLE : READING_BAND_TABLE;
  return {
    raw,
    total,
    band: bandFromTable(raw, total, table),
  };
}

export function scoreListeningModule(
  questions: DiagnosticPackQuestion[],
  answers: Record<string, string>,
): ModuleScoreResult {
  return scoreModule(questions, answers, "listening");
}

export function scoreReadingModule(
  questions: DiagnosticPackQuestion[],
  answers: Record<string, string>,
): ModuleScoreResult {
  return scoreModule(questions, answers, "reading");
}

export function wordCount(text: string): number {
  const stripped = text.trim();
  return stripped ? stripped.split(/\s+/).length : 0;
}

/** Below this word count, skip AI writing evaluation and assign a local short band. */
export const SHORT_RESPONSE_AI_MIN_WORDS = 100;

/** Total recorded speech under this many seconds uses the short-response band (0–3). */
export const SHORT_SPEAKING_MAX_SEC = 45;

/**
 * Map a short response (words or speech seconds) onto band 0–3 in half-band steps.
 * `amount` of 0 → 0.0; `maxForFullShort` → 3.0.
 */
export function shortResponseBand(
  amount: number,
  maxForFullShort = SHORT_RESPONSE_AI_MIN_WORDS - 1,
): number {
  if (amount <= 0) return 0;
  const ceiling = Math.max(1, maxForFullShort);
  const capped = Math.min(amount, ceiling);
  return Math.round((capped / ceiling) * 3 * 2) / 2;
}

export function calculateWritingBand(words: number, part: number): number {
  if (words <= 0) return 0;
  const minimum = WRITING_MIN_WORDS[part] ?? WRITING_MIN_WORDS[2];
  if (words >= minimum) {
    const over = words - minimum;
    const bonus = Math.min(
      MAX_OVER_BONUS,
      (over / WORDS_FOR_FULL_BONUS) * MAX_OVER_BONUS,
    );
    return Math.round((BASE_BAND_AT_MINIMUM + bonus) * 10) / 10;
  }
  const ratio = words / minimum;
  const band = UNDER_FLOOR_BAND + ratio * (BASE_BAND_AT_MINIMUM - UNDER_FLOOR_BAND);
  return Math.round(band * 10) / 10;
}

export function scoreWritingModule(
  essay: string,
  _minWords: number,
  part = 1,
): { words: number; band: number } {
  const words = wordCount(essay);
  return {
    words,
    band: calculateWritingBand(words, part),
  };
}

export function scoreWritingTasks(
  essays: Record<string, string>,
  tasks: { id: string; part: number; minWords: number }[],
): { words: number; band: number } {
  if (tasks.length === 0) return { words: 0, band: 0 };
  let totalWords = 0;
  const bands: number[] = [];
  for (const task of tasks) {
    const essay = essays[task.id] ?? "";
    const result = scoreWritingModule(essay, task.minWords, task.part);
    totalWords += result.words;
    bands.push(result.band);
  }
  const band =
    bands.length > 0
      ? Math.round((bands.reduce((s, b) => s + b, 0) / bands.length) * 10) / 10
      : 0;
  return { words: totalWords, band };
}

export function buildModuleReview(
  questions: DiagnosticPackQuestion[],
  answers: Record<string, string>,
): DiagnosticModuleReview {
  const wrong: DiagnosticReviewItem[] = [];
  const bySkill: Record<string, { correct: number; total: number }> = {};

  for (const q of questions) {
    const skill = q.skill ?? "general";
    if (!bySkill[skill]) bySkill[skill] = { correct: 0, total: 0 };
    bySkill[skill].total += 1;
    const userAnswer = answers[q.id] ?? "";
    if (isAnswerCorrect(userAnswer, q.answer)) {
      bySkill[skill].correct += 1;
    } else {
      wrong.push({
        id: q.id,
        number: q.number,
        prompt: q.prompt,
        userAnswer: userAnswer || "—",
        correctAnswer: q.answer,
        skill,
      });
    }
  }

  return { wrong, bySkill };
}

export type SpeakingScoreInput = {
  part1Questions: { id: string; minSec: number }[];
  part2MinSec: number;
  part2Enabled?: boolean;
  answers: DiagnosticSpeakingAnswers;
};

export function scoreSpeakingModule(input: SpeakingScoreInput): {
  band: number;
  completionRate: number;
} {
  const { part1Questions, part2MinSec, part2Enabled = true, answers } = input;
  let earned = 0;
  let possible = part1Questions.length + (part2Enabled ? 1 : 0);
  let totalSec = 0;

  for (const q of part1Questions) {
    const rec = answers.part1[q.id];
    if (rec?.durationSec && rec.durationSec > 0) {
      totalSec += rec.durationSec;
    }
    if (rec?.completed && rec.durationSec >= q.minSec) {
      earned += 1;
    } else if (rec?.completed && rec.durationSec > 0) {
      earned += 0.5;
    }
  }

  const p2 = answers.part2;
  if (part2Enabled) {
    if (p2?.recordSec && p2.recordSec > 0) {
      totalSec += p2.recordSec;
    }
    if (p2?.completed && p2.recordSec >= part2MinSec) {
      earned += 1;
    } else if (p2?.completed && p2.recordSec > 0) {
      earned += 0.5;
    }
  }

  const completionRate = possible > 0 ? earned / possible : 0;
  if (totalSec < SHORT_SPEAKING_MAX_SEC) {
    return {
      band: shortResponseBand(totalSec, SHORT_SPEAKING_MAX_SEC - 1),
      completionRate,
    };
  }
  const band = Math.round((4.0 + completionRate * 3.5) * 10) / 10;
  return { band, completionRate };
}

export function aggregateBand(
  listening: number | null,
  reading: number | null,
  writing: number | null,
  speaking?: number | null,
): number | null {
  const bands = [listening, reading, writing, speaking].filter(
    (b): b is number => b != null && b > 0,
  );
  if (bands.length === 0) return null;
  const avg = bands.reduce((sum, b) => sum + b, 0) / bands.length;
  return Math.round(avg * 10) / 10;
}
