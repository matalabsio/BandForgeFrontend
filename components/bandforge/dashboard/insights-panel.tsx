"use client";

import type { DashboardSummary } from "@/components/bandforge/dashboard/types";
import { SparkleIcon } from "@/components/bandforge/dashboard/icons";
import {
  deriveInsights,
  weeklyBandPoints,
} from "@/components/bandforge/dashboard/utils";

export function InsightsPanel({ summary }: { summary: DashboardSummary }) {
  const insights = deriveInsights(summary);
  const weekly = weeklyBandPoints(summary.recent);
  const maxBand = Math.max(
    6,
    ...weekly.map((p) => p.band ?? 0),
    summary.stats.best_band ?? 0,
  );

  return (
    <section
      aria-label="Performance intelligence"
      className="bf-dash-enter flex h-full flex-col overflow-hidden rounded-[24px] border border-white/70 bg-white/70 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl"
      style={{ animationDelay: "180ms" }}
    >
      <header className="border-b border-[#0F172A]/6 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#06B6D4]/12 text-[#06B6D4]">
            <SparkleIcon className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-[15px] font-bold text-[#0F172A]">
              AI insights
            </h2>
            <p className="text-[11px] text-[#0F172A]/45">
              Based on your recent mocks
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 space-y-5 p-5">
        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#0F172A]/40">
            Weekly band trend
          </p>
          <div className="flex h-28 items-end justify-between gap-1.5 rounded-2xl bg-[#0F172A]/[0.03] px-3 pb-3 pt-4">
            {weekly.map((p) => {
              const h =
                p.band !== null ? Math.max(12, (p.band / maxBand) * 100) : 8;
              return (
                <div
                  key={p.label}
                  className="flex flex-1 flex-col items-center gap-1"
                >
                  <div
                    className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                      p.band !== null
                        ? "bg-gradient-to-t from-[#0891B2] to-[#06B6D4]"
                        : "bg-[#0F172A]/8"
                    }`}
                    style={{ height: `${h}%` }}
                    title={
                      p.band !== null ? `Band ${p.band.toFixed(1)}` : "No data"
                    }
                  />
                  <span className="text-[9px] font-semibold text-[#0F172A]/40">
                    {p.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <ul className="space-y-2">
          {insights.map((line, i) => (
            <li
              key={i}
              className="flex gap-2 rounded-xl border border-[#06B6D4]/12 bg-[#06B6D4]/5 px-3 py-2.5 text-[13px] leading-snug text-[#0F172A]/75"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#06B6D4]" />
              {line}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
