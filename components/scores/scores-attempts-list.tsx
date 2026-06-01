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
import { bandBadgeClass } from "@/components/scores/scores-utils";
import { formatDateShort } from "@/lib/date-format";
import {
  listeningModuleResultsPath,
  listeningTestPath,
} from "@/lib/listening-test";
import { readingModuleResultsPath } from "@/lib/reading-test";

const PAGE_SIZE = 5;

function moduleIcon(module: string) {
  switch (module) {
    case "listening":
      return HeadphonesIcon;
    case "reading":
      return BookIcon;
    case "writing":
      return PencilIcon;
    case "speaking":
      return MicIcon;
    default:
      return HeadphonesIcon;
  }
}

function reportHref(attempt: DashboardRecentAttempt): string | null {
  if (attempt.module === "listening") {
    return listeningModuleResultsPath(attempt.mock_test.id, attempt.id);
  }
  if (attempt.module === "reading") {
    return readingModuleResultsPath(attempt.mock_test.id, attempt.id);
  }
  return null;
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
            <span className="text-[11px] font-semibold tabular-nums text-[#0F172A]/40">
              {completed.length} total
            </span>
          ) : undefined
        }
      />

      {completed.length === 0 ? (
        <EmptyAttempts />
      ) : (
        <>
          <ul className="divide-y divide-[#0F172A]/6">
            {visible.map((a) => (
              <AttemptRow
                key={a.id}
                attempt={a}
                highlighted={a.id === highlightAttemptId}
              />
            ))}
          </ul>

          {hasMore ? (
            <div className="border-t border-[#0F172A]/6 px-5 py-3">
              <button
                type="button"
                onClick={() =>
                  setUserVisibleCount((n) =>
                    Math.min(n + PAGE_SIZE, completed.length),
                  )
                }
                className="w-full cursor-pointer rounded-xl border border-[#0F172A]/10 bg-[#F8FAFC] py-2.5 text-[13px] font-bold text-[#0891B2] transition-colors hover:border-[#06B6D4]/30 hover:bg-[#06B6D4]/5"
              >
                View more
                <span className="font-medium text-[#0F172A]/45">
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
  const Icon = moduleIcon(attempt.module);
  const href = reportHref(attempt);
  const label =
    MODULE_LABELS[attempt.module as keyof typeof MODULE_LABELS] ??
    attempt.module;

  const row = (
    <div
      id={highlighted ? `score-attempt-${attempt.id}` : undefined}
      className={`flex items-center gap-4 px-5 py-4 ${
        highlighted ? "bg-[#06B6D4]/8 ring-2 ring-inset ring-[#06B6D4]/35" : ""
      }`}
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#06B6D4]/10 text-[#06B6D4]">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold text-[#0F172A]">
          {attempt.mock_test.title}
        </p>
        <p className="mt-0.5 text-[12px] text-[#0F172A]/45">
          {label} · {formatDateShort(attempt.completed_at ?? attempt.started_at)}
          {attempt.raw_score !== null && attempt.total_questions !== null
            ? ` · ${attempt.raw_score}/${attempt.total_questions} correct`
            : ""}
        </p>
      </div>
      <span
        className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-bold tabular-nums ${bandBadgeClass(attempt.band)}`}
      >
        {attempt.band !== null ? `Band ${attempt.band.toFixed(1)}` : "—"}
      </span>
      {href ? (
        <ArrowRightIcon className="size-4 shrink-0 text-[#0F172A]/30" />
      ) : null}
    </div>
  );

  if (href) {
    return (
      <li>
        <Link
          href={href}
          className="block cursor-pointer transition-colors hover:bg-[#06B6D4]/5"
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
      <HeadphonesIcon className="mx-auto size-10 text-[#06B6D4]" />
      <p className="mt-4 font-display text-lg font-bold text-[#0F172A]">
        No scored mocks yet
      </p>
      <p className="mx-auto mt-2 max-w-sm text-[13px] text-[#0F172A]/55">
        Complete a reading or listening section to see your band, trends, and
        detailed reports here.
      </p>
      <Link
        href={listeningTestPath()}
        className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#06B6D4] px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#0891B2]"
      >
        Start listening mock
        <ArrowRightIcon className="size-4" />
      </Link>
    </div>
  );
}
