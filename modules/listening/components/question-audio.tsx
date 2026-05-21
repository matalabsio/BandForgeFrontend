"use client";

import { useEffect } from "react";
import { useListeningAudio } from "@/modules/listening/hooks/use-listening-audio";

type Props = {
  audioUrl: string | null;
  played: boolean;
  onStarted?: () => void;
  onCompleted?: () => void;
  variant?: "default" | "exam";
};

function formatTime(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function HeadphonesIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className={className}
      aria-hidden
    >
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" strokeLinecap="round" />
      <path d="M4 14a2 2 0 0 0 2 2h1v5H4v-7zm16 0a2 2 0 0 1-2 2h-1v5h2v-7z" />
    </svg>
  );
}

export function QuestionAudio({
  audioUrl,
  played,
  onStarted,
  onCompleted,
  variant = "default",
}: Props) {
  const audio = useListeningAudio(played ? null : audioUrl);
  const isExam = variant === "exam";

  useEffect(() => {
    if (audio.isCompleted) onCompleted?.();
  }, [audio.isCompleted, onCompleted]);

  if (!audioUrl) {
    return (
      <p className="text-[12px] text-[#a1a1aa]">No audio for this section.</p>
    );
  }

  if (played || audio.isCompleted) {
    return (
      <div
        className={`flex items-center gap-2 text-[12px] ${
          isExam ? "text-[#52525b]" : "rounded-lg border border-teal/40 bg-teal/5 px-3 py-2 text-navy"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[#71717a]" fill="currentColor" aria-hidden>
          <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
        <span>Recording played — cannot be replayed.</span>
      </div>
    );
  }

  const pct = audio.duration > 0 ? (audio.currentTime / audio.duration) * 100 : 0;

  if (isExam) {
    return (
      <div className="border border-[#e4e4e7] bg-[#fafafa]">
        <div className="flex items-stretch gap-0">
          <div className="flex w-12 shrink-0 items-center justify-center border-r border-[#e4e4e7] bg-white text-[#52525b]">
            <HeadphonesIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[12px] font-medium text-[#18181b]">
                {audio.isStarted ? "Playing" : "Listen once only"}
              </p>
              <p className="font-mono text-[11px] tabular-nums text-[#71717a]">
                {formatTime(audio.currentTime)} / {formatTime(audio.duration)}
              </p>
            </div>
            <div
              className="mt-2 h-0.5 w-full overflow-hidden bg-[#e4e4e7]"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(pct)}
            >
              <div
                className="h-full bg-[#18181b] transition-all duration-200 motion-reduce:transition-none"
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>
          </div>
          <button
            type="button"
            disabled={!audio.isReady || audio.isStarted}
            onClick={async () => {
              await audio.start();
              onStarted?.();
            }}
            className="flex w-14 shrink-0 cursor-pointer items-center justify-center border-l border-[#e4e4e7] bg-[#18181b] text-white transition-colors hover:bg-[#27272a] disabled:cursor-not-allowed disabled:bg-[#a1a1aa]"
            aria-label="Play recording once"
          >
            {audio.isStarted ? (
              <span className="flex gap-0.5" aria-hidden>
                <span className="h-3 w-0.5 bg-white" />
                <span className="h-3 w-0.5 bg-white" />
              </span>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>
        {audio.error ? (
          <p className="border-t border-[#fecaca] bg-[#fef2f2] px-4 py-2 text-[12px] text-[#b91c1c]">
            {audio.error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={!audio.isReady || audio.isStarted}
          onClick={async () => {
            await audio.start();
            onStarted?.();
          }}
          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-teal text-white shadow-sm transition-colors hover:bg-teal-light disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Play question audio"
        >
          {audio.isStarted ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
              <rect x="6" y="5" width="4" height="14" />
              <rect x="14" y="5" width="4" height="14" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold text-navy">
            {audio.isStarted ? "Playing — single play only" : "Tap to listen (one time)"}
          </p>
          <div
            className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pct)}
          >
            <div
              className="h-full bg-teal transition-all duration-200"
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
          <p className="mt-0.5 text-[11px] tabular-nums text-ink/55">
            {formatTime(audio.currentTime)} / {formatTime(audio.duration)}
          </p>
        </div>
      </div>
      {audio.error ? (
        <p className="mt-2 rounded-md border border-danger/30 bg-danger/5 px-2 py-1 text-[12px] text-danger">
          {audio.error}
        </p>
      ) : null}
    </div>
  );
}
