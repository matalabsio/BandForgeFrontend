"use client";

import { useState, type ReactNode } from "react";
import {
  CheckCircle2,
  Clock,
  Cloud,
  CloudOff,
  FileText,
  PencilLine,
} from "lucide-react";
import { TestTimer } from "@/modules/shared";
import { ExamPartFooter } from "@/components/exam/exam-part-footer";
import { cn } from "@/lib/utils";

type MobilePanel = "prompt" | "write";

type Props = {
  activePart: 1 | 2;
  isMock: boolean;
  displayLabel?: string;
  remainingSeconds: number;
  wordCount: number;
  minWords: number;
  estimatedBand: number;
  saved: boolean;
  busy: boolean;
  submitLabel: string;
  error: string | null;
  prompt: ReactNode;
  essay: string;
  onEssayChange: (value: string) => void;
  onSubmit: () => void;
};

function wordProgress(count: number, min: number): number {
  if (min <= 0) return count > 0 ? 100 : 0;
  return Math.min(100, Math.round((count / min) * 100));
}

export function WritingExamWorkspace({
  activePart,
  isMock,
  displayLabel,
  remainingSeconds,
  wordCount,
  minWords,
  estimatedBand,
  saved,
  busy,
  submitLabel,
  error,
  prompt,
  essay,
  onEssayChange,
  onSubmit,
}: Props) {
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("write");
  const progress = wordProgress(wordCount, minWords);
  const metMin = minWords > 0 && wordCount >= minWords;

  return (
    <div className="flex min-h-dvh flex-col bg-surface text-ink">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-sm">
        <div className="flex h-14 items-center justify-between gap-3 px-4 md:h-[3.75rem] md:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#ECFEFF] text-teal">
              <PencilLine className="size-[18px]" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-bold leading-tight text-ink">
                Writing · Task {activePart}
              </p>
              <p className="truncate text-[11px] text-[#64748B]">
                {displayLabel ?? "IELTS Academic"}
                {isMock ? " · Full mock" : ""}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span
              className={cn(
                "hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold sm:inline-flex",
                saved
                  ? "bg-[#ECFDF5] text-[#059669]"
                  : "bg-[#FEF3C7] text-[#D97706]",
              )}
            >
              {saved ? (
                <Cloud className="size-3.5" aria-hidden />
              ) : (
                <CloudOff className="size-3.5" aria-hidden />
              )}
              {saved ? "Saved" : "Saving…"}
            </span>

            <div
              className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-surface px-3 py-1.5"
              aria-label="Time remaining"
            >
              <Clock className="size-4 text-[#64748B]" aria-hidden />
              <TestTimer
                remainingSeconds={remainingSeconds}
                className="text-[15px] font-bold"
              />
            </div>
          </div>
        </div>

        {/* Stats + mobile tabs */}
        <div className="border-t border-[#E2E8F0] bg-white px-4 py-2.5 md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="min-w-[120px] flex-1 max-w-xs">
                <div className="flex items-center justify-between text-[11px] font-medium text-[#64748B]">
                  <span>{wordCount} words</span>
                  <span>min {minWords}</span>
                </div>
                <div
                  className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#E2E8F0]"
                  role="progressbar"
                  aria-valuenow={wordCount}
                  aria-valuemin={0}
                  aria-valuemax={minWords}
                  aria-label="Word count progress"
                >
                  <div
                    className={cn(
                      "h-full rounded-full transition-[width] duration-300",
                      metMin ? "bg-[#22C55E]" : "bg-cyan",
                    )}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold tabular-nums",
                  metMin
                    ? "bg-[#ECFDF5] text-[#059669]"
                    : "bg-surface text-[#64748B]",
                )}
              >
                {metMin ? (
                  <CheckCircle2 className="size-3.5" aria-hidden />
                ) : null}
                Est. {estimatedBand > 0 ? estimatedBand.toFixed(1) : "—"}
              </span>
            </div>

            <div
              className="flex rounded-xl border border-[#E2E8F0] bg-surface p-0.5 lg:hidden"
              role="tablist"
              aria-label="Writing panels"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mobilePanel === "prompt"}
                onClick={() => setMobilePanel("prompt")}
                className={cn(
                  "inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-lg px-3 text-[12px] font-semibold transition-colors",
                  mobilePanel === "prompt"
                    ? "bg-white text-ink shadow-sm"
                    : "text-[#64748B]",
                )}
              >
                <FileText className="size-3.5" aria-hidden />
                Prompt
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mobilePanel === "write"}
                onClick={() => setMobilePanel("write")}
                className={cn(
                  "inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-lg px-3 text-[12px] font-semibold transition-colors",
                  mobilePanel === "write"
                    ? "bg-white text-ink shadow-sm"
                    : "text-[#64748B]",
                )}
              >
                <PencilLine className="size-3.5" aria-hidden />
                Write
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main split */}
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <section
          className={cn(
            "min-h-0 border-b border-[#E2E8F0] lg:w-[min(44%,520px)] lg:shrink-0 lg:border-b-0 lg:border-r",
            mobilePanel === "prompt" ? "flex flex-1 flex-col" : "hidden lg:flex lg:flex-1 lg:flex-col",
          )}
          aria-label="Task prompt"
        >
          <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-5 lg:p-6">
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm md:p-5">
              {prompt}
            </div>
          </div>
        </section>

        <section
          className={cn(
            "flex min-h-0 flex-1 flex-col",
            mobilePanel === "write" ? "flex" : "hidden lg:flex",
          )}
          aria-label="Your response"
        >
          <div className="flex min-h-0 flex-1 flex-col p-4 md:p-5 lg:p-6">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-2.5 md:px-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#94A3B8]">
                  Your response
                </p>
                <span className="text-[11px] font-medium tabular-nums text-[#64748B] sm:hidden">
                  {saved ? "Saved" : "Saving…"}
                </span>
              </div>
              <div className="relative min-h-0 flex-1">
                <label htmlFor="essay" className="sr-only">
                  Your response for Writing Task {activePart}
                </label>
                <textarea
                  id="essay"
                  value={essay}
                  onChange={(e) => onEssayChange(e.target.value)}
                  placeholder="Type your response here. Organise your ideas into clear paragraphs…"
                  spellCheck
                  className="answer-input h-full min-h-[min(52vh,520px)] w-full resize-none border-0 bg-transparent px-4 py-4 text-[16px] leading-[1.75] text-[#334155] placeholder:text-[#94A3B8] focus:outline-none focus:ring-0 md:min-h-[min(60vh,640px)] md:px-5 md:py-5 lg:min-h-0"
                />
              </div>
            </div>

            {error ? (
              <p
                className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700"
                role="alert"
              >
                {error}
              </p>
            ) : null}
          </div>

          <ExamPartFooter
            variant="writing"
            label={submitLabel}
            busy={busy}
            onAction={onSubmit}
          />
        </section>
      </main>
    </div>
  );
}
