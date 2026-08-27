"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardAppShellSkeleton } from "@/components/bandforge/dashboard/dashboard-shell-skeleton";
import { ProcessingOverlay } from "@/components/pricing/processing-overlay";
import { readDiagnosticLead } from "@/lib/diagnostic-lead";
import { syncDiagnosticLeadAfterAuth } from "@/lib/diagnostic-lead-sync";
import { readDiagnosticResults } from "@/lib/diagnostic-session";
import {
  hasFullSkillProgram,
  hasSpeakingSkillPlan,
  hasWritingSkillPlan,
  isDiagnosticComplete,
  postCheckoutDestination,
} from "@/lib/entitlement";
import { getLearningProfile } from "@/lib/learning-api";
import { getSubscription } from "@/lib/payments";
import { resetCheckoutResumeForPostAuth } from "@/lib/checkout-resume";
import {
  postLoginNeedsServerLookup,
  resolvePostLoginDestination,
  safePostLoginPath,
} from "@/lib/post-login-destination";

function skillCoursePathForSubscription(
  subscription: Awaited<ReturnType<typeof getSubscription>> | null,
): string | null {
  if (!subscription || hasFullSkillProgram(subscription)) return null;
  if (hasSpeakingSkillPlan(subscription) || hasWritingSkillPlan(subscription)) {
    const dest = postCheckoutDestination(subscription);
    return dest.startsWith("/practice/") ? dest : null;
  }
  return null;
}

function PostLoginContinueInner() {
  const searchParams = useSearchParams();
  const requestedPath = safePostLoginPath(searchParams.get("next"));
  const wantsCheckout = requestedPath.includes("checkout=1");
  const needsServerLookup = postLoginNeedsServerLookup(requestedPath);

  useEffect(() => {
    let cancelled = false;

    async function continueAfterLogin() {
      const snapshot = readDiagnosticResults();
      const lead = readDiagnosticLead();

      // Never block navigation on lead/diagnostic sync (includes getMe).
      if (snapshot && lead) {
        void syncDiagnosticLeadAfterAuth(snapshot, lead).catch(() => undefined);
      }

      // Mid-auth / explicit deep links (e.g. /diagnostic/writing): redirect now.
      if (!needsServerLookup) {
        if (cancelled) return;
        window.location.replace(
          resolvePostLoginDestination(requestedPath, Boolean(snapshot)),
        );
        return;
      }

      let hasServerDiagnostic = Boolean(snapshot);
      let hasPaidFullSkillProgram = false;
      let paidSkillCoursePath: string | null = null;

      if (wantsCheckout) {
        // Fast path: one subscription check so already-paid users skip Razorpay.
        try {
          const subscription = await getSubscription();
          hasPaidFullSkillProgram = hasFullSkillProgram(subscription);
          paidSkillCoursePath = skillCoursePathForSubscription(subscription);
        } catch {
          hasPaidFullSkillProgram = false;
          paidSkillCoursePath = null;
        }
        if (cancelled) return;
        // New Google/auth return: drop sticky claim/suppress from earlier attempts.
        resetCheckoutResumeForPostAuth();
        window.location.replace(
          resolvePostLoginDestination(requestedPath, Boolean(snapshot), {
            hasServerDiagnostic,
            hasPaidFullSkillProgram,
            paidSkillCoursePath,
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
          paidSkillCoursePath = skillCoursePathForSubscription(subscription);
        }
      } catch {
        /* offline / API — fall back to local diagnostic only */
      }

      if (cancelled) return;

      const destination = resolvePostLoginDestination(
        requestedPath,
        Boolean(snapshot),
        {
          hasServerDiagnostic,
          hasPaidFullSkillProgram,
          paidSkillCoursePath,
        },
      );

      window.location.replace(destination);
    }

    void continueAfterLogin();
    return () => {
      cancelled = true;
    };
  }, [requestedPath, wantsCheckout, needsServerLookup]);

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
