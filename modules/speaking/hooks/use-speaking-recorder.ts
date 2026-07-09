"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSupportedAudioMimeType } from "@/modules/speaking/lib/media-recorder-support";
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
  const [lastError, setLastError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);
  const resolveStopRef = useRef<((result: RecorderResult | null) => void) | null>(null);

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const cleanup = useCallback(() => {
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    releaseStream();
    mediaRecorderRef.current = null;
    startRef.current = null;
    setRecording(false);
  }, [releaseStream]);

  useEffect(() => () => cleanup(), [cleanup]);

  const ensureStream = useCallback(async (): Promise<MediaStream> => {
    if (streamHasLiveAudio(streamRef.current)) {
      return streamRef.current!;
    }
    releaseStream();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
      const mimeType = getSupportedAudioMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      startRef.current = Date.now();
      setSeconds(0);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onerror = () => {
        setLastError("Recording failed mid-attempt. Please try this question again.");
        cleanup();
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
    playRecordingBeep();
    return startRecording();
  }, [startRecording]);

  return {
    recording,
    seconds,
    lastError,
    startRecording,
    startRecordingWithBeep,
    stopRecording,
  };
}
