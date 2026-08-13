"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BandForgeLogoLink } from "@/components/bandforge/bandforge-logo-link";
import { SignOutButton } from "@/components/bandforge/auth/sign-out-button";
import { DevMockTestFooter } from "@/components/bandforge/dev-mock-test-footer";
import { DashboardDailyReportHost } from "@/components/bandforge/dashboard/dashboard-daily-report-host";
import { requestOpenDailyReport } from "@/components/bandforge/dashboard/dashboard-top-header";
import { PanelIcon } from "@/components/bandforge/dashboard/icons";
import {
  getMobileBottomNav,
  isNavItemActive,
} from "@/components/bandforge/dashboard/dashboard-nav";
import type { LearningStudyTask, SkillHubProgress } from "@/lib/learning-types";
import { cn } from "@/lib/utils";

const SHOW_DEV_MOCK_FOOTER = process.env.NODE_ENV === "development";

const SIDEBAR_KEY = "bf-dashboard-sidebar";

type Props = {
  displayName: string;
  avatarUrl?: string | null;
  pathname: string;
  sidebar: React.ReactNode;
  children: React.ReactNode;
  /** Dashboard page uses its own greeting header */
  hideHeader?: boolean;
  /** Checkout success: no sidebar, header, or mobile nav */
  hideChrome?: boolean;
  /** Full mocks unlocked after the personalized practice plan. */
  mockUnlocked?: boolean;
  /** Daily growth report — opened from the header (lg+) or mobile nav. */
  report?: {
    studentName: string;
    tasks: LearningStudyTask[];
    hubProgress?: Record<string, SkillHubProgress>;
    currentBand?: number | null;
    targetBand?: number | null;
    overallPlanPct?: number;
  };
};

