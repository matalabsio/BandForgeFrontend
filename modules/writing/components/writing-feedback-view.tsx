"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, type ReactNode } from "react";
import { Check, ChevronLeft, Lightbulb, Share2 } from "lucide-react";
import type {
  WritingEssayHighlight,
  WritingFeedback,
  WritingReview,
} from "@/modules/writing/types";
import {
  writingTaskPath,
  writingTestHubPath,
} from "@/lib/writing-test";
import { mockHubPath } from "@/lib/mock-catalog";
import { cn } from "@/lib/utils";

type Props = {
  review: WritingReview;
  feedback: WritingFeedback;
  mockAttemptId?: string | null;
  mockSlug?: string;
  showContinueTask2?: boolean;
  backHref?: string;
  dashboardHref?: string;
};

function bandDisplay(band: number): string {
  if (band <= 0) return "—";
  return band.toFixed(1);
}

function HighlightedEssay({
  text,
  highlights,
}: {
  text: string;
  highlights: WritingEssayHighlight[];
}) {
  if (!text.trim()) {
    return (
      <p className="text-[14px] italic text-[#64748B]">No text saved.</p>
    );
  }

  if (highlights.length === 0) {
    return (
      <p className="whitespace-pre-wrap text-[14px] leading-[1.75] text-[#334155]">
        {text}
      </p>
    );
  }

  const sorted = [...highlights].sort((a, b) => {
    const ai = text.toLowerCase().indexOf(a.text.toLowerCase());
    const bi = text.toLowerCase().indexOf(b.text.toLowerCase());
    return ai - bi;
  });

  const parts: ReactNode[] = [];
  let cursor = 0;

  for (const hl of sorted) {
    const idx = text.toLowerCase().indexOf(hl.text.toLowerCase(), cursor);
    if (idx === -1) continue;
    if (idx > cursor) {
      parts.push(text.slice(cursor, idx));
    }
    const slice = text.slice(idx, idx + hl.text.length);
    parts.push(
      <span
        key={`${hl.type}-${idx}`}
        className={cn(
          "underline decoration-2 underline-offset-[3px]",
          hl.type === "strong"
            ? "decoration-cyan"
            : "decoration-[#FBBF24]",
        )}
      >
        {slice}
      </span>,
    );
    cursor = idx + hl.text.length;
  }

  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return (
    <p className="whitespace-pre-wrap text-[14px] leading-[1.75] text-[#334155]">
      {parts}
    </p>
  );
}

