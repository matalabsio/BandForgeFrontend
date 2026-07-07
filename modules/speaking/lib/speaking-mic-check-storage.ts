const MIC_CHECK_PREFIX = "bf-speaking-mic-check:";

export function readMicCheckPassed(scope: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(`${MIC_CHECK_PREFIX}${scope}`) === "1";
  } catch {
    return false;
  }
}

export function writeMicCheckPassed(scope: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${MIC_CHECK_PREFIX}${scope}`, "1");
  } catch {
    /* ignore */
  }
}

export function clearMicCheckPassed(scope: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(`${MIC_CHECK_PREFIX}${scope}`);
  } catch {
    /* ignore */
  }
}
