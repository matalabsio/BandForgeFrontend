"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardAppShellSkeleton } from "@/components/bandforge/dashboard/dashboard-shell-skeleton";
import {
  ensureSession,
  loginPathWithNext,
  logout,
} from "@/lib/auth";
import { adminLoginPath } from "@/lib/admin-roles";
import { isAuthEnabled } from "@/lib/flags";
import {
  ACCESS_COOKIE,
  getRefreshToken,
  hasLikelyClientSession,
  REFRESH_COOKIE,
} from "@/lib/session";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

const SESSION_RESTORE_TIMEOUT_MS = 5_000;

function hadPriorSession(): boolean {
  if (typeof document === "undefined") return false;
  const hasCookie = document.cookie
    .split(";")
    .some((c) => {
      const name = c.trim().split("=")[0];
      return name === ACCESS_COOKIE || name === REFRESH_COOKIE;
    });
  return hasCookie || Boolean(getRefreshToken());
}

function loginRedirectPath(next: string, sessionExpired: boolean): string {
  if (next === "/admin" || next.startsWith("/admin/")) {
    return adminLoginPath("/admin", sessionExpired ? "session_expired" : undefined);
  }
  return loginPathWithNext(next, sessionExpired);
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), ms);
    }),
  ]);
}

function AuthBootstrapInner() {
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));

  useEffect(() => {
    if (!isAuthEnabled()) {
      replace(next);
      return;
    }

    if (!hasLikelyClientSession()) {
      replace(loginRedirectPath(next, false));
      return;
    }

    let cancelled = false;

    async function run() {
      const staleSession = hadPriorSession();
      const session = await withTimeout(ensureSession(), SESSION_RESTORE_TIMEOUT_MS);
      if (cancelled) return;

      if (session) {
        // Full navigation so the next request includes fresh auth cookies and
        // dashboard RSC data (soft router.replace often renders empty once).
        window.location.replace(next);
        return;
      }

      if (staleSession) {
        await logout();
      }
      if (cancelled) return;
      replace(loginRedirectPath(next, staleSession));
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [next, replace]);

  return <DashboardAppShellSkeleton />;
}

export default function AuthBootstrapPage() {
  return (
    <Suspense fallback={<DashboardAppShellSkeleton />}>
      <AuthBootstrapInner />
    </Suspense>
  );
}
