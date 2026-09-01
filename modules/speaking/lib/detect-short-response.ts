/** Minimum valid response length in seconds (locked in speaking evaluation plan). */
export const SHORT_RESPONSE_SEC = 5;

/** RMS threshold for detecting audible speech in a 100ms window. */
export const SPEECH_RMS_THRESHOLD = 0.012;

const SPEECH_WINDOW_SEC = 0.1;
const MIN_LOUD_WINDOWS = 10; // ~1s of audible speech

/** Sync check: duration and blob size only. */
export function isShortOrSilentResponse(
  durationSec: number,
  blob?: Blob | null,
): boolean {
  if (durationSec < SHORT_RESPONSE_SEC) return true;
  if (!blob || blob.size < 2_000) return true;
  return false;
}

function rmsForWindow(samples: Float32Array, start: number, end: number): number {
  if (end <= start) return 0;
  let sum = 0;
  for (let i = start; i < end; i++) sum += samples[i]! * samples[i]!;
  return Math.sqrt(sum / (end - start));
}

/** Decode audio and detect sustained speech above the noise floor. */
export async function hasAudibleSpeech(blob: Blob): Promise<boolean> {
  if (typeof window === "undefined") return true;

  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtx) return true;

  let ctx: AudioContext | null = null;
  try {
    ctx = new AudioCtx();
    const buffer = await blob.arrayBuffer();
    const audio = await ctx.decodeAudioData(buffer.slice(0));
    const samples = audio.getChannelData(0);
    const windowSize = Math.max(
      1,
      Math.floor(audio.sampleRate * SPEECH_WINDOW_SEC),
    );
    let loudWindows = 0;
    for (let i = 0; i < samples.length; i += windowSize) {
      const end = Math.min(i + windowSize, samples.length);
      if (rmsForWindow(samples, i, end) >= SPEECH_RMS_THRESHOLD) {
        loudWindows++;
      }
    }
    return loudWindows >= MIN_LOUD_WINDOWS;
  } catch {
    // Codec/decode issues — do not block submission on unsupported browsers.
    return true;
  } finally {
    if (ctx) {
      try {
        await ctx.close();
      } catch {
        /* ignore */
      }
    }
  }
}

/** True when the recording should be rejected (too short, empty, or silent). */
export async function isUnusableRecording(
  durationSec: number,
  blob?: Blob | null,
): Promise<boolean> {
  if (isShortOrSilentResponse(durationSec, blob)) return true;
  if (!blob) return true;
  const audible = await hasAudibleSpeech(blob);
  return !audible;
}
