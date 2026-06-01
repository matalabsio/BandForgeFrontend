"use client";

import Link from "next/link";
import { formatRemaining } from "@/modules/listening/hooks/use-listening-timer";
import { cn } from "@/lib/utils";

type Props = {
  moduleName: string;
  stageLabel: string;
  testTitle: string;
  hubHref: string;
  hubLabel?: string;
  remainingSeconds: number;
  timerActive: boolean;
  answeredCount: number;
  totalQuestions: number;
  busy: boolean;
  submitLabel?: string;
  sectionHint?: string;
  onSubmit: () => void;
};

export function IeltsExamToolbar({
  moduleName,
  stageLabel,
  testTitle,
  hubHref,
  hubLabel = "← Back",
  remainingSeconds,
  timerActive,
  answeredCount,
  totalQuestions,
  busy,
  submitLabel = "Submit",
  sectionHint,
  onSubmit,
}: Props) {
  const warning = remainingSeconds <= 300 && timerActive;
  const critical = remainingSeconds <= 60 && timerActive;
  const pct =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-2 border-b border-[var(--exam-border)] bg-[var(--exam-bar)] px-2 text-white sm:gap-3 sm:px-4">
      <Link
        href={hubHref}
        className="hidden shrink-0 cursor-pointer text-[11px] font-medium text-white/70 transition-colors hover:text-white sm:inline"
      >
        {hubLabel}
      </Link>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-white/60 sm:text-[11px]">
          IELTS Academic {moduleName}
          {sectionHint ? ` · ${sectionHint}` : ` · ${stageLabel}`}
        </p>
        <p className="truncate text-[12px] font-medium leading-tight sm:text-[13px]">
          {testTitle}
        </p>
      </div>
      <div className="hidden items-center gap-2 md:flex">
        <span className="text-[10px] font-medium text-white/50">Progress</span>
        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/20 lg:w-20">
          <div
            className="h-full rounded-full bg-[var(--exam-accent)] transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-[11px] tabular-nums text-white/80">
          {answeredCount}/{totalQuestions}
        </span>
      </div>
      <div
        className={cn(
          "flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1.5 font-mono text-[12px] font-bold tabular-nums sm:gap-2 sm:px-3 sm:text-[13px]",
          critical
            ? "border-red-400/60 bg-red-950/40 text-red-200"
            : warning
              ? "border-amber-400/50 bg-amber-950/30 text-amber-100"
              : "border-white/20 bg-white/10 text-white",
        )}
        aria-live={warning ? "polite" : "off"}
      >
        <span className="hidden text-[9px] font-sans font-semibold uppercase tracking-wider opacity-70 sm:inline">
          Time
        </span>
        {formatRemaining(remainingSeconds)}
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={onSubmit}
        className="shrink-0 cursor-pointer rounded-md bg-[var(--exam-accent)] px-3 py-2 text-[11px] font-bold text-white transition-colors hover:bg-[#0891B2] disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:text-[12px]"
      >
        {busy ? "…" : submitLabel}
      </button>
    </header>
  );
}
