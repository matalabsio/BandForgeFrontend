"use client";

import { ContinueCard } from "@/components/bandforge/dashboard/continue-card";
import { DashboardHero } from "@/components/bandforge/dashboard/dashboard-hero";
import { AiCoachPanel } from "@/components/bandforge/dashboard/ai-coach-panel";
import { InsightsPanel } from "@/components/bandforge/dashboard/insights-panel";
import { MockGrid } from "@/components/bandforge/dashboard/mock-grid";
import { RecentActivity } from "@/components/bandforge/dashboard/recent-activity";
import { StatCards } from "@/components/bandforge/dashboard/stat-cards";
import type {
  DashboardSummary,
  MockTestSummary,
} from "@/components/bandforge/dashboard/types";
import { studyStreakDays } from "@/components/bandforge/dashboard/utils";

type Props = {
  firstName: string;
  mockTests: MockTestSummary[];
  summary: DashboardSummary;
};

export function DashboardExperience({
  firstName,
  mockTests,
  summary,
}: Props) {
  const streak = studyStreakDays(summary);

  return (
    <div className="space-y-8">
      <DashboardHero
        firstName={firstName}
        stats={summary.stats}
        streakDays={streak}
      />

      <StatCards stats={summary.stats} />

      <ContinueCard attempts={summary.in_progress} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <InsightsPanel summary={summary} />
        <RecentActivity attempts={summary.recent} />
      </div>

      <MockGrid mocks={mockTests} />

      <AiCoachPanel summary={summary} />
    </div>
  );
}
