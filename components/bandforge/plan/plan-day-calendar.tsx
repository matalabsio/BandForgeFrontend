"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Lock,
  PlayCircle,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type {
  LearningStudyDay,
  LearningStudyPlan,
  LearningStudyTask,
} from "@/lib/learning-types";
import {
  buildMonthCells,
  dayFocusSummary,
  dayStatus,
  dayStatusLabel,
  findPlanDay,
  isDayAccessible,
  monthKeyFromIso,
  shiftMonthKey,
  sortPlanTasks,
  type DayAccessStatus,
} from "@/lib/study-plan-calendar";
import { localPlanDateKey } from "@/lib/plan-step-completion";
import { resolveTodayTaskHref } from "@/lib/plan-task-flow";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"] as const;
const HOVER_MQ = "(hover: hover) and (pointer: fine)";

const SKILL_DOT: Record<string, string> = {
  listening: "bg-[#0891B2]",
  reading: "bg-teal",
  writing: "bg-amber-500",
  speaking: "bg-[#3b6fb0]",
};

const SKILL_SOFT: Record<string, string> = {
  listening: "bg-[#0891B2]/15 text-[#0E7490]",
  reading: "bg-teal/15 text-teal",
  writing: "bg-amber-500/15 text-amber-800",
  speaking: "bg-[#3b6fb0]/15 text-[#2a5080]",
};

const MODULE_LABEL: Record<string, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};

const TASK_TYPE_LABEL: Record<string, string> = {
  watch: "Watch",
  practice: "Practice",
  submit: "Submit",
};

type PanelMode = "preview" | "detail";

type Props = {
  studyPlan: LearningStudyPlan;
  examDate?: string | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  variant?: "embed" | "page";
  className?: string;
};

function formatMonthTitle(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(new Date(y, m - 1, 1));
}

function formatDayHeader(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "short",
    }).format(new Date(`${iso}T12:00:00`));
  } catch {
    return iso;
  }
}

function taskHref(task: LearningStudyTask): string {
  return resolveTodayTaskHref({
    skill: task.module,
    hubId: task.hub_id,
    taskType: task.task_type,
    taskId: task.id,
    fallbackHref: task.href,
  });
}

