"use client";

import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { adminCard } from "@/components/admin/admin-ui";
import { cn } from "@/lib/utils";
import type { DailyActivityPoint } from "@/lib/admin-api";

export type ChartSegment = {
  label: string;
  value: number;
  color: string;
};

export type BarItem = {
  label: string;
  value: number;
  color: string;
};

type ChartCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export function AdminChartCard({ title, subtitle, children, className }: ChartCardProps) {
  return (
    <div className={cn("flex h-full flex-col", adminCard, className)}>
      <div className="mb-3 shrink-0 sm:mb-4">
        <h3 className="text-sm font-semibold text-black">{title}</h3>
        {subtitle ? <p className="mt-0.5 text-xs font-medium text-gray-600">{subtitle}</p> : null}
      </div>
      <div className="flex min-h-0 flex-1 flex-col justify-center">{children}</div>
    </div>
  );
}

export function WeeklyActivityChart({ data }: { data: DailyActivityPoint[] }) {
  const hasData = data.some(
    (d) => d.active_users > 0 || d.signups > 0 || d.mock_attempts > 0,
  );

  if (!hasData) {
    return (
      <p className="py-12 text-center text-sm text-gray-600">No activity recorded this week yet.</p>
    );
  }

  return (
    <div className="h-[220px] w-full sm:h-[240px]" role="img" aria-label="Weekly activity line chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="activeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0f2fe" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#374151" }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#374151" }} axisLine={false} tickLine={false} width={28} />
          <Tooltip
            contentStyle={{
              borderRadius: "10px",
              border: "1px solid #bae6fd",
              background: "#fff",
              color: "#000",
              fontSize: "12px",
            }}
          />
          <Area type="monotone" dataKey="active_users" name="Active users" stroke="#0ea5e9" strokeWidth={2} fill="url(#activeFill)" />
          <Line type="monotone" dataKey="signups" name="Signups" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: "#10b981" }} />
          <Line type="monotone" dataKey="mock_attempts" name="Mock attempts" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3, fill: "#8b5cf6" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function UserGrowthChart({ data }: { data: DailyActivityPoint[] }) {
  return (
    <div className="h-[200px] w-full" role="img" aria-label="User signups trend chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0f2fe" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#374151" }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#374151" }} axisLine={false} tickLine={false} width={28} />
          <Tooltip contentStyle={{ borderRadius: "10px", background: "#fff", color: "#000", fontSize: "12px" }} />
          <Line type="monotone" dataKey="signups" name="New signups" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 4, fill: "#0ea5e9", strokeWidth: 0 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MockStatusBars({ segments }: { segments: ChartSegment[] }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  if (total === 0) {
    return <p className="py-8 text-center text-sm text-gray-600">No catalog mocks yet.</p>;
  }

  return (
    <ul className="space-y-4" aria-label="Mock status distribution">
      {segments.map((segment) => {
        const pct = Math.round((segment.value / total) * 100);
        return (
          <li key={segment.label}>
            <div className="mb-1.5 flex items-center justify-between gap-2 text-xs font-semibold">
              <span className="text-black">{segment.label}</span>
              <span className="tabular-nums text-black">
                {segment.value} <span className="font-medium text-gray-500">({pct}%)</span>
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-cyan-soft">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(pct, segment.value > 0 ? 6 : 0)}%`,
                  backgroundColor: segment.color,
                }}
                role="presentation"
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function HorizontalBarChart({ items }: { items: BarItem[] }) {
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const widthPct = (item.value / max) * 100;
        return (
          <li key={item.label}>
            <div className="mb-1.5 flex items-center justify-between gap-2 text-xs font-semibold">
              <span className="capitalize text-black">{item.label}</span>
              <span className="tabular-nums text-black">{item.value}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-cyan-soft">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${item.value > 0 ? Math.max(widthPct, 4) : 0}%`,
                  backgroundColor: item.color,
                }}
                role="presentation"
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
