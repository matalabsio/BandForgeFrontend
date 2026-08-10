"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FileText } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import {
  BellIcon,
  ChevronDownIcon,
} from "@/components/bandforge/dashboard/icons";
import { DASH_EASE } from "@/components/bandforge/dashboard/motion";
import { timeGreeting } from "@/components/bandforge/dashboard/utils";
import { cn } from "@/lib/utils";

/** Fired by the header so TodaysPlanPanel can open the growth report modal. */
export const OPEN_DAILY_REPORT_EVENT = "bf:open-daily-report";

export function requestOpenDailyReport(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_DAILY_REPORT_EVENT));
}

export type HeaderPlanTimeline = {
  currentDay?: number | null;
  totalDays?: number | null;
  daysRemaining?: number | null;
  examDate?: string | null;
};

type Props = {
  firstName: string;
  displayName: string;
  email?: string | null;
  avatarUrl?: string | null;
  /** Show the daily growth report shortcut (dashboard with plan). */
  showReportButton?: boolean;
  /** Compact plan day + progress + time-left strip under the greeting. */
  planTimeline?: HeaderPlanTimeline | null;
};

function localIsoToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatExamDate(examDate: string | null | undefined): string | null {
  if (!examDate) return null;
  const parsed = new Date(`${examDate.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function examCountdown(
  daysRemaining: number | null | undefined,
  examDate: string | null | undefined,
): { value: string; unit: string } {
  if (daysRemaining == null && !examDate) {
    return { value: "—", unit: "Set exam date" };
  }
  const todayIso = localIsoToday();
  if (examDate && examDate.slice(0, 10) < todayIso) {
    return { value: "—", unit: "Exam passed" };
  }
  if (daysRemaining === 0) {
    return { value: "0", unit: "Exam today" };
  }
  if (daysRemaining != null && daysRemaining > 0) {
    return {
      value: String(daysRemaining),
      unit: daysRemaining === 1 ? "day left" : "days left",
    };
  }
  if (examDate) {
    return { value: "—", unit: "Exam passed" };
  }
  return { value: "—", unit: "Set exam date" };
}

export function DashboardTopHeader({
  firstName,
  displayName,
  email = null,
  avatarUrl = null,
  showReportButton = true,
  planTimeline = null,
}: Props) {
  const reduce = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const initial = displayName.trim().charAt(0).toUpperCase() || "B";
  const triggerLabel =
    firstName.trim() || displayName.split("@")[0] || "Account";
  const emailLine =
    email?.trim() || (displayName.includes("@") ? displayName : null);
  const timelineDay = planTimeline?.currentDay ?? null;
  const timelineTotal = planTimeline?.totalDays ?? null;
  const showTimeline = planTimeline != null;
  const timelinePct =
    timelineDay != null && timelineTotal != null && timelineTotal > 0
      ? Math.min(100, Math.round((timelineDay / timelineTotal) * 100))
      : 0;
  const countdown = examCountdown(
    planTimeline?.daysRemaining,
    planTimeline?.examDate,
  );
  const examLabel = formatExamDate(planTimeline?.examDate);

  const updateMenuPosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 8,
      right: Math.max(8, window.innerWidth - rect.right),
    });
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    updateMenuPosition();
    const onResize = () => updateMenuPosition();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [menuOpen, updateMenuPosition]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const menu =
    menuOpen && typeof document !== "undefined"
      ? createPortal(
          <>
            <button
              type="button"
              className="fixed inset-0 z-[200] cursor-default bg-transparent"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              role="menu"
              initial={reduce ? false : { opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2, ease: DASH_EASE }}
              className="fixed z-[210] min-w-[220px] max-w-[min(280px,calc(100vw-16px))] overflow-hidden rounded-2xl border border-ink/10 bg-white py-1 shadow-[0_16px_48px_rgba(15,23,42,0.16)]"
              style={{ top: menuPos.top, right: menuPos.right }}
            >
              <div className="border-b border-ink/[0.06] px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 overflow-hidden rounded-full bg-navy text-xs font-bold text-white">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center">
                        {initial}
                      </span>
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-bold text-ink">
                      {triggerLabel}
                    </p>
                    {emailLine ? (
                      <p className="mt-0.5 truncate text-[11px] text-muted">
                        {emailLine}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
              <Link
                href="/profile"
                role="menuitem"
                className="block cursor-pointer px-4 py-2.5 text-[13px] font-medium text-ink transition-colors hover:bg-cyan-soft/50 hover:text-teal"
                onClick={() => setMenuOpen(false)}
              >
                Profile
              </Link>
            </motion.div>
          </>,
          document.body,
        )
      : null;

  const markerLeft = Math.min(100, Math.max(0, timelinePct));

  return (
    <header className="relative z-40">
      <motion.div
        className="rounded-2xl border border-ink/[0.06] bg-white/90 px-3 py-2.5 sm:px-4"
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: DASH_EASE }}
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2.5">
          <div className="min-w-0 shrink-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-teal">
              {timeGreeting()}
            </p>
            <h1 className="truncate font-display text-lg font-bold tracking-tight text-ink sm:text-xl">
              {firstName}
            </h1>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          {showTimeline ? (
            <div
              className="w-[8.75rem] shrink-0 sm:w-[10rem]"
              aria-label={
                examLabel
                  ? `Exam ${examLabel}. ${countdown.value} ${countdown.unit}`
                  : countdown.unit
              }
            >
              <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-light">
                Exam timeline
              </p>
              <div className="relative">
                <div
                  className="h-1.5 overflow-hidden rounded-full bg-ink/[0.08]"
                  role="progressbar"
                  aria-valuenow={timelinePct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-teal to-cyan"
                    style={{ width: `${timelinePct}%` }}
                  />
                </div>
                <span
                  className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal ring-2 ring-white"
                  style={{ left: `${markerLeft}%` }}
                  aria-hidden
                />
              </div>
              <p className="mt-1 text-[10px] font-semibold text-muted">
                <span className="font-mono tabular-nums text-teal">
                  {countdown.value}
                </span>
                {countdown.value !== "—" ? " · " : " "}
                {countdown.unit}
              </p>
            </div>
          ) : null}

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {showReportButton ? (
              <button
                type="button"
                onClick={() => requestOpenDailyReport()}
                className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-teal/25 bg-white px-2.5 py-1.5 text-[12px] font-semibold text-teal transition-colors hover:border-cyan/40 hover:bg-cyan-soft/60 sm:min-h-10 sm:px-3 sm:text-[12.5px]"
              >
                <FileText className="size-3.5" strokeWidth={2.25} aria-hidden />
                <span className="sm:hidden">Report</span>
                <span className="hidden sm:inline">Report card</span>
              </button>
            ) : null}

            <button
              type="button"
              aria-label="Notifications"
              className="hidden size-9 cursor-pointer items-center justify-center rounded-xl border border-ink/8 bg-white text-muted transition-colors hover:border-cyan/35 hover:text-teal sm:flex sm:size-10"
            >
              <BellIcon className="size-4 sm:size-5" />
            </button>

            <button
              ref={triggerRef}
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex max-w-[11rem] cursor-pointer items-center gap-1.5 rounded-xl border border-ink/8 bg-white py-1 pl-1 pr-1.5 transition-colors hover:border-cyan/30 sm:max-w-[13rem] sm:gap-2 sm:py-1.5 sm:pl-1.5 sm:pr-2.5"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              <span className="flex size-7 shrink-0 overflow-hidden rounded-full bg-navy text-[11px] font-bold text-white sm:size-8 sm:text-xs">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center">
                    {initial}
                  </span>
                )}
              </span>
              <span className="hidden min-w-0 truncate text-[12px] font-semibold text-ink sm:block sm:text-[13px]">
                {triggerLabel}
              </span>
              <ChevronDownIcon
                className={cn(
                  "hidden size-4 shrink-0 text-ink/35 transition-transform duration-200 sm:block",
                  menuOpen && "rotate-180",
                )}
              />
            </button>
          </div>
          </div>
        </div>
      </motion.div>

      {menu}
    </header>
  );
}
