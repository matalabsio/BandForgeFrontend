"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { BandForgeLogoLink } from "@/components/bandforge/bandforge-logo-link";
import { SignOutButton } from "@/components/bandforge/auth/sign-out-button";
import {
  CloseIcon,
  PanelIcon,
} from "@/components/bandforge/dashboard/icons";
import { MOBILE_BOTTOM_NAV, isNavItemActive } from "@/components/bandforge/dashboard/dashboard-nav";
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
  /** Checkout success: no sidebar, header, or mobile nav */
  hideChrome?: boolean;
};

export function DashboardShell({
  displayName,
  avatarUrl = null,
  pathname,
  sidebar,
  children,
  hideHeader = false,
  hideChrome = false,
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

      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm lg:hidden"
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
            className="flex size-10 cursor-pointer items-center justify-center rounded-xl border border-ink/10 text-ink/60"
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
          <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-ink/8 bg-white/95 px-4 backdrop-blur-md sm:px-6">
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
            {/* Logo lives in the sidebar when it's open (desktop). Keep it in the top bar on mobile / when sidebar is closed. */}
            <BandForgeLogoLink
              href="/dashboard"
              size="sm"
              className={cn("min-w-0", sidebarOpen && "lg:hidden")}
            />
          </header>
        ) : (
          <header className="sticky top-0 z-20 border-b border-ink/8 bg-white/95 backdrop-blur-md">
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
              <BandForgeLogoLink
                href="/dashboard"
                size="sm"
                className={cn(
                  "min-w-0 flex-1",
                  sidebarOpen && "lg:hidden",
                )}
              />
              {sidebarOpen ? (
                <span className="hidden flex-1 lg:block" aria-hidden />
              ) : null}
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  className="relative flex size-9 items-center justify-center rounded-full border border-border-soft bg-surface-alt text-navy"
                  aria-label="Notifications"
                >
                  <Bell className="size-4" strokeWidth={2} />
                  <span className="absolute top-2 right-2 size-1.5 rounded-full bg-cyan ring-2 ring-white" />
                </button>
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

      <nav
        className="fixed right-0 bottom-0 left-0 z-20 grid grid-cols-5 border-t border-border-soft bg-white px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden"
        aria-label="Mobile navigation"
      >
        {MOBILE_BOTTOM_NAV.map((item) => {
          const active = isNavItemActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              className={cn(
                "flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-medium",
                active ? "text-cyan" : "text-muted-light",
              )}
            >
              <item.Icon className="size-[23px]" strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>
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
