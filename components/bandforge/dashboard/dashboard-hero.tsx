"use client";

import { BandRing } from "@/components/bandforge/dashboard/band-ring";
import { Waveform } from "@/components/bandforge/dashboard/waveform";
import type { DashboardStats } from "@/components/bandforge/dashboard/types";
import {
  formatBand,
  motivationalLine,
  targetBand,
  timeGreeting,
} from "@/components/bandforge/dashboard/utils";

type Props = {
  firstName: string;
  stats: DashboardStats;
  streakDays: number;
};

export function DashboardHero({ firstName, stats, streakDays }: Props) {
  const target = targetBand(stats.average_band);
  const predicted = stats.average_band ?? stats.best_band;

  return (
    <section
      aria-label="Your progress"
      className="bf-dash-enter relative overflow-hidden rounded-[32px] border border-white/70 bg-white/70 p-5 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8"
    >
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)",
        }}
      />

      <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="min-w-0 space-y-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#06B6D4]">
            {timeGreeting()}
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
            {firstName}, you&apos;re building toward{" "}
            <span className="text-[#06B6D4]">Band {target.toFixed(1)}</span>
          </h1>
          <p className="max-w-xl text-[15px] leading-relaxed text-[#0F172A]/65">
            {motivationalLine(stats)}
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <Pill label="Target" value={`Band ${target.toFixed(1)}`} />
            <Pill
              label="Streak"
              value={streakDays > 0 ? `${streakDays} days` : "Start today"}
              accent={streakDays > 0}
            />
            <Pill
              label="Completed"
              value={String(stats.completed_attempts)}
            />
            <Pill
              label="Best"
              value={formatBand(stats.best_band)}
              accent={stats.best_band !== null && stats.best_band >= 7}
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 lg:items-end">
          <BandRing band={predicted} target={target} size={168} />
          <div className="w-full max-w-[220px] rounded-2xl border border-[#06B6D4]/15 bg-[#06B6D4]/5 px-4 py-3">
            <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-[#0F172A]/45">
              Listening live
            </p>
            <Waveform active={stats.in_progress_attempts > 0 || stats.completed_attempts > 0} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Pill({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-semibold ${
        accent
          ? "border-[#06B6D4]/30 bg-[#06B6D4]/10 text-[#0F172A]"
          : "border-[#0F172A]/8 bg-white/60 text-[#0F172A]/70"
      }`}
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0F172A]/40">
        {label}
      </span>
      {value}
    </span>
  );
}
