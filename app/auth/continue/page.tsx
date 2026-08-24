"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardAppShellSkeleton } from "@/components/bandforge/dashboard/dashboard-shell-skeleton";
import { ProcessingOverlay } from "@/components/pricing/processing-overlay";
import { readDiagnosticLead } from "@/lib/diagnostic-lead";
import { syncDiagnosticLeadAfterAuth } from "@/lib/diagnostic-lead-sync";
import { readDiagnosticResults } from "@/lib/diagnostic-session";
import { isDiagnosticComplete, hasFullSkillProgram } from "@/lib/entitlement";
import { getLearningProfile } from "@/lib/learning-api";
import { getSubscription } from "@/lib/payments";
import { resetCheckoutResumeForPostAuth } from "@/lib/checkout-resume";
import {
  resolvePostLoginDestination,
  safePostLoginPath,
} from "@/lib/post-login-destination";

function PostLoginContinueInner() {
  const searchParams = useSearchParams();
  const requestedPath = safePostLoginPath(searchParams.get("next"));
  const wantsCheckout = requestedPath.includes("checkout=1");

  useEffect(() => {
    let cancelled = false;

    async function continueAfterLogin() {
      const snapshot = readDiagnosticResults();
      const lead = readDiagnosticLead();

      // Never block checkout return on lead/diagnostic sync
      if (snapshot && lead && !wantsCheckout) {
        await syncDiagnosticLeadAfterAuth(snapshot, lead).catch(() => undefined);
      } else if (snapshot && lead && wantsCheckout) {
        // Results page opens Razorpay immediately and syncs in the background
        void syncDiagnosticLeadAfterAuth(snapshot, lead).catch(() => undefined);
      }

      let hasServerDiagnostic = Boolean(snapshot);
      let hasPaidFullSkillProgram = false;

      if (wantsCheckout) {
        // Fast path: one subscription check so already-paid users skip Razorpay.
        try {
          const subscription = await getSubscription();
          hasPaidFullSkillProgram = hasFullSkillProgram(subscription);
        } catch {
          hasPaidFullSkillProgram = false;
        }
        if (cancelled) return;
        // New Google/auth return: drop sticky claim/suppress from earlier attempts.
        resetCheckoutResumeForPostAuth();
        window.location.replace(
          resolvePostLoginDestination(requestedPath, Boolean(snapshot), {
            hasServerDiagnostic,
            hasPaidFullSkillProgram,
          }),
        );
        return;
      }

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
  }, [requestedPath, wantsCheckout]);

  if (wantsCheckout) {
    return <ProcessingOverlay variant="creating" />;
  }

  return <DashboardAppShellSkeleton />;
}

export default function PostLoginContinuePage() {
  return (
    <Suspense fallback={<DashboardAppShellSkeleton />}>
      <PostLoginContinueInner />
    </Suspense>
  );
}
