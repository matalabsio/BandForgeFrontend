export const AUDIO_MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4;codecs=mp4a.40.2",
  "audio/mp4",
  "audio/ogg;codecs=opus",
  "audio/ogg",
] as const;

export type AudioRecordingCapability =
  | { supported: true; mimeType: string | undefined }
  | {
      supported: false;
      reason: "insecure_context" | "media_devices" | "media_recorder";
      message: string;
    };

export function getAudioRecordingCapability(): AudioRecordingCapability {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return {
      supported: false,
      reason: "media_devices",
      message: "Audio recording is only available in a browser.",
    };
  }
  if (!window.isSecureContext) {
    return {
      supported: false,
      reason: "insecure_context",
      message: "Microphone access requires a secure HTTPS connection.",
    };
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    return {
      supported: false,
      reason: "media_devices",
      message: "This browser cannot access microphone devices.",
    };
  }
  if (typeof MediaRecorder === "undefined") {
    return {
      supported: false,
      reason: "media_recorder",
      message: "This browser cannot record audio. Try the latest Safari, Chrome, or Firefox.",
    };
  }
  return {
    supported: true,
    // An undefined MIME asks the browser to choose its native recording codec.
    mimeType: AUDIO_MIME_CANDIDATES.find((type) =>
      MediaRecorder.isTypeSupported(type),
    ),
  };
}

/** Pick a MediaRecorder mime type supported by the current browser. */
export function getSupportedAudioMimeType(): string | undefined {
  const capability = getAudioRecordingCapability();
  return capability.supported ? capability.mimeType : undefined;
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
