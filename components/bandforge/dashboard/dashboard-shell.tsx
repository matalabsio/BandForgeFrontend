"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SignOutButton } from "@/components/bandforge/auth/sign-out-button";
import { DashboardBackground } from "@/components/bandforge/dashboard/dashboard-background";
import {
  CloseIcon,
  FlameIcon,
  HomeIcon,
  MenuIcon,
  SparkleIcon,
  UserIcon,
} from "@/components/bandforge/dashboard/icons";
import { formatBand } from "@/components/bandforge/dashboard/utils";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  Icon: typeof HomeIcon;
};

const NAV: NavItem[] = [
  { label: "Home", href: "/dashboard", Icon: HomeIcon },
  { label: "Profile", href: "/profile", Icon: UserIcon },
];

type Props = {
  displayName: string;
  avatarUrl?: string | null;
  bandScore?: number | null;
  streakDays?: number;
  children: React.ReactNode;
};

export function DashboardShell({
  displayName,
  avatarUrl = null,
  bandScore = null,
  streakDays = 0,
  children,
}: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  const initial = displayName.trim().charAt(0).toUpperCase() || "B";

  return (
    <div className="bf-dash relative min-h-dvh text-[#0F172A]">
      <DashboardBackground />

      {/* Floating desktop sidebar */}
      <aside className="fixed left-4 top-4 z-40 hidden h-[calc(100dvh-2rem)] w-[72px] flex-col items-center rounded-[24px] border border-white/60 bg-white/70 py-5 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:flex xl:left-6 xl:w-[220px] xl:items-stretch xl:px-3">
        <Link
          href="/"
          className="mb-6 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0F172A] text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02] xl:h-auto xl:w-auto xl:gap-2 xl:bg-transparent xl:px-2 xl:py-1 xl:text-[#0F172A] xl:shadow-none"
        >
          <span className="xl:hidden">B</span>
          <span className="hidden font-display text-lg font-bold tracking-tight xl:inline">
            Band<span className="text-[#06B6D4]">Forge</span>
          </span>
        </Link>

        <nav className="flex flex-1 flex-col gap-1 xl:w-full" aria-label="Dashboard">
          {NAV.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={cn(
                  "group flex cursor-pointer flex-col items-center gap-1 rounded-2xl px-2 py-2.5 text-[10px] font-semibold transition-all duration-200 xl:flex-row xl:gap-3 xl:px-3 xl:py-2.5 xl:text-[13px]",
                  active
                    ? "bg-[#06B6D4]/15 text-[#0F172A] shadow-[0_0_24px_rgba(6,182,212,0.18)]"
                    : "text-[#0F172A]/55 hover:bg-white/80 hover:text-[#0F172A]",
                )}
              >
                <item.Icon
                  className={cn(
                    "h-5 w-5",
                    active ? "text-[#06B6D4]" : "text-[#0F172A]/45",
                  )}
                />
                <span className="hidden xl:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto hidden w-full flex-col gap-2 xl:flex">
          <div className="rounded-2xl border border-[#06B6D4]/20 bg-[#06B6D4]/8 px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0F172A]/45">
              Band
            </p>
            <p className="font-display text-xl font-bold tabular-nums">
              {formatBand(bandScore)}
            </p>
          </div>
          {streakDays > 0 ? (
            <div className="flex items-center gap-2 rounded-2xl bg-[#0F172A]/5 px-3 py-2">
              <FlameIcon className="h-4 w-4 text-[#06B6D4]" />
              <span className="text-[12px] font-semibold">
                {streakDays} day streak
              </span>
            </div>
          ) : null}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-2xl border border-dashed border-[#06B6D4]/35 px-3 py-2 text-[12px] font-semibold text-[#06B6D4] transition-colors hover:bg-[#06B6D4]/10"
          >
            <SparkleIcon className="h-4 w-4" />
            AI Coach
          </Link>
        </div>

        <div className="mt-4 hidden w-full border-t border-[#0F172A]/8 pt-4 xl:block">
          <UserChip
            displayName={displayName}
            initial={initial}
            avatarUrl={avatarUrl}
          />
        </div>
      </aside>

      {/* Mobile drawer */}
      {open ? (
        <div
          className="fixed inset-0 z-40 bg-[#0F172A]/30 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      ) : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-white/60 bg-white/95 p-4 shadow-2xl backdrop-blur-xl transition-transform duration-200 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="font-display text-lg font-bold">
            Band<span className="text-[#06B6D4]">Forge</span>
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#0F172A]/10"
            aria-label="Close menu"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
        <nav className="space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#0F172A]/75 hover:bg-[#06B6D4]/10"
            >
              <item.Icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-4">
          <UserChip
            displayName={displayName}
            initial={initial}
            avatarUrl={avatarUrl}
          />
          <div className="mt-2">
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-[100px] xl:pl-[248px]">
        <header className="sticky top-0 z-30 border-b border-white/50 bg-white/60 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#0F172A]/10 bg-white/80 lg:hidden"
              aria-label="Open menu"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <Link
              href="/"
              className="font-display text-lg font-bold lg:hidden"
            >
              Band<span className="text-[#06B6D4]">Forge</span>
            </Link>
            <p className="hidden text-sm font-medium text-[#0F172A]/55 lg:block">
              Learning OS
            </p>
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="hidden rounded-full border border-[#0F172A]/10 bg-white/70 px-3 py-1.5 text-[12px] font-semibold text-[#0F172A]/70 transition-colors hover:text-[#06B6D4] sm:inline-flex"
              >
                Home
              </Link>
              <SignOutButton />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-white/60 bg-white/85 px-2 py-2 backdrop-blur-xl lg:hidden"
        aria-label="Mobile"
      >
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-[72px] flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-semibold",
                active ? "text-[#06B6D4]" : "text-[#0F172A]/50",
              )}
            >
              <item.Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
        <Link
          href="/"
          className="flex min-w-[72px] flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-semibold text-[#0F172A]/50"
        >
          <span className="text-lg leading-none">⌂</span>
          Site
        </Link>
      </nav>

      <div className="h-16 lg:hidden" aria-hidden />
    </div>
  );
}

function UserChip({
  displayName,
  initial,
  avatarUrl,
}: {
  displayName: string;
  initial: string;
  avatarUrl?: string | null;
}) {
  return (
    <Link
      href="/profile"
      className="flex items-center gap-3 rounded-2xl bg-[#0F172A]/5 px-3 py-2 transition-colors hover:bg-[#06B6D4]/10"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0F172A] text-xs font-bold text-white">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          initial
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold">{displayName}</p>
        <p className="text-[11px] text-[#0F172A]/45">Edit profile</p>
      </div>
    </Link>
  );
}
