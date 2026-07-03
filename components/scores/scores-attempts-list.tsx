"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { DashboardRecentAttempt } from "@/components/bandforge/dashboard/types";
import { MODULE_LABELS } from "@/components/bandforge/dashboard/types";
import {
  ArrowRightIcon,
  BookIcon,
  HeadphonesIcon,
  MicIcon,
  PencilIcon,
} from "@/components/bandforge/dashboard/icons";
import {
  DashboardCard,
  DashboardCardHeader,
} from "@/components/bandforge/dashboard/dashboard-card";
import {
  attemptReportHref,
  bandBadgeClass,
  isSpeakingUnderReview,
  isWritingUnderReview,
} from "@/components/scores/scores-utils";
import { formatDateShort } from "@/lib/date-format";
import { persistModuleResultAttempt } from "@/lib/exam-session-storage";
import { testNumberForMockId, writingModuleLabel } from "@/lib/mock-catalog";
import { listeningTestPath } from "@/lib/listening-test";

const PAGE_SIZE = 5;

function ModuleIconGlyph({ module }: { module: string }) {
  switch (module) {
    case "reading":
      return <BookIcon className="size-5" />;
    case "writing":
      return <PencilIcon className="size-5" />;
    case "speaking":
      return <MicIcon className="size-5" />;
    case "listening":
    default:
      return <HeadphonesIcon className="size-5" />;
  }
}

function reportHref(attempt: DashboardRecentAttempt): string | null {
  return attemptReportHref(attempt);
}

function attemptSubtext(attempt: DashboardRecentAttempt, label: string): string {
  const date = formatDateShort(attempt.completed_at ?? attempt.started_at);
  const score =
    attempt.raw_score !== null && attempt.total_questions !== null
      ? ` · ${attempt.raw_score}/${attempt.total_questions} correct`
      : "";
  if (attempt.module === "speaking" && attempt.band !== null) {
    return `${label} · ${date} · Human reviewed`;
  }
  if (isSpeakingUnderReview(attempt)) {
    return `${label} · ${date} · Under review`;
  }
  if (isWritingUnderReview(attempt)) {
    return `${label} · ${date} · Under review`;
  }
  return `${label} · ${date}${score}`;
}

function primeResultSession(attempt: DashboardRecentAttempt): void {
  const testNumber = testNumberForMockId(attempt.mock_test.id);
  if (
    attempt.module === "listening" ||
    attempt.module === "reading" ||
    attempt.module === "writing" ||
    attempt.module === "speaking"
  ) {
    persistModuleResultAttempt(testNumber, attempt.module, attempt.id);
  }
}

function sortCompletedNewestFirst(
  attempts: DashboardRecentAttempt[],
): DashboardRecentAttempt[] {
  return attempts.toSorted((a, b) => {
    const aTime = new Date(a.completed_at ?? a.started_at).getTime();
    const bTime = new Date(b.completed_at ?? b.started_at).getTime();
    return bTime - aTime;
  });
}

