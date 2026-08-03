"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Check, TrendingUp } from "lucide-react";
import {
  BookIcon,
  HeadphonesIcon,
  MicIcon,
  PencilIcon,
} from "@/components/bandforge/dashboard/icons";
import type {
  LearningStudyTask,
  SkillHubProgress,
} from "@/lib/learning-types";
import {
  readPlanDayOutcomes,
  type PlanDayOutcome,
} from "@/lib/plan-daily-progress";
import { cn } from "@/lib/utils";
import type { ComponentType, SVGProps } from "react";

const MODULE_ICONS: Record<
  string,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  listening: HeadphonesIcon,
  reading: BookIcon,
  writing: PencilIcon,
  speaking: MicIcon,
};

const MODULE_LABEL: Record<string, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};

type ModuleSummary = Record<
  string,
  { latest: number | null; best: number | null; n: number; gap: number | null }
>;

type Props = {
  tasks: LearningStudyTask[];
  hubProgress?: Record<string, SkillHubProgress>;
  moduleSummary?: ModuleSummary;
  currentBand?: number | null;
  targetBand?: number | null;
  overallPlanPct?: number;
};

function sumMinutes(tasks: LearningStudyTask[]): number {
  return tasks.reduce((acc, t) => acc + (t.duration_min ?? 0), 0);
}

function skillRows(tasks: LearningStudyTask[]): string[] {
  const order: string[] = [];
  for (const t of tasks) {
    const skill = t.module || "other";
    if (!order.includes(skill)) order.push(skill);
  }
  return order;
}

function formatBand(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toFixed(1);
}

function outcomeForSkill(
  outcomes: PlanDayOutcome[],
  skill: string,
): PlanDayOutcome | undefined {
  const matches = outcomes.filter((o) => o.skill === skill);
  if (matches.length === 0) return undefined;
  return matches[matches.length - 1];
}

export function DailyImprovementsPanel({
  tasks,
  hubProgress = {},
  moduleSummary = {},
  currentBand = null,
  targetBand = null,
  overallPlanPct = 0,
}: Props) {
  const outcomes = useMemo(() => readPlanDayOutcomes(), []);
  const visible = tasks.filter((t) => t.status !== "skipped");
  const done = visible.filter((t) => t.status === "done");
  const minutes = sumMinutes(done);
  const skills = skillRows(done.length ? done : visible);
  const dateLabel = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
    .format(new Date())
    .replace(",", " ·");

  const scoredOutcomes = outcomes.filter(
    (o) => o.band != null || o.accuracyPct != null,
  );

  return (
    <section
      className="bf-dash-enter overflow-hidden rounded-2xl border border-border-soft bg-white"
      aria-labelledby="daily-improvements-heading"
    >
      <div className="relative border-b border-border-soft bg-gradient-to-br from-cyan-soft/80 via-white to-white px-4 py-6 sm:px-6 sm:py-7">
        <div
          className="pointer-events-none absolute -top-16 right-0 size-40 rounded-full bg-cyan/10 blur-3xl"
          aria-hidden
        />
        <p className="font-mono text-[11px] tracking-[0.12em] text-cyan uppercase">
          Daily check-in · {dateLabel}
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h2
              id="daily-improvements-heading"
              className="font-display text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem]"
            >
              Today&apos;s work complete
            </h2>
            <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted">
              Here&apos;s what you covered and how today&apos;s practice scored —
              small daily gains compound toward your target.
            </p>
          </div>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-cyan text-white shadow-sm sm:size-14">
            <Check className="size-6" strokeWidth={2.5} aria-hidden />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px border-b border-border-soft bg-border-soft sm:grid-cols-4">
        {[
          { label: "Tasks done", value: `${done.length}/${visible.length}` },
          { label: "Minutes", value: `~${minutes}` },
          { label: "Skills", value: String(skills.length) },
          {
            label: "Plan progress",
            value: `${Math.max(0, Math.min(100, overallPlanPct))}%`,
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white px-4 py-4 sm:px-5">
            <p className="font-mono text-[10px] tracking-[0.1em] text-muted-light uppercase">
              {stat.label}
            </p>
            <p className="mt-1 font-display text-xl font-bold tabular-nums text-navy sm:text-2xl">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-5 px-4 py-5 sm:px-6 sm:py-6">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="size-4 text-cyan" strokeWidth={2} />
            <p className="text-[13px] font-semibold text-navy">
              Skill improvements today
            </p>
          </div>
          <ul className="space-y-2.5">
            {skills.map((skill) => {
              const Icon = MODULE_ICONS[skill] ?? BookIcon;
              const hub = hubProgress[skill];
              const summary = moduleSummary[skill];
              const outcome = outcomeForSkill(outcomes, skill);
              const accuracy = outcome?.accuracyPct;
              const practiceBand = outcome?.band;
              const baseline = summary?.latest ?? null;

              return (
                <li
                  key={skill}
                  className="flex flex-col gap-3 rounded-xl border border-border-soft px-3.5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-cyan-soft text-cyan">
                      <Icon className="size-[18px]" strokeWidth={2} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-navy">
                        {MODULE_LABEL[skill] ?? skill}
                      </p>
                      <p className="text-xs text-muted">
                        {hub
                          ? `Hubs ${hub.completed_count}/${hub.total_count}`
                          : "Practice set updated"}
                        {hub?.mock_unlocked ? " · Mock unlocked" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    {accuracy != null ? (
                      <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[12px] font-semibold tabular-nums text-emerald-700">
                        {accuracy}% correct
                        {outcome?.rawScore != null &&
                        outcome?.totalQuestions != null
                          ? ` · ${outcome.rawScore}/${outcome.totalQuestions}`
                          : ""}
                      </span>
                    ) : null}
                    {practiceBand != null ? (
                      <span className="rounded-lg bg-cyan-soft px-2.5 py-1 text-[12px] font-semibold tabular-nums text-cyan">
                        Practice band {formatBand(practiceBand)}
                      </span>
                    ) : null}
                    {baseline != null ? (
                      <span className="rounded-lg bg-ink/[0.04] px-2.5 py-1 text-[12px] font-medium tabular-nums text-ink/70">
                        Profile {formatBand(baseline)}
                      </span>
                    ) : accuracy == null && practiceBand == null ? (
                      <span className="rounded-lg bg-ink/[0.04] px-2.5 py-1 text-[12px] font-medium text-ink/60">
                        Session logged
                      </span>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
          {scoredOutcomes.length === 0 ? (
            <p className="mt-3 text-xs leading-relaxed text-muted">
              Complete a Listening or Reading practice for scored accuracy and
              practice-band feedback next time.
            </p>
          ) : null}
        </div>

        {(currentBand != null || targetBand != null) && (
          <div className="flex flex-col gap-2 rounded-xl border border-dashed border-border-soft px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">
              Overall band vs target
            </p>
            <p className="font-display text-base font-bold tabular-nums text-navy">
              {formatBand(currentBand)}
              <span className="mx-1.5 font-normal text-muted">→</span>
              {formatBand(targetBand)}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/study-plan"
            className={cn(
              "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
              "bg-navy text-white hover:bg-navy/90",
            )}
          >
            View full plan
            <ArrowRight className="size-4" strokeWidth={2} />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-cyan transition-colors hover:bg-cyan-soft"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}
