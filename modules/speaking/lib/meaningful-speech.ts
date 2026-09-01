import type { SpeakingPendingPayload } from "@/modules/speaking/types";

export const MIN_MEANINGFUL_WORDS_ATTEMPT = 8;

const PUNCT_ONLY = /^[\W_]+$/u;
const WORD_TOKEN = /[A-Za-z0-9]+(?:'[A-Za-z0-9]+)?/;

export function isMeaningfulWordToken(token: string): boolean {
  const raw = token.trim();
  if (!raw || PUNCT_ONLY.test(raw)) return false;
  return WORD_TOKEN.test(raw);
}

export function meaningfulWordCount(transcript: string): number {
  const text = transcript.trim();
  if (!text) return 0;
  return text.split(/\s+/).filter((part) => isMeaningfulWordToken(part)).length;
}

export function transcriptLooksEmpty(transcript: string): boolean {
  return meaningfulWordCount(transcript) === 0;
}

export function attemptMeaningfulWordCount(
  responses: Array<{ transcript?: string | null }>,
): number {
  return responses.reduce(
    (sum, row) => sum + meaningfulWordCount(String(row.transcript ?? "")),
    0,
  );
}

export function isInsufficientSpeechPayload(
  payload: SpeakingPendingPayload,
): boolean {
  if (payload.ai_status === "insufficient_speech") return true;
  if (payload.score_source === "insufficient_speech") return true;

  // Legacy rows scored before the backend gate.
  if (
    payload.ai_status === "ai_complete" &&
    attemptMeaningfulWordCount(payload.responses) < MIN_MEANINGFUL_WORDS_ATTEMPT
  ) {
    return true;
  }

  return false;
}

export function displayTranscript(transcript: string): string {
  const trimmed = transcript.trim();
  if (!trimmed || transcriptLooksEmpty(trimmed)) {
    return "";
  }
  return trimmed;
}
