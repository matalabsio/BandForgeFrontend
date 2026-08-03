"use client";

import Link from "next/link";
import { formatRemaining } from "@/modules/listening/hooks/use-listening-timer";
import { readingTestHubPath } from "@/lib/reading-test";
import { cn } from "@/lib/utils";

type Props = {
  passage: number;
  testTitle: string;
  hubHref?: string;
  hubLabel?: string;
  remainingSeconds: number;
  timerActive: boolean;
  answeredCount: number;
  totalQuestions: number;
  busy: boolean;
  submitLabel?: string;
  sectionHint?: string;
  showSubmit?: boolean;
  /** Hide IELTS/mock marketing eyebrow (plan practice). */
  plainHeader?: boolean;
  onSubmit: () => void;
};

export function ReadingExamToolbar({
  passage,
  testTitle,
  hubHref = readingTestHubPath(),
  hubLabel = "← Passages",
  remainingSeconds,
  timerActive,
  answeredCount,
  totalQuestions,
  busy,
  submitLabel = "Submit",
  sectionHint,
  showSubmit = true,
  plainHeader = false,
  onSubmit,
}: Props) {
  const warning = remainingSeconds <= 300 && timerActive;
  const critical = remainingSeconds <= 60 && timerActive;
  const pct =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-3 border-b border-[var(--reading-border)] bg-[var(--reading-bar)] px-3 text-white sm:px-4">
      <Link
        href={hubHref}
        className="hidden shrink-0 cursor-pointer text-[11px] font-medium text-white/70 transition-colors hover:text-white sm:inline"
      >
        {hubLabel}
      </Link>
      <div className="min-w-0 flex-1">
        {plainHeader ? (
          <p className="truncate text-[13px] font-medium leading-tight">
            {testTitle || `Passage ${passage}`}
          </p>
        ) : (
          <>
            <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-white/60">
              IELTS Academic Reading
              {sectionHint ? ` · ${sectionHint}` : ` · Passage ${passage}`}
            </p>
            <p className="truncate text-[13px] font-medium leading-tight">
              {testTitle}
            </p>
          </>
        )}
      </div>
      <div className="hidden items-center gap-2 sm:flex">
        <span className="text-[10px] font-medium text-white/50">Progress</span>
        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-[var(--reading-accent)] transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-[11px] tabular-nums text-white/80">
          {answeredCount}/{totalQuestions}
        </span>
      </div>
      <div
        className={cn(
          "flex items-center gap-2 rounded-md border px-3 py-1.5 font-mono text-[13px] font-bold tabular-nums",
          critical
            ? "border-red-400/60 bg-red-950/40 text-red-200"
            : warning
              ? "border-amber-400/50 bg-amber-950/30 text-amber-100"
              : "border-white/20 bg-white/10 text-white",
        )}
        aria-live={warning ? "polite" : "off"}
      >
        <span className="text-[9px] font-sans font-semibold uppercase tracking-wider opacity-70">
          Time
        </span>
        {formatRemaining(remainingSeconds)}
      </div>
      {showSubmit ? (
        <button
          type="button"
          disabled={busy}
          onClick={onSubmit}
          className="shrink-0 cursor-pointer rounded-md bg-[var(--reading-accent)] px-4 py-2 text-[12px] font-bold text-white transition-colors hover:bg-cyan disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Submitting…" : submitLabel}
        </button>
      ) : null}
    </header>
  );
}
