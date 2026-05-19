"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { verifyEmail } from "@/lib/auth";
import { ApiError } from "@/lib/api";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    token ? "idle" : "error",
  );
  const [message, setMessage] = useState(
    token ? "" : "Missing verification token.",
  );

  useEffect(() => {
    if (!token || status !== "idle") return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStatus("loading");
    });
    verifyEmail(token)
      .then(() => {
        if (cancelled) return;
        setStatus("ok");
        setMessage("Email verified. Redirecting to your dashboard…");
        router.replace("/dashboard");
        router.refresh();
      })
      .catch((e) => {
        if (cancelled) return;
        setStatus("error");
        setMessage(e instanceof ApiError ? e.message : "Verification failed.");
      });
    return () => {
      cancelled = true;
    };
  }, [token, status, router]);

  return (
    <AuthShell title="Email verification">
      {status === "loading" || status === "idle" ? (
        <p className="text-body text-ink/70">Verifying your email…</p>
      ) : (
        <p
          className={`text-body ${status === "ok" ? "text-teal" : "text-danger"}`}
          role="alert"
        >
          {message}
        </p>
      )}
      {status === "error" ? (
        <p className="mt-6 text-center text-meta">
          <Link href="/login" className="font-semibold text-teal">
            Back to sign in
          </Link>
        </p>
      ) : null}
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <AuthShell title="Email verification">
          <p className="text-body text-ink/70">Loading…</p>
        </AuthShell>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
