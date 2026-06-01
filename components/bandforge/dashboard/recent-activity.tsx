"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { DashboardRecentAttempt } from "@/components/bandforge/dashboard/types";
import { MODULE_LABELS } from "@/components/bandforge/dashboard/types";
import { formatDateShort } from "@/lib/date-format";
import { listeningModuleResultsPath } from "@/lib/listening-test";
import { readingModuleResultsPath } from "@/lib/reading-test";
import {
  BookIcon,
  HeadphonesIcon,
  MicIcon,
  PencilIcon,
} from "@/components/bandforge/dashboard/icons";

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

function bandStyles(band: number | null): string {
  if (band === null) return "bg-[#0F172A]/5 text-[#0F172A]/50";
  if (band >= 7.5) return "bg-emerald-500/12 text-emerald-700";
  if (band >= 6) return "bg-[#06B6D4]/12 text-[#0891B2]";
  if (band >= 5) return "bg-amber-500/12 text-amber-700";
  return "bg-red-500/10 text-red-600";
}

/** Newest completed attempts first (server order preserved). */
function sortRecentNewestFirst(
  attempts: DashboardRecentAttempt[],
): DashboardRecentAttempt[] {
  return attempts.toSorted((a, b) => {
    const aTime = new Date(a.completed_at ?? a.started_at).getTime();
    const bTime = new Date(b.completed_at ?? b.started_at).getTime();
    return bTime - aTime;
  });
}

export function RecentActivity({
  attempts,
}: {
  attempts: DashboardRecentAttempt[];
}) {
  const sorted = useMemo(() => sortRecentNewestFirst(attempts), [attempts]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [attempts]);

  const visible = sorted.slice(0, visibleCount);
  const hasMore = visibleCount < sorted.length;
  const remaining = sorted.length - visibleCount;

  return (
    <section
      aria-label="Activity timeline"
      className="overflow-hidden rounded-[24px] border border-white/70 bg-white/70 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl"
      style={{ animationDelay: "220ms" }}
    >
      <header className="border-b border-[#0F172A]/6 px-5 py-4">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <h2 className="text-[15px] font-bold text-[#0F172A]">Timeline</h2>
            <p className="text-[11px] text-[#0F172A]/45">Recent attempts & bands</p>
          </div>
          {sorted.length > 0 ? (
            <p className="text-[11px] font-semibold tabular-nums text-[#0F172A]/40">
              {sorted.length} total
            </p>
          ) : null}
        </div>
      </header>

      {sorted.length === 0 ? (
        <EmptyTimeline />
      ) : (
        <>
          <ol className="relative px-5 py-4">
            <span
              className="absolute bottom-6 left-[2.35rem] top-6 w-px bg-[#0F172A]/8"
              aria-hidden
            />
            {visible.map((a, i) => (
              <TimelineItem
                key={a.id}
                attempt={a}
                isLast={i === visible.length - 1 && !hasMore}
              />
            ))}
          </ol>

          {hasMore ? (
            <div className="border-t border-[#0F172A]/6 px-5 py-3">
              <button
                type="button"
                onClick={() =>
                  setVisibleCount((n) => Math.min(n + PAGE_SIZE, sorted.length))
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
    </section>
  );
}

function TimelineItem({
  attempt,
  isLast,
}: {
  attempt: DashboardRecentAttempt;
  isLast: boolean;
}) {
  const Icon = moduleIcon(attempt.module);
  const href = reportHref(attempt);
  const label =
    MODULE_LABELS[attempt.module as keyof typeof MODULE_LABELS] ??
    attempt.module;

  const content = (
    <div className={`relative flex gap-4 pb-5 ${isLast ? "pb-0" : ""}`}>
      <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-2xl border-2 border-white bg-[#06B6D4]/10 text-[#06B6D4] shadow-sm">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="truncate text-[13px] font-semibold text-[#0F172A]">
          {label} · {attempt.mock_test.title}
        </p>
        <p className="mt-0.5 text-[11px] text-[#0F172A]/45">
          {formatDateShort(attempt.completed_at ?? attempt.started_at)}
          {attempt.raw_score !== null && attempt.total_questions !== null
            ? ` · ${attempt.raw_score}/${attempt.total_questions}`
            : ""}
        </p>
      </div>
      <span
        className={`shrink-0 self-start rounded-full px-2.5 py-1 text-[11px] font-bold tabular-nums ${bandStyles(attempt.band)}`}
      >
        {attempt.band !== null ? attempt.band.toFixed(1) : "—"}
      </span>
    </div>
  );

  if (href) {
    return (
      <li>
        <Link
          href={href}
          className="block cursor-pointer rounded-xl transition-colors hover:bg-[#06B6D4]/5"
        >
          {content}
        </Link>
      </li>
    );
  }

  return <li>{content}</li>;
}

function EmptyTimeline() {
  return (
    <div className="px-6 py-12 text-center">
      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-3xl bg-[#06B6D4]/10 text-[#06B6D4]">
        <HeadphonesIcon className="size-8" />
      </div>
      <p className="font-display text-lg font-bold text-[#0F172A]">
        Your timeline starts here
      </p>
      <p className="mx-auto mt-2 max-w-xs text-[13px] text-[#0F172A]/55">
        Complete a listening mock: your band, score breakdown, and activity
        will appear on this timeline.
      </p>
      <Link
        href="/dashboard"
        className="mt-5 inline-flex rounded-full bg-[#06B6D4] px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:brightness-105"
      >
        Pick a mock below
      </Link>
    </div>
  );
}
