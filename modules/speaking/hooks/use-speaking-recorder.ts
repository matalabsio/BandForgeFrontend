"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { playRecordingBeep } from "@/modules/speaking/lib/play-beep";

export type RecorderResult = {
  blob: Blob;
  durationSec: number;
};

type UseSpeakingRecorderOptions = {
  maxDurationSec?: number;
  onMaxDuration?: () => void;
};

export function useSpeakingRecorder(options: UseSpeakingRecorderOptions = {}) {
  const { maxDurationSec, onMaxDuration } = options;
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);
  const resolveStopRef = useRef<((result: RecorderResult | null) => void) | null>(null);

  const cleanup = useCallback(() => {
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;
    startRef.current = null;
    setRecording(false);
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

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
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      streamRef.current = stream;
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      startRef.current = Date.now();
      setSeconds(0);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const durationSec = startRef.current
          ? Math.round((Date.now() - startRef.current) / 1000)
          : 0;
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
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

      recorder.start();
      setRecording(true);
      return true;
    } catch {
      cleanup();
      return false;
    }
  }, [cleanup, maxDurationSec, onMaxDuration, stopRecording]);

  const startRecordingWithBeep = useCallback(async () => {
    playRecordingBeep();
    return startRecording();
  }, [startRecording]);

  return {
    recording,
    seconds,
    startRecording,
    startRecordingWithBeep,
    stopRecording,
  };
}
