"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AdminSidebarNav } from "@/components/admin/admin-sidebar-nav";
import { adminBtnSecondary, adminHeader, adminPageBg, adminSidebar } from "@/components/admin/admin-ui";
import { cn } from "@/lib/utils";

const SIDEBAR_KEY = "bf-admin-sidebar";

type AdminShellProps = {
  children: ReactNode;
  title?: string;
  description?: string;
};

export function AdminShell({
  children,
  title = "Admin",
  description,
}: AdminShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const mobileAsideRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_KEY);
      if (stored === "0") setSidebarOpen(false);
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

  const sidebarContent = <AdminSidebarNav pathname={pathname} />;

  return (
    <div className={cn("relative", adminPageBg)}>
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg"
      >
        Skip to main content
      </a>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col p-5 transition-transform duration-200 ease-out lg:flex",
          adminSidebar,
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-hidden={!sidebarOpen}
      >
        <div className="mb-4 flex items-center justify-end">
          <button
            type="button"
            onClick={toggleSidebar}
            className="cursor-pointer rounded-lg p-2 text-slate transition-colors hover:bg-surface hover:text-ink"
            aria-label="Hide sidebar"
          >
            <PanelLeftClose className="size-5" />
          </button>
        </div>
        {sidebarContent}
      </aside>

      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 hidden bg-black/20 lg:block"
          aria-label="Close sidebar overlay"
          onClick={toggleSidebar}
        />
      ) : null}

      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}
      <aside
        ref={mobileAsideRef}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(280px,88vw)] flex-col p-5 transition-transform duration-200 ease-out lg:hidden",
          adminSidebar,
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-hidden={!mobileOpen}
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Menu
          </span>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="cursor-pointer rounded-lg p-2 text-slate hover:bg-surface"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>
        {sidebarContent}
      </aside>

      <div
        className={cn(
          "flex min-h-dvh flex-col transition-[padding] duration-200 ease-out",
          sidebarOpen ? "lg:pl-[260px]" : "lg:pl-0",
        )}
      >
        <header className={adminHeader}>
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="cursor-pointer rounded-lg p-2 text-white/90 transition-colors hover:bg-white/15 lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </button>
              {!sidebarOpen ? (
                <button
                  type="button"
                  onClick={toggleSidebar}
                  className="hidden cursor-pointer rounded-lg p-2 text-white/90 transition-colors hover:bg-white/15 lg:inline-flex"
                  aria-label="Show sidebar"
                >
                  <PanelLeftOpen className="size-5" />
                </button>
              ) : null}
              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold text-white sm:text-xl">{title}</h1>
                {description ? (
                  <p className="hidden truncate text-xs font-medium text-white/85 sm:block">
                    {description}
                  </p>
                ) : null}
              </div>
            </div>
            <Link
              href="/dashboard"
              className={cn(
                adminBtnSecondary,
                "border-white/40 bg-white/95 text-teal hover:bg-white",
              )}
            >
              Student view
            </Link>
          </div>
        </header>

        <main
          id="admin-main"
          className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
