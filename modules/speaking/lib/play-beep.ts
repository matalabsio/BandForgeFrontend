/** Resolve AudioContext across Chromium and Safari (webkit prefix). */
export function getAudioContextConstructor(): typeof AudioContext | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

const BEEP_MS = 120;
/** Hard ceiling so Safari suspended AudioContext can never block recording. */
const BEEP_TIMEOUT_MS = 280;

/**
 * Short beep played when question video ends and recording auto-starts.
 * Must always resolve quickly — never await this without a timeout in callers either.
 */
export function playRecordingBeep(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    const watchdog = window.setTimeout(finish, BEEP_TIMEOUT_MS);

    void (async () => {
      let ctx: AudioContext | null = null;
      try {
        const Ctx = getAudioContextConstructor();
        if (!Ctx) {
          finish();
          return;
        }

        ctx = new Ctx();
        if (ctx.state === "suspended") {
          // Safari often starts suspended outside a fresh user gesture.
          await Promise.race([
            ctx.resume(),
            new Promise<void>((r) => window.setTimeout(r, 80)),
          ]);
        }

        // Still suspended → skip audible beep; recording must proceed.
        if (ctx.state === "suspended") {
          finish();
          return;
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = 880;
        gain.gain.value = 0.08;
        osc.connect(gain);
        gain.connect(ctx.destination);

        await new Promise<void>((beepDone) => {
          osc.onended = () => beepDone();
          osc.start();
          osc.stop(ctx!.currentTime + BEEP_MS / 1000);
          window.setTimeout(beepDone, BEEP_MS + 40);
        });
      } catch {
        /* ignore — recording start must not depend on beep */
      } finally {
        window.clearTimeout(watchdog);
        if (ctx && ctx.state !== "closed") {
          void ctx.close().catch(() => undefined);
        }
        finish();
      }
    })();
  });
}
