"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  BellIcon,
  ChevronDownIcon,
  FlameIcon,
} from "@/components/bandforge/dashboard/icons";
import { timeGreeting } from "@/components/bandforge/dashboard/utils";
import { cn } from "@/lib/utils";

type Props = {
  firstName: string;
  displayName: string;
  email?: string | null;
  avatarUrl?: string | null;
  streakDays: number;
};

export function DashboardTopHeader({
  firstName,
  displayName,
  email = null,
  avatarUrl = null,
  streakDays,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const initial = displayName.trim().charAt(0).toUpperCase() || "B";
  const triggerLabel =
    firstName.trim() || displayName.split("@")[0] || "Account";
  const emailLine = email?.trim() || (displayName.includes("@") ? displayName : null);

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
            <div
              role="menu"
              className="fixed z-[210] min-w-[220px] max-w-[min(280px,calc(100vw-16px))] overflow-hidden rounded-xl border border-ink/10 bg-white py-1 shadow-[0_12px_40px_rgba(15,23,42,0.18)]"
              style={{ top: menuPos.top, right: menuPos.right }}
            >
              <div className="border-b border-ink/6 px-4 py-3">
                <p className="truncate text-[13px] font-bold text-ink">
                  {triggerLabel}
                </p>
                {emailLine ? (
                  <p className="mt-0.5 truncate text-[11px] text-ink/50">
                    {emailLine}
                  </p>
                ) : null}
              </div>
              <Link
                href="/profile"
                role="menuitem"
                className="block px-4 py-2.5 text-[13px] font-medium text-ink transition-colors hover:bg-ink/5"
                onClick={() => setMenuOpen(false)}
              >
                Profile
              </Link>
            </div>
          </>,
          document.body,
        )
      : null;

  return (
    <header className="bf-dash-enter relative z-40 mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-[28px]">
          {timeGreeting()}, {firstName}
        </h1>
        <p className="mt-1 text-[14px] text-ink/55">
          Keep your IELTS journey consistent. Small steps, big band.
        </p>
      </div>

      <div className="relative z-50 flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
        {streakDays > 0 ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-[12px] font-semibold text-orange-700">
            <FlameIcon className="size-4 text-orange-500" />
            {streakDays} day{streakDays === 1 ? "" : "s"} streak
          </span>
        ) : null}

        <button
          type="button"
          aria-label="Notifications"
          className="flex size-10 cursor-pointer items-center justify-center rounded-xl border border-ink/10 bg-white text-ink/60 transition-colors hover:border-cyan/30 hover:text-cyan"
        >
          <BellIcon className="size-5" />
        </button>

        <button
          ref={triggerRef}
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex max-w-[200px] cursor-pointer items-center gap-2 rounded-xl border border-ink/10 bg-white py-1.5 pl-1.5 pr-3 transition-colors hover:border-cyan/25 sm:max-w-[240px]"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
        >
          <span className="flex size-8 shrink-0 overflow-hidden rounded-full bg-ink text-xs font-bold text-white">
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
              "hidden size-4 shrink-0 text-ink/40 transition-transform sm:block",
              menuOpen && "rotate-180",
            )}
          />
        </button>
      </div>

      {menu}
    </header>
  );
}
