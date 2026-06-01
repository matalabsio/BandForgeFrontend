"use client";

import dynamic from "next/dynamic";
import type { DashboardRecentAttempt } from "@/components/bandforge/dashboard/types";

function ChartSkeleton() {
  return (
    <div
      className="h-full min-h-[220px] animate-pulse rounded-[20px] bg-[#0F172A]/[0.06]"
      aria-hidden
    />
  );
}

const PerformanceChartDynamic = dynamic(
  () =>
    import("@/components/bandforge/dashboard/performance-chart").then(
      (m) => m.PerformanceChart,
    ),
  { loading: () => <ChartSkeleton />, ssr: false },
);

type Props = {
  attempts: DashboardRecentAttempt[];
  averageBand: number | null;
};

export function PerformanceChartLazy({ attempts, averageBand }: Props) {
  return (
    <PerformanceChartDynamic attempts={attempts} averageBand={averageBand} />
  );
}
