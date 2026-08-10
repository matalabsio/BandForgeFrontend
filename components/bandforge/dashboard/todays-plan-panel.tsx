"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock3,
  ClipboardCheck,
  PlayCircle,
  PencilLine,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookIcon,
  HeadphonesIcon,
  MicIcon,
  PencilIcon,
} from "@/components/bandforge/dashboard/icons";
import {
  DASH_EASE,
  DashProgressBar,
  DashReveal,
} from "@/components/bandforge/dashboard/motion";
import {
  SkillProgressStepper,
  type SkillStepperStep,
} from "@/components/bandforge/dashboard/skill-progress-stepper";
import { DailyImprovementsPanel, DoneChecklistDisclosure } from "@/components/bandforge/plan/daily-improvements-panel";
import { PrefetchHrefs } from "@/components/bandforge/prefetch-hrefs";
import { DailyGrowthReportModal } from "@/components/bandforge/plan/daily-growth-report-modal";
import { OPEN_DAILY_REPORT_EVENT } from "@/components/bandforge/dashboard/dashboard-top-header";
import { CatchUpDaysModal } from "@/components/bandforge/plan/catch-up-days-modal";
import { getLearningProfile } from "@/lib/learning-api";
import { localPlanDateKey } from "@/lib/plan-step-completion";
import type {
  LearningStudyPlan,
  LearningStudyTask,
  SkillHubProgress,
} from "@/lib/learning-types";
import { resolveTodayTaskHref } from "@/lib/plan-task-flow";
import {
  findNextStartTask,
  isPlanTaskUnavailable,
  planTaskOpenHref,
} from "@/lib/plan-start-task";
import {
  cachePlanDayTasks,
  mergePlanDayStatusesIntoTasks,
  planTaskStatusesDiffer,
} from "@/lib/plan-day-tasks";
import {
  findPlanDay,
  getNextAheadTarget,
  getOldestCatchUpTarget,
} from "@/lib/study-plan-calendar";
import { cn } from "@/lib/utils";
import type { ComponentType, SVGProps } from "react";

const moduleIcons: Record<
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

const TASK_TYPE_ORDER: Record<string, number> = {
  watch: 0,
  practice: 1,
  submit: 2,
};

const TASK_TYPE_LABEL: Record<string, string> = {
  watch: "Watch",
  practice: "Practice",
  submit: "Submit",
};

type TaskRow = LearningStudyTask & { clientKey: string };

type SkillStack = {
  skill: string;
  tasks: TaskRow[];
};

type Props = {
  initialTasks: LearningStudyTask[];
  userId: string;
  studentName?: string;
  hubProgress?: Record<string, SkillHubProgress>;
  moduleSummary?: Record<
    string,
    { latest: number | null; best: number | null; n: number; gap: number | null }
  >;
  currentBand?: number | null;
  targetBand?: number | null;
  overallPlanPct?: number;
  /** Dashboard embed: hide duplicate labels / collapse checklist when day is done. */
  embedded?: boolean;
  studyPlan?: LearningStudyPlan | null;
  examDate?: string | null;
};

function withClientKeys(tasks: LearningStudyTask[]): TaskRow[] {
  return tasks.map((t, i) => ({ ...t, clientKey: `${t.id}__${i}` }));
}

/** Group by skill in first-seen (session) order; within skill: watch → practice → submit. */
function stackTasksBySkill(tasks: TaskRow[]): SkillStack[] {
  const visible = tasks.filter((t) => t.status !== "skipped");
  const order: string[] = [];
  const bySkill = new Map<string, TaskRow[]>();

  for (const task of visible) {
    const skill = task.module || "other";
    if (!bySkill.has(skill)) {
      order.push(skill);
      bySkill.set(skill, []);
    }
    bySkill.get(skill)!.push(task);
  }

  return order.map((skill) => {
    const stack = bySkill.get(skill) ?? [];
    stack.sort((a, b) => {
      const ao = TASK_TYPE_ORDER[a.task_type ?? ""] ?? 99;
      const bo = TASK_TYPE_ORDER[b.task_type ?? ""] ?? 99;
      return ao - bo;
    });
    return { skill, tasks: stack };
  });
}

function sumMinutes(tasks: LearningStudyTask[]): number {
  return tasks.reduce((acc, t) => acc + (t.duration_min ?? 0), 0);
}

function progressPercent(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((done / total) * 100);
}

