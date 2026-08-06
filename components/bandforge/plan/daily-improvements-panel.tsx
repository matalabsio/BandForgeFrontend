"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { ArrowRight, Check, ChevronDown, ListChecks } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
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
  embedded?: boolean;
  nextActionHref?: string;
  nextActionLabel?: string;
  onNextActionClick?: () => void;
  nextActionHint?: string;
  checklist?: ReactNode;
  missedDayCount?: number;
  onOpenCatchUp?: () => void;
  catchUpIsPrimary?: boolean;
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

/** One badge per skill — prefer scored accuracy, then practice band, then profile. */
function skillHighlight(
  outcome: PlanDayOutcome | undefined,
  baseline: number | null,
): { label: string; tone: "score" | "band" | "profile" } | null {
  if (outcome?.accuracyPct != null) {
    const raw =
      outcome.rawScore != null && outcome.totalQuestions != null
        ? ` · ${outcome.rawScore}/${outcome.totalQuestions}`
        : "";
    return {
      label: `${outcome.accuracyPct}%${raw}`,
      tone: "score",
    };
  }
  if (outcome?.band != null) {
    return { label: `Band ${formatBand(outcome.band)}`, tone: "band" };
  }
  if (baseline != null) {
    return { label: `Band ${formatBand(baseline)}`, tone: "profile" };
  }
  return null;
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
  onNextActionClick,
  nextActionHint,
  checklist,
  missedDayCount = 0,
  onOpenCatchUp,
  catchUpIsPrimary = false,
}: Props) {
  const outcomes = useMemo(() => readPlanDayOutcomes(), []);
  const visible = tasks.filter((t) => t.status !== "skipped");
  const done = visible.filter((t) => t.status === "done");
  const minutes = sumMinutes(done);
  const skills = skillRows(done.length ? done : visible);
  const reduce = useReducedMotion();
  const showSecondaryCatchUp =
    missedDayCount > 0 && onOpenCatchUp && !catchUpIsPrimary;

  const primaryHref = nextActionHref ?? "/practice/listening";
  const primaryLabel = nextActionLabel ?? "Start next practice";

  return (
    <DashReveal
      as="section"
      className="overflow-hidden rounded-[24px] border border-teal/20 bg-white shadow-[0_1px_0_rgba(255,255,255,0.8)_inset]"
      aria-labelledby="daily-improvements-heading"
    >
      <div
        className={cn(
          "relative bg-[linear-gradient(160deg,rgba(224,247,250,0.7),rgba(255,255,255,0.96)_70%)]",
          embedded ? "px-4 py-4 sm:px-5" : "px-4 py-5 sm:px-5 sm:py-5",
        )}
      >
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal px-2.5 py-1 text-[11px] font-bold tracking-wide text-white uppercase">
                <Check className="size-3.5" strokeWidth={3} aria-hidden />
                Done
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-teal/80">
                Daily check-in
              </span>
            </div>
            <h2
              id="daily-improvements-heading"
              className="mt-2 font-display text-xl font-bold tracking-tight text-ink sm:text-[1.3rem]"
            >
              Completed
            </h2>
            {nextActionHint ? (
              <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-muted">
                {nextActionHint}
              </p>
            ) : null}
            <p className="mt-2.5 text-[12.5px] tabular-nums text-muted">
              <span className="font-semibold text-ink">
                {done.length}/{visible.length}
              </span>{" "}
              tasks
              <span className="mx-1.5 text-ink/20">·</span>
              <span className="font-semibold text-ink">~{minutes}</span> min
              <span className="mx-1.5 text-ink/20">·</span>
              <span className="font-semibold text-ink">{skills.length}</span>{" "}
              {skills.length === 1 ? "skill" : "skills"}
            </p>
          </div>

          <div
            className={cn(
              "flex shrink-0 flex-col gap-2",
              "w-full sm:w-auto sm:min-w-[200px]",
            )}
          >
            <motion.div
              whileHover={reduce ? undefined : { scale: 1.02 }}
              whileTap={reduce ? undefined : { scale: 0.98 }}
            >
              <Link
                href={primaryHref}
                onClick={onNextActionClick}
                className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-navy/90"
              >
                {primaryLabel}
                <ArrowRight className="size-4" strokeWidth={2.5} aria-hidden />
              </Link>
            </motion.div>
            <Link
              href="/study-plan"
              className="inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-teal/25 bg-white/90 px-4 py-2 text-[13px] font-semibold text-teal transition-colors hover:border-cyan/40 hover:bg-cyan-soft/50"
            >
              Full plan
            </Link>
            {showSecondaryCatchUp ? (
              <button
                type="button"
                onClick={onOpenCatchUp}
                className="inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-semibold text-amber-800 transition-colors hover:bg-amber-50"
              >
                Catch up · {missedDayCount} day
                {missedDayCount === 1 ? "" : "s"}
              </button>
            ) : null}
            {!embedded ? (
              <Link
                href="/dashboard"
                className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-semibold text-muted transition-colors hover:bg-white/70"
              >
                Dashboard
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {checklist ? (
        <div className="border-t border-ink/[0.05] px-4 py-3 sm:px-5">
          {checklist}
        </div>
      ) : null}

      {skills.length > 0 ? (
        <div className="border-t border-ink/[0.05] px-4 py-3.5 sm:px-5 sm:py-4">
          <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-light">
            Skills today
          </p>
          <ul className="divide-y divide-ink/[0.05] rounded-xl border border-ink/[0.06] bg-white">
            {skills.map((skill) => {
              const Icon = MODULE_ICONS[skill] ?? BookIcon;
              const hub = hubProgress[skill];
              const highlight = skillHighlight(
                outcomeForSkill(outcomes, skill),
                moduleSummary[skill]?.latest ?? null,
              );

              return (
                <li
                  key={skill}
                  className="flex items-center gap-3 px-3 py-2.5 sm:px-3.5"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-cyan-soft text-teal">
                    <Icon className="size-3.5" strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-ink">
                      {MODULE_LABEL[skill] ?? skill}
                    </p>
                    <p className="text-[11.5px] text-muted">
                      {hub
                        ? `Hubs ${hub.completed_count}/${hub.total_count}`
                        : "Logged"}
                      {hub?.mock_unlocked ? " · Mock ready" : ""}
                    </p>
                  </div>
                  {highlight ? (
                    <span
                      className={cn(
                        "shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold tabular-nums",
                        highlight.tone === "score" &&
                          "bg-emerald-50 text-emerald-700",
                        highlight.tone === "band" &&
                          "bg-cyan-soft text-teal",
                        highlight.tone === "profile" &&
                          "bg-ink/[0.04] text-muted",
                      )}
                    >
                      {highlight.label}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {!embedded && (currentBand != null || targetBand != null) ? (
        <div className="flex items-center justify-between gap-3 border-t border-ink/[0.05] px-4 py-3 sm:px-5">
          <p className="text-[12.5px] text-muted">Band</p>
          <p className="font-display text-sm font-bold tabular-nums text-ink">
            {formatBand(currentBand)}
            <span className="mx-1 font-normal text-muted">→</span>
            {formatBand(targetBand)}
            {overallPlanPct > 0 ? (
              <span className="ml-2 text-[11px] font-medium text-muted-light">
                · Plan {Math.max(0, Math.min(100, overallPlanPct))}%
              </span>
            ) : null}
          </p>
        </div>
      ) : null}
    </DashReveal>
  );
}

/** Compact disclosure for the completed-day checklist. */
export function DoneChecklistDisclosure({
  open,
  onToggle,
  children,
  hasTasks,
}: {
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  hasTasks: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg py-1 text-left transition-colors hover:text-teal"
      >
        <span className="flex items-center gap-2 text-[12.5px] font-semibold text-muted">
          <ListChecks className="size-3.5 text-teal" strokeWidth={2.25} />
          {open ? "Hide checklist" : "Show checklist"}
        </span>
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 text-muted transition-transform duration-200",
            open && "rotate-180 text-teal",
          )}
          aria-hidden
        />
      </button>

      <AnimatePresence initial={false}>
        {open && hasTasks ? (
          <motion.div
            key="checklist"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: DASH_EASE }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
