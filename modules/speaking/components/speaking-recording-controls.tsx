"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Headphones, Mic, Pause, Play, RotateCcw, Square } from "lucide-react";
import { formatAudioDuration } from "@/modules/speaking/lib/media-recorder-support";
import { cn } from "@/lib/utils";

export type RecordingControlPhase = "idle" | "recording" | "captured";

type Props = {
  phase: RecordingControlPhase;
  seconds: number;
  countdownSec?: number | null;
  answerBlob?: Blob | null;
  onStop: () => void;
  onRerecord: () => void;
  onStart?: () => void;
  className?: string;
  showStart?: boolean;
};

export function SpeakingRecordingControls({
  phase,
  seconds,
  countdownSec,
  answerBlob,
  onStop,
  onRerecord,
  onStart,
  className,
  showStart = false,
}: Props) {
  const recording = phase === "recording";
  const captured = phase === "captured";
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [isHearing, setIsHearing] = useState(false);
  const [playbackDuration, setPlaybackDuration] = useState(seconds);

  useEffect(() => {
    if (!answerBlob) {
      setPlaybackUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setIsHearing(false);
      return;
    }

    const url = URL.createObjectURL(answerBlob);
    setPlaybackUrl(url);
    setPlaybackDuration(seconds);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [answerBlob, seconds]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !playbackUrl) return;

    audio.src = playbackUrl;
    audio.load();

    const onLoaded = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setPlaybackDuration(audio.duration);
      }
    };
    const onEnded = () => setIsHearing(false);
    const onPause = () => setIsHearing(false);
    const onPlay = () => setIsHearing(true);

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("play", onPlay);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("play", onPlay);
    };
  }, [playbackUrl]);

  const toggleHear = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !playbackUrl) return;

    try {
      if (isHearing) {
        audio.pause();
        return;
      }
      audio.currentTime = 0;
      await audio.play();
    } catch {
      setIsHearing(false);
    }
  }, [isHearing, playbackUrl]);

  const label =
    countdownSec != null
      ? `Recording… ${seconds}s / ${countdownSec}s`
      : recording
        ? `Recording… ${seconds}s`
        : captured
          ? `Answer captured · ${formatAudioDuration(playbackDuration || seconds)}`
          : "Waiting to record";

  return (
    <div
      className={cn(
        "rounded-[16px] border border-cyan/25 bg-cyan/5 px-4 py-5 sm:px-6",
        className,
      )}
    >
      <audio ref={audioRef} className="hidden" playsInline preload="auto" />

      <div className="flex items-center justify-center gap-2">
        <span
          className={cn(
            "size-3 shrink-0 rounded-full",
            recording ? "bg-red-500 motion-safe:animate-pulse" : captured ? "bg-teal" : "bg-navy/20",
          )}
          aria-hidden
        />
        <span className="text-sm font-semibold text-navy">
          {recording ? "Recording in progress" : captured ? "Answer ready" : "Ready to record"}
        </span>
      </div>

      <div
        className="mx-auto my-4 flex h-10 w-full max-w-xs items-end justify-center gap-1 overflow-hidden"
        aria-hidden
      >
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "w-1 shrink-0 rounded-sm bg-cyan",
              (recording || isHearing) && "motion-safe:animate-[bfwave_1.1s_ease-in-out_infinite]",
            )}
            style={{
              height: recording || isHearing ? `${10 + (i % 5) * 6}px` : captured ? "10px" : "6px",
              animationDelay: recording || isHearing ? `${i * 0.05}s` : undefined,
            }}
          />
        ))}
      </div>

      <p className="text-center font-mono text-sm text-[#5A6B82]">{label}</p>

      {captured && playbackUrl ? (
        <button
          type="button"
          onClick={() => void toggleHear()}
          className={cn(
            "mt-4 flex w-full cursor-pointer items-center gap-2.5 rounded-xl border border-navy/10 bg-white px-3 py-2.5 text-left transition-colors duration-200 hover:border-cyan/30 hover:bg-cyan/5",
            isHearing && "border-cyan/40 ring-2 ring-cyan/20",
          )}
          aria-label={isHearing ? "Stop playback" : "Hear what you spoke"}
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cyan">
            {isHearing ? (
              <Pause className="size-4 fill-[#06222B] text-[#06222B]" />
            ) : (
              <Play className="size-4 fill-[#06222B] text-[#06222B]" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-navy">
              {isHearing ? "Playing your answer…" : "Hear what you spoke"}
            </p>
            <p className="text-xs text-[#6E83A0]">Tap to listen before continuing</p>
          </div>
          <span className="shrink-0 font-mono text-[10px] text-[#6E83A0]">
            {formatAudioDuration(playbackDuration || seconds)}
          </span>
        </button>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-5 sm:gap-3">
        {showStart && onStart ? (
          <button
            type="button"
            onClick={onStart}
            disabled={recording || captured}
            className="col-span-2 flex min-h-[var(--spacing-touch,48px)] cursor-pointer items-center justify-center gap-2 rounded-[11px] border border-cyan/30 bg-cyan px-4 text-sm font-semibold text-[#06222B] transition-colors duration-200 hover:bg-brand-sky-hover disabled:cursor-not-allowed disabled:opacity-50 sm:text-[15px]"
          >
            <Mic className="size-4 shrink-0" />
            Start recording
          </button>
        ) : null}

        <button
          type="button"
          onClick={onStop}
          disabled={!recording}
          className={cn(
            "flex min-h-[var(--spacing-touch,48px)] cursor-pointer items-center justify-center gap-2 rounded-[11px] border px-3 text-sm font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-45 sm:text-[15px]",
            recording
              ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
              : "border-navy/12 bg-white text-[#6E83A0]",
          )}
        >
          <Square className="size-3.5 shrink-0 fill-current" />
          Stop
        </button>

        <button
          type="button"
          onClick={() => void toggleHear()}
          disabled={!captured || !playbackUrl}
          className={cn(
            "flex min-h-[var(--spacing-touch,48px)] cursor-pointer items-center justify-center gap-2 rounded-[11px] border px-3 text-sm font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-45 sm:text-[15px]",
            captured && playbackUrl
              ? "border-navy/12 bg-white text-navy hover:border-cyan/30 hover:bg-cyan/5"
              : "border-navy/12 bg-white text-[#6E83A0]",
            isHearing && "border-cyan/40 bg-cyan/10 text-teal",
          )}
        >
          {isHearing ? (
            <Pause className="size-3.5 shrink-0" />
          ) : (
            <Headphones className="size-3.5 shrink-0" />
          )}
          Hear
        </button>

        <button
          type="button"
          onClick={onRerecord}
          disabled={recording}
          className={cn(
            "col-span-2 flex min-h-[var(--spacing-touch,48px)] cursor-pointer items-center justify-center gap-2 rounded-[11px] border px-3 text-sm font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-45 sm:text-[15px]",
            captured
              ? "border-navy/12 bg-white text-navy hover:border-cyan/30 hover:bg-cyan/5"
              : "border-navy/12 bg-white text-[#6E83A0] hover:bg-navy/[0.03]",
          )}
        >
          <RotateCcw className="size-3.5 shrink-0" />
          Re-record
        </button>
      </div>
    </div>
  );
}
