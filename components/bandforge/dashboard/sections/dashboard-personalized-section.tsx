import { Suspense } from "react";
import { DashboardTopHeader } from "@/components/bandforge/dashboard/dashboard-top-header";
import { DashboardMagicBentoClient } from "@/components/bandforge/dashboard/dashboard-magic-bento-client";
import {
  DashPageItem,
  DashPageMotion,
} from "@/components/bandforge/dashboard/motion";
import { buildDashboardBentoCards } from "@/lib/build-dashboard-bento-cards";
import {
  computeBandGapFromLearning,
  overallPlanPercent,
  resolveExamTimeline,
} from "@/lib/dashboard-plan-math";
import type { LearningProfile } from "@/lib/learning-types";
import { buildDashboardStartNow, isTodayPlanComplete } from "@/lib/plan-start-task";

type UserProps = {
  firstName: string;
  displayName: string;
  email: string | null;
  avatarUrl: string | null;
  ieltsPurpose: string | null;
  ieltsGoal: string | null;
};

type Props = {
  learning: LearningProfile;
  user: UserProps;
  userId?: string;
};

function BentoSkeleton() {
  return (
    <div
      className="grid min-h-[28rem] flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 lg:min-h-0"
      aria-hidden
    >
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className={[
            "min-h-[200px] animate-pulse rounded-[24px] bg-ink/[0.06] lg:min-h-0",
            i === 2 ? "md:col-span-2 lg:col-span-2" : "",
            i === 3 ? "md:col-span-2 lg:col-span-2" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      ))}
    </div>
  );
}

export async function DashboardPersonalizedSection({
  learning,
  user,
}: Props) {
  const studyPlan = learning.study_plan;
  const examTimeline = resolveExamTimeline(learning);
  const planPct = overallPlanPercent(studyPlan);
  const bandGap = computeBandGapFromLearning(learning);
  const todayPlanComplete = isTodayPlanComplete(learning.todays_tasks);
  const startNow = todayPlanComplete
    ? null
    : (buildDashboardStartNow(learning.todays_tasks) ?? {
        href: "/study-plan/today",
        title: "Jump into today’s practice",
        meta: "Open today’s plan and start the next test",
        ctaLabel: "Begin Practice",
      });

  const cards = buildDashboardBentoCards({
    learning,
    startNow,
    bandGap,
    examTimeline,
    overallPlanPct: planPct,
  });

  return (
    <DashPageMotion className="flex min-h-0 flex-1 flex-col gap-[var(--bf-dash-gutter)]">
      <DashPageItem className="shrink-0">
        <DashboardTopHeader
          firstName={user.firstName}
          displayName={user.displayName}
          email={user.email}
          avatarUrl={user.avatarUrl}
          ieltsPurpose={user.ieltsPurpose}
          ieltsGoal={user.ieltsGoal}
          planTimeline={examTimeline}
          todayTasks={learning.todays_tasks}
          showReportButton
        />
      </DashPageItem>

      <DashPageItem className="flex min-h-0 flex-1 flex-col">
        <Suspense fallback={<BentoSkeleton />}>
          <DashboardMagicBentoClient cards={cards} />
        </Suspense>
      </DashPageItem>
    </DashPageMotion>
  );
}