export function DashboardShell({
  displayName,
  avatarUrl = null,
  pathname,
  sidebar,
  children,
  hideHeader = false,
  hideChrome = false,
  mockUnlocked = false,
  report,
}: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_KEY);
      if (stored === "1") setSidebarOpen(true);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const initial = displayName.trim().charAt(0).toUpperCase() || "B";
  const isDashboard = pathname === "/dashboard";
  const showDevMockFooter = SHOW_DEV_MOCK_FOOTER && !isDashboard;
  const mobileNav = getMobileBottomNav({ mockUnlocked });
  const bottomNavCols =
    mobileNav.length >= 5
      ? "grid-cols-5"
      : mobileNav.length === 4
        ? "grid-cols-4"
        : "grid-cols-3";

  if (hideChrome) {
    return (
      <div className="bf-dashboard relative min-h-dvh text-ink">
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="bf-dashboard relative min-h-dvh text-ink">
      {/* Desktop sidebar only — small screens use bottom nav */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-ink/8 bg-white p-5 shadow-[4px_0_32px_rgba(15,23,42,0.06)] transition-transform duration-200 ease-out lg:flex",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-hidden={!sidebarOpen}
      >
        <div className="mb-4 flex items-center">
          <SidebarToggleButton
            open={sidebarOpen}
            onClick={toggleSidebar}
            ariaLabel={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          />
        </div>
        {sidebar}
      </aside>

      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 hidden bg-ink/25 lg:block"
          aria-label="Close sidebar"
          onClick={() => toggleSidebar()}
        />
      ) : null}

      <div
        className={cn(
          "flex flex-col transition-[padding] duration-200 ease-out",
          isDashboard
            ? "min-h-dvh lg:h-dvh lg:overflow-hidden"
            : "min-h-dvh overflow-visible",
          sidebarOpen ? "lg:pl-[260px]" : "lg:pl-0",
        )}
      >
        <header
          className={cn(
            "sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-ink/8 bg-white/95 px-4 backdrop-blur-md sm:px-6",
            !hideHeader && "lg:px-8",
          )}
        >
          {!sidebarOpen ? (
            <SidebarToggleButton
              open={false}
              onClick={toggleSidebar}
              ariaLabel="Show sidebar"
              className="hidden shrink-0 lg:flex"
            />
          ) : (
            <span className="hidden size-10 shrink-0 lg:block" aria-hidden />
          )}
          <BandForgeLogoLink
            href="/dashboard"
            size="sm"
            className={cn("min-w-0 flex-1", sidebarOpen && "lg:hidden")}
          />
          {sidebarOpen ? (
            <span className="hidden flex-1 lg:block" aria-hidden />
          ) : null}
          <NavAccount avatarUrl={avatarUrl} initial={initial} />
        </header>

        <main
          className={cn(
            "mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 sm:px-6 lg:px-8",
            // Dashboard pins to the viewport and scrolls inside cards.
            // Study plan / practice pages must grow with content so the
            // document can scroll — min-h-0 here clips overflow and
            // overflow-x:hidden on html then blocks page scroll.
            isDashboard ? "min-h-0" : "min-h-min",
            hideHeader
              ? isDashboard
                ? "pt-[var(--bf-dash-gutter)] pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-[var(--bf-dash-gutter)]"
                : "pt-6 pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-6"
              : "py-6 pb-[calc(4.5rem+env(safe-area-inset-bottom))] sm:py-8 lg:pb-10",
            showDevMockFooter &&
              "pb-[calc(7.25rem+env(safe-area-inset-bottom))] lg:pb-16",
          )}
        >
          {children}
        </main>
      </div>

      {showDevMockFooter ? <DevMockTestFooter aboveMobileNav /> : null}

      <nav
        className={cn(
          "fixed right-0 bottom-0 left-0 z-20 grid border-t border-border-soft bg-white/95 px-1 pt-1.5 backdrop-blur-md pb-[max(0.35rem,env(safe-area-inset-bottom))] lg:hidden",
          bottomNavCols,
        )}
        aria-label="Mobile navigation"
      >
        {mobileNav.map((item) => {
          const active = isNavItemActive(pathname, item.href);
          const className = cn(
            "flex min-h-[48px] min-w-0 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 text-[10px] font-semibold tracking-tight transition-colors duration-150 sm:text-[11px]",
            item.disabled
              ? "pointer-events-none opacity-45 text-muted-light"
              : active
                ? "text-cyan"
                : "text-muted-light active:text-ink/70",
          );
          const inner = (
            <>
              <item.Icon
                className={cn(
                  "size-5 shrink-0 sm:size-[22px]",
                  active && !item.disabled && "text-cyan",
                )}
                strokeWidth={active ? 2.25 : 2}
              />
              <span className="max-w-full truncate">
                {item.shortLabel ?? item.label}
              </span>
            </>
          );
          if (item.disabled) {
            return (
              <span key={item.href} className={className} title={item.disabledHint}>
                {inner}
              </span>
            );
          }
          if (item.action === "open-report") {
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => requestOpenDailyReport()}
                className={className}
              >
                {inner}
              </button>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              className={className}
            >
              {inner}
            </Link>
          );
        })}
      </nav>

      {report ? (
        <DashboardDailyReportHost
          studentName={report.studentName}
          tasks={report.tasks}
          hubProgress={report.hubProgress}
          currentBand={report.currentBand}
          targetBand={report.targetBand}
          overallPlanPct={report.overallPlanPct}
        />
      ) : null}
    </div>
  );
}

function NavAccount({
  avatarUrl,
  initial,
}: {
  avatarUrl?: string | null;
  initial: string;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <Link
        href="/profile"
        className="flex size-9 overflow-hidden rounded-full border border-border-soft bg-navy"
        title="Profile"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-ink text-xs font-bold text-white">
            {initial}
          </span>
        )}
      </Link>
      <div className="hidden sm:block">
        <SignOutButton />
      </div>
    </div>
  );
}

function SidebarToggleButton({
  open,
  onClick,
  ariaLabel,
  className,
}: {
  open: boolean;
  onClick: () => void;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={open}
      className={cn(
        "flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-ink/10 bg-white text-ink shadow-[0_4px_16px_rgba(15,23,42,0.08)] transition-all duration-200",
        "hover:border-cyan/45 hover:text-cyan hover:shadow-[0_6px_20px_rgba(6,182,212,0.15)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2",
        open && "border-cyan/40 text-cyan",
        className,
      )}
    >
      <PanelIcon className="size-4" />
    </button>
  );
}
