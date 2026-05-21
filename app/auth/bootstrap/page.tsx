"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ensureSession } from "@/lib/auth";
import { isAuthEnabled } from "@/lib/flags";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

function AuthBootstrapInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const [message, setMessage] = useState("Restoring your session…");

  useEffect(() => {
    if (!isAuthEnabled()) {
      router.replace(next);
      return;
    }

    let cancelled = false;

    async function run() {
      const session = await ensureSession();
      if (cancelled) return;

      if (session) {
        router.replace(next);
        return;
      }

      setMessage("Session expired. Redirecting to sign in…");
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [next, router]);

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
