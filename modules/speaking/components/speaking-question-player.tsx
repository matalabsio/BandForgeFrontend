"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Headphones, Loader2 } from "lucide-react";
import {
  canSpeakPrompt,
  speakPromptText,
  stopSpeakingPrompt,
} from "@/modules/speaking/lib/speak-question-prompt";
import { cn } from "@/lib/utils";

type Props = {
  videoUrl?: string;
  audioUrl?: string;
  prompt: string;
  partLabel: string;
  onEnded: () => void;
  playKey: string;
  variant?: "mock" | "diagnostic";
};

export function SpeakingQuestionPlayer({
  videoUrl,
  audioUrl,
  prompt,
  partLabel,
  onEnded,
  playKey,
  variant = "mock",
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const autoEndedRef = useRef(false);
  const cancelSpeakRef = useRef<(() => void) | null>(null);
  const onEndedRef = useRef(onEnded);
  const [isListening, setIsListening] = useState(false);

  onEndedRef.current = onEnded;

  const finishAutoPlay = useCallback(() => {
    if (autoEndedRef.current) return;
    autoEndedRef.current = true;
    onEndedRef.current();
  }, []);

  const stopPlayback = useCallback(() => {
    cancelSpeakRef.current?.();
    cancelSpeakRef.current = null;
    stopSpeakingPrompt();
    videoRef.current?.pause();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsListening(false);
  }, []);

  // Auto-play once per playKey only — avoid restarting when parent re-renders.
  useEffect(() => {
    autoEndedRef.current = false;
    stopPlayback();

    let cancelled = false;
    let fallbackTimer: number | undefined;

    const runAutoPlay = async () => {
      const video = videoRef.current;
      if (videoUrl && video) {
        setIsListening(true);
        video.currentTime = 0;
        try {
          await video.play();
        } catch {
          if (!cancelled) {
            setIsListening(false);
            finishAutoPlay();
          }
        }
        return;
      }

      const audio = audioRef.current;
      if (audioUrl && audio) {
        setIsListening(true);
        audio.currentTime = 0;
        try {
          await audio.play();
        } catch {
          if (!cancelled) {
            setIsListening(false);
            finishAutoPlay();
          }
        }
        return;
      }

      if (canSpeakPrompt()) {
        setIsListening(true);
        cancelSpeakRef.current = speakPromptText(prompt, () => {
          if (cancelled) return;
          cancelSpeakRef.current = null;
          setIsListening(false);
          finishAutoPlay();
        });
        return;
      }

      fallbackTimer = window.setTimeout(() => {
        if (!cancelled) finishAutoPlay();
      }, 2200);
    };

    void runAutoPlay();

    return () => {
      cancelled = true;
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      stopPlayback();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- play once per question key only
  }, [playKey, videoUrl, audioUrl, prompt]);

  const playManual = useCallback(async () => {
    stopPlayback();
    autoEndedRef.current = true;

    const video = videoRef.current;
    if (videoUrl && video) {
      setIsListening(true);
      video.currentTime = 0;
      try {
        await video.play();
      } catch {
        setIsListening(false);
      }
      return;
    }

    const audio = audioRef.current;
    if (audioUrl && audio) {
      setIsListening(true);
      audio.currentTime = 0;
      try {
        await audio.play();
      } catch {
        setIsListening(false);
      }
      return;
    }

    if (canSpeakPrompt()) {
      setIsListening(true);
      cancelSpeakRef.current = speakPromptText(prompt, () => {
        cancelSpeakRef.current = null;
        setIsListening(false);
      });
    }
  }, [audioUrl, prompt, stopPlayback, videoUrl]);

  const handleListen = useCallback(() => {
    if (isListening) {
      const wasWaitingForFirstPlay = !autoEndedRef.current;
      stopPlayback();
      if (wasWaitingForFirstPlay) {
        finishAutoPlay();
      }
      return;
    }
    void playManual();
  }, [finishAutoPlay, isListening, playManual, stopPlayback]);

  const handleMediaEnded = useCallback(() => {
    setIsListening(false);
    if (!autoEndedRef.current) {
      finishAutoPlay();
    }
  }, [finishAutoPlay]);

  const listenLabel = isListening ? "Stop" : "Listen";
  const canListen = Boolean(videoUrl || audioUrl || canSpeakPrompt());

  return (
    <div
      className={cn(
        "rounded-[18px] border border-navy/12 bg-white p-4 sm:p-5",
        variant === "diagnostic" && "shadow-[0_14px_30px_rgba(13,31,60,0.07)]",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        {variant !== "diagnostic" ? (
          <p className="font-mono text-[10px] tracking-wider text-teal uppercase sm:text-[10.5px]">
            {partLabel}
          </p>
        ) : null}
        {canListen ? (
          <button
            type="button"
            onClick={handleListen}
            className={cn(
              "inline-flex min-h-[36px] shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors duration-200 sm:text-[13px]",
              isListening
                ? "border-cyan/45 bg-cyan/12 text-teal"
                : "border-navy/15 bg-slate-50 text-navy hover:border-cyan/40 hover:bg-cyan/10",
            )}
            aria-label={isListening ? "Stop listening to question" : "Listen to examiner question"}
          >
            {isListening ? (
              <Loader2 className="size-3.5 shrink-0 motion-safe:animate-spin" />
            ) : (
              <Headphones className="size-3.5 shrink-0" />
            )}
            {listenLabel}
          </button>
        ) : null}
      </div>

      {videoUrl ? (
        <video
          ref={videoRef}
          key={playKey}
          src={videoUrl}
          className="mt-4 aspect-video w-full max-w-full rounded-xl bg-navy/10 object-cover"
          playsInline
          onEnded={handleMediaEnded}
        />
      ) : null}

      {audioUrl && !videoUrl ? (
        <audio
          ref={audioRef}
          key={playKey}
          src={audioUrl}
          onEnded={handleMediaEnded}
          className="hidden"
        />
      ) : null}

      {!videoUrl ? (
        <div className="mt-4 rounded-xl border border-navy/15 bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6E83A0]">
            Examiner question
          </p>
          <p className="mt-2 break-words whitespace-pre-wrap text-sm leading-relaxed text-navy sm:text-[15px] sm:leading-relaxed">
            {prompt}
          </p>
          <p className="mt-3 text-xs leading-relaxed text-[#6E83A0]">
            {canListen
              ? "Tap Listen to hear the examiner. Recording starts automatically after the question plays once."
              : "Recording will start automatically after the question plays."}
          </p>
        </div>
      ) : null}
    </div>
  );
}

/** Read-only question card shown while the student is answering. */
export function SpeakingQuestionCard({
  prompt,
  partLabel,
  videoUrl,
  variant = "mock",
}: {
  prompt: string;
  partLabel: string;
  /** When present, video is primary — do not show examiner text. */
  videoUrl?: string;
  variant?: "mock" | "diagnostic";
}) {
  const hasVideo = Boolean(videoUrl);

  return (
    <div
      className={cn(
        "rounded-[18px] border border-navy/12 bg-white p-4 sm:p-5",
        variant === "diagnostic" && "shadow-[0_14px_30px_rgba(13,31,60,0.07)]",
      )}
    >
      {variant !== "diagnostic" ? (
        <p className="font-mono text-[10px] tracking-wider text-teal uppercase sm:text-[10.5px]">
          {partLabel}
        </p>
      ) : null}
      {hasVideo ? (
        <p className="mt-3 text-sm leading-relaxed text-[#475569]">
          Answer the examiner&apos;s question. Recording is in progress.
        </p>
      ) : (
        <div className="mt-4 rounded-xl border border-navy/15 bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6E83A0]">
            Examiner question
          </p>
          <p className="mt-2 break-words whitespace-pre-wrap text-sm leading-relaxed text-navy sm:text-[15px]">
            {prompt}
          </p>
        </div>
      )}
    </div>
  );
}
