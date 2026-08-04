"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Check, TrendingUp } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import {
  BookIcon,
  HeadphonesIcon,
  MicIcon,
  PencilIcon,
} from "@/components/bandforge/dashboard/icons";
import {
  DASH_EASE,
  DashReveal,
} from "@/components/bandforge/dashboard/motion";
import type {
  LearningStudyTask,
  SkillHubProgress,
} from "@/lib/learning-types";
import {
  readPlanDayOutcomes,
  type PlanDayOutcome,
} from "@/lib/plan-daily-progress";
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
  /** When true (dashboard embed), hide duplicate CTAs / band / plan % already on the page. */
  embedded?: boolean;
  /** Primary action: jump straight into the next practice/test. */
  nextActionHref?: string;
  nextActionLabel?: string;
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
  embedded = false,
  nextActionHref,
  nextActionLabel,
}: Props) {
  const outcomes = useMemo(() => readPlanDayOutcomes(), []);
  const visible = tasks.filter((t) => t.status !== "skipped");
  const done = visible.filter((t) => t.status === "done");
  const minutes = sumMinutes(done);
  const skills = skillRows(done.length ? done : visible);

  const scoredOutcomes = outcomes.filter(
    (o) => o.band != null || o.accuracyPct != null,
  );

  const stats = [
    { label: "Tasks", value: `${done.length}/${visible.length}` },
    { label: "Minutes", value: `~${minutes}` },
    { label: "Skills", value: String(skills.length) },
  ];

  const primaryHref = nextActionHref ?? "/practice/listening";
  const primaryLabel = nextActionLabel ?? "Start next practice";
  const reduce = useReducedMotion();

  return (
    <DashReveal
      as="section"
      className="overflow-hidden rounded-[24px] border border-ink/8 bg-white shadow-[0_1px_0_rgba(255,255,255,0.8)_inset]"
      aria-labelledby="daily-improvements-heading"
    >
      <div className="relative border-b border-ink/[0.05] bg-[linear-gradient(160deg,rgba(224,247,250,0.75),rgba(255,255,255,0.95)_60%)] px-4 py-5 sm:px-5 sm:py-6">
        <div
          className="pointer-events-none absolute -right-8 -top-10 size-36 rounded-full bg-cyan/15 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-teal">
              Daily check-in
            </p>
            <h2
              id="daily-improvements-heading"
              className="mt-1 font-display text-xl font-bold tracking-tight text-ink sm:text-[1.35rem]"
            >
              Today&apos;s work complete
            </h2>
            <p className="mt-1.5 max-w-lg text-[13px] leading-relaxed text-muted sm:text-sm">
              Results are in. Take the next practice test while you&apos;re warm —
              test first, then review the score.
            </p>
          </div>
          <motion.div
            className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-teal text-white sm:size-12"
            initial={reduce ? false : { scale: 0.7, opacity: 0 }}
            whileInView={reduce ? undefined : { scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: DASH_EASE, delay: 0.1 }}
          >
            <Check className="size-5" strokeWidth={2.5} aria-hidden />
          </motion.div>
        </div>

        <div className="relative mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <motion.div
            whileHover={reduce ? undefined : { scale: 1.02 }}
            whileTap={reduce ? undefined : { scale: 0.98 }}
          >
            <Link
              href={primaryHref}
              className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-navy px-5 py-3 text-[15px] font-bold text-white transition-colors hover:bg-navy/90 sm:w-auto sm:min-w-[220px]"
            >
              {primaryLabel}
              <ArrowRight className="size-4" strokeWidth={2.5} aria-hidden />
            </Link>
          </motion.div>
          <Link
            href="/study-plan"
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-teal transition-colors hover:bg-white/70"
          >
            Full plan
          </Link>
          {!embedded ? (
            <Link
              href="/dashboard"
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-muted transition-colors hover:bg-white/70"
            >
              Dashboard
            </Link>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-px border-b border-ink/[0.05] bg-ink/[0.05]">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white px-3 py-3.5 sm:px-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-light">
              {stat.label}
            </p>
            <p className="mt-1 font-display text-lg font-bold tabular-nums text-ink sm:text-xl">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
        <div>
          <div className="mb-2.5 flex items-center gap-2">
            <TrendingUp className="size-4 text-teal" strokeWidth={2} />
            <p className="text-[13px] font-semibold text-ink">
              Today&apos;s results
            </p>
          </div>
          <ul className="space-y-2">
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
                  className="flex flex-col gap-2.5 rounded-xl border border-ink/8 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-3.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-cyan-soft text-teal">
                      <Icon className="size-4" strokeWidth={2} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">
                        {MODULE_LABEL[skill] ?? skill}
                      </p>
                      <p className="text-[12px] text-muted">
                        {hub
                          ? `Hubs ${hub.completed_count}/${hub.total_count}`
                          : "Practice set updated"}
                        {hub?.mock_unlocked ? " · Mock unlocked" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                    {accuracy != null ? (
                      <span className="rounded-lg bg-emerald-50 px-2 py-1 text-[11.5px] font-semibold tabular-nums text-emerald-700">
                        {accuracy}% correct
                        {outcome?.rawScore != null &&
                        outcome?.totalQuestions != null
                          ? ` · ${outcome.rawScore}/${outcome.totalQuestions}`
                          : ""}
                      </span>
                    ) : null}
                    {practiceBand != null ? (
                      <span className="rounded-lg bg-cyan-soft px-2 py-1 text-[11.5px] font-semibold tabular-nums text-teal">
                        Practice {formatBand(practiceBand)}
                      </span>
                    ) : null}
                    {baseline != null ? (
                      <span className="rounded-lg bg-surface px-2 py-1 text-[11.5px] font-medium tabular-nums text-muted">
                        Profile {formatBand(baseline)}
                      </span>
                    ) : accuracy == null && practiceBand == null ? (
                      <span className="rounded-lg bg-surface px-2 py-1 text-[11.5px] font-medium text-muted">
                        Session logged
                      </span>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
          {scoredOutcomes.length === 0 ? (
            <p className="mt-2.5 text-[12px] leading-relaxed text-muted">
              Run a Listening or Reading practice test next for scored accuracy.
            </p>
          ) : null}
        </div>

        {!embedded && (currentBand != null || targetBand != null) ? (
          <div className="flex flex-col gap-2 rounded-xl border border-dashed border-ink/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">Overall band vs target</p>
            <p className="font-display text-base font-bold tabular-nums text-ink">
              {formatBand(currentBand)}
              <span className="mx-1.5 font-normal text-muted">→</span>
              {formatBand(targetBand)}
            </p>
          </div>
        ) : null}

        {/* Keep overallPlanPct referenced so callers can still pass it without lint noise */}
        {!embedded && overallPlanPct > 0 ? (
          <p className="text-[11px] text-muted-light">
            Overall plan {Math.max(0, Math.min(100, overallPlanPct))}%
          </p>
        ) : null}
      </div>
    </DashReveal>
  );
}
