/** Pick a MediaRecorder mime type supported by the current browser.
 * Preference: webm/opus (Chrome/Firefox), then mp4 (Safari), then ogg.
 */
export function getSupportedAudioMimeType(): string | undefined {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") {
    return undefined;
  }

  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
    "audio/ogg",
  ];

  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

/** Map a blob/MIME type to a safe recording filename (no path). */
export function recordingFilenameForMime(mimeType: string | undefined | null): string {
  return `recording.${extensionForAudioMime(mimeType)}`;
}

/** Map MIME / Content-Type to a file extension for R2 keys and FormData filenames. */
export function extensionForAudioMime(mimeType: string | undefined | null): string {
  const raw = (mimeType ?? "").toLowerCase().split(";")[0]?.trim() ?? "";
  if (raw.includes("mp4") || raw === "audio/m4a" || raw === "audio/x-m4a") {
    return "mp4";
  }
  if (raw.includes("ogg")) return "ogg";
  if (raw.includes("mpeg") || raw === "audio/mp3") return "mp3";
  if (raw.includes("wav")) return "wav";
  if (raw.includes("webm")) return "webm";
  // Safari often reports empty type briefly; prefer webm as last resort only
  // when type is completely unknown so Chrome path stays correct.
  return "webm";
}

export function formatAudioDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.round(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
