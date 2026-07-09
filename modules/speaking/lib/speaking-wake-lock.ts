/**
 * Screen Wake Lock helper for speaking exams.
 * Requests `navigator.wakeLock` while the test is active and re-acquires
 * after the tab becomes visible again (lock is released on hide).
 */

type WakeLockSentinelLike = {
  released: boolean;
  release: () => Promise<void>;
  addEventListener: (type: "release", listener: () => void) => void;
};

type WakeLockNavigator = Navigator & {
  wakeLock?: {
    request: (type: "screen") => Promise<WakeLockSentinelLike>;
  };
};

export type SpeakingWakeLockHandle = {
  release: () => Promise<void>;
};

export async function acquireSpeakingWakeLock(): Promise<SpeakingWakeLockHandle> {
  if (typeof document === "undefined" || typeof navigator === "undefined") {
    return { release: async () => undefined };
  }

  const nav = navigator as WakeLockNavigator;
  if (!nav.wakeLock?.request) {
    return { release: async () => undefined };
  }

  let sentinel: WakeLockSentinelLike | null = null;
  let released = false;

  const request = async () => {
    if (released || document.visibilityState !== "visible") return;
    try {
      sentinel = await nav.wakeLock!.request("screen");
      sentinel.addEventListener("release", () => {
        sentinel = null;
      });
    } catch {
      sentinel = null;
    }
  };

  const onVisibility = () => {
    if (document.visibilityState === "visible") {
      void request();
    }
  };

  await request();
  document.addEventListener("visibilitychange", onVisibility);

  return {
    release: async () => {
      if (released) return;
      released = true;
      document.removeEventListener("visibilitychange", onVisibility);
      const current = sentinel;
      sentinel = null;
      if (current && !current.released) {
        try {
          await current.release();
        } catch {
          /* ignore */
        }
      }
    },
  };
}
