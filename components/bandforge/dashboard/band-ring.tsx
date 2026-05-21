"use client";

import { formatBand } from "@/components/bandforge/dashboard/utils";

type Props = {
  band: number | null;
  target?: number;
  size?: number;
};

export function BandRing({ band, target = 7, size = 168 }: Props) {
  const value = band ?? 0;
  const pct = Math.min(100, (value / 9) * 100);
  const r = (size - 14) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-2 rounded-full opacity-60 blur-xl"
        style={{
          background:
            "radial-gradient(circle, rgba(6,182,212,0.35) 0%, transparent 70%)",
        }}
      />
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(15,23,42,0.06)"
          strokeWidth="10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#bandGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="bf-dash-ring transition-[stroke-dashoffset] duration-700 ease-out"
        />
        <defs>
          <linearGradient id="bandGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#0891B2" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F172A]/45">
          Predicted
        </span>
        <span className="font-display text-4xl font-bold tabular-nums tracking-tight text-[#0F172A]">
          {formatBand(band)}
        </span>
        <span className="mt-0.5 text-[11px] font-medium text-[#0F172A]/50">
          Target {target.toFixed(1)}
        </span>
      </div>
    </div>
  );
}
