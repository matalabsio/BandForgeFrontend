"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardAppShellSkeleton } from "@/components/bandforge/dashboard/dashboard-shell-skeleton";
import { readDiagnosticLead } from "@/lib/diagnostic-lead";
import { syncDiagnosticLeadAfterAuth } from "@/lib/diagnostic-lead-sync";
import { readDiagnosticResults } from "@/lib/diagnostic-session";
import {
  resolvePostLoginDestination,
  safePostLoginPath,
} from "@/lib/post-login-destination";

function PostLoginContinueInner() {
  const searchParams = useSearchParams();
  const requestedPath = safePostLoginPath(searchParams.get("next"));

  useEffect(() => {
    let cancelled = false;

    async function continueAfterLogin() {
      const snapshot = readDiagnosticResults();
      const lead = readDiagnosticLead();
      const destination = resolvePostLoginDestination(
        requestedPath,
        Boolean(snapshot),
      );

      if (snapshot && lead) {
        await syncDiagnosticLeadAfterAuth(snapshot, lead).catch(() => undefined);
      }

      if (!cancelled) {
        window.location.replace(destination);
      }
    }

    void continueAfterLogin();
    return () => {
      cancelled = true;
    };
  }, [requestedPath]);

  return <DashboardAppShellSkeleton />;
}

export default function PostLoginContinuePage() {
  return (
    <Suspense fallback={<DashboardAppShellSkeleton />}>
      <PostLoginContinueInner />
    </Suspense>
  );
}
