import { mockAttemptStorageKey } from "@/modules/mock/lib/mock-session-storage";

const LISTENING_PREFIX = "bf-listening-";
const READING_PREFIX = "bf-reading-";
const CHECKPOINT_PREFIX = "bf-mock-checkpoint-";
const NAV_HINT_KEY = "bf-mock-nav";
const INSTRUCTIONS_PREFIX = "bf-instructions:";

type ModuleInstructionScope = "listening" | "reading" | "writing";

export function instructionConsentKey(
  module: ModuleInstructionScope,
  attemptScope: string,
): string {
  return `${INSTRUCTIONS_PREFIX}${module}:${attemptScope}`;
}

export function readInstructionConsent(
  module: ModuleInstructionScope,
  attemptScope: string,
): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(instructionConsentKey(module, attemptScope)) === "1";
  } catch {
    return false;
  }
}

export function writeInstructionConsent(
  module: ModuleInstructionScope,
  attemptScope: string,
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(instructionConsentKey(module, attemptScope), "1");
  } catch {
    /* ignore */
  }
}

/** Drop local exam drafts when starting a fresh mock attempt. */
export function clearMockExamLocalData(mockTestId: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(mockAttemptStorageKey(mockTestId));
    sessionStorage.removeItem("bf-mock-section-advance");
    sessionStorage.removeItem(NAV_HINT_KEY);
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k?.startsWith(CHECKPOINT_PREFIX)) keys.push(k);
    }
    for (const k of keys) sessionStorage.removeItem(k);
  } catch {
    /* ignore */
  }
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (
        k &&
        (k.startsWith(LISTENING_PREFIX) || k.startsWith(READING_PREFIX))
      ) {
        keys.push(k);
      }
    }
    for (const k of keys) localStorage.removeItem(k);
    const consentKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(INSTRUCTIONS_PREFIX)) consentKeys.push(k);
    }
    for (const k of consentKeys) localStorage.removeItem(k);
  } catch {
    /* ignore */
  }
}
