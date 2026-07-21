"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getAudioRecordingCapability,
  getSupportedAudioMimeType,
} from "@/modules/speaking/lib/media-recorder-support";
import { playRecordingBeep } from "@/modules/speaking/lib/play-beep";

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

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const cleanup = useCallback((discardRecorder = false) => {
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (analyserFrameRef.current) {
      cancelAnimationFrame(analyserFrameRef.current);
      analyserFrameRef.current = null;
    }
    const audioContext = audioContextRef.current;
    audioContextRef.current = null;
    if (audioContext && audioContext.state !== "closed") void audioContext.close();
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
    if (mountedRef.current) setRecording(false);
  }, [releaseStream]);

  useEffect(
    () => () => {
      mountedRef.current = false;
      cleanup(true);
      resolveStopRef.current?.(null);
      resolveStopRef.current = null;
    },
    [cleanup],
  );

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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!streamHasLiveAudio(stream)) {
        stream.getTracks().forEach((track) => track.stop());
        throw new Error("The selected microphone is not ready. Reconnect it and try again.");
      }
      streamRef.current = stream;
      return stream;
    } catch (err) {
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

  const stopRecording = useCallback((): Promise<RecorderResult | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        cleanup();
        resolve(null);
        return;
      }
      resolveStopRef.current = resolve;
      recorder.stop();
    });
  }, [cleanup]);

  const startRecording = useCallback(async (): Promise<boolean> => {
    setLastError(null);
    try {
      // Drop dead tracks (common after iOS backgrounding) before re-acquiring.
      if (streamRef.current && !streamHasLiveAudio(streamRef.current)) {
        releaseStream();
      }

      const stream = await ensureStream();
      const AudioContextConstructor = window.AudioContext;
      const audioContext = new AudioContextConstructor();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.72;
      audioContext.createMediaStreamSource(stream).connect(analyser);
      audioContextRef.current = audioContext;
      const samples = new Uint8Array(analyser.frequencyBinCount);
      let lastPaint = 0;
      const paintWaveform = (time: number) => {
        analyser.getByteTimeDomainData(samples);
        if (time - lastPaint >= 50 && mountedRef.current) {
          lastPaint = time;
          const bucketSize = Math.floor(samples.length / 24);
          setWaveform(
            Array.from({ length: 24 }, (_, index) => {
              let peak = 0;
              for (let i = 0; i < bucketSize; i += 1) {
                peak = Math.max(peak, Math.abs(samples[index * bucketSize + i] - 128));
              }
              return Math.max(0.08, Math.min(1, peak / 64));
            }),
          );
        }
        analyserFrameRef.current = requestAnimationFrame(paintWaveform);
      };
      analyserFrameRef.current = requestAnimationFrame(paintWaveform);
      const mimeType = getSupportedAudioMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

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
        const blobType = recorder.mimeType || mimeType || "audio/webm";
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

      // Full blob on stop — no timeslice upload streaming.
      recorder.start();
      setRecording(true);
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
    cleanup,
    ensureStream,
    maxDurationSec,
    onMaxDuration,
    releaseStream,
    stopRecording,
  ]);

  const startRecordingWithBeep = useCallback(async () => {
    await playRecordingBeep();
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
