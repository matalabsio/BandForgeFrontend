"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { DASH_EASE } from "@/components/bandforge/dashboard/motion";
import { timeGreeting } from "@/components/bandforge/dashboard/utils";
import type { LearningStudyTask } from "@/lib/learning-types";
import {
  mergePlanDayStatusesIntoTasks,
  PLAN_DAY_TASKS_UPDATED_EVENT,
} from "@/lib/plan-day-tasks";
import { isTodayPlanComplete } from "@/lib/plan-start-task";

/** Fired by the header so TodaysPlanPanel / welcome can open the growth report. */
export const OPEN_DAILY_REPORT_EVENT = "bf:open-daily-report";

export function requestOpenDailyReport(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_DAILY_REPORT_EVENT));
}

export type HeaderPlanTimeline = {
  currentDay?: number | null;
  totalDays?: number | null;
  daysRemaining?: number | null;
  examDate?: string | null;
};

type Props = {
  firstName: string;
  displayName?: string;
  email?: string | null;
  avatarUrl?: string | null;
  /**
   * Static override when `todayTasks` is not provided.
   * Defaults to hidden — Report unlocks from completed today tasks.
   */
  showReportButton?: boolean;
  /** Today’s plan tasks — Report shows only when all actionable tasks are done. */
  todayTasks?: LearningStudyTask[] | null;
  planTimeline?: HeaderPlanTimeline | null;
};

function localIsoToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatExamDate(examDate: string | null | undefined): string | null {
  if (!examDate) return null;
  const parsed = new Date(`${examDate.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function greetingSubheading(timeline: HeaderPlanTimeline | null): string {
  const day = timeline?.currentDay ?? null;
  const total = timeline?.totalDays ?? null;
  if (day != null && day > 0 && total != null && total > 0) {
    return `Day ${day} of ${total}`;
  }
  if (day != null && day > 0) {
    return `Day ${day}`;
  }
  const exam = formatExamDate(timeline?.examDate);
  if (exam) return `Exam · ${exam}`;
  return "IELTS Academic prep";
}

function examCountdown(
  daysRemaining: number | null | undefined,
  examDate: string | null | undefined,
): { value: string; unit: string } {
  if (daysRemaining == null && !examDate) {
    return { value: "—", unit: "Set exam date" };
  }
  const todayIso = localIsoToday();
  if (examDate && examDate.slice(0, 10) < todayIso) {
    return { value: "—", unit: "Exam passed" };
  }
  if (daysRemaining === 0) {
    return { value: "0", unit: "Exam today" };
  }
  if (daysRemaining != null && daysRemaining > 0) {
    return {
      value: String(daysRemaining),
      unit: daysRemaining === 1 ? "day left" : "days left",
    };
  }
  if (examDate) {
    return { value: "—", unit: "Exam passed" };
  }
  return { value: "—", unit: "Set exam date" };
}

function resolveReportUnlocked(
  todayTasks: LearningStudyTask[] | null | undefined,
  fallback: boolean,
): boolean {
  if (todayTasks != null) {
    return isTodayPlanComplete(mergePlanDayStatusesIntoTasks(todayTasks));
  }
  return fallback;
}

export function DashboardTopHeader({
  firstName,
  showReportButton = false,
  todayTasks = null,
  planTimeline = null,
}: Props) {
  const reduce = useReducedMotion();
  const [reportUnlocked, setReportUnlocked] = useState(showReportButton);

  useEffect(() => {
    const recompute = () => {
      setReportUnlocked(resolveReportUnlocked(todayTasks, showReportButton));
    };
    recompute();

    window.addEventListener(PLAN_DAY_TASKS_UPDATED_EVENT, recompute);
    const onVisible = () => {
      if (document.visibilityState === "visible") recompute();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", recompute);

    return () => {
      window.removeEventListener(PLAN_DAY_TASKS_UPDATED_EVENT, recompute);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", recompute);
    };
  }, [todayTasks, showReportButton]);

  const timelineDay = planTimeline?.currentDay ?? null;
  const timelineTotal = planTimeline?.totalDays ?? null;
  const showTimeline = planTimeline != null;
  const timelinePct =
    timelineDay != null && timelineTotal != null && timelineTotal > 0
      ? Math.min(100, Math.round((timelineDay / timelineTotal) * 100))
      : 0;
  const countdown = examCountdown(
    planTimeline?.daysRemaining,
    planTimeline?.examDate,
  );
  const examLabel = formatExamDate(planTimeline?.examDate);
  const nameSubheading = greetingSubheading(planTimeline);
  const markerLeft = Math.min(100, Math.max(0, timelinePct));

  return (
    <header className="relative z-40">
      <motion.div
        className="rounded-2xl border border-ink/[0.06] bg-white/90 px-3 py-2.5 sm:px-4"
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: DASH_EASE }}
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-teal">
              {timeGreeting()}
            </p>
            <h1 className="truncate font-display text-lg font-bold tracking-tight text-ink sm:text-xl">
              {firstName}
            </h1>
            <p className="mt-0.5 truncate text-[12px] text-muted">
              <span className="sm:hidden">
                {showTimeline && countdown.value !== "—"
                  ? `${nameSubheading} · ${countdown.value} ${countdown.unit}`
                  : nameSubheading}
              </span>
              <span className="hidden sm:inline">{nameSubheading}</span>
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {showTimeline ? (
              <div
                className="hidden w-[9.75rem] shrink-0 sm:block lg:w-[10.5rem]"
                aria-label={
                  examLabel
                    ? `Exam ${examLabel}. ${countdown.value} ${countdown.unit}`
                    : countdown.unit
                }
              >
                <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-light">
                  Exam timeline
                </p>
                <div className="relative">
                  <div
                    className="h-1.5 overflow-hidden rounded-full bg-ink/[0.08]"
                    role="progressbar"
                    aria-valuenow={timelinePct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <span
                      className="block h-full rounded-full bg-gradient-to-r from-teal to-cyan"
                      style={{ width: `${timelinePct}%` }}
                    />
                  </div>
                  <span
                    className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal ring-2 ring-white"
                    style={{ left: `${markerLeft}%` }}
                    aria-hidden
                  />
                </div>
                <p className="mt-1 text-[10px] font-semibold text-muted">
                  <span className="font-mono tabular-nums text-teal">
                    {countdown.value}
                  </span>
                  {countdown.value !== "—" ? " · " : " "}
                  {countdown.unit}
                </p>
              </div>
            ) : null}

            {reportUnlocked ? (
              <motion.button
                type="button"
                onClick={() => requestOpenDailyReport()}
                initial={reduce ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.28, ease: DASH_EASE }}
                className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-teal/25 bg-white px-2.5 py-1.5 text-[12px] font-semibold text-teal transition-colors duration-200 hover:border-cyan/40 hover:bg-cyan-soft/60 sm:min-h-10 sm:px-3 sm:text-[12.5px]"
                aria-label="Open today’s growth report card"
              >
                <FileText className="size-3.5" strokeWidth={2.25} aria-hidden />
                <span className="sm:hidden">Report</span>
                <span className="hidden sm:inline">Report card</span>
              </motion.button>
            ) : null}
          </div>
        </div>
      </motion.div>
    </header>
  );
}