function isUnavailable(task: LearningStudyTask): boolean {
  return isPlanTaskUnavailable(task);
}

function taskOpenHref(task: LearningStudyTask): string {
  return planTaskOpenHref(task);
}

function nextPracticeSkillHref(
  hubProgress?: Record<string, SkillHubProgress>,
): { href: string; label: string } {
  const order = ["listening", "reading", "writing", "speaking"] as const;
  for (const skill of order) {
    const hub = hubProgress?.[skill];
    const total = hub?.total_count ?? 12;
    const done = hub?.completed_count ?? 0;
    if (done < total) {
      return {
        href: `/practice/${skill}`,
        label: `Start ${MODULE_LABEL[skill]} practice`,
      };
    }
  }
  return { href: "/test", label: "Start a mock test" };
}

const SKILL_GRID_ORDER = [
  "listening",
  "reading",
  "writing",
  "speaking",
] as const;

/** Always show L/R/W/S in a stable 2×2 order, even if a skill has no tasks today. */
function stacksForSkillGrid(tasks: TaskRow[]): SkillStack[] {
  const bySkill = stackTasksBySkill(tasks);
  const map = new Map(bySkill.map((s) => [s.skill, s.tasks]));
  return SKILL_GRID_ORDER.map((skill) => ({
    skill,
    tasks: map.get(skill) ?? [],
  }));
}

function startLabelForTask(task: LearningStudyTask): string {
  if (task.task_type === "practice") return "Start practice";
  if (task.task_type === "submit") return "Start submit";
  if (task.task_type === "watch") return "Start watch";
  return "Start";
}

const TASK_STEP_META: Record<
  string,
  {
    label: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
  }
> = {
  watch: { label: "Watch", icon: PlayCircle },
  practice: { label: "Practice", icon: PencilLine },
  submit: { label: "Submit", icon: ClipboardCheck },
};

function buildTaskStepperSteps(tasks: TaskRow[]): SkillStepperStep[] {
  const ordered = [...tasks].sort((a, b) => {
    const ao = TASK_TYPE_ORDER[a.task_type ?? ""] ?? 99;
    const bo = TASK_TYPE_ORDER[b.task_type ?? ""] ?? 99;
    return ao - bo;
  });

  const firstPendingIdx = ordered.findIndex(
    (t) => t.status !== "done" && !isUnavailable(t),
  );

  return ordered.map((task, index) => {
    const meta =
      TASK_STEP_META[task.task_type ?? ""] ?? {
        label: TASK_TYPE_LABEL[task.task_type ?? ""] ?? "Task",
        icon: PencilLine,
      };
    const done = task.status === "done";
    const unavailable = isUnavailable(task);
    let state: SkillStepperStep["state"] = "upcoming";
    if (done) state = "done";
    else if (!unavailable && index === firstPendingIdx) state = "current";

    return {
      id: task.clientKey,
      label: meta.label,
      detail:
        task.duration_min != null ? `~${task.duration_min}m` : undefined,
      icon: meta.icon,
      state,
      href:
        !done && !unavailable
          ? taskOpenHref(task)
          : null,
    };
  });
}

