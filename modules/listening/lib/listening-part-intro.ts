/** IELTS-style question preview before each part recording starts. */
export const LISTENING_QUESTION_PREVIEW_SEC = 30;

/** Standard bullets shown before each listening part audio (exam mode). */
export const LISTENING_PART_STANDARD_BULLETS = [
  "You have 30 seconds to read the questions before the recording starts",
  "Audio will play once",
  "You can answer while you listen",
] as const;

export type ListeningPartAudioPhase =
  | "awaiting_start"
  | "preview"
  | "playing"
  | "complete";

export function questionsBrowsable(phase: ListeningPartAudioPhase): boolean {
  return phase === "preview" || phase === "playing" || phase === "complete";
}

export function initialPartAudioPhase(partPlayed: boolean): ListeningPartAudioPhase {
  return partPlayed ? "complete" : "awaiting_start";
}
