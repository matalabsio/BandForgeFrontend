import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ScoreReportView } from "@/components/scores/score-report-view";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Score report",
  robots: { index: false, follow: false },
};

export default function ScoresPage() {
  return (
    <DashboardShell>
      <PageHeader
        title="Score report & analytics"
        description="Band breakdown, trends, and targeted improvement suggestions."
      />
      <ScoreReportView />
    </DashboardShell>
  );
}
