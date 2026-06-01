"use client";

import Link from "next/link";
import type { WritingReview } from "@/modules/writing/types";
import {
  writingTaskPath,
  writingTestHubPath,
} from "@/lib/writing-test";
import { mockHubPath } from "@/lib/mock-catalog";
import { cn } from "@/lib/utils";

type Props = {
  review: WritingReview;
  mockAttemptId?: string | null;
  mockSlug?: string;
  showContinueTask2?: boolean;
};

export function WritingResultsView({
  review,
  mockAttemptId,
  mockSlug = "m01",
  showContinueTask2 = false,
}: Props) {
  const submitted = review.submitted_at
    ? new Date(review.submitted_at).toLocaleString()
    : null;
  const metMin = review.min_words > 0 && review.word_count >= review.min_words;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-teal/30 bg-gradient-to-br from-teal/10 to-transparent px-5 py-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-teal">
            Estimated band
          </p>
          <p className="mt-1 text-[12px] text-ink/55">
            Based on word count{" "}
            {review.min_words > 0 ? `(minimum ${review.min_words} words)` : ""}
          </p>
        </div>
        <p className="font-display text-4xl font-bold tabular-nums text-navy">
          {review.band != null && review.band > 0
            ? review.band.toFixed(1)
            : "—"}
        </p>
      </div>

      <h1 className="mt-6 font-display text-2xl font-bold text-navy">
        Writing Task {review.part} — {metMin ? "complete" : "submitted"}
      </h1>
      {review.test_title ? (
        <p className="mt-1 text-[13px] text-ink/55">{review.test_title}</p>
      ) : null}
      {submitted ? (
        <p className="mt-2 text-[12px] text-ink/45">Submitted {submitted}</p>
      ) : null}

      <section className="mt-8 rounded-xl border border-border bg-surface/50 p-5">
        <h2 className="text-[11px] font-bold uppercase tracking-wide text-ink/50">
          Task prompt
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-ink">{review.prompt}</p>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[11px] font-bold uppercase tracking-wide text-ink/50">
            Your response
          </h2>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[12px] font-semibold tabular-nums",
              metMin ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900",
            )}
          >
            {review.word_count} words
            {review.min_words > 0 && !metMin
              ? ` · ${review.min_words - review.word_count} below minimum`
              : ""}
          </span>
        </div>
        <div className="mt-4 whitespace-pre-wrap rounded-lg border border-border bg-surface/30 p-4 text-[15px] leading-relaxed text-ink">
          {review.user_answer || (
            <span className="text-ink/40">No text saved.</span>
          )}
        </div>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        {showContinueTask2 ? (
          <Link
            href={writingTaskPath(2, {
              mockSlug,
              mockAttemptId: mockAttemptId ?? undefined,
              auto: true,
            })}
            className="inline-flex min-h-[44px] items-center rounded-xl bg-teal px-5 py-2.5 text-[14px] font-bold text-white hover:bg-teal/90"
          >
            Continue to Task 2
          </Link>
        ) : null}
        <Link
          href={writingTestHubPath()}
          className="inline-flex min-h-[44px] items-center rounded-xl border border-border px-5 py-2.5 text-[14px] font-semibold text-ink/70"
        >
          Writing home
        </Link>
        {mockAttemptId ? (
          <Link
            href={mockHubPath(mockSlug)}
            className="inline-flex min-h-[44px] items-center rounded-xl border border-border px-5 py-2.5 text-[14px] font-semibold text-teal"
          >
            Mock hub
          </Link>
        ) : null}
      </div>
    </div>
  );
}
