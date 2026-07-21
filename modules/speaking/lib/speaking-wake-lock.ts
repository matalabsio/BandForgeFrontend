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
  let requestInFlight: Promise<void> | null = null;

  const request = (): Promise<void> => {
    if (
      released ||
      document.visibilityState !== "visible" ||
      (sentinel && !sentinel.released)
    ) {
      return Promise.resolve();
    }
    if (requestInFlight) return requestInFlight;
    requestInFlight = (async () => {
      try {
        const acquired = await nav.wakeLock!.request("screen");
        if (released) {
          if (!acquired.released) await acquired.release();
          return;
        }
        sentinel = acquired;
        acquired.addEventListener("release", () => {
          if (sentinel === acquired) sentinel = null;
        });
      } catch {
        sentinel = null;
      } finally {
        requestInFlight = null;
      }
    })();
    return requestInFlight;
  };

  const onVisibility = () => {
    if (document.visibilityState === "visible") {
      void request();
    }
  };

  await request();
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pageshow", onVisibility);

  return {
    release: async () => {
      if (released) return;
      released = true;
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onVisibility);
      await requestInFlight;
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
