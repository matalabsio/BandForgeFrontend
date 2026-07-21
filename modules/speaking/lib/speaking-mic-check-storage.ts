const MIC_CHECK_PREFIX = "bf-speaking-mic-check:v2:";
const MIC_CHECK_TTL_MS = 6 * 60 * 60 * 1000;

type MicCheckMarker = {
  passedAt: number;
};

export function speakingMicCheckStorageKey(scope: string): string {
  return `${MIC_CHECK_PREFIX}${scope}`;
}

export function readMicCheckPassed(scope: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = sessionStorage.getItem(speakingMicCheckStorageKey(scope));
    if (!raw) return false;
    const marker = JSON.parse(raw) as MicCheckMarker;
    const valid =
      Number.isFinite(marker.passedAt) &&
      Date.now() - marker.passedAt >= 0 &&
      Date.now() - marker.passedAt <= MIC_CHECK_TTL_MS;
    if (!valid) sessionStorage.removeItem(speakingMicCheckStorageKey(scope));
    return valid;
  } catch {
    return false;
  }
}

export function writeMicCheckPassed(scope: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      speakingMicCheckStorageKey(scope),
      JSON.stringify({ passedAt: Date.now() } satisfies MicCheckMarker),
    );
  } catch {
    /* ignore */
  }
}

export function clearMicCheckPassed(scope: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(speakingMicCheckStorageKey(scope));
  } catch {
    /* ignore */
  }
}
