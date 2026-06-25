"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ensureSession, loginPathWithNext, logout } from "@/lib/auth";
import { adminLoginPath } from "@/lib/admin-roles";
import { isAuthEnabled } from "@/lib/flags";
import { ACCESS_COOKIE, getRefreshToken, REFRESH_COOKIE } from "@/lib/session";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

const SESSION_RESTORE_TIMEOUT_MS = 12_000;

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
  const [message, setMessage] = useState("Restoring your session…");

  useEffect(() => {
    if (!isAuthEnabled()) {
      replace(next);
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

      setMessage(
        staleSession
          ? "Session expired. Redirecting to sign in…"
          : "Redirecting to sign in…",
      );
      await logout();
      if (cancelled) return;
      // Only show "session expired" when old cookies/tokens existed but could not refresh.
      replace(loginRedirectPath(next, staleSession));
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [next, replace]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface px-4">
      <p className="text-meta font-medium text-ink/70">{message}</p>
    </main>
  );
}

export default function AuthBootstrapPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-dvh items-center justify-center bg-surface px-4">
          <p className="text-meta font-medium text-ink/70">Loading…</p>
        </main>
      }
    >
      <AuthBootstrapInner />
    </Suspense>
  );
}
