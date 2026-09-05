"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  adjacentPlanDayTask,
  cachePlanDayTasks,
  ensurePlanDayTasksCached,
  markCachedPlanTaskDone,
  nextPendingPlanDayTask,
  planTaskShortLabel,
  resolveTodayTaskHrefFromCache,
  type PlanResultContext,
} from "@/lib/plan-day-tasks";
import { resolveTodayTaskHref } from "@/lib/plan-task-flow";
import { localPlanDateKey } from "@/lib/plan-step-completion";
import {
  findPlanDay,
  getNextAheadTarget,
  getOldestCatchUpTarget,
  weeksWithDayMarkedDone,
} from "@/lib/study-plan-calendar";
import { SectionResultsCtaBar } from "@/modules/shared/components/section-results";
import {
  PlanDayFinishedModal,
  type PlanDayFinishOption,
} from "@/components/bandforge/plan/plan-day-finished-modal";

export const PLAN_TODAY_HREF = "/study-plan/today";

function goToPlanHref(
  router: ReturnType<typeof useRouter>,
  href: string,
  taskId: string | null,
) {
  // Defensive: results already ran ensurePlanDayTasksCached, but soft-nav to
  // Today must see this task as done in sessionStorage before TodaysPlanPanel mounts.
  if (href === PLAN_TODAY_HREF) {
    markCachedPlanTaskDone(taskId);
  }
  router.push(href);
}

export type PlanResultsNav = {
  taskId: string | null;
  continueHref: string;
  continueLabel: string;
  previousHref: string;
  hasPrevious: boolean;
  todayHref: string;
  showSecondaryBack: boolean;
  ready: boolean;
  loading: boolean;
  hasNextTask: boolean;
  dayFinished: boolean;
  onContinue: () => void;
  goToday: () => void;
  finishModal: ReactNode;
};

