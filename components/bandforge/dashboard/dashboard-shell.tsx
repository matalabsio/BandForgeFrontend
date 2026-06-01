"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { BandForgeLogoLink } from "@/components/bandforge/bandforge-logo-link";
import { SignOutButton } from "@/components/bandforge/auth/sign-out-button";
import {
  CloseIcon,
  HomeIcon,
  PanelIcon,
  UserIcon,
} from "@/components/bandforge/dashboard/icons";
import { cn } from "@/lib/utils";

const SIDEBAR_KEY = "bf-dashboard-sidebar";

type Props = {
  displayName: string;
  avatarUrl?: string | null;
  pathname: string;
  sidebar: React.ReactNode;
  children: React.ReactNode;
  /** Dashboard page uses its own greeting header */
  hideHeader?: boolean;
};

export function DashboardShell({
  displayName,
  avatarUrl = null,
  pathname,
  sidebar,
  children,
  hideHeader = false,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mobileAsideRef = useRef<HTMLElement>(null);

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

  useEffect(() => {
    if (!mobileOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const el = mobileAsideRef.current;
    if (!el) return;
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("a")) {
        setMobileOpen(false);
      }
    };
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, [mobileOpen]);

  const initial = displayName.trim().charAt(0).toUpperCase() || "B";
  const showTopNavToggle = !sidebarOpen;

  return (
    <div className="bf-dashboard relative min-h-dvh bg-[#F1F5F9] text-[#0F172A]">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-[#0F172A]/8 bg-white p-5 shadow-[4px_0_32px_rgba(15,23,42,0.06)] transition-transform duration-200 ease-out lg:flex",
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
          className="fixed inset-0 z-30 hidden bg-[#0F172A]/25 lg:block"
          aria-label="Close sidebar"
          onClick={() => toggleSidebar()}
        />
      ) : null}

      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-[#0F172A]/30 backdrop-blur-sm lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}
      <aside
        ref={mobileAsideRef}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(300px,90vw)] flex-col overflow-y-auto bg-white p-5 shadow-2xl transition-transform duration-200 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <SidebarToggleButton
            open={mobileOpen}
            onClick={() => setMobileOpen(false)}
            ariaLabel="Close menu"
          />
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="flex size-10 cursor-pointer items-center justify-center rounded-xl border border-[#0F172A]/10 text-[#0F172A]/60"
            aria-label="Close menu"
          >
            <CloseIcon className="size-4" />
          </button>
        </div>
        {sidebar}
      </aside>

      <div
        className={cn(
          "flex min-h-dvh flex-col transition-[padding] duration-200 ease-out",
          sidebarOpen ? "lg:pl-[260px]" : "lg:pl-0",
        )}
      >
        {hideHeader ? (
          <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-[#0F172A]/8 bg-white/95 px-4 backdrop-blur-md sm:px-6">
            {showTopNavToggle ? (
              <SidebarToggleButton
                open={mobileOpen}
                onClick={() => setMobileOpen(true)}
                ariaLabel="Open menu"
                className="lg:hidden"
              />
            ) : (
              <span className="hidden w-10 lg:block" aria-hidden />
            )}
            {!sidebarOpen ? (
              <SidebarToggleButton
                open={false}
                onClick={toggleSidebar}
                ariaLabel="Show sidebar"
                className="hidden lg:flex"
              />
            ) : null}
            <BandForgeLogoLink size="sm" />
          </header>
        ) : (
          <header className="sticky top-0 z-20 border-b border-[#0F172A]/8 bg-white/95 backdrop-blur-md">
            <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
              {showTopNavToggle ? (
                <SidebarToggleButton
                  open={mobileOpen}
                  onClick={() => setMobileOpen(true)}
                  ariaLabel="Open menu"
                  className="lg:hidden"
                />
              ) : null}
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
              <BandForgeLogoLink size="sm" className="min-w-0 flex-1" />
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href="/profile"
                  className="hidden size-9 overflow-hidden rounded-full border border-[#0F172A]/10 bg-[#0F172A]/5 sm:flex"
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
                    <span className="flex h-full w-full items-center justify-center bg-[#0F172A] text-xs font-bold text-white">
                      {initial}
                    </span>
                  )}
                </Link>
                <SignOutButton />
              </div>
            </div>
          </header>
        )}

        <main
          className={cn(
            "mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8",
            hideHeader ? "py-6 pb-20 lg:py-8 lg:pb-10" : "py-6 pb-20 sm:py-8 lg:pb-10",
          )}
        >
          {children}
        </main>
      </div>

      {hideHeader ? (
        <nav
          className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around border-t border-[#0F172A]/8 bg-white px-2 py-2 lg:hidden"
          aria-label="Mobile navigation"
        >
          <Link
            href="/dashboard"
            prefetch
            className={cn(
              "flex min-h-[44px] min-w-[72px] flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-semibold",
              pathname === "/dashboard" ? "text-[#06B6D4]" : "text-[#0F172A]/50",
            )}
          >
            <HomeIcon className="size-5" />
            Home
          </Link>
          <Link
            href="/profile"
            prefetch
            className={cn(
              "flex min-h-[44px] min-w-[72px] flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-semibold",
              pathname === "/profile" ? "text-[#06B6D4]" : "text-[#0F172A]/50",
            )}
          >
            <UserIcon className="size-5" />
            Profile
          </Link>
        </nav>
      ) : null}
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
        "flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-[#0F172A]/10 bg-white text-[#0F172A] shadow-[0_4px_16px_rgba(15,23,42,0.08)] transition-all duration-200",
        "hover:border-[#06B6D4]/45 hover:text-[#06B6D4] hover:shadow-[0_6px_20px_rgba(6,182,212,0.15)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06B6D4] focus-visible:ring-offset-2",
        open && "border-[#06B6D4]/40 text-[#06B6D4]",
        className,
      )}
    >
      <PanelIcon className="size-4" />
    </button>
  );
}