function SkillPlanCard({
  skill,
  title,
  icon: Icon,
  tasks,
  quietCta = false,
}: {
  skill: string;
  title: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  tasks: TaskRow[];
  /** When primary Start banner is visible, demote card CTAs. */
  quietCta?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const minutes = sumMinutes(tasks);
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const hasTasks = tasks.length > 0;
  const allDone = hasTasks && doneCount === tasks.length;
  const progressPct = progressPercent(doneCount, tasks.length);
  const nextTask = findNextStartTask(tasks);
  const fallbackHref = `/practice/${skill}`;
  const stepperSteps = useMemo(
    () => (hasTasks ? buildTaskStepperSteps(tasks) : []),
    [hasTasks, tasks],
  );

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-2xl border border-ink/8 bg-white p-4 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-cyan/30 hover:shadow-[0_12px_28px_rgba(15,23,42,0.06)]",
        allDone && "border-teal/25 bg-teal/[0.02]",
        !hasTasks && "bg-surface/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              allDone
                ? "bg-teal text-white"
                : hasTasks
                  ? "bg-cyan-soft text-teal"
                  : "bg-ink/[0.04] text-muted",
            )}
          >
            {allDone ? (
              <Check className="size-4" strokeWidth={2.5} aria-hidden />
            ) : (
              <Icon className="size-4" strokeWidth={2.1} aria-hidden />
            )}
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-[15px] font-bold tracking-tight text-ink">
              {title}
            </h3>
            <p className="mt-0.5 text-[12px] text-muted">
              {hasTasks ? (
                <>
                  {doneCount}/{tasks.length} · ~{minutes} min
                </>
              ) : (
                "No tasks today"
              )}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums",
            allDone
              ? "bg-teal/10 text-teal"
              : hasTasks
                ? "bg-ink/[0.04] text-muted"
                : "bg-transparent text-muted-light",
          )}
        >
          {hasTasks ? `${progressPct}%` : "—"}
        </span>
      </div>

      <div className="mt-4 flex-1">
        {hasTasks ? (
          <SkillProgressStepper steps={stepperSteps} compact animate />
        ) : (
          <p className="rounded-xl border border-dashed border-ink/8 bg-surface/50 px-3 py-4 text-center text-[12.5px] text-muted">
            Nothing scheduled for {title.toLowerCase()} today.
          </p>
        )}
      </div>

      <div className="mt-auto flex items-center gap-2 pt-4">
        {allDone ? (
          <span className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl bg-teal/10 px-3 text-[13px] font-semibold text-teal">
            Done
          </span>
        ) : nextTask ? (
          <Link
            href={taskOpenHref(nextTask)}
            onClick={() => cachePlanDayTasks(tasks)}
            className={cn(
              "inline-flex min-h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3 text-[13px] transition-colors",
              quietCta
                ? "border border-ink/10 bg-white font-semibold text-teal hover:border-cyan/30 hover:bg-cyan-soft/40"
                : "bg-navy font-bold text-white hover:bg-navy/90",
            )}
          >
            {quietCta ? "Continue" : startLabelForTask(nextTask)}
            <ArrowRight className="size-3.5" strokeWidth={2.5} aria-hidden />
          </Link>
        ) : hasTasks ? (
          <span className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl border border-ink/8 bg-surface px-3 text-[13px] font-semibold text-muted">
            Unavailable
          </span>
        ) : (
          <Link
            href={fallbackHref}
            className="inline-flex min-h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-ink/10 bg-white px-3 text-[13px] font-semibold text-teal transition-colors hover:border-cyan/30 hover:bg-cyan-soft/40"
          >
            Browse practice
            <ArrowRight className="size-3.5" strokeWidth={2.5} aria-hidden />
          </Link>
        )}

        {hasTasks ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-label={
              expanded ? `Hide ${title} tasks` : `Show ${title} tasks`
            }
            className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-ink/8 bg-white text-muted transition-colors hover:border-cyan/30 hover:text-teal"
          >
            <ChevronDown
              className={cn(
                "size-4 transition-transform duration-200",
                expanded && "rotate-180",
              )}
              aria-hidden
            />
          </button>
        ) : null}
      </div>

      {expanded && hasTasks ? (
        <ul className="mt-3 space-y-1 border-t border-ink/[0.05] pt-3">
          {tasks.map((task, index) => {
            const done = task.status === "done";
            const unavailable = isUnavailable(task);
            const typeLabel =
              TASK_TYPE_LABEL[task.task_type ?? ""] ??
              (task.task_type
                ? task.task_type.charAt(0).toUpperCase() +
                  task.task_type.slice(1)
                : "Task");
            const duration =
              task.subtitle?.trim() ||
              (task.duration_min != null
                ? `~${task.duration_min} min`
                : null);

            const rowInner = (
              <>
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-md text-[11px] font-bold tabular-nums",
                    done ? "bg-teal/10 text-teal" : "bg-surface text-muted",
                  )}
                  aria-hidden
                >
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block truncate text-[13px] font-semibold",
                      done
                        ? "text-muted line-through decoration-ink/25"
                        : "text-ink",
                    )}
                  >
                    {task.title}
                  </span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11.5px] text-muted">
                    <span className="font-semibold uppercase tracking-[0.06em] text-teal/80">
                      {typeLabel}
                    </span>
                    {unavailable ? (
                      <span>Not available yet</span>
                    ) : duration ? (
                      <span>{duration}</span>
                    ) : null}
                  </span>
                </span>
                {!unavailable && !done ? (
                  <ArrowRight
                    className="size-3.5 shrink-0 text-teal"
                    aria-hidden
                  />
                ) : null}
              </>
            );

            return (
              <li key={task.clientKey}>
                {unavailable || done ? (
                  <div className="flex items-center gap-2.5 rounded-xl px-1.5 py-2 opacity-80">
                    {rowInner}
                  </div>
                ) : (
                  <Link
                    href={taskOpenHref(task)}
                    className="group flex cursor-pointer items-center gap-2.5 rounded-xl px-1.5 py-2 outline-none transition-colors hover:bg-cyan-soft/40 focus-visible:ring-2 focus-visible:ring-cyan/40"
                  >
                    {rowInner}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}
    </article>
  );
}

