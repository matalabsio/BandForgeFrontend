import type { SpeakingSessionRecording } from "@/modules/speaking/types";

const SESSION_PREFIX = "bf-speaking-session:";

function key(scope: string): string {
  return `${SESSION_PREFIX}${scope}`;
}

export function readSpeakingSessionRecordings(
  scope: string,
): SpeakingSessionRecording[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(key(scope));
    if (!raw) return [];
    return JSON.parse(raw) as SpeakingSessionRecording[];
  } catch {
    return [];
  }
}

export function saveSpeakingSessionRecording(
  scope: string,
  recording: SpeakingSessionRecording,
): void {
  if (typeof window === "undefined") return;
  const existing = readSpeakingSessionRecordings(scope);
  const next = [...existing.filter((r) => r.questionId !== recording.questionId), recording];
  try {
    sessionStorage.setItem(key(scope), JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
}

export function clearSpeakingSessionRecordings(scope: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(key(scope));
  } catch {
    /* ignore */
  }
}