export function WritingFeedbackView({
  review,
  feedback,
  mockAttemptId,
  mockSlug = "m01",
  showContinueTask2 = false,
  backHref,
  dashboardHref = "/dashboard",
}: Props) {
  const router = useRouter();
  const taskTitle =
    review.test_title?.trim() ||
    `Writing Task ${review.part} — Mock Test`;

  const resolvedBack =
    backHref ??
    (mockAttemptId ? mockHubPath(mockSlug, mockAttemptId) : writingTestHubPath());

  const nextHref = showContinueTask2
    ? writingTaskPath(2, {
        mockSlug,
        mockAttemptId: mockAttemptId ?? undefined,
        auto: true,
      })
    : writingTestHubPath();

  const nextLabel = showContinueTask2
    ? "Begin Next Writing Test"
    : "Practice Writing Again";

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    const title = `Writing Feedback — Task ${review.part}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
    } catch {
      /* user cancelled or clipboard denied */
    }
  }, [review.part]);

  return (
    <div className="min-h-dvh bg-surface-alt text-ink">
      <header className="sticky top-0 z-20 border-b border-border-soft bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => router.push(resolvedBack)}
            className="inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center gap-1 rounded-lg px-1 text-sm font-semibold text-muted transition-colors hover:bg-surface-alt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
          >
            <ChevronLeft className="size-5" aria-hidden />
            <span className="hidden sm:inline">Back</span>
          </button>

          <h1 className="font-display truncate text-center text-base font-bold tracking-tight text-navy sm:text-[1.0625rem]">
            AI Writing Feedback
          </h1>

          <button
            type="button"
            onClick={() => void handleShare()}
            className="inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 text-[14px] font-semibold text-[#334155] transition-colors hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
            aria-label="Share feedback"
          >
            <Share2 className="size-[18px]" aria-hidden />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] lg:items-start lg:gap-8">
          {/* Left: scores & feedback */}
          <div className="min-w-0 space-y-5">
            <section className="rounded-2xl border border-border-soft bg-white p-5 shadow-sm sm:p-6">
              <p className="font-mono text-[0.6875rem] tracking-wide text-cyan uppercase">
                Task {review.part} · Writing
              </p>
              <div className="mt-4 flex flex-wrap items-start gap-5 sm:gap-6">
                <div className="shrink-0">
                  <p className="font-display text-5xl leading-none font-bold text-cyan tabular-nums sm:text-6xl">
                    {bandDisplay(feedback.overall_band)}
                  </p>
                  <p className="mt-2 font-mono text-[0.625rem] tracking-[0.14em] text-muted-light uppercase">
                    Overall band
                  </p>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-lg leading-snug font-bold text-navy">
                    {taskTitle}
                  </h2>
                  <p className="mt-1 text-[0.8125rem] text-muted">
                    {feedback.evaluated_label}
                  </p>
                </div>
              </div>
            </section>

            <section
              className="grid grid-cols-2 gap-3 sm:gap-4"
              aria-label="Criterion scores"
            >
              {feedback.criteria.map((criterion) => (
                <div
                  key={criterion.key}
                  className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-3.5 shadow-sm"
                >
                  <p className="font-mono text-2xl font-medium tabular-nums text-cyan">
                    {bandDisplay(criterion.band)}
                  </p>
                  <p className="mt-1 text-[11px] font-medium leading-snug text-[#64748B]">
                    {criterion.label}
                  </p>
                </div>
              ))}
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[#BBF7D0] border-l-4 border-l-[#22C55E] bg-[#F0FDF4] p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-full bg-[#DCFCE7] text-[#16A34A]">
                    <Check className="size-4" aria-hidden />
                  </span>
                  <h3 className="text-[14px] font-bold text-ink">Strengths</h3>
                </div>
                <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-[#334155]">
                  {feedback.strengths.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 size-1 shrink-0 rounded-full bg-[#22C55E]" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-[#FDE68A] border-l-4 border-l-[#F59E0B] bg-[#FFFBEB] p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-full bg-[#FEF3C7] text-[#D97706]">
                    <Lightbulb className="size-4" aria-hidden />
                  </span>
                  <h3 className="text-[14px] font-bold text-ink">To Improve</h3>
                </div>
                <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-[#334155]">
                  {feedback.improvements.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 size-1 shrink-0 rounded-full bg-[#F59E0B]" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#94A3B8]">
                Vocabulary highlights
              </p>

              {feedback.strong_words.length > 0 ? (
                <div className="mt-4">
                  <p className="text-[12px] font-semibold text-[#64748B]">
                    Strong words you used
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {feedback.strong_words.map((word) => (
                      <span
                        key={word}
                        className="rounded-full bg-[#ECFEFF] px-3 py-1 text-[12px] font-semibold text-teal"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {feedback.weak_words.length > 0 ? (
                <div className="mt-5">
                  <p className="text-[12px] font-semibold text-[#64748B]">
                    Repeated / weak — try instead
                  </p>
                  <ul className="mt-2 space-y-2">
                    {feedback.weak_words.map(({ word, alternatives }) => (
                      <li
                        key={word}
                        className="flex flex-wrap items-center gap-2 text-[12px]"
                      >
                        <span className="rounded-full bg-surface px-2.5 py-1 font-medium text-[#64748B] line-through decoration-[#94A3B8]">
                          {word}
                        </span>
                        <span className="text-[#94A3B8]" aria-hidden>
                          →
                        </span>
                        {alternatives?.map((alt) => (
                          <span
                            key={alt}
                            className="rounded-full bg-[#ECFEFF] px-2.5 py-1 font-semibold text-teal"
                          >
                            {alt}
                          </span>
                        ))}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          </div>

          {/* Right: essay + actions */}
          <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-[4.5rem] lg:max-h-[calc(100dvh-5.5rem)]">
            <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
              <div className="border-b border-[#E2E8F0] px-4 py-3 sm:px-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#94A3B8]">
                    Your essay
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#64748B]">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-0.5 w-4 rounded bg-cyan" aria-hidden />
                      Strong
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-0.5 w-4 rounded bg-[#FBBF24]" aria-hidden />
                      Improve
                    </span>
                  </div>
                </div>
              </div>
              <div className="min-h-[200px] flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
                <HighlightedEssay
                  text={review.user_answer}
                  highlights={feedback.highlights}
                />
              </div>
            </section>

            <div className="flex flex-col gap-2.5">
              <Link
                href={nextHref}
                className="inline-flex min-h-[48px] w-full cursor-pointer items-center justify-center rounded-xl bg-cyan px-5 text-[14px] font-bold text-white transition-colors hover:bg-cyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
              >
                {nextLabel}
              </Link>
              <Link
                href={dashboardHref}
                className="inline-flex min-h-[48px] w-full cursor-pointer items-center justify-center rounded-xl border border-[#CBD5E1] bg-white px-5 text-[14px] font-semibold text-[#334155] transition-colors hover:border-[#94A3B8] hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
              >
                Back to Dashboard
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
