"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ensureSession, loginPathWithNext, logout } from "@/lib/auth";
import { isAuthEnabled } from "@/lib/flags";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

const SESSION_RESTORE_TIMEOUT_MS = 12_000;

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
      const session = await withTimeout(ensureSession(), SESSION_RESTORE_TIMEOUT_MS);
      if (cancelled) return;

      if (session) {
        // Full navigation so the next request includes fresh auth cookies and
        // dashboard RSC data (soft router.replace often renders empty once).
        window.location.replace(next);
        return;
      }

      setMessage("Session expired. Redirecting to sign in…");
      await logout();
      if (cancelled) return;
      replace(loginPathWithNext(next, true));
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