export function ScoresAttemptsList({
  attempts,
  highlightAttemptId = null,
}: {
  attempts: DashboardRecentAttempt[];
  highlightAttemptId?: string | null;
}) {
  const completed = useMemo(
    () =>
      sortCompletedNewestFirst(
        attempts.filter((a) => a.completed_at || a.status === "completed"),
      ),
    [attempts],
  );

  const highlightMinVisible = useMemo(() => {
    if (!highlightAttemptId) return PAGE_SIZE;
    const idx = completed.findIndex((a) => a.id === highlightAttemptId);
    return idx >= 0 ? Math.max(PAGE_SIZE, idx + 1) : PAGE_SIZE;
  }, [completed, highlightAttemptId]);

  const [userVisibleCount, setUserVisibleCount] = useState(PAGE_SIZE);
  const visibleCount = Math.max(userVisibleCount, highlightMinVisible);

  const visible = completed.slice(0, visibleCount);
  const hasMore = visibleCount < completed.length;
  const remaining = completed.length - visibleCount;

  return (
    <DashboardCard id="score-reports" className="overflow-hidden">
      <DashboardCardHeader
        title="Score reports"
        subtitle="Open a mock for question-by-question breakdown"
        action={
          completed.length > 0 ? (
            <span className="text-[11px] font-semibold tabular-nums text-ink/40">
              {completed.length} total
            </span>
          ) : undefined
        }
      />

      {completed.length === 0 ? (
        <EmptyAttempts />
      ) : (
        <>
          <ul className="divide-y divide-ink/6">
            {visible.map((a) => (
              <AttemptRow
                key={a.id}
                attempt={a}
                highlighted={a.id === highlightAttemptId}
              />
            ))}
          </ul>

          {hasMore ? (
            <div className="border-t border-ink/6 px-5 py-3">
              <button
                type="button"
                onClick={() =>
                  setUserVisibleCount((n) =>
                    Math.min(n + PAGE_SIZE, completed.length),
                  )
                }
                className="w-full cursor-pointer rounded-xl border border-ink/10 bg-surface py-2.5 text-[13px] font-bold text-teal transition-colors hover:border-cyan/30 hover:bg-cyan/5"
              >
                View more
                <span className="font-medium text-ink/45">
                  {" "}
                  · show next {Math.min(PAGE_SIZE, remaining)} of {remaining}{" "}
                  remaining
                </span>
              </button>
            </div>
          ) : null}
        </>
      )}
    </DashboardCard>
  );
}

function AttemptRow({
  attempt,
  highlighted = false,
}: {
  attempt: DashboardRecentAttempt;
  highlighted?: boolean;
}) {
  const href = reportHref(attempt);
  const label =
    attempt.module === "writing"
      ? writingModuleLabel(attempt.part)
      : (MODULE_LABELS[attempt.module as keyof typeof MODULE_LABELS] ??
        attempt.module);

  const row = (
    <div
      id={highlighted ? `score-attempt-${attempt.id}` : undefined}
      className={`flex items-center gap-4 px-5 py-4 ${
        highlighted ? "bg-cyan/8 ring-2 ring-inset ring-cyan/35" : ""
      }`}
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-cyan/10 text-cyan">
        <ModuleIconGlyph module={attempt.module} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold text-ink">
          {attempt.mock_test.title}
        </p>
        <p className="mt-0.5 text-[12px] text-ink/45">
          {attemptSubtext(attempt, label)}
        </p>
      </div>
      <span
        className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-bold tabular-nums ${
          isSpeakingUnderReview(attempt) || isWritingUnderReview(attempt)
            ? "bg-amber-500/12 text-amber-800"
            : bandBadgeClass(attempt.band)
        }`}
      >
        {attempt.band !== null
          ? `Band ${attempt.band.toFixed(1)}`
          : isSpeakingUnderReview(attempt) || isWritingUnderReview(attempt)
            ? "Under review"
            : "—"}
      </span>
      {href ? (
        <ArrowRightIcon className="size-4 shrink-0 text-ink/30" />
      ) : null}
    </div>
  );

  if (href) {
    return (
      <li>
        <Link
          href={href}
          onClick={() => primeResultSession(attempt)}
          className="block cursor-pointer transition-colors hover:bg-cyan/5"
        >
          {row}
        </Link>
      </li>
    );
  }

  return <li className="opacity-80">{row}</li>;
}

function EmptyAttempts() {
  return (
    <div className="px-6 py-14 text-center">
      <HeadphonesIcon className="mx-auto size-10 text-cyan" />
      <p className="mt-4 font-display text-lg font-bold text-ink">
        No scored mocks yet
      </p>
      <p className="mx-auto mt-2 max-w-sm text-[13px] text-ink/55">
        Complete a reading or listening section to see your band, trends, and
        detailed reports here.
      </p>
      <Link
        href={listeningTestPath()}
        className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-cyan px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-cyan"
      >
        Start listening mock
        <ArrowRightIcon className="size-4" />
      </Link>
    </div>
  );
}
