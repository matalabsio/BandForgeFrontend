/** Standard bullets shown before each listening part audio (exam mode). */
export const LISTENING_PART_STANDARD_BULLETS = [
  "Audio will play once",
  "Questions will follow",
  "Make notes",
] as const;

export type ListeningPartAudioPhase = "awaiting_start" | "playing" | "complete";

export function initialPartAudioPhase(partPlayed: boolean): ListeningPartAudioPhase {
  return partPlayed ? "complete" : "awaiting_start";
}
