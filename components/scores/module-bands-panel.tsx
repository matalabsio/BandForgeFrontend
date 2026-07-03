"use client";

import Link from "next/link";
import {
  BookIcon,
  HeadphonesIcon,
  MicIcon,
  PencilIcon,
} from "@/components/bandforge/dashboard/icons";
import {
  DashboardCard,
  DashboardCardHeader,
} from "@/components/bandforge/dashboard/dashboard-card";
import type { ModuleBand } from "@/components/scores/scores-utils";
import {
  bandBarColor,
  moduleBandLabel,
  underReviewBadgeClass,
} from "@/components/scores/scores-utils";
import { persistModuleResultAttempt } from "@/lib/exam-session-storage";
import type { ResultModule } from "@/lib/exam-session-storage";
import { cn } from "@/lib/utils";

const ICONS = {
  listening: HeadphonesIcon,
  reading: BookIcon,
  writing: PencilIcon,
  speaking: MicIcon,
} as const;

function primeResultSession(row: ModuleBand): void {
  if (!row.attemptId || row.testNumber == null) return;
  if (
    row.module === "listening" ||
    row.module === "reading" ||
    row.module === "writing" ||
    row.module === "speaking"
  ) {
    persistModuleResultAttempt(
      row.testNumber,
      row.module as ResultModule,
      row.attemptId,
    );
  }
}

function ModuleBandRow({ row }: { row: ModuleBand }) {
  const Icon = ICONS[row.module];
  const pct = row.band !== null ? Math.min(100, (row.band / 9) * 100) : 0;

  const content = (
    <>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg",
              row.live ? "bg-cyan/10 text-cyan" : "bg-ink/5 text-ink/35",
            )}
          >
            <Icon className="size-4" />
          </span>
          <span className="text-[13px] font-semibold text-ink">{row.label}</span>
        </div>
        <span
          className={cn(
            "shrink-0 text-[13px] font-bold tabular-nums",
            row.band !== null
              ? "text-ink"
              : row.reviewState === "under_review"
                ? underReviewBadgeClass()
                : "text-ink/50",
          )}
        >
          {moduleBandLabel(row.band, row.reviewState, row.live)}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink/8">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            bandBarColor(row.band),
          )}
          style={{ width: row.band !== null ? `${pct}%` : "0%" }}
        />
      </div>
    </>
  );

  if (row.href) {
    return (
      <Link
        href={row.href}
        onClick={() => primeResultSession(row)}
        className="block cursor-pointer rounded-xl px-1 py-1 transition-colors hover:bg-cyan/5"
      >
        {content}
      </Link>
    );
  }

  return <div className="px-1 py-1">{content}</div>;
}

export function ModuleBandsPanel({ bands }: { bands: ModuleBand[] }) {
  return (
    <DashboardCard className="flex h-full flex-col">
      <DashboardCardHeader
        title="Band by module"
        subtitle="Latest band per task and skill"
      />
      <ul className="space-y-4 p-5 pt-2">
        {bands.map((row) => (
          <li key={row.key}>
            <ModuleBandRow row={row} />
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}
