import { mockAttemptStorageKey } from "@/modules/mock/lib/mock-session-storage";

const LISTENING_PREFIX = "bf-listening-";
const READING_PREFIX = "bf-reading-";
const CHECKPOINT_PREFIX = "bf-mock-checkpoint-";

/** Drop local exam drafts when starting a fresh mock attempt. */
export function clearMockExamLocalData(mockTestId: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(mockAttemptStorageKey(mockTestId));
    sessionStorage.removeItem("bf-mock-section-advance");
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
  } catch {
    /* ignore */
  }
}