function useFinePointerHover(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia(HOVER_MQ);
    const sync = () => setEnabled(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return enabled;
}

function DayHeader({
  day,
  status,
  mode,
}: {
  day: LearningStudyDay;
  status: DayAccessStatus;
  mode: PanelMode;
}) {
  const focus = dayFocusSummary(day);

  return (
    <div className="border-b border-white/40 px-5 pb-4 pt-5 sm:px-6">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-display text-[1.15rem] font-bold tracking-tight text-ink sm:text-xl">
          {formatDayHeader(day.date)}
        </p>
        {mode === "preview" ? (
          <span className="inline-flex rounded-full bg-ink/5 px-2.5 py-0.5 text-[10px] font-semibold text-ink/55 backdrop-blur-sm">
            Preview
          </span>
        ) : (
          <span
            className={cn(
              "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold backdrop-blur-sm",
              status === "today" && "bg-cyan/90 text-navy",
              status === "completed" && "bg-emerald-500/15 text-emerald-800",
              status === "in_progress" && "bg-amber-400/20 text-amber-900",
              status === "locked" && "bg-ink/5 text-ink/45",
              status === "open" && "bg-white/50 text-ink/60",
              status === "ahead" && "bg-cyan/20 text-teal",
            )}
          >
            {dayStatusLabel(status)}
          </span>
        )}
      </div>
      <p className="mt-2 text-[14px] font-semibold leading-snug text-[#0E7490]">
        {focus.label}
      </p>
      {focus.detailLabel && focus.detailLabel !== focus.label ? (
        <p className="mt-1 text-[12px] leading-relaxed text-muted">
          {focus.detailLabel}
        </p>
      ) : null}
      {focus.taskCount > 0 ? (
        <p className="mt-1 text-[12px] text-muted">
          {focus.doneCount}/{focus.taskCount} tasks done
        </p>
      ) : null}
      {focus.skills.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {focus.skills.map((skill) => (
            <span
              key={skill}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                SKILL_SOFT[skill] ?? "bg-ink/5 text-ink/60",
              )}
            >
              {MODULE_LABEL[skill] ?? skill}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function DayPlanPanel({
  day,
  status,
  locked,
  emptyDate,
  today,
  mode,
  hoverCapable,
}: {
  day: LearningStudyDay | null;
  status: DayAccessStatus | null;
  locked: boolean;
  emptyDate?: string | null;
  today: string;
  mode: PanelMode;
  hoverCapable: boolean;
}) {
  if (!day || !status) {
    return (
      <div className="flex h-full min-h-[220px] flex-col items-center justify-center px-4 text-center">
        <p className="font-display text-lg font-semibold text-ink/80">
          {emptyDate ? formatDayHeader(emptyDate) : "Pick a day"}
        </p>
        <p className="mt-1.5 max-w-[16rem] text-[13px] leading-relaxed text-muted">
          {hoverCapable
            ? "Hover to preview, click to open that day's plan."
            : "Tap a date to see that day's plan."}
        </p>
      </div>
    );
  }

  const isToday = day.date === today;
  const isPast = day.date < today;
  const tasks = sortPlanTasks(
    day.tasks.filter(
      (t) => t.status !== "skipped" && t.task_type !== "watch",
    ),
  );
  const focus = dayFocusSummary(day);
  const incomplete = tasks.filter((t) => t.status !== "done");
  const allDone =
    tasks.length > 0 && incomplete.length === 0;
  const firstIncomplete = incomplete[0] ?? null;

  if (mode === "preview") {
    return (
      <div className="flex h-full flex-col">
        <DayHeader day={day} status={status} mode="preview" />
        <div className="flex flex-1 flex-col justify-between px-5 py-4 sm:px-6">
          {locked ? (
            <p className="flex items-start gap-2.5 rounded-2xl border border-white/50 bg-white/40 px-3.5 py-3 text-[13px] leading-relaxed text-muted">
              <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              Locked until you reach this day.
            </p>
          ) : (
            <p className="text-[13px] leading-relaxed text-muted">
              {focus.taskCount > 0
                ? `${focus.taskCount} tasks scheduled across ${focus.skills.length} skill${focus.skills.length === 1 ? "" : "s"}.`
                : "No tasks scheduled."}
            </p>
          )}
          <p className="mt-4 text-[12px] font-semibold text-teal">
            Click to open full plan
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <DayHeader day={day} status={status} mode="detail" />

      <div className="flex-1 overflow-y-visible px-4 py-4 sm:px-5">
        {locked ? (
          <p className="flex items-start gap-2.5 rounded-2xl border border-white/50 bg-white/40 px-3.5 py-3 text-[13px] leading-relaxed text-muted">
            <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            This day unlocks when you reach it. Focus on today first.
          </p>
        ) : (
          <>
            {isPast && !allDone && tasks.length > 0 ? (
              <div className="mb-3 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-3.5 py-3">
                <p className="text-[13px] font-semibold text-amber-950">
                  Catch up when you can
                </p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-amber-900/90">
                  {incomplete.length} incomplete task
                  {incomplete.length === 1 ? "" : "s"} from this day. Today's
                  plan stays the same.
                </p>
              </div>
            ) : null}

            {tasks.length === 0 ? (
              <p className="text-[13px] text-muted">No tasks scheduled.</p>
            ) : (
              <ul className="space-y-2">
                {tasks.map((task, i) => {
                  const done = task.status === "done";
                  const typeLabel =
                    TASK_TYPE_LABEL[task.task_type ?? ""] ??
                    (task.task_type
                      ? task.task_type.charAt(0).toUpperCase() +
                        task.task_type.slice(1)
                      : "Task");
                  const moduleLabel = MODULE_LABEL[task.module] ?? task.module;
                  const titleLooksLikeStep =
                    /—|-/.test(task.title) &&
                    /watch|practice|submit/i.test(task.title);
                  const row = (
                    <>
                      <span
                        className={cn(
                          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
                          done
                            ? "bg-teal text-white"
                            : "bg-white/70 text-teal ring-1 ring-white/60",
                        )}
                      >
                        {done ? (
                          <Check className="size-3.5" strokeWidth={3} />
                        ) : (
                          <PlayCircle className="size-3.5" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block text-[13px] font-semibold",
                            done
                              ? "text-muted line-through decoration-ink/20"
                              : "text-ink",
                          )}
                        >
                          {titleLooksLikeStep
                            ? `${moduleLabel} · ${typeLabel}`
                            : task.title}
                        </span>
                        <span className="mt-0.5 block text-[11.5px] text-muted">
                          {titleLooksLikeStep
                            ? task.duration_min
                              ? `~${task.duration_min} min`
                              : typeLabel
                            : [
                                moduleLabel,
                                typeLabel,
                                task.duration_min
                                  ? `~${task.duration_min} min`
                                  : null,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                        </span>
                      </span>
                    </>
                  );

                  return (
                    <li key={`${task.id}-${i}`}>
                      <Link
                        href={taskHref(task)}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-2xl border border-white/50 bg-white/55 px-3 py-2.5 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset] backdrop-blur-md transition-[transform,background-color,box-shadow] duration-300 hover:bg-white/80 hover:shadow-[0_8px_24px_rgba(8,145,178,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50",
                          !done && "hover:-translate-y-0.5",
                          done && "opacity-75",
                        )}
                      >
                        {row}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}

            {isPast && allDone ? (
              <p className="mt-3 text-[12px] font-medium text-teal">
                All tasks done for this day.
              </p>
            ) : null}
          </>
        )}
      </div>

      {!locked && isToday ? (
        <div className="border-t border-white/40 px-4 py-3 sm:px-5">
          <Link
            href="/study-plan/today"
            className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-navy px-4 text-[13px] font-bold text-white shadow-[0_8px_24px_rgba(15,23,42,0.18)] transition-colors hover:bg-navy/90"
          >
            Open today&apos;s plan
            <ArrowRight className="size-4" strokeWidth={2.5} aria-hidden />
          </Link>
        </div>
      ) : null}

      {!locked && isPast && firstIncomplete ? (
        <div className="border-t border-white/40 px-4 py-3 sm:px-5">
          <Link
            href={taskHref(firstIncomplete)}
            className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-navy px-4 text-[13px] font-bold text-white shadow-[0_8px_24px_rgba(15,23,42,0.18)] transition-colors hover:bg-navy/90"
          >
            Catch up on this day
            <ArrowRight className="size-4" strokeWidth={2.5} aria-hidden />
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export function PlanDayCalendar({
  studyPlan,
  examDate = null,
  open: openProp,
  onOpenChange,
  variant = "embed",
  className,
}: Props) {
  const today = localPlanDateKey();
  const weeks = studyPlan.weeks ?? [];
  const resolvedExam = examDate ?? studyPlan.exam_date ?? null;
  const isPage = variant === "page";
  const reduce = useReducedMotion();
  const hoverCapable = useFinePointerHover();

  const [internalOpen, setInternalOpen] = useState(false);
  const open = isPage ? true : (openProp ?? internalOpen);
  const setOpen = (next: boolean) => {
    onOpenChange?.(next);
    if (openProp === undefined) setInternalOpen(next);
  };

  const [monthKey, setMonthKey] = useState(() => monthKeyFromIso(today));
  const [selectedDate, setSelectedDate] = useState<string | null>(today);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  /** While pointer is over the detail panel, ignore calendar-cell hover previews. */
  const panelPointerInsideRef = useRef(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** After a click, briefly ignore hover so the pointer can cross other days to the panel. */
  const ignoreHoverUntilRef = useRef(0);

  // Clear sticky hover when device cannot use fine-pointer hover.
  useEffect(() => {
    if (!hoverCapable) setHoveredDate(null);
  }, [hoverCapable]);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  const clearHoverPreview = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setHoveredDate(null);
  };

  const activeDate = hoveredDate ?? selectedDate ?? today;
  const panelMode: PanelMode =
    hoveredDate && hoveredDate !== selectedDate ? "preview" : "detail";

  const cells = useMemo(
    () => buildMonthCells(monthKey, weeks),
    [monthKey, weeks],
  );

  const activeDay = useMemo(() => {
    if (!activeDate) return null;
    return findPlanDay(weeks, activeDate);
  }, [activeDate, weeks]);

  const activeStatus = activeDay
    ? dayStatus(activeDay, today, resolvedExam, weeks)
    : null;

  if (!open) return null;

  const glassShell = cn(
    // Do not use overflow-hidden/clip here — it traps wheel/touch and the page cannot scroll.
    "relative overflow-visible rounded-[28px] border border-white/60",
    "bg-white/45 shadow-[0_8px_40px_rgba(8,145,178,0.10),0_1px_0_rgba(255,255,255,0.85)_inset]",
    "backdrop-blur-[28px] backdrop-saturate-[160%]",
  );

  const pinDay = (date: string) => {
    setSelectedDate(date);
    clearHoverPreview();
    // Ignore accidental hover while moving from the cell to the detail panel.
    ignoreHoverUntilRef.current = Date.now() + 450;
  };

  const setPreviewDate = (date: string) => {
    if (!hoverCapable) return;
    if (panelPointerInsideRef.current) return;
    if (Date.now() < ignoreHoverUntilRef.current) return;
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    // Debounce so crossing neighboring cells en route to the panel does not flicker.
    hoverTimerRef.current = setTimeout(() => {
      if (panelPointerInsideRef.current) return;
      if (Date.now() < ignoreHoverUntilRef.current) return;
      setHoveredDate(date);
    }, 140);
  };

  return (
    <div className={cn("relative", className)}>
      {isPage ? (
        <div
          className="pointer-events-none absolute -inset-6 -z-10 overflow-hidden rounded-[36px]"
          aria-hidden
        >
          <div className="absolute -left-16 top-0 size-64 rounded-full bg-[#22D3EE]/25 blur-3xl" />
          <div className="absolute -right-10 top-24 size-72 rounded-full bg-teal/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 size-56 rounded-full bg-cyan/20 blur-3xl" />
        </div>
      ) : null}

      <div
        className={cn(
          glassShell,
          isPage
            ? "grid gap-0 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.9fr)]"
            : "p-4 sm:p-5",
        )}
      >
        <div
          className={cn(
            isPage &&
              "border-b border-white/40 p-5 sm:p-6 lg:border-b-0 lg:border-r",
          )}
          onMouseLeave={() => {
            // Leaving the month grid (including toward the detail panel) restores
            // the clicked day's full plan — not the last hovered neighbor.
            if (hoverCapable) clearHoverPreview();
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-[1.35rem] font-bold tracking-tight text-ink sm:text-[1.6rem]">
              {formatMonthTitle(monthKey)}
            </h2>
            <div className="flex items-center gap-1 rounded-full border border-white/70 bg-white/50 p-1 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset] backdrop-blur-md">
              <button
                type="button"
                onClick={() => setMonthKey((m) => shiftMonthKey(m, -1))}
                className="flex size-8 cursor-pointer items-center justify-center rounded-full text-ink/70 transition-colors duration-200 hover:bg-white/80 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50"
                aria-label="Previous month"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setMonthKey(monthKeyFromIso(today));
                  pinDay(today);
                }}
                className="cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-semibold text-teal transition-colors duration-200 hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setMonthKey((m) => shiftMonthKey(m, 1))}
                className="flex size-8 cursor-pointer items-center justify-center rounded-full text-ink/70 transition-colors duration-200 hover:bg-white/80 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50"
                aria-label="Next month"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-y-1">
            {WEEKDAYS.map((d, i) => (
              <div
                key={`${d}-${i}`}
                className="pb-2 text-center text-[11px] font-semibold tracking-[0.04em] text-ink/35"
              >
                {d}
              </div>
            ))}

            {cells.map((cell) => {
              const status = cell.day
                ? dayStatus(cell.day, today, resolvedExam, weeks)
                : null;
              const focus = cell.day ? dayFocusSummary(cell.day) : null;
              const hasPlan = Boolean(cell.day);
              const dayNum = Number(cell.date.slice(8, 10));
              const isToday = cell.date === today;
              const isActive = activeDate === cell.date;
              const isSelected = selectedDate === cell.date;

              return (
                <button
                  key={cell.date}
                  type="button"
                  disabled={!hasPlan}
                  onClick={() => {
                    if (!hasPlan) return;
                    pinDay(cell.date);
                  }}
                  onMouseEnter={() => {
                    if (!hasPlan) return;
                    setPreviewDate(cell.date);
                  }}
                  onFocus={() => {
                    if (!hasPlan) return;
                    setPreviewDate(cell.date);
                  }}
                  className={cn(
                    "group relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-[18px] transition-[transform,background-color,box-shadow,color] duration-300 ease-out",
                    !cell.inMonth && "opacity-30",
                    !hasPlan && "cursor-default opacity-25",
                    hasPlan &&
                      "hover:bg-white/55 hover:shadow-[0_8px_28px_rgba(8,145,178,0.14)] hover:backdrop-blur-md",
                    hasPlan &&
                      !reduce &&
                      "hover:scale-[1.06] focus-visible:scale-[1.06]",
                    isActive &&
                      hasPlan &&
                      "bg-white/70 shadow-[0_10px_30px_rgba(8,145,178,0.16)] backdrop-blur-md",
                    isSelected &&
                      hasPlan &&
                      !isToday &&
                      "ring-1 ring-[#0891B2]/35",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50",
                  )}
                  aria-label={
                    hasPlan && focus
                      ? `${cell.date}: ${focus.label}`
                      : cell.date
                  }
                  aria-pressed={isSelected}
                >
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full text-[14px] font-semibold tabular-nums transition-colors duration-300 sm:size-10 sm:text-[15px]",
                      isToday &&
                        "bg-cyan text-navy shadow-[0_0_0_4px_rgba(0,188,212,0.22)]",
                      !isToday && isActive && "text-[#0E7490]",
                      !isToday && !isActive && "text-ink",
                      status === "locked" && !isToday && "text-ink/40",
                    )}
                  >
                    {dayNum}
                  </span>

                  {focus && focus.skills.length > 0 ? (
                    <span className="mt-0.5 flex h-1.5 items-center gap-0.5">
                      {focus.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className={cn(
                            "size-1 rounded-full transition-transform duration-300 group-hover:scale-125",
                            isToday
                              ? "bg-navy/45"
                              : (SKILL_DOT[skill] ?? "bg-ink/25"),
                          )}
                          aria-hidden
                        />
                      ))}
                    </span>
                  ) : hasPlan ? (
                    <span
                      className="mt-0.5 size-1 rounded-full bg-ink/12"
                      aria-hidden
                    />
                  ) : (
                    <span className="mt-0.5 h-1.5" aria-hidden />
                  )}

                  {status === "completed" && !isToday ? (
                    <span
                      className="pointer-events-none absolute right-1.5 top-1.5 size-1.5 rounded-full bg-emerald-500/80"
                      aria-hidden
                    />
                  ) : null}
                  {status === "ahead" ? (
                    <span
                      className="pointer-events-none absolute right-1.5 top-1.5 size-1.5 rounded-full bg-cyan"
                      aria-hidden
                    />
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-cyan" /> Today
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500" /> Done
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1 rounded-full bg-[#0891B2]" />
              <span className="size-1 rounded-full bg-teal" />
              Skill focus
            </span>
            <span className="text-ink/35">
              {hoverCapable
                ? "Hover to preview · click to open"
                : "Tap a day to open"}
            </span>
          </div>
        </div>

        <div
          className={cn(
            "relative min-h-[260px] bg-gradient-to-b from-white/35 via-white/25 to-cyan-soft/30",
            !isPage && "mt-4 overflow-x-clip overflow-y-visible rounded-2xl border border-white/50",
          )}
          aria-live="polite"
          onMouseEnter={() => {
            panelPointerInsideRef.current = true;
            clearHoverPreview();
          }}
          onMouseLeave={() => {
            panelPointerInsideRef.current = false;
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeDate ?? "empty"}-${panelMode}`}
              initial={
                reduce ? false : { opacity: 0, y: 8, filter: "blur(4px)" }
              }
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={
                reduce
                  ? undefined
                  : { opacity: 0, y: -6, filter: "blur(4px)" }
              }
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="h-full min-h-0"
            >
              <DayPlanPanel
                day={activeDay}
                status={activeStatus}
                locked={
                  activeDay
                    ? !isDayAccessible(
                        activeDay.date,
                        today,
                        resolvedExam,
                        weeks,
                      )
                    : false
                }
                emptyDate={activeDate}
                today={today}
                mode={panelMode}
                hoverCapable={hoverCapable}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {!isPage ? (
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-3 w-full cursor-pointer rounded-2xl border border-ink/8 bg-white/70 py-2.5 text-[12.5px] font-semibold text-muted backdrop-blur-sm transition-colors hover:border-cyan/30 hover:text-teal"
        >
          Close calendar
        </button>
      ) : null}
    </div>
  );
}
