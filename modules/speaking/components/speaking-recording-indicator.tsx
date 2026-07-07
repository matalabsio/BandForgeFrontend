"use client";

import { cn } from "@/lib/utils";

type Props = {
  recording: boolean;
  seconds: number;
  countdownSec?: number | null;
  className?: string;
};

export function SpeakingRecordingIndicator({
  recording,
  seconds,
  countdownSec,
  className,
}: Props) {
  const label =
    countdownSec != null
      ? `Recording… ${seconds}s / ${countdownSec}s`
      : recording
        ? `Recording… ${seconds}s`
        : "Waiting for your answer";

  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-[16px] border border-cyan/25 bg-cyan/5 px-4 py-5 sm:px-6",
        className,
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        <span
          className={cn(
            "size-3 rounded-full bg-red-500",
            recording && "motion-safe:animate-pulse",
          )}
          aria-hidden
        />
        <span className="text-sm font-semibold text-navy">
          {recording ? "Recording in progress" : "Ready"}
        </span>
      </div>

      <div
        className="mb-3 flex h-10 w-full max-w-xs items-end justify-center gap-1 overflow-hidden"
        aria-hidden
      >
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "w-1 shrink-0 rounded-sm bg-cyan",
              recording && "motion-safe:animate-[bfwave_1.1s_ease-in-out_infinite]",
            )}
            style={{
              height: recording ? `${10 + (i % 5) * 6}px` : "6px",
              animationDelay: recording ? `${i * 0.05}s` : undefined,
            }}
          />
        ))}
      </div>

      <p className="font-mono text-sm text-[#5A6B82]">{label}</p>
    </div>
  );
}
