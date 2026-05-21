"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type AudioState = {
  isReady: boolean;
  isStarted: boolean;
  isCompleted: boolean;
  currentTime: number;
  duration: number;
  error: string | null;
};

const INITIAL: AudioState = {
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

  useEffect(() => {
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    audio.preload = "auto";
    audio.crossOrigin = "anonymous";
    audio.controls = false;
    audio.setAttribute("playsinline", "true");
    audioRef.current = audio;

    const onLoaded = () => {
      setState((s) => ({
        ...s,
        isReady: true,
        duration: Number.isFinite(audio.duration) ? audio.duration : 0,
      }));
    };
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
    const onError = () => {
      setState((s) => ({ ...s, error: "Audio failed to load." }));
    };

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audioRef.current = null;
      maxReachedRef.current = 0;
      setState(INITIAL);
    };
  }, [audioUrl]);

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
