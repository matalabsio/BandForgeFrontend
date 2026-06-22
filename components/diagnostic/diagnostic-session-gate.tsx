"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ensureDiagnosticGuestSession } from "@/lib/diagnostic-session";

type Props = {
  children: ReactNode;
};

/** Ensures a guest JWT exists before diagnostic module APIs run. */
export function DiagnosticSessionGate({ children }: Props) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void ensureDiagnosticGuestSession()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not start session.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-6">
        <p className="text-center text-sm text-red-600" role="alert">
          {error}
        </p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
