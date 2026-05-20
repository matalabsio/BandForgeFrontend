"use client";

import { useEffect } from "react";
import { useListeningAudio } from "@/modules/listening/hooks/use-listening-audio";

type Props = {
  audioUrl: string | null;
  played: boolean;
  onStarted?: () => void;
  onCompleted?: () => void;
};

function formatTime(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * Compact per-question audio control.
 * Plays exactly once. Re-mount with the same audioUrl will still respect
 * the parent-managed `played` flag — the button stays disabled.
 */
export function QuestionAudio({
  audioUrl,
  played,
  onStarted,
  onCompleted,
}: Props) {
  const audio = useListeningAudio(played ? null : audioUrl);

  useEffect(() => {
    if (audio.isCompleted) onCompleted?.();
  }, [audio.isCompleted, onCompleted]);

  if (!audioUrl) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface px-3 py-2 text-[12px] text-ink/60">
        No audio attached.
      </div>
    );
  }

  if (played || audio.isCompleted) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-teal/40 bg-teal/5 px-3 py-2 text-[12px] text-navy">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-teal" fill="currentColor" aria-hidden>
          <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
        Audio played. Recording cannot be repeated.
      </div>
    );
  }

  const pct = audio.duration > 0 ? (audio.currentTime / audio.duration) * 100 : 0;

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
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal text-white shadow-sm transition-colors hover:bg-teal-light disabled:cursor-not-allowed disabled:opacity-60"
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
