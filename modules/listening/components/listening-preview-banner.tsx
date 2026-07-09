"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

type Props = {
  remainingSeconds: number;
  progressPct: number;
  variant?: "exam" | "diagnostic";
};

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function ListeningPreviewBannerBase({
  remainingSeconds,
  progressPct,
  variant = "exam",
}: Props) {
  const isDiagnostic = variant === "diagnostic";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border shadow-sm",
        isDiagnostic
          ? "border-navy/10 bg-white"
          : "border-[var(--exam-border)] bg-white",
      )}
      role="status"
      aria-live="polite"
      aria-label={`Recording starts in ${remainingSeconds} seconds`}
    >
      <div
        className={cn(
          "border-b px-4 py-3",
          isDiagnostic
            ? "border-navy/10 bg-navy/[0.03]"
            : "border-[var(--exam-border)] bg-[var(--exam-paper)]",
        )}
      >
        <p
          className={cn(
            "text-[10px] font-bold uppercase tracking-[0.14em]",
            isDiagnostic ? "text-cyan" : "text-[var(--exam-accent)]",
          )}
        >
          Question preview
        </p>
        <p
          className={cn(
            "mt-1 text-[14px] font-semibold",
            isDiagnostic ? "text-navy" : "text-[var(--exam-ink)]",
          )}
        >
          Recording starts in{" "}
          <span className="font-mono tabular-nums">
            {formatCountdown(remainingSeconds)}
          </span>
        </p>
        <p
          className={cn(
            "mt-1 text-[12px] leading-relaxed",
            isDiagnostic ? "text-[#5A6B82]" : "text-[var(--exam-ink-muted)]",
          )}
        >
          {isDiagnostic
            ? "Read the questions below before the recording begins."
            : "Read the questions on the right before the recording begins."}
        </p>
      </div>
      <div className="px-4 py-3">
        <div
          className={cn(
            "h-1.5 overflow-hidden rounded-full",
            isDiagnostic ? "bg-navy/10" : "bg-[var(--exam-border)]",
          )}
        >
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-1000 ease-linear motion-reduce:transition-none",
              isDiagnostic ? "bg-cyan" : "bg-[var(--exam-accent)]",
            )}
            style={{ width: `${Math.min(100, progressPct)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export const ListeningPreviewBanner = memo(ListeningPreviewBannerBase);
