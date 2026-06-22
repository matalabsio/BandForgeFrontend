"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn, formatTimer } from "@/lib/utils";

type Props = {
  src: string;
  className?: string;
};

function formatAudioTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function DiagnosticAudioStrip({ src, className }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrent(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnd = () => {
      setPlaying(false);
      setEnded(true);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    void audio.play().catch(() => {
      /* autoplay blocked */
    });

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [src]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || ended) return;
    if (playing) {
      audio.pause();
    } else {
      void audio.play();
    }
  }, [playing, ended]);

  const progress = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div
      className={cn(
        "rounded-2xl border border-navy/10 bg-navy/[0.04] p-4 sm:p-[18px]",
        className,
      )}
    >
      <audio ref={audioRef} src={src} preload="auto" />
      <p className="mb-3.5 font-mono text-[9px] tracking-[0.14em] text-[#5E84A8] uppercase">
        Recording · plays once
      </p>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggle}
          disabled={ended}
          className={cn(
            "flex size-[46px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-cyan shadow-[0_6px_16px_rgba(0,188,212,0.35)] transition-opacity",
            ended && "cursor-not-allowed opacity-50",
          )}
          aria-label={playing ? "Pause" : ended ? "Playback finished" : "Play"}
        >
          {playing ? (
            <Pause className="size-4 fill-[#06222B] text-[#06222B]" />
          ) : (
            <Play className="ml-0.5 size-4 fill-[#06222B] text-[#06222B]" />
          )}
        </button>
        <div className="min-w-0 flex-1">
          <div className="relative h-[5px] rounded-sm bg-navy/14">
            <div
              className="absolute inset-y-0 left-0 rounded-sm bg-cyan transition-[width] duration-150"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 size-[13px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal shadow-sm"
              style={{ left: `${progress}%` }}
            />
          </div>
          <p className="mt-2 font-mono text-xs text-[#5A6B82]">
            {formatAudioTime(current)}
            <span className="text-[#5E708C]">
              {" "}
              / {duration > 0 ? formatAudioTime(duration) : formatTimer(0)}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
