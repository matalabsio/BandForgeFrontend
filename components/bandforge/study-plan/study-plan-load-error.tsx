"use client";

import { Button } from "@/components/ui/button";

type Props = {
  onRetry: () => void;
  message?: string;
};

export function StudyPlanLoadError({
  onRetry,
  message = "Still preparing your plan…",
}: Props) {
  return (
    <div
      className="rounded-2xl border border-border-soft bg-white px-5 py-10 text-center sm:px-8"
      role="alert"
    >
      <p className="text-sm font-medium text-ink">{message}</p>
      <p className="mt-2 text-sm text-muted">
        This can take up to a minute the first time. Your plan is safe — try
        again in a moment.
      </p>
      <Button type="button" className="mt-5" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}
