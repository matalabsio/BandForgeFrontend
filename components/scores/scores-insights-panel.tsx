import { LightbulbIcon, SparkleIcon } from "@/components/bandforge/dashboard/icons";
import { deriveInsights } from "@/components/bandforge/dashboard/utils";
import type { DashboardSummary } from "@/components/bandforge/dashboard/types";
import {
  DashboardCard,
  DashboardCardHeader,
} from "@/components/bandforge/dashboard/dashboard-card";
import type { ModuleBand } from "@/components/scores/scores-utils";
import { focusModule, strongestModule } from "@/components/scores/scores-utils";

export function ScoresInsightsPanel({
  summary,
  moduleBands,
}: {
  summary: DashboardSummary;
  moduleBands: ModuleBand[];
}) {
  const insights = deriveInsights(summary);
  const strong = strongestModule(moduleBands);
  const focus = focusModule(moduleBands);

  const items: { title: string; body: string; tag: string }[] = [];

  if (strong?.band != null) {
    items.push({
      title: `Strongest: ${strong.label}`,
      body: `Your latest ${strong.label.toLowerCase()} band is ${strong.band?.toFixed(1)} — build on this momentum.`,
      tag: "Strength",
    });
  }

  if (focus?.band != null && focus.module !== strong?.module) {
    items.push({
      title: `Focus: ${focus.label}`,
      body: `Extra practice in ${focus.label.toLowerCase()} could lift your average band fastest.`,
      tag: "Priority",
    });
  }

  if (insights[0]) {
    items.push({
      title: "Listening tip",
      body: insights[0],
      tag: "Tip",
    });
  }

  if (items.length === 0) {
    items.push({
      title: "Get started",
      body: "Complete your first listening mock to unlock performance insights and score reports.",
      tag: "Start",
    });
  }

  return (
    <DashboardCard>
      <DashboardCardHeader
        title="What to work on"
        subtitle="Based on your completed mocks"
        action={
          <span className="rounded-full border border-ink/10 bg-ink/[0.02] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink/40">
            Rule-based
          </span>
        }
      />
      <ul className="space-y-3 p-5 pt-2">
        {items.slice(0, 3).map((item) => (
          <li
            key={item.title}
            className="flex flex-col gap-2 rounded-xl border border-ink/8 bg-surface p-4 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-[13px] font-bold text-ink">
                {item.tag === "Tip" ? (
                  <LightbulbIcon className="size-4 shrink-0 text-cyan" />
                ) : (
                  <SparkleIcon className="size-4 shrink-0 text-cyan" />
                )}
                {item.title}
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink/65">
                {item.body}
              </p>
            </div>
            <span
              className={`shrink-0 self-start rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
                item.tag === "Priority"
                  ? "bg-amber-500/12 text-amber-700"
                  : item.tag === "Strength"
                    ? "bg-emerald-500/12 text-emerald-700"
                    : "bg-cyan/10 text-teal"
              }`}
            >
              {item.tag}
            </span>
          </li>
        ))}
      </ul>
      <p className="border-t border-ink/6 px-5 py-3 text-[11px] text-ink/40">
        AI Coach insights: coming in a few days.
      </p>
    </DashboardCard>
  );
}
