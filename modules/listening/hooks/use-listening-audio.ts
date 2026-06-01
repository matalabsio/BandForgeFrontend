"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type AudioState = {
  isLoading: boolean;
  isReady: boolean;
  isStarted: boolean;
  isCompleted: boolean;
  currentTime: number;
  duration: number;
  error: string | null;
};

const INITIAL: AudioState = {
  isLoading: false,
  isReady: false,
  isStarted: false,
  isCompleted: false,
  currentTime: 0,
  duration: 0,
  error: null,
};

/**
 * Strict IELTS-style listening audio.
 * - No native controls.
 * - Plays once. No replay. No backward seek (clamped to monotonic max).
 * - Requires a user gesture to start (iOS-safe).
 */
export function useListeningAudio(audioUrl: string | null) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const maxReachedRef = useRef(0);
  const [state, setState] = useState<AudioState>(INITIAL);

  const suggestedUpload = useCallback((): string | null => {
    if (!audioUrl) return null;
    const clean = audioUrl.split("?")[0] ?? audioUrl;

    // Expected key shape: listening/<preset>/part-<N>/full.mp3
    const m = clean.match(/listening\/([^/]+)\/part-(\d+)\/full\.mp3/i);
    if (m) {
      const preset = m[1];
      const part = m[2];
      return `listening/${preset}/part-${part}/full.mp3`;
    }

    const partOnly = clean.match(/part-(\d+)/i)?.[1];
    if (partOnly) return `listening/m01/part-${partOnly}/full.mp3`;

    return null;
  }, [audioUrl]);

  useEffect(() => {
    if (!audioUrl) return;
    setState({ ...INITIAL, isLoading: true });
    const audio = new Audio(audioUrl);
    audio.preload = "auto";
    // Do not set crossOrigin: R2 presigned URLs omit CORS headers and the
    // browser will reject the resource with crossOrigin="anonymous".
    audio.controls = false;
    audio.setAttribute("playsinline", "true");
    audioRef.current = audio;

    const markReady = () => {
      setState((s) => ({
        ...s,
        isLoading: false,
        isReady: true,
        duration: Number.isFinite(audio.duration) ? audio.duration : 0,
      }));
    };
    const onLoaded = () => markReady();
    const onCanPlay = () => markReady();
    const onTime = () => {
      const t = audio.currentTime;
      if (t > maxReachedRef.current) {
        maxReachedRef.current = t;
      } else if (t < maxReachedRef.current - 0.4) {
        // backward seek attempted — clamp forward
        audio.currentTime = maxReachedRef.current;
      }
      setState((s) => ({ ...s, currentTime: audio.currentTime }));
    };
    const onEnded = () => {
      setState((s) => ({ ...s, isCompleted: true, isStarted: false }));
    };
    const onPause = () => {
      if (audio.ended) return;
      if (audio.currentTime > 0 && audio.currentTime < (audio.duration || Infinity)) {
        void audio.play().catch(() => undefined);
      }
    };
    const onError = () => {
      const code = audio.error?.code;
      const detail =
        code === MediaError.MEDIA_ERR_NETWORK
          ? "Network error loading audio."
          : code === MediaError.MEDIA_ERR_DECODE
            ? "Audio file could not be decoded."
            : code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED
              ? `Audio file missing or invalid. ${
                  suggestedUpload()
                    ? `Upload ${suggestedUpload()} to R2.`
                    : "Upload the correct listening full.mp3 for this part to R2."
                }`
              : "Audio failed to load.";
      setState((s) => ({ ...s, isLoading: false, error: detail }));
    };

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", onError);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("error", onError);
      audioRef.current = null;
      maxReachedRef.current = 0;
      setState(INITIAL);
    };

    audio.load();
  }, [audioUrl, suggestedUpload]);

  const start = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      await audio.play();
      setState((s) => ({ ...s, isStarted: true, error: null }));
    } catch (e) {
      setState((s) => ({
        ...s,
        error:
          e instanceof Error
            ? e.message
            : "Could not start audio. Tap the play button again.",
      }));
    }
  }, []);

  useEffect(() => {
    const blockSeekKeys = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }
      const blocked = ["ArrowLeft", "ArrowRight", " ", "Space", "MediaTrackPrevious"];
      if (blocked.includes(e.key) || blocked.includes(e.code)) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", blockSeekKeys);
    return () => window.removeEventListener("keydown", blockSeekKeys);
  }, []);

  return { ...state, start };
}
