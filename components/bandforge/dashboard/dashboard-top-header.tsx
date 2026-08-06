"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FileText } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import {
  BellIcon,
  ChevronDownIcon,
  FlameIcon,
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

type Props = {
  firstName: string;
  displayName: string;
  email?: string | null;
  avatarUrl?: string | null;
  streakDays: number;
  /** Show the daily growth report shortcut (dashboard with plan). */
  showReportButton?: boolean;
};

export function DashboardTopHeader({
  firstName,
  displayName,
  email = null,
  avatarUrl = null,
  streakDays,
  showReportButton = true,
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

  return (
    <header className="relative z-40">
      <div className="flex flex-col gap-4 rounded-[22px] border border-ink/[0.06] bg-[linear-gradient(145deg,rgba(224,247,250,0.55),rgba(255,255,255,0.96)_55%)] p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5">
        <div className="min-w-0">
          <motion.p
            className="text-[10px] font-semibold uppercase tracking-[0.14em] text-teal"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: DASH_EASE }}
          >
            {timeGreeting()}
          </motion.p>
          <motion.h1
            className="mt-1 font-display text-[1.55rem] font-bold tracking-tight text-ink sm:text-[1.85rem]"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.04, ease: DASH_EASE }}
          >
            {firstName}
          </motion.h1>
          <motion.p
            className="mt-1 text-[13px] text-muted sm:text-[14px]"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08, ease: DASH_EASE }}
          >
            Keep your IELTS journey consistent.
          </motion.p>
        </div>

        <motion.div
          className="flex shrink-0 flex-wrap items-center gap-2"
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: DASH_EASE }}
        >
          <Link
            href="/streak"
            className={cn(
              "inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-[12.5px] font-semibold transition-colors",
              streakDays > 0
                ? "bg-navy text-white hover:bg-navy/90"
                : "border border-ink/10 bg-white text-muted hover:border-cyan/30 hover:text-teal",
            )}
          >
            <FlameIcon
              className={cn(
                "size-4",
                streakDays > 0 ? "text-cyan" : "text-orange-400",
              )}
            />
            {streakDays > 0 ? (
              <span className="tabular-nums">
                {streakDays}
                <span className="font-medium opacity-80">
                  {" "}
                  day{streakDays === 1 ? "" : "s"}
                </span>
              </span>
            ) : (
              "Start streak"
            )}
          </Link>

          {showReportButton ? (
            <button
              type="button"
              onClick={() => requestOpenDailyReport()}
              className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-teal/25 bg-white px-3 py-2 text-[12.5px] font-semibold text-teal transition-colors hover:border-cyan/40 hover:bg-cyan-soft/60"
            >
              <FileText className="size-3.5" strokeWidth={2.25} aria-hidden />
              Report card
            </button>
          ) : null}

          <button
            type="button"
            aria-label="Notifications"
            className="flex size-10 cursor-pointer items-center justify-center rounded-xl border border-ink/8 bg-white text-muted transition-colors hover:border-cyan/35 hover:text-teal"
          >
            <BellIcon className="size-5" />
          </button>

          <button
            ref={triggerRef}
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex max-w-[200px] cursor-pointer items-center gap-2 rounded-xl border border-ink/8 bg-white py-1.5 pl-1.5 pr-2.5 transition-colors hover:border-cyan/30 sm:max-w-[220px] sm:pr-3"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <span className="flex size-8 shrink-0 overflow-hidden rounded-full bg-navy text-xs font-bold text-white">
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
            <span className="hidden min-w-0 truncate text-[13px] font-semibold text-ink sm:block">
              {triggerLabel}
            </span>
            <ChevronDownIcon
              className={cn(
                "hidden size-4 shrink-0 text-ink/35 transition-transform duration-200 sm:block",
                menuOpen && "rotate-180",
              )}
            />
          </button>
        </motion.div>
      </div>

      {menu}
    </header>
  );
}
