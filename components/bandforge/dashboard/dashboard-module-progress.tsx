"use client";

import Link from "next/link";
import {
  BookIcon,
  HeadphonesIcon,
  MicIcon,
  PencilIcon,
} from "@/components/bandforge/dashboard/icons";
import type { DashboardRecentAttempt } from "@/components/bandforge/dashboard/types";
import {
  latestBandByModule,
  moduleBandLabel,
} from "@/components/scores/scores-utils";
import { mockTestNumberPath } from "@/lib/mock-catalog";
import { persistModuleResultAttempt } from "@/lib/exam-session-storage";
import type { ResultModule } from "@/lib/exam-session-storage";
import type { ComponentType, SVGProps } from "react";
import { cn } from "@/lib/utils";
import type { DashboardModule } from "@/components/bandforge/dashboard/types";

const moduleIcons: Record<
  DashboardModule,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  listening: HeadphonesIcon,
  reading: BookIcon,
  writing: PencilIcon,
  speaking: MicIcon,
};

function completedCount(
  recent: DashboardRecentAttempt[],
  module: DashboardModule,
  part?: number,
): number {
  return recent.filter(
    (a) =>
      a.module === module &&
      (part == null || a.part === part) &&
      (a.completed_at || a.status === "completed"),
  ).length;
}

function StatusPill({ status }: { status: "under_review" }) {
  return (
    <span className="inline-flex items-center gap-1 self-start rounded-full bg-[#e5eef9] px-2 py-1 text-[0.6875rem] font-semibold text-[#3b6fb0]">
      Under review
    </span>
  );
}

export function DashboardModuleProgress({
  recent,
}: {
  recent: DashboardRecentAttempt[];
}) {
  const bands = latestBandByModule(recent);
  const testedCount = bands.filter(
    (b) =>
      (b.band != null && b.band > 0) ||
      b.reviewState !== "none" ||
      completedCount(recent, b.module, b.part) > 0,
  ).length;

  return (
    <section>
      <div className="mb-3.5 flex items-center justify-between lg:hidden">
        <span className="font-mono text-[0.6875rem] tracking-[0.1em] text-muted-light uppercase">
          Your modules
        </span>
        <span className="font-mono text-[0.6875rem] text-muted-light">
          {testedCount} / 4 tested
        </span>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {bands.map((mod) => {
          const Icon = moduleIcons[mod.module];
          const testsDone = completedCount(recent, mod.module, mod.part);
          const hasBand = mod.band != null && mod.band > 0;
          const progress = hasBand
            ? Math.min(100, Math.round((mod.band! / 9) * 100))
            : 0;
          const displayBand = moduleBandLabel(mod.band, mod.reviewState, mod.live);

          return (
            <li key={mod.key}>
              <article className="flex h-full flex-col rounded-2xl border border-border-soft border-l-[3px] border-l-cyan bg-white p-5">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-cyan-soft text-cyan">
                    <Icon className="size-[23px]" strokeWidth={2} />
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        "font-mono text-2xl leading-none font-medium",
                        hasBand
                          ? "text-cyan"
                          : mod.reviewState === "under_review"
                            ? "text-[#3b6fb0]"
                            : "text-muted-light",
                      )}
                    >
                      {displayBand}
                    </p>
                    <p className="mt-0.5 text-[0.65625rem] text-muted-light">
                      {hasBand ? "band" : mod.reviewState === "under_review" ? "status" : "band"}
                    </p>
                  </div>
                </div>
                <h3 className="font-display text-lg font-bold text-navy">
                  {mod.label}
                </h3>
                <p className="mt-1 text-[0.78125rem] text-muted-light">
                  {testsDone} {testsDone === 1 ? "attempt" : "attempts"}
                </p>
                {mod.reviewState === "under_review" ? (
                  <StatusPill status="under_review" />
                ) : null}
                <div
                  className={cn(
                    "h-[7px] overflow-hidden rounded bg-[#edf1f6]",
                    mod.reviewState === "under_review" ? "mt-2.5 mb-4" : "my-3.5",
                  )}
                >
                  <div
                    className="h-full rounded bg-cyan transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <Link
                  href={mod.href ?? mockTestNumberPath(1)}
                  onClick={() => {
                    if (mod.attemptId && mod.testNumber != null && mod.href) {
                      persistModuleResultAttempt(
                        mod.testNumber,
                        mod.module as ResultModule,
                        mod.attemptId,
                      );
                    }
                  }}
                  className="mt-auto flex w-full items-center justify-center rounded-full bg-cyan py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-sky-hover"
                >
                  {testsDone > 0 ? (mod.href ? "View results" : "Continue") : "Start"}
                </Link>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