export function TodaysPlanPanel({
  initialTasks,
  userId,
  studentName,
  hubProgress,
  moduleSummary,
  currentBand = null,
  targetBand = null,
  overallPlanPct = 0,
  embedded = false,
  studyPlan = null,
  examDate = null,
}: Props) {
  const router = useRouter();
  const [tasks, setTasks] = useState(() =>
    withClientKeys(mergePlanDayStatusesIntoTasks(initialTasks)),
  );
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [catchUpOpen, setCatchUpOpen] = useState(false);
  const wasAllDoneRef = useRef(false);
  const reportShownRef = useRef(false);
  const catchUpOfferedRef = useRef(false);
  const refreshedOnceRef = useRef(false);
  const reconcileInFlightRef = useRef(false);
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  const applyTaskList = (next: LearningStudyTask[]) => {
    const merged = mergePlanDayStatusesIntoTasks(next);
    const withKeys = withClientKeys(merged);
    setTasks((prev) =>
      planTaskStatusesDiffer(prev, withKeys) || prev.length !== withKeys.length
        ? withKeys
        : prev,
    );
    cachePlanDayTasks(merged);
    return merged;
  };

  // Hydrate from sessionStorage immediately when server props arrive (covers soft-nav
  // with stale RSC while results already marked tasks done in bf-plan-day-tasks).
  useEffect(() => {
    applyTaskList(initialTasks);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- applyTaskList is stable enough via refs
  }, [initialTasks]);

  // Network reconcile + visibility/pageshow so returning from results opens the report
  // without a hard refresh.
  useEffect(() => {
    let cancelled = false;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const reconcile = async (opts?: { allowRefresh?: boolean }) => {
      if (reconcileInFlightRef.current) return;
      reconcileInFlightRef.current = true;
      try {
        const profile = await getLearningProfile();
        if (cancelled) return;
        const incoming = profile.todays_tasks ?? [];
        if (incoming.length === 0) return;

        const before = tasksRef.current;
        const merged = applyTaskList(incoming);
        const changed = planTaskStatusesDiffer(before, merged);

        if (
          opts?.allowRefresh !== false &&
          !refreshedOnceRef.current &&
          changed
        ) {
          refreshedOnceRef.current = true;
          router.refresh();
        }
      } catch {
        // Keep cache-merged state — degraded but usable for report allDone.
      } finally {
        reconcileInFlightRef.current = false;
      }
    };

    const scheduleReconcile = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        void reconcile({ allowRefresh: true });
      }, 300);
    };

    void reconcile({ allowRefresh: true });

    const onVisibility = () => {
      if (document.visibilityState === "visible") scheduleReconcile();
    };
    const onPageShow = () => scheduleReconcile();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      cancelled = true;
      if (debounceTimer) clearTimeout(debounceTimer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount + router identity
  }, [router]);

  // Cache ordered day tasks for mid-exam next/prev without re-fetching profile.
  useEffect(() => {
    cachePlanDayTasks(tasks);
  }, [tasks]);

  const stacks = useMemo(() => stacksForSkillGrid(tasks), [tasks]);
  const actionable = useMemo(
    () => tasks.filter((t) => t.status !== "skipped"),
    [tasks],
  );
  const hasTasks = actionable.length > 0;
  const doneCount = useMemo(
    () => actionable.filter((t) => t.status === "done").length,
    [actionable],
  );
  const totalMinutes = useMemo(() => sumMinutes(actionable), [actionable]);
  const allDone = hasTasks && doneCount === actionable.length;
  const prefetchHrefs = useMemo(
    () =>
      actionable
        .filter((t) => t.status !== "done" && !isUnavailable(t))
        .map((t) => taskOpenHref(t))
        .filter((h) => h.includes("/test/") || h.includes("/practice/")),
    [actionable],
  );
  const dayPct = progressPercent(doneCount, actionable.length);
  const hasSubmit = stacks.some((s) =>
    s.tasks.some((t) => t.task_type === "submit"),
  );

  const dateLabel = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date());

  const nextStart = useMemo(() => findNextStartTask(tasks), [tasks]);
  const showPrimaryBanner = !allDone && Boolean(nextStart);
  const continuePractice = useMemo(
    () => nextPracticeSkillHref(hubProgress),
    [hubProgress],
  );

  const catchUpTarget = useMemo(() => {
    if (!studyPlan?.weeks?.length) return null;
    return getOldestCatchUpTarget(
      studyPlan.weeks,
      localPlanDateKey(),
      examDate ?? studyPlan.exam_date ?? null,
    );
  }, [studyPlan, examDate]);

  const catchUpHref = useMemo(() => {
    if (!catchUpTarget?.task) return "/study-plan";
    return resolveTodayTaskHref({
      skill: catchUpTarget.task.module,
      hubId: catchUpTarget.task.hub_id,
      taskType: catchUpTarget.task.task_type,
      taskId: catchUpTarget.task.id,
      fallbackHref: catchUpTarget.task.href,
    });
  }, [catchUpTarget]);

  const aheadTarget = useMemo(() => {
    if (!studyPlan?.weeks?.length) return null;
    // Catch-up backlog blocks practice-ahead (strict day-wise progression).
    if (catchUpTarget && catchUpTarget.missed.length > 0) return null;
    return getNextAheadTarget(
      studyPlan.weeks,
      localPlanDateKey(),
      examDate ?? studyPlan.exam_date ?? null,
    );
  }, [studyPlan, examDate, catchUpTarget]);

  const aheadHref = useMemo(() => {
    if (!aheadTarget?.task) return null;
    return resolveTodayTaskHref({
      skill: aheadTarget.task.module,
      hubId: aheadTarget.task.hub_id,
      taskType: aheadTarget.task.task_type,
      taskId: aheadTarget.task.id,
      fallbackHref: aheadTarget.task.href,
    });
  }, [aheadTarget]);

  const donePrimaryAction = useMemo(() => {
    const missedCount = catchUpTarget?.missed.length ?? 0;
    if (missedCount > 0) {
      return {
        href: catchUpHref,
        label:
          missedCount === 1
            ? "Catch up on previous day"
            : `Catch up on ${missedCount} previous days`,
        hint: "Finish previous plan days before unlocking tomorrow.",
        catchUpIsPrimary: true as const,
        onClick: () => {
          if (!studyPlan?.weeks?.length || !catchUpTarget) return;
          const day = findPlanDay(studyPlan.weeks, catchUpTarget.date);
          if (day?.tasks?.length) cachePlanDayTasks(day.tasks);
        },
      };
    }
    if (aheadHref && aheadTarget) {
      return {
        href: aheadHref,
        label: "Start tomorrow's plan",
        hint: "You're clear through today — practice tomorrow early to advance hubs toward your full mock.",
        catchUpIsPrimary: false as const,
        onClick: () => {
          if (!studyPlan?.weeks?.length) return;
          const day = findPlanDay(studyPlan.weeks, aheadTarget.date);
          if (day?.tasks?.length) cachePlanDayTasks(day.tasks);
        },
      };
    }
    return {
      href: continuePractice.href,
      label: continuePractice.label,
      hint: undefined as string | undefined,
      catchUpIsPrimary: false as const,
      onClick: undefined as (() => void) | undefined,
    };
  }, [
    catchUpTarget,
    catchUpHref,
    aheadHref,
    aheadTarget,
    continuePractice,
    studyPlan,
  ]);

  /** On dashboard when day is done: check-in is primary; checklist is optional. */
  const compactDone = embedded && allDone;
  const reduce = useReducedMotion();
  const reportDate = useMemo(() => new Date(), []);
  const displayName = (studentName?.trim() || "BandForge Student").slice(0, 60);

  const catchUpStorageKey = `bf-catchup-offered:${
    userId || "anon"
  }:${localPlanDateKey()}`;

  const markCatchUpOffered = () => {
    catchUpOfferedRef.current = true;
    try {
      sessionStorage.setItem(catchUpStorageKey, "1");
    } catch {
      // Ignore storage errors.
    }
  };

  const dismissCatchUp = () => {
    markCatchUpOffered();
    setCatchUpOpen(false);
  };

  const maybeOpenCatchUp = () => {
    if (!allDone || !catchUpTarget || catchUpTarget.missed.length === 0) return;
    if (catchUpOfferedRef.current) return;
    let offered = false;
    try {
      offered = sessionStorage.getItem(catchUpStorageKey) === "1";
    } catch {
      offered = false;
    }
    if (offered) {
      catchUpOfferedRef.current = true;
      return;
    }
    setCatchUpOpen(true);
    markCatchUpOffered();
  };

  const skillChecklistGrid = (
    <motion.div
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: 0.07, delayChildren: 0.04 },
        },
      }}
    >
      {stacks.map((stack) => {
        const Icon = moduleIcons[stack.skill] ?? BookIcon;
        return (
          <motion.div
            key={stack.skill}
            className="min-h-0 h-full"
            variants={{
              hidden: reduce
                ? { opacity: 1 }
                : { opacity: 0, y: 14, scale: 0.98 },
              show: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { duration: 0.45, ease: DASH_EASE },
              },
            }}
          >
            <SkillPlanCard
              skill={stack.skill}
              title={MODULE_LABEL[stack.skill] ?? stack.skill}
              icon={Icon}
              tasks={stack.tasks}
              quietCta={showPrimaryBanner}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );

  const doneChecklistSlot = (
    <DoneChecklistDisclosure
      open={checklistOpen}
      onToggle={() => setChecklistOpen((v) => !v)}
      hasTasks={hasTasks}
    >
      {skillChecklistGrid}
    </DoneChecklistDisclosure>
  );

  useEffect(() => {
    const onOpenReport = () => setReportOpen(true);
    window.addEventListener(OPEN_DAILY_REPORT_EVENT, onOpenReport);
    return () => {
      window.removeEventListener(OPEN_DAILY_REPORT_EVENT, onOpenReport);
    };
  }, []);

  useEffect(() => {
    const storageKey = `bf-daily-report-shown:${
      userId || "anon"
    }:${localPlanDateKey()}`;

    if (!allDone) {
      wasAllDoneRef.current = false;
      return;
    }

    // Auto-open once when the day first reaches complete (not on every remount
    // after the same-day flag is set). Also works on first load if already done.
    if (reportShownRef.current) {
      wasAllDoneRef.current = true;
      return;
    }

    let shown = false;
    try {
      shown = sessionStorage.getItem(storageKey) === "1";
    } catch {
      shown = false;
    }

    if (!shown) {
      setReportOpen(true);
      reportShownRef.current = true;
      try {
        sessionStorage.setItem(storageKey, "1");
      } catch {
        // Ignore storage quota errors.
      }
    } else {
      reportShownRef.current = true;
      // Report already shown this day — offer catch-up after settle.
      queueMicrotask(() => maybeOpenCatchUp());
    }
    wasAllDoneRef.current = true;
    // maybeOpenCatchUp reads latest catchUpTarget via closure on each effect run.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: gate on allDone/userId
  }, [allDone, userId, catchUpTarget]);

  return (
    <div className="space-y-4 sm:space-y-5">
      <PrefetchHrefs hrefs={prefetchHrefs} />
      <DailyGrowthReportModal
        open={reportOpen}
        onClose={() => {
          setReportOpen(false);
          maybeOpenCatchUp();
        }}
        studentName={displayName}
        reportDate={reportDate}
        tasks={tasks}
        hubProgress={hubProgress}
        currentBand={currentBand}
        targetBand={targetBand}
        overallPlanPct={overallPlanPct}
      />

      <CatchUpDaysModal
        open={catchUpOpen}
        onClose={dismissCatchUp}
        missed={catchUpTarget?.missed ?? []}
        catchUpHref={catchUpHref}
        onCatchUp={markCatchUpOffered}
      />

      {!embedded && !allDone && nextStart ? (
        <DashReveal className="relative overflow-hidden rounded-[24px] border border-navy/15 bg-navy p-4 text-white sm:p-5">
          <div
            className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-cyan/20 blur-3xl"
            aria-hidden
          />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan">
                Start now · test first
              </p>
              <p className="mt-1 font-display text-lg font-bold tracking-tight sm:text-xl">
                {nextStart.task_type === "practice"
                  ? "Jump into today’s practice test"
                  : nextStart.task_type === "submit"
                    ? "Finish today’s submit task"
                    : nextStart.title}
              </p>
              <p className="mt-1 truncate text-[13px] text-white/70">
                {MODULE_LABEL[nextStart.module] ?? nextStart.module}
                {nextStart.duration_min != null
                  ? ` · ~${nextStart.duration_min} min`
                  : ""}
                {" · "}
                Score shows after you finish
              </p>
            </div>
            <motion.div
              whileHover={reduce ? undefined : { scale: 1.02 }}
              whileTap={reduce ? undefined : { scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                href={taskOpenHref(nextStart)}
                onClick={() => cachePlanDayTasks(actionable)}
                className="inline-flex min-h-12 w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-cyan px-5 py-3 text-[15px] font-bold text-navy shadow-[0_0_24px_rgba(0,188,212,0.35)] transition-colors hover:bg-brand-sky-hover sm:w-auto sm:min-w-[200px]"
              >
                Start test
                <ArrowRight className="size-4" strokeWidth={2.5} aria-hidden />
              </Link>
            </motion.div>
          </div>
        </DashReveal>
      ) : null}

      {allDone ? (
        <DailyImprovementsPanel
          tasks={tasks}
          hubProgress={hubProgress}
          moduleSummary={moduleSummary}
          currentBand={currentBand}
          targetBand={targetBand}
          overallPlanPct={overallPlanPct}
          embedded={embedded}
          nextActionHref={donePrimaryAction.href}
          nextActionLabel={donePrimaryAction.label}
          nextActionHint={donePrimaryAction.hint}
          onNextActionClick={donePrimaryAction.onClick}
          checklist={doneChecklistSlot}
          missedDayCount={catchUpTarget?.missed.length ?? 0}
          catchUpIsPrimary={donePrimaryAction.catchUpIsPrimary}
          onOpenCatchUp={() => setCatchUpOpen(true)}
        />
      ) : (
        <DashReveal as="section" aria-labelledby="todays-plan-heading">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <h2
                id="todays-plan-heading"
                className="font-display text-lg font-bold tracking-tight text-ink sm:text-xl"
              >
                Today&apos;s plan
              </h2>
              {!embedded ? (
                <p className="mt-0.5 text-[13px] text-muted">{dateLabel}</p>
              ) : null}
            </div>
            {hasTasks ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/8 bg-white px-2.5 py-1 text-[12px] font-semibold text-ink">
                  <Clock3 className="size-3.5 text-teal" aria-hidden />
                  ~{totalMinutes} min
                </span>
                <span className="inline-flex items-center rounded-full bg-cyan-soft px-2.5 py-1 font-mono text-[12px] font-semibold tabular-nums text-teal">
                  Daily goal · {doneCount}/{actionable.length}
                </span>
              </div>
            ) : null}
          </div>

          {!hasTasks ? (
            <div className="rounded-[24px] border border-ink/8 bg-white px-5 py-8 text-center sm:px-6">
              <p className="text-sm text-muted">No tasks scheduled for today.</p>
              <Link
                href="/study-plan"
                className="mt-3 inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-teal transition-colors hover:text-cyan"
              >
                View full study plan
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[24px] border border-ink/8 bg-white shadow-[0_1px_0_rgba(255,255,255,0.8)_inset]">
              <div className="border-b border-ink/[0.05] bg-[linear-gradient(160deg,rgba(224,247,250,0.55),rgba(255,255,255,0.95)_60%)] px-4 py-3.5 sm:px-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-xl text-[13px] leading-relaxed text-muted">
                    Prefer Practice first; Watch is optional support
                    {hasSubmit ? "; Submit when asked" : ""}.
                  </p>
                  <div className="min-w-[140px] sm:w-40">
                    <div className="mb-1 flex items-center justify-between text-[11px] text-muted">
                      <span>Day progress</span>
                      <span className="font-mono font-semibold tabular-nums text-ink">
                        {dayPct}%
                      </span>
                    </div>
                    <DashProgressBar
                      value={dayPct}
                      heightClassName="h-2"
                      className="bg-white/80 ring-1 ring-ink/5"
                      label="Today plan progress"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-4">{skillChecklistGrid}</div>

              <div className="border-t border-ink/[0.05] px-4 py-3 sm:px-5">
                <Link
                  href="/study-plan"
                  className="inline-flex cursor-pointer items-center gap-1.5 text-[13px] font-semibold text-teal transition-colors hover:text-cyan"
                >
                  View full study plan
                  <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              </div>
            </div>
          )}
        </DashReveal>
      )}
    </div>
  );
}
