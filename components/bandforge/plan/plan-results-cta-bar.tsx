"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  adjacentPlanDayTask,
  ensurePlanDayTasksCached,
  markCachedPlanTaskDone,
  nextPendingPlanDayTask,
  planTaskShortLabel,
  resolveTodayTaskHrefFromCache,
  type PlanResultContext,
} from "@/lib/plan-day-tasks";
import { SectionResultsCtaBar } from "@/modules/shared/components/section-results";

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

export function usePlanResultsNav(plan: PlanResultContext | null) {
  const taskId = plan?.taskId ?? null;
  const hubId = plan?.hubId ?? null;
  const fromPlan = Boolean(plan);
  const [ready, setReady] = useState(false);
  const [version, setVersion] = useState(0);
  const [continueHref, setContinueHref] = useState(PLAN_TODAY_HREF);
  const [continueLabel, setContinueLabel] = useState("Finding next step…");
  const [previousHref, setPreviousHref] = useState(PLAN_TODAY_HREF);
  const [hasPrevious, setHasPrevious] = useState(false);

  useEffect(() => {
    if (!fromPlan) {
      setReady(false);
      return;
    }
    let cancelled = false;
    setReady(false);
    setContinueLabel("Finding next step…");
    void (async () => {
      await ensurePlanDayTasksCached(taskId, { force: true, hubId });
      if (cancelled) return;

      const next = nextPendingPlanDayTask(taskId, { skipHubId: hubId });
      const prev = adjacentPlanDayTask(taskId, "prev");
      const href = next
        ? resolveTodayTaskHrefFromCache(next)
        : PLAN_TODAY_HREF;
      const label = next
        ? `Continue · ${planTaskShortLabel(next)}`
        : "Back to Today's plan";

      setContinueHref(href);
      setContinueLabel(label);
      setPreviousHref(prev ? resolveTodayTaskHrefFromCache(prev) : PLAN_TODAY_HREF);
      setHasPrevious(Boolean(prev));
      setVersion((v) => v + 1);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [fromPlan, taskId, hubId]);

  return useMemo(() => {
    if (!fromPlan) return null;
    const goingToToday = continueHref === PLAN_TODAY_HREF;
    return {
      taskId,
      continueHref,
      continueLabel: ready ? continueLabel : "Finding next step…",
      previousHref: hasPrevious ? previousHref : PLAN_TODAY_HREF,
      hasPrevious,
      todayHref: PLAN_TODAY_HREF,
      // Always keep a way back when Continue goes to another task.
      showSecondaryBack: !goingToToday,
      ready,
      loading: !ready,
      hasNextTask: !goingToToday,
    };
  }, [
    fromPlan,
    taskId,
    ready,
    version,
    continueHref,
    continueLabel,
    previousHref,
    hasPrevious,
  ]);
}

type Props = {
  plan: PlanResultContext | null;
  /** When not from plan, render nothing (caller uses its own CTAs). */
  fallback?: ReactNode;
};

export function PlanResultsCtaBar({ plan, fallback = null }: Props) {
  const router = useRouter();
  const nav = usePlanResultsNav(plan);

  if (!nav) return <>{fallback}</>;

  return (
    <SectionResultsCtaBar
      layout="split"
      primaryLabel={nav.continueLabel}
      onPrimary={() => goToPlanHref(router, nav.continueHref, nav.taskId)}
      primaryLoading={nav.loading}
      primaryDisabled={nav.loading}
      secondaryLabel={
        nav.showSecondaryBack ? "Back to Today's plan" : undefined
      }
      onSecondary={
        nav.showSecondaryBack
          ? () => goToPlanHref(router, nav.todayHref, nav.taskId)
          : undefined
      }
    />
  );
}
