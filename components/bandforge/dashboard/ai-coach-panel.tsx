"use client";

import Link from "next/link";
import { SparkleIcon } from "@/components/bandforge/dashboard/icons";
import { deriveInsights } from "@/components/bandforge/dashboard/utils";
import type { DashboardSummary } from "@/components/bandforge/dashboard/types";

export function AiCoachPanel({ summary }: { summary: DashboardSummary }) {
  const tip = deriveInsights(summary)[0] ?? "Start a listening mock to unlock personalised coaching.";

  return (
    <aside
      className="bf-dash-enter fixed bottom-20 right-4 z-20 hidden max-w-[280px] rounded-2xl border border-[#06B6D4]/25 bg-white/90 p-4 shadow-[0_12px_40px_rgba(6,182,212,0.2)] backdrop-blur-xl lg:bottom-8 lg:block"
      style={{ animationDelay: "400ms" }}
      aria-label="AI coach"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#06B6D4] to-[#0891B2] text-white">
          <SparkleIcon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#06B6D4]">
            AI Coach
          </p>
          <p className="mt-1 text-[13px] leading-snug text-[#0F172A]/75">
            {tip}
          </p>
          <Link
            href="/dashboard"
            className="mt-2 inline-block text-[12px] font-bold text-[#06B6D4] hover:underline"
          >
            View insights →
          </Link>
        </div>
      </div>
    </aside>
  );
}