export function usePlanResultsNav(
  plan: PlanResultContext | null,
): PlanResultsNav | null {
  const router = useRouter();
  const taskId = plan?.taskId ?? null;
  const hubId = plan?.hubId ?? null;
  const fromPlan = Boolean(plan);
  const [ready, setReady] = useState(false);
  const [continueHref, setContinueHref] = useState(PLAN_TODAY_HREF);
  const [continueLabel, setContinueLabel] = useState("Finding next step…");
  const [previousHref, setPreviousHref] = useState(PLAN_TODAY_HREF);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);
  const [catchUpOption, setCatchUpOption] =
    useState<PlanDayFinishOption | null>(null);
  const [tomorrowOption, setTomorrowOption] =
    useState<PlanDayFinishOption | null>(null);

  useEffect(() => {
    if (!fromPlan) {
      setReady(false);
      setCatchUpOption(null);
      setTomorrowOption(null);
      return;
    }
    let cancelled = false;
    setReady(false);
    setContinueLabel("Finding next step…");

    // Don't leave the CTA stuck on "Finding next step…" if learning/today is slow.
    const slowTimer = window.setTimeout(() => {
      if (cancelled) return;
      setContinueHref(PLAN_TODAY_HREF);
      setContinueLabel("Back to Today's plan");
      setPreviousHref(PLAN_TODAY_HREF);
      setHasPrevious(false);
      setReady(true);
    }, 8_000);

    void (async () => {
      await ensurePlanDayTasksCached(taskId, { force: true, hubId });
      if (cancelled) return;
      window.clearTimeout(slowTimer);

      const next = nextPendingPlanDayTask(taskId, { skipHubId: hubId });
      const prev = adjacentPlanDayTask(taskId, "prev");
      const href = next
        ? resolveTodayTaskHrefFromCache(next)
        : PLAN_TODAY_HREF;
      const label = next
        ? `Continue · ${planTaskShortLabel(next)}`
        : "What's next?";

      setContinueHref(href);
      setContinueLabel(label);
      setPreviousHref(prev ? resolveTodayTaskHrefFromCache(prev) : PLAN_TODAY_HREF);
      setHasPrevious(Boolean(prev));

      // Day finished — resolve catch-up / tomorrow choices for the popup.
      if (!next) {
        try {
          const { getLearningProfile } = await import("@/lib/learning-api");
          const profile = await getLearningProfile();
          if (cancelled) return;
          const weeks = profile.study_plan?.weeks ?? [];
          const today = localPlanDateKey();
          const examDate =
            profile.exam_date ?? profile.study_plan?.exam_date ?? null;

          const catchUp = weeks.length
            ? getOldestCatchUpTarget(weeks, today, examDate)
            : null;
          // Profile may still show today's last task as pending — treat the day
          // as done so tomorrow unlocks for the finish popup.
          const weeksForAhead = weeksWithDayMarkedDone(weeks, today);
          const ahead =
            weeksForAhead.length && !(catchUp && catchUp.missed.length > 0)
              ? getNextAheadTarget(weeksForAhead, today, examDate)
              : null;

          if (catchUp?.task) {
            const catchHref = resolveTodayTaskHref({
              skill: catchUp.task.module,
              hubId: catchUp.task.hub_id,
              taskType: catchUp.task.task_type,
              taskId: catchUp.task.id,
              fallbackHref: catchUp.task.href,
            });
            const missed = catchUp.missed.length;
            setCatchUpOption({
              kind: "catch_up",
              href: catchHref,
              label:
                missed === 1
                  ? "Complete previous day"
                  : `Complete ${missed} previous days`,
              hint:
                missed === 1
                  ? "Finish your oldest incomplete plan day first."
                  : `You have ${missed} incomplete previous days — start with the oldest.`,
              onNavigate: () => {
                const day = findPlanDay(weeks, catchUp.date);
                if (day?.tasks?.length) {
                  cachePlanDayTasks(day.tasks, { planDate: catchUp.date });
                }
                markCachedPlanTaskDone(taskId);
              },
            });
          } else {
            setCatchUpOption(null);
          }

          if (ahead?.task) {
            const aheadHref = resolveTodayTaskHref({
              skill: ahead.task.module,
              hubId: ahead.task.hub_id,
              taskType: ahead.task.task_type,
              taskId: ahead.task.id,
              fallbackHref: ahead.task.href,
            });
            setTomorrowOption({
              kind: "tomorrow",
              href: aheadHref,
              label: "Start tomorrow's plan",
              hint: "Practice tomorrow early to keep advancing toward your full mock.",
              onNavigate: () => {
                const day = findPlanDay(weeks, ahead.date);
                if (day?.tasks?.length) {
                  cachePlanDayTasks(day.tasks, { planDate: ahead.date });
                }
                markCachedPlanTaskDone(taskId);
              },
            });
          } else {
            setTomorrowOption(null);
          }
        } catch {
          if (!cancelled) {
            setCatchUpOption(null);
            setTomorrowOption(null);
          }
        }
      } else {
        setCatchUpOption(null);
        setTomorrowOption(null);
      }

      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
      window.clearTimeout(slowTimer);
    };
  }, [fromPlan, taskId, hubId]);

  const goingToToday = continueHref === PLAN_TODAY_HREF;
  const dayFinished = fromPlan && ready && goingToToday;
  const hasFinishChoices = Boolean(catchUpOption || tomorrowOption);

  const goToday = useCallback(() => {
    goToPlanHref(router, PLAN_TODAY_HREF, taskId);
  }, [router, taskId]);

  const onContinue = useCallback(() => {
    if (dayFinished) {
      // Always offer the finish popup when the day is done (catch-up, tomorrow,
      // or at least confirm back to Today).
      setFinishOpen(true);
      return;
    }
    goToPlanHref(router, continueHref, taskId);
  }, [dayFinished, router, continueHref, taskId]);

  // Auto-open once when the last task lands on results.
  useEffect(() => {
    if (!dayFinished || !hasFinishChoices) return;
    const key = `bf-plan-finish-offered:${localPlanDateKey()}`;
    try {
      if (sessionStorage.getItem(key) === "1") return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Ignore storage errors — still open once this mount.
    }
    setFinishOpen(true);
  }, [dayFinished, hasFinishChoices]);

  if (!fromPlan) return null;

  return {
    taskId,
    continueHref,
    continueLabel: ready ? continueLabel : "Finding next step…",
    previousHref: hasPrevious ? previousHref : PLAN_TODAY_HREF,
    hasPrevious,
    todayHref: PLAN_TODAY_HREF,
    showSecondaryBack: !goingToToday,
    ready,
    loading: !ready,
    hasNextTask: !goingToToday,
    dayFinished,
    onContinue,
    goToday,
    finishModal: (
      <PlanDayFinishedModal
        open={finishOpen}
        onClose={() => setFinishOpen(false)}
        catchUp={catchUpOption}
        tomorrow={tomorrowOption}
        onGoToday={goToday}
      />
    ),
  };
}

type Props = {
  plan: PlanResultContext | null;
  /** When not from plan, render nothing (caller uses its own CTAs). */
  fallback?: ReactNode;
};

export function PlanResultsCtaBar({ plan, fallback = null }: Props) {
  const nav = usePlanResultsNav(plan);

  if (!nav) return <>{fallback}</>;

  return (
    <>
      <SectionResultsCtaBar
        layout="split"
        primaryLabel={nav.continueLabel}
        onPrimary={nav.onContinue}
        primaryLoading={nav.loading}
        primaryDisabled={nav.loading}
        secondaryLabel={
          nav.showSecondaryBack ? "Back to Today's plan" : undefined
        }
        onSecondary={nav.showSecondaryBack ? nav.goToday : undefined}
      />
      {nav.finishModal}
    </>
  );
}
