"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScoreBandChart } from "@/components/ui/score-band-chart";
import { StatCard } from "@/components/ui/stat-card";

const history = [
  { date: "12 May 2026", overall: 6.5 },
  { date: "28 Apr 2026", overall: 6.0 },
  { date: "10 Apr 2026", overall: 5.5 },
];

const bands = [
  { label: "Listening", score: 7.0 },
  { label: "Reading", score: 6.5 },
  { label: "Writing", score: 6.0 },
  { label: "Speaking", score: 6.5 },
];

export function ScoreReportView() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Overall band" value="6.5" hint="Academic mock" />
        <StatCard label="Strongest skill" value="Listening" hint="Band 7.0" />
        <StatCard
          label="Focus area"
          value="Writing"
          hint="Band 6.0 · +0.5 potential"
        />
        <StatCard label="Mocks taken" value="3" hint="Last 30 days" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="elevated">
          <h2 className="text-h4 text-navy">Band breakdown</h2>
          <p className="mt-1 text-meta text-ink/55">
            Optimised for 375px — horizontal bars scale on mobile
          </p>
          <ScoreBandChart className="mt-6" bands={bands} />
        </Card>

        <Card variant="elevated">
          <h2 className="text-h4 text-navy">Historical trend</h2>
          <ul className="mt-6 space-y-4" aria-label="Score history">
            {history.map((h) => (
              <li key={h.date}>
                <div className="mb-1 flex justify-between text-meta">
                  <span className="text-ink/60">{h.date}</span>
                  <span className="font-semibold tabular-nums text-teal">
                    {h.overall.toFixed(1)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface">
                  <div
                    className="h-full rounded-full bg-teal transition-[width] duration-300 motion-reduce:transition-none"
                    style={{ width: `${(h.overall / 9) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card variant="elevated">
        <h2 className="text-h4 text-navy">Improvement suggestions</h2>
        <ul className="mt-4 space-y-3">
          {[
            {
              skill: "Writing Task 2",
              tip: "Practice thesis-led introductions and one idea per body paragraph.",
              tag: "Priority" as const,
            },
            {
              skill: "Reading",
              tip: "Skim passages first, then scan for keywords — target 18 min per passage.",
              tag: "Practice" as const,
            },
          ].map((item) => (
            <li
              key={item.skill}
              className="flex flex-col gap-2 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-body font-semibold text-navy">{item.skill}</p>
                <p className="mt-1 text-body text-ink/65">{item.tip}</p>
              </div>
              <Badge variant={item.tag === "Priority" ? "warning" : "teal"}>
                {item.tag}
              </Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
