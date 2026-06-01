"use client";

import { useEffect, useRef, useState } from "react";
import { useListeningAudio } from "@/modules/listening/hooks/use-listening-audio";

type Props = {
  audioUrl: string | null;
  played: boolean;
  onStarted?: () => void;
  onCompleted?: () => void;
  variant?: "default" | "exam";
  /** Exam: autoplay once when the section loads and audio is ready. */
  autoplay?: boolean;
  /** Shown under the player (exam). */
  sectionNote?: string;
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
  autoplay = false,
  sectionNote,
}: Props) {
  const audio = useListeningAudio(played ? null : audioUrl);
  const isExam = variant === "exam";
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const autoplayTriedRef = useRef(false);
  const urlRef = useRef(audioUrl);

  useEffect(() => {
    if (urlRef.current !== audioUrl) {
      urlRef.current = audioUrl;
      autoplayTriedRef.current = false;
      setAutoplayBlocked(false);
    }
  }, [audioUrl]);

  useEffect(() => {
    if (audio.isCompleted) onCompleted?.();
  }, [audio.isCompleted, onCompleted]);

  useEffect(() => {
    if (!autoplay || played || audio.isStarted || audio.isCompleted) return;
    if (!audio.isReady || autoplayTriedRef.current) return;
    autoplayTriedRef.current = true;
    void (async () => {
      try {
        await audio.start();
        onStarted?.();
        setAutoplayBlocked(false);
      } catch {
        setAutoplayBlocked(true);
      }
    })();
  }, [
    autoplay,
    played,
    audio.isReady,
    audio.isStarted,
    audio.isCompleted,
    audio.start,
    onStarted,
  ]);

  if (!audioUrl) {
    return (
      <p className="text-[12px] leading-relaxed text-[var(--exam-ink-muted)]">
        Listening audio is not configured. From{" "}
        <code className="rounded bg-[var(--exam-border)] px-1 text-[11px]">
          backend/
        </code>
        , run{" "}
        <code className="rounded bg-[var(--exam-border)] px-1 text-[11px]">
          python -m scripts.upload_listening_audio --preset m01
        </code>
        .
      </p>
    );
  }

  if (played || audio.isCompleted) {
    return (
      <output
        className={
          isExam
            ? "flex items-center gap-3 rounded-lg border border-[var(--exam-border)] bg-white px-4 py-3"
            : "flex items-center gap-2 rounded-lg border border-teal/40 bg-teal/5 px-3 py-2 text-[12px] text-navy"
        }
      >
        <span
          className={
            isExam
              ? "flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--exam-accent-soft)] text-[var(--exam-accent)]"
              : undefined
          }
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
            <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        </span>
        <div>
          <p
            className={
              isExam
                ? "text-[13px] font-semibold text-[var(--exam-ink)]"
                : undefined
            }
          >
            Recording finished
          </p>
          <p
            className={
              isExam
                ? "mt-0.5 text-[12px] text-[var(--exam-ink-muted)]"
                : undefined
            }
          >
            This clip cannot be played again. Answer questions 1–10 on the right.
          </p>
        </div>
      </output>
    );
  }

  const pct = audio.duration > 0 ? (audio.currentTime / audio.duration) * 100 : 0;

  if (isExam) {
    const statusLabel = audio.isStarted
      ? "Now playing — do not leave this page"
      : autoplayBlocked
        ? "Tap below to start the recording"
        : audio.isLoading || !audio.isReady
          ? "Preparing audio…"
          : "Starting playback…";

    return (
      <div className="overflow-hidden rounded-lg border border-[var(--exam-border)] bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-[var(--exam-border)] bg-[var(--exam-paper)] px-4 py-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-[var(--exam-border)] bg-white text-[var(--exam-ink-muted)]">
            <HeadphonesIcon className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--exam-accent)]">
              Listening · Questions 1–10
            </p>
            <p className="text-[13px] font-medium text-[var(--exam-ink)]">{statusLabel}</p>
          </div>
          {audio.isStarted ? (
            <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-red-700">
              <span className="size-1.5 animate-pulse rounded-full bg-red-600 motion-reduce:animate-none" />
              Live
            </span>
          ) : audio.isLoading || !audio.isReady ? (
            <span
              className="size-5 animate-spin rounded-full border-2 border-[var(--exam-border)] border-t-[var(--exam-accent)] motion-reduce:animate-none"
              aria-hidden
            />
          ) : null}
        </div>

        <div className="px-4 py-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[12px] text-[var(--exam-ink-muted)]">Progress</p>
            <p className="font-mono text-[12px] tabular-nums text-[var(--exam-ink)]">
              {formatTime(audio.currentTime)} / {formatTime(audio.duration)}
            </p>
          </div>
          <div
            className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--exam-border)]"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pct)}
            aria-label="Audio progress"
          >
            <div
              className="h-full rounded-full bg-[var(--exam-bar)] transition-[width] duration-200 motion-reduce:transition-none"
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>

          {autoplayBlocked && !audio.isStarted && !audio.error ? (
            <button
              type="button"
              disabled={!audio.isReady}
              onClick={async () => {
                setAutoplayBlocked(false);
                try {
                  await audio.start();
                  onStarted?.();
                } catch {
                  setAutoplayBlocked(true);
                }
              }}
              className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-[var(--exam-bar)] px-4 py-3 text-[13px] font-bold text-white transition-colors hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
              Start recording (plays once)
            </button>
          ) : null}

          {audio.error ? (
            <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-800">
              {audio.error}
            </p>
          ) : null}
        </div>

        <p className="border-t border-[var(--exam-border)] bg-[var(--exam-paper)] px-4 py-2.5 text-[11px] leading-relaxed text-[var(--exam-ink-muted)]">
          {sectionNote ??
            "One recording for all 10 questions. It plays once automatically when ready. Pausing and replay are disabled."}
        </p>
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
          className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-teal text-white shadow-sm transition-colors hover:bg-teal-light disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Play question audio"
        >
          {audio.isStarted ? (
            <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
              <rect x="6" y="5" width="4" height="14" />
              <rect x="14" y="5" width="4" height="14" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
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
