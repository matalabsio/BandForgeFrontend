import type { ActivityDay } from "@/components/bandforge/dashboard/types";
import { ActivityHeatmap } from "@/components/bandforge/dashboard/activity-heatmap";
import {
  DashboardCard,
  DashboardCardHeader,
} from "@/components/bandforge/dashboard/dashboard-card";

export function StudyActivityCard({ days }: { days: ActivityDay[] }) {
  return (
    <DashboardCard className="h-full">
      <DashboardCardHeader
        title="Study activity"
        subtitle="Last 12 weeks of practice"
      />
      <div className="px-4 pb-4 pt-1 sm:px-5">
        <ActivityHeatmap days={days} />
      </div>
    </DashboardCard>
  );
}
