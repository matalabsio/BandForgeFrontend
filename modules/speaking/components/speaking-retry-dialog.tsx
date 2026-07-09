"use client";

import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onRetry: () => void;
  onContinueAnyway?: () => void;
};

export function SpeakingRetryDialog({ open, onRetry }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="speaking-retry-title"
    >
      <div className="w-full max-w-sm rounded-[18px] border border-border bg-white p-6 shadow-xl">
        <h2 id="speaking-retry-title" className="font-display text-lg font-semibold text-navy">
          We didn&apos;t catch a response — try again?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#5A6B82]">
          Your answer was too short or too quiet. Record again before moving on.
        </p>
        <div className="mt-5">
          <Button variant="primary" className="w-full" onClick={onRetry}>
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
