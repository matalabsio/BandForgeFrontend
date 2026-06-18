"use client";

import Link from "next/link";
import {
  BookOpen,
  ClipboardList,
  Mic,
  Plus,
  Upload,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AdminChartCard,
  HorizontalBarChart,
  MockStatusBars,
  UserGrowthChart,
  WeeklyActivityChart,
} from "@/components/admin/admin-charts";
import { AdminKpiCard } from "@/components/admin/admin-kpi-card";
import {
  adminApi,
  type AdminMockListItem,
  type DashboardOverview,
} from "@/lib/admin-api";
import {
  adminBtnPrimary,
  adminCard,
  adminLink,
} from "@/components/admin/admin-ui";
import { cn } from "@/lib/utils";

const CHART_COLORS = {
  sky: "#0097a7",
  success: "#10b981",
  warning: "#f59e0b",
  slate: "#9fb3cc",
  violet: "#8b5cf6",
} as const;

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function sumModuleQuestions(mocks: AdminMockListItem[], module: string) {
  return mocks.reduce((sum, mock) => {
    const row = mock.modules.find((m) => m.module === module);
    return sum + (row?.question_count ?? 0);
  }, 0);
}

const kindColors: Record<string, string> = {
  signup: "bg-emerald-500",
  mock_attempt: "bg-teal",
  admin: "bg-violet-500",
  event: "bg-slate-400",
};

