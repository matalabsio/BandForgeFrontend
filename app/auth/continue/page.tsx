"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardAppShellSkeleton } from "@/components/bandforge/dashboard/dashboard-shell-skeleton";
import { readDiagnosticLead } from "@/lib/diagnostic-lead";
import { syncDiagnosticLeadAfterAuth } from "@/lib/diagnostic-lead-sync";
import { readDiagnosticResults } from "@/lib/diagnostic-session";
import { isDiagnosticComplete, hasFullSkillProgram } from "@/lib/entitlement";
import { getLearningProfile } from "@/lib/learning-api";
import { getSubscription } from "@/lib/payments";
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

      if (snapshot && lead) {
        await syncDiagnosticLeadAfterAuth(snapshot, lead).catch(() => undefined);
      }

      let hasServerDiagnostic = false;
      let hasPaidFullSkillProgram = false;

      try {
        const [profile, subscription] = await Promise.all([
          getLearningProfile().catch(() => null),
          getSubscription().catch(() => null),
        ]);
        if (profile) {
          hasServerDiagnostic = isDiagnosticComplete(profile);
        }
        if (subscription) {
          hasPaidFullSkillProgram = hasFullSkillProgram(subscription);
        }
      } catch {
        /* offline / API — fall back to local diagnostic only */
      }

      if (cancelled) return;

      const destination = resolvePostLoginDestination(
        requestedPath,
        Boolean(snapshot),
        { hasServerDiagnostic, hasPaidFullSkillProgram },
      );

      window.location.replace(destination);
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
