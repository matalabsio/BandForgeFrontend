"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  GET_USER_MEDIA_TIMEOUT_MS,
  RECORDER_TIMESLICE_MS,
  getAudioRecordingCapability,
  getSupportedAudioMimeType,
} from "@/modules/speaking/lib/media-recorder-support";
import {
  getAudioContextConstructor,
  playRecordingBeep,
} from "@/modules/speaking/lib/play-beep";

export type RecorderResult = {
  blob: Blob;
  durationSec: number;
};

type UseSpeakingRecorderOptions = {
  maxDurationSec?: number;
  onMaxDuration?: () => void;
};

function streamHasLiveAudio(stream: MediaStream | null): boolean {
  if (!stream) return false;
  const tracks = stream.getAudioTracks();
  return tracks.length > 0 && tracks.every((t) => t.readyState === "live");
}

async function getUserMediaWithTimeout(
  constraints: MediaStreamConstraints,
  timeoutMs: number,
): Promise<MediaStream> {
  let timer: number | undefined;
  try {
    return await Promise.race([
      navigator.mediaDevices.getUserMedia(constraints),
      new Promise<never>((_, reject) => {
        timer = window.setTimeout(() => {
          reject(
            new Error(
              "Microphone request timed out. Tap Start recording and allow access when prompted.",
            ),
          );
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timer != null) window.clearTimeout(timer);
  }
}

export function useSpeakingRecorder(options: UseSpeakingRecorderOptions = {}) {
  const { maxDurationSec, onMaxDuration } = options;
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [waveform, setWaveform] = useState<number[]>(() => Array(24).fill(0.08));
  const [lastError, setLastError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);
  const resolveStopRef = useRef<((result: RecorderResult | null) => void) | null>(null);
  const mountedRef = useRef(true);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserFrameRef = useRef<number | null>(null);
  const startingRef = useRef(false);

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const stopWaveform = useCallback(() => {
    if (analyserFrameRef.current) {
      cancelAnimationFrame(analyserFrameRef.current);
      analyserFrameRef.current = null;
    }
    const audioContext = audioContextRef.current;
    audioContextRef.current = null;
    if (audioContext && audioContext.state !== "closed") void audioContext.close();
  }, []);

  const cleanup = useCallback(
    (discardRecorder = false) => {
      if (tickRef.current) {
        window.clearInterval(tickRef.current);
      }
      tickRef.current = null;
      stopWaveform();
      const recorder = mediaRecorderRef.current;
      if (discardRecorder && recorder && recorder.state !== "inactive") {
        recorder.ondataavailable = null;
        recorder.onerror = null;
        recorder.onstop = null;
        try {
          recorder.stop();
        } catch {
          /* recorder already stopped */
        }
      }
      releaseStream();
      mediaRecorderRef.current = null;
      startRef.current = null;
      startingRef.current = false;
      if (mountedRef.current) setRecording(false);
    },
    [releaseStream, stopWaveform],
  );

  useEffect(
    () => () => {
      mountedRef.current = false;
      cleanup(true);
      resolveStopRef.current?.(null);
      resolveStopRef.current = null;
    },
    [cleanup],
  );

  // Keep React UI in sync with the real MediaRecorder — fixes "mic live but Waiting" desync.
  useEffect(() => {
    mountedRef.current = true;
    const id = window.setInterval(() => {
      const active = mediaRecorderRef.current?.state === "recording";
      setRecording((prev) => (prev === active ? prev : active));
      if (active && startRef.current) {
        const elapsed = Math.round((Date.now() - startRef.current) / 1000);
        setSeconds((prev) => (prev === elapsed ? prev : elapsed));
      }
    }, 200);
    return () => window.clearInterval(id);
  }, []);

  const ensureStream = useCallback(async (): Promise<MediaStream> => {
    const capability = getAudioRecordingCapability();
    if (!capability.supported) {
      throw new Error(capability.message);
    }
    if (streamHasLiveAudio(streamRef.current)) {
      return streamRef.current!;
    }
    releaseStream();
    try {
      const stream = await getUserMediaWithTimeout(
        { audio: true },
        GET_USER_MEDIA_TIMEOUT_MS,
      );
      if (!streamHasLiveAudio(stream)) {
        stream.getTracks().forEach((track) => track.stop());
        throw new Error("The selected microphone is not ready. Reconnect it and try again.");
      }
      streamRef.current = stream;
      return stream;
    } catch (err) {
      if (err instanceof Error && err.message.includes("timed out")) {
        throw err;
      }
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        throw new Error(
          "Microphone permission was denied. Enable the mic and try again.",
        );
      }
      if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        throw new Error("No microphone found. Connect a mic and try again.");
      }
      throw new Error(
        "Could not access the microphone. Check permissions and try again.",
      );
    }
  }, [releaseStream]);

  const attachWaveform = useCallback(
    async (stream: MediaStream) => {
      const Ctx = getAudioContextConstructor();
      if (!Ctx) return;

      try {
        const audioContext = new Ctx();
        if (audioContext.state === "suspended") {
          await Promise.race([
            audioContext.resume(),
            new Promise<void>((r) => window.setTimeout(r, 80)),
          ]);
        }
        // Waveform is optional — never block MediaRecorder on Safari audio graph.
        if (audioContext.state === "closed") return;

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.72;
        audioContext.createMediaStreamSource(stream).connect(analyser);
        audioContextRef.current = audioContext;
        const samples = new Uint8Array(analyser.frequencyBinCount);
        let lastPaint = 0;
        const paintWaveform = (time: number) => {
          analyser.getByteTimeDomainData(samples);
          if (time - lastPaint >= 50) {
            lastPaint = time;
            const bucketSize = Math.floor(samples.length / 24);
            const next = Array.from({ length: 24 }, (_, index) => {
              let peak = 0;
              for (let i = 0; i < bucketSize; i += 1) {
                peak = Math.max(peak, Math.abs(samples[index * bucketSize + i]! - 128));
              }
              return Math.max(0.08, Math.min(1, peak / 64));
            });
            setWaveform(next);
          }
          // Keep painting while the mic stream is live (not only after React recording=true).
          if (
            mediaRecorderRef.current?.state === "recording" ||
            streamHasLiveAudio(streamRef.current)
          ) {
            analyserFrameRef.current = requestAnimationFrame(paintWaveform);
          }
        };
        analyserFrameRef.current = requestAnimationFrame(paintWaveform);
      } catch {
        stopWaveform();
      }
    },
    [stopWaveform],
  );

  const stopRecording = useCallback((): Promise<RecorderResult | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        cleanup();
        resolve(null);
        return;
      }
      resolveStopRef.current = resolve;
      try {
        // Safari sometimes needs an explicit flush before stop.
        if (typeof recorder.requestData === "function" && recorder.state === "recording") {
          recorder.requestData();
        }
      } catch {
        /* ignore */
      }
      recorder.stop();
    });
  }, [cleanup]);

  const startRecording = useCallback(async (): Promise<boolean> => {
    const isActivelyRecording = () =>
      mediaRecorderRef.current?.state === "recording";

    const markRecording = () => {
      // Always sync UI — even if a remount raced mid-start.
      setRecording(true);
    };

    if (isActivelyRecording()) {
      markRecording();
      return true;
    }
    // Another start is in flight (auto-start) — wait for it instead of failing.
    if (startingRef.current) {
      const deadline = Date.now() + GET_USER_MEDIA_TIMEOUT_MS + 1000;
      while (startingRef.current && Date.now() < deadline) {
        await new Promise((r) => window.setTimeout(r, 100));
        if (isActivelyRecording()) {
          markRecording();
          return true;
        }
      }
      if (isActivelyRecording()) {
        markRecording();
        return true;
      }
      // Previous attempt failed; continue with a fresh start below.
    }

    startingRef.current = true;
    setLastError(null);
    try {
      // Drop dead tracks (common after iOS backgrounding) before re-acquiring.
      if (streamRef.current && !streamHasLiveAudio(streamRef.current)) {
        releaseStream();
      }

      const stream = await ensureStream();
      await attachWaveform(stream);

      const mimeType = getSupportedAudioMimeType();
      let recorder: MediaRecorder;
      try {
        recorder = mimeType
          ? new MediaRecorder(stream, { mimeType })
          : new MediaRecorder(stream);
      } catch {
        // Safari can reject an advertised mimeType; fall back to browser default.
        recorder = new MediaRecorder(stream);
      }

      mediaRecorderRef.current = recorder;
      stream.getAudioTracks().forEach((track) => {
        track.onended = () => {
          if (mediaRecorderRef.current !== recorder || recorder.state === "inactive") return;
          setLastError("The microphone disconnected. Reconnect it and retry this answer.");
          cleanup(true);
          resolveStopRef.current?.(null);
          resolveStopRef.current = null;
        };
      });
      chunksRef.current = [];
      startRef.current = Date.now();
      setSeconds(0);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstart = () => {
        markRecording();
      };

      recorder.onerror = () => {
        setLastError("Recording failed mid-attempt. Please try this question again.");
        cleanup(true);
        resolveStopRef.current?.(null);
        resolveStopRef.current = null;
      };

      recorder.onstop = () => {
        const durationSec = startRef.current
          ? Math.round((Date.now() - startRef.current) / 1000)
          : 0;
        const blobType = recorder.mimeType || mimeType || "audio/mp4";
        const blob = new Blob(chunksRef.current, { type: blobType });
        cleanup();
        setSeconds(durationSec);
        resolveStopRef.current?.({ blob, durationSec });
        resolveStopRef.current = null;
      };

      tickRef.current = window.setInterval(() => {
        if (!startRef.current) return;
        const elapsed = Math.round((Date.now() - startRef.current) / 1000);
        setSeconds(elapsed);
        if (maxDurationSec != null && elapsed >= maxDurationSec) {
          void stopRecording().then(() => onMaxDuration?.());
        }
      }, 400);

      // Timeslice keeps Safari flushing chunks during long answers.
      recorder.start(RECORDER_TIMESLICE_MS);
      markRecording();
      startingRef.current = false;
      return true;
    } catch (err) {
      cleanup();
      const message =
        err instanceof Error
          ? err.message
          : "Could not start recording. Check microphone access.";
      setLastError(message);
      return false;
    }
  }, [
    attachWaveform,
    cleanup,
    ensureStream,
    maxDurationSec,
    onMaxDuration,
    releaseStream,
    stopRecording,
  ]);

  const startRecordingWithBeep = useCallback(async () => {
    // Beep is cosmetic. Never let a suspended Safari AudioContext block the mic.
    try {
      await playRecordingBeep();
    } catch {
      /* ignore */
    }
    return startRecording();
  }, [startRecording]);

  return {
    recording,
    seconds,
    waveform,
    lastError,
    startRecording,
    startRecordingWithBeep,
    stopRecording,
  };
}