export function AdminDashboardClient() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [mocks, setMocks] = useState<AdminMockListItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([adminApi.dashboardOverview(), adminApi.listMocks()])
      .then(([ov, mockList]) => {
        setOverview(ov);
        setMocks(mockList);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load dashboard"));
  }, []);

  const chartData = useMemo(() => {
    if (!overview) return null;
    const metrics = overview.metrics;
    const published = mocks.filter((m) => m.status === "published").length;
    const draft = mocks.filter((m) => m.status === "draft").length;
    const archived = mocks.filter((m) => m.status === "archived").length;

    return {
      mockStatus: [
        { label: "Published", value: published, color: CHART_COLORS.success },
        { label: "Draft", value: draft, color: CHART_COLORS.warning },
        { label: "Archived", value: archived, color: CHART_COLORS.slate },
      ],
      moduleBars: [
        {
          label: "Listening",
          value: sumModuleQuestions(mocks, "listening"),
          color: CHART_COLORS.sky,
        },
        {
          label: "Reading",
          value: sumModuleQuestions(mocks, "reading"),
          color: "#0284c7",
        },
        {
          label: "Writing",
          value: sumModuleQuestions(mocks, "writing"),
          color: CHART_COLORS.violet,
        },
      ],
      published,
      draft,
      metrics,
    };
  }, [overview, mocks]);

  if (error) {
    return (
      <div
        className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-medium text-rose-700"
        role="alert"
      >
        {error}
      </div>
    );
  }

  if (!overview || !chartData) {
    return <DashboardSkeleton />;
  }

  const { metrics } = chartData;
  const liveTests = metrics.published_mocks ?? chartData.published;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Hero */}
      <section
        className="relative overflow-hidden rounded-2xl border border-navy/10 bg-gradient-to-br from-navy via-teal to-cyan p-5 text-white shadow-lg sm:p-6 lg:p-8"
        aria-labelledby="admin-hero-heading"
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-white/20 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/90">
              {greeting()}, Admin
            </p>
            <h2
              id="admin-hero-heading"
              className="font-display mt-1 text-2xl font-bold tracking-tight sm:text-3xl"
            >
              BandForge control center
            </h2>
            <div className="mt-4 grid grid-cols-3 gap-3 sm:max-w-lg sm:gap-4">
              <HeroStat
                label="Users"
                value={metrics.total_users}
                trend={metrics.users_trend_pct}
              />
              <HeroStat
                label="Mocks"
                value={metrics.total_mocks ?? mocks.length}
                trend={metrics.mocks_trend_pct}
              />
              <HeroStat label="Live" value={liveTests} sub="tests" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <HeroCta href="/admin/mocks" Icon={Plus} primary>
              Create mock
            </HeroCta>
            <HeroCta href="/admin/mocks" Icon={Upload}>
              Upload questions
            </HeroCta>
          </div>
        </div>
      </section>

      {/* KPI row */}
      <section aria-labelledby="kpi-heading">
        <h2 id="kpi-heading" className="sr-only">
          Key metrics
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <AdminKpiCard
            label="Total users"
            value={metrics.total_users}
            Icon={Users}
            accent="teal"
            href="/admin/users"
            trendPct={metrics.signups_trend_pct}
          />
          <AdminKpiCard
            label="Active (7d)"
            value={metrics.active_users_7d}
            hint="Unique learners"
            Icon={Users}
            accent="teal"
            href="/admin/users"
            trendPct={metrics.users_trend_pct}
          />
          <AdminKpiCard
            label="New signups"
            value={metrics.new_signups_7d}
            hint="This week"
            Icon={UserPlus}
            accent="emerald"
            href="/admin/users"
            trendPct={metrics.signups_trend_pct}
          />
          <AdminKpiCard
            label="Mock attempts"
            value={metrics.mock_attempts_7d}
            hint="Sessions started"
            Icon={BookOpen}
            accent="violet"
            trendPct={metrics.mocks_trend_pct}
          />
        </div>
      </section>

      {/* Charts row */}
      <section
        className="grid gap-4 lg:grid-cols-5"
        aria-label="Analytics charts"
      >
        <AdminChartCard
          title="Weekly activity"
          subtitle="Active users, signups, and mock attempts"
          className="lg:col-span-3"
        >
          <WeeklyActivityChart data={overview.weekly_activity} />
        </AdminChartCard>

        <AdminChartCard
          title="Mock catalog"
          subtitle={`${chartData.published} published · ${chartData.draft} draft`}
          className="lg:col-span-2"
        >
          <MockStatusBars segments={chartData.mockStatus} />
        </AdminChartCard>
      </section>

      {/* Growth + activity */}
      <section className="grid gap-4 lg:grid-cols-2">
        <AdminChartCard title="User growth" subtitle="Daily signups this week">
          <UserGrowthChart data={overview.weekly_activity} />
        </AdminChartCard>

        <div className={adminCard}>
          <h3 className="text-sm font-semibold text-black">Recent activity</h3>
          <p className="mt-0.5 text-xs font-medium text-gray-600">
            Live feed from signups, sessions, and admin actions
          </p>
          {overview.recent_activity.length === 0 ? (
            <p className="mt-6 text-sm text-gray-600">No recent activity yet.</p>
          ) : (
            <ul className="mt-4 max-h-[220px] space-y-3 overflow-y-auto pr-1" role="list">
              {overview.recent_activity.map((item) => (
                <li key={item.id} className="flex gap-3 text-sm">
                  <span
                    className={cn(
                      "mt-1.5 size-2 shrink-0 rounded-full",
                      kindColors[item.kind] ?? kindColors.event,
                    )}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium leading-snug text-black">{item.message}</p>
                    <time className="text-xs text-gray-600" dateTime={item.created_at}>
                      {formatRelativeTime(item.created_at)}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Questions bank */}
      <section className="grid gap-4 lg:grid-cols-2">
        <AdminChartCard title="Question bank" subtitle="Total questions by module">
          <HorizontalBarChart items={chartData.moduleBars} />
        </AdminChartCard>

        <div className={adminCard}>
          <div className="mb-4 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-black">Recent mocks</h3>
            <Link href="/admin/mocks" className={cn("text-xs", adminLink)}>
              View all
            </Link>
          </div>
          {mocks.length === 0 ? (
            <p className="text-sm text-gray-600">No mocks yet.</p>
          ) : (
            <ul className="space-y-1">
              {mocks.slice(0, 5).map((mock) => (
                <li key={mock.id}>
                  <Link
                    href={`/admin/mocks/${mock.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-cyan-soft/50"
                  >
                    <span className="min-w-0 truncate text-sm font-medium text-black">
                      {mock.catalog_number ? `Test ${mock.catalog_number} · ` : ""}
                      {mock.title}
                    </span>
                    <StatusBadge status={mock.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Quick actions */}
      <section aria-labelledby="quick-actions-heading">
        <h2 id="quick-actions-heading" className="mb-3 text-sm font-semibold text-black">
          Quick actions
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <ActionTile href="/admin/mocks" title="Create mock" Icon={ClipboardList} accent="teal" />
          <ActionTile href="/admin/mocks" title="Upload" Icon={Upload} accent="violet" />
          <ActionTile
            href="/admin/speaking"
            title="Review speaking"
            Icon={Mic}
            accent="warning"
            badge={
              metrics.speaking_pending > 0 ? String(metrics.speaking_pending) : undefined
            }
          />
          <ActionTile href="/admin/users" title="Users" Icon={Users} accent="teal" />
        </div>
      </section>
    </div>
  );
}

function HeroStat({
  label,
  value,
  trend,
  sub,
}: {
  label: string;
  value: number;
  trend?: number | null;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/55">
        {label}
      </p>
      <p className="mt-0.5 text-xl font-bold tabular-nums sm:text-2xl">
        {value}
        {sub ? (
          <span className="ml-1 text-xs font-semibold text-white/50">{sub}</span>
        ) : null}
      </p>
      {trend != null ? (
        <p className="mt-0.5 text-[11px] font-semibold text-white/90">
          {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% vs last week
        </p>
      ) : null}
    </div>
  );
}

function HeroCta({
  href,
  Icon,
  children,
  primary = false,
}: {
  href: string;
  Icon: LucideIcon;
  children: ReactNode;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200",
        primary
          ? "bg-white text-teal shadow-lg hover:bg-cyan-soft"
          : "border border-white/40 bg-white/15 text-white hover:bg-white/25",
      )}
    >
      <Icon className="size-4" aria-hidden />
      {children}
    </Link>
  );
}

function ActionTile({
  href,
  title,
  Icon,
  accent,
  badge,
}: {
  href: string;
  title: string;
  Icon: LucideIcon;
  accent: "teal" | "violet" | "warning";
  badge?: string;
}) {
  const accents = {
    teal: "from-cyan-soft to-surface text-teal border-border",
    violet: "from-violet-100 to-violet-50 text-violet-700 border-violet-100",
    warning: "from-amber-100 to-amber-50 text-amber-700 border-amber-100",
  };

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex min-h-[7.5rem] flex-col items-center justify-center gap-3 rounded-2xl border bg-gradient-to-br p-4 shadow-sm transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-md",
        accents[accent],
      )}
    >
      {badge ? (
        <span className="absolute right-3 top-3 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
          {badge}
        </span>
      ) : null}
      <div className="flex size-11 items-center justify-center rounded-xl bg-white shadow-sm">
        <Icon className="size-5" aria-hidden />
      </div>
      <span className="text-center text-sm font-semibold text-black">{title}</span>
    </Link>
  );
}

function StatusBadge({ status }: { status: AdminMockListItem["status"] }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        status === "published" && "bg-emerald-100 text-emerald-700",
        status === "draft" && "bg-amber-100 text-amber-700",
        status === "archived" && "bg-slate-500/15 text-slate-500",
      )}
    >
      {status}
    </span>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5 animate-pulse sm:space-y-6">
      <div className="h-40 rounded-2xl bg-cyan-soft" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="min-h-[7.5rem] rounded-xl bg-cyan-soft" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-64 rounded-2xl bg-cyan-soft" />
        <div className="h-64 rounded-2xl bg-cyan-soft" />
      </div>
    </div>
  );
}
