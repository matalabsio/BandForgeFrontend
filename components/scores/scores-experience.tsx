import { PerformanceChartLazy } from "@/components/bandforge/dashboard/performance-chart-lazy";
import type { DashboardSummary } from "@/components/bandforge/dashboard/types";
import { ScoresCompletionFocus } from "@/components/scores/scores-completion-focus";
import { ModuleBandsPanel } from "@/components/scores/module-bands-panel";
import { ScoresAttemptsList } from "@/components/scores/scores-attempts-list";
import { ScoresInsightsPanel } from "@/components/scores/scores-insights-panel";
import { ScoresPageHeader } from "@/components/scores/scores-page-header";
import { ScoresStatRow } from "@/components/scores/scores-stat-row";
import { latestBandByModule } from "@/components/scores/scores-utils";

import type { MockSlug } from "@/lib/mock-catalog";

type Props = {
  summary: DashboardSummary;
  profileTargetBand?: number | null;
  fresh?: boolean;
  highlightAttemptId?: string | null;
  mockSlug?: MockSlug | null;
};

export function ScoresExperience({
  summary,
  profileTargetBand = null,
  fresh = false,
  highlightAttemptId = null,
  mockSlug = null,
}: Props) {
  const moduleBands = latestBandByModule(summary.recent);

  return (
    <div className="space-y-6">
      <ScoresPageHeader />

      <ScoresCompletionFocus
        fresh={fresh}
        highlightAttemptId={highlightAttemptId}
        mockSlug={mockSlug}
      />

      <ScoresStatRow
        stats={summary.stats}
        profileTargetBand={profileTargetBand}
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <PerformanceChartLazy
          attempts={summary.recent}
          averageBand={summary.stats.average_band}
        />
        <ModuleBandsPanel bands={moduleBands} />
      </div>

      <div className="bf-below-fold">
        <ScoresAttemptsList
          attempts={summary.recent}
          highlightAttemptId={highlightAttemptId}
        />
      </div>

      <ScoresInsightsPanel summary={summary} moduleBands={moduleBands} />
    </div>
  );
}
