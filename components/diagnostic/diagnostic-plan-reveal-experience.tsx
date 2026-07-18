"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, Sparkles, Target } from "lucide-react";
import { DiagnosticChrome } from "@/components/diagnostic/diagnostic-chrome";
import { DiagnosticBandGapCard } from "@/components/diagnostic/ui/diagnostic-band-gap-card";
import { DiagnosticPlanBundleCard } from "@/components/diagnostic/ui/diagnostic-plan-bundle-card";
import { DiagnosticPlanPreviewSection } from "@/components/diagnostic/ui/diagnostic-plan-preview-section";
import { DiagnosticSkillTags } from "@/components/diagnostic/ui/diagnostic-skill-tags";
import { DiagnosticStudyPlanLocked } from "@/components/diagnostic/ui/diagnostic-study-plan-locked";
import { DiagnosticTrustBadges } from "@/components/diagnostic/ui/diagnostic-trust-badges";
import { ProcessingOverlay } from "@/components/pricing/processing-overlay";
import { PaymentStatusModal } from "@/components/pricing/payment-status-modal";
import { diagnosticPaths } from "@/lib/diagnostic-catalog";
import { readDiagnosticLead } from "@/lib/diagnostic-lead";
import {
  isFullAccountUser,
  syncDiagnosticLeadAfterAuth,
} from "@/lib/diagnostic-lead-sync";
import {
  DIAGNOSTIC_STUDY_PLAN_WEEKS,
  formatPlanPriceInr,
  FULL_SKILL_PROGRAM,
  FULL_SKILL_PROGRAM_SLUG,
} from "@/lib/diagnostic-plan-content";
import {
  initialsFromName,
  overallBandGap,
  type SkillBands,
} from "@/lib/diagnostic-performance";
import {
  readDiagnosticResults,
  type DiagnosticResultsSnapshot,
} from "@/lib/diagnostic-session";
import { buildPlanPreview } from "@/lib/plan-preview";
import { ApiError } from "@/lib/api";
import { ensureSession, getMe, loginPathWithNext } from "@/lib/auth";
import {
  createOrder,
  getPlans,
  getSubscription,
  openRazorpayCheckout,
  paymentTraceLog,
  verifyPayment,
} from "@/lib/payments";
import { aggregateBand } from "@/lib/diagnostic-scoring";

function PlanRevealSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 rounded-2xl bg-navy/8" />
      <div className="h-16 rounded-2xl bg-navy/8" />
      <div className="h-48 rounded-2xl bg-navy/8" />
      <div className="h-40 rounded-2xl bg-navy/8" />
      <div className="space-y-4">
        <div className="h-32 rounded-2xl bg-navy/8" />
        <div className="h-28 rounded-2xl bg-navy/8" />
      </div>
    </div>
  );
}

function shortName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Student";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function formatExamDate(iso: string): string {
  try {
    return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

type SummaryBarProps = {
  studentName: string;
  initials: string;
  targetBand: number;
  examDate: string;
  daysToTest: number;
};

function DiagnosticPlanSummaryBar({
  studentName,
  initials,
  targetBand,
  examDate,
  daysToTest,
}: SummaryBarProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E8EDF3] bg-white shadow-[0_2px_12px_rgba(13,31,60,0.05)]">
      <div className="grid grid-cols-2 sm:grid-cols-4">
        <div className="flex flex-col items-center px-2.5 py-[11px] text-center sm:flex-row sm:items-center sm:gap-3 sm:px-5 sm:py-4 sm:text-left">
          <div className="mb-2 flex size-10 shrink-0 items-center justify-center rounded-full bg-[#0D1F3C] font-display text-[15px] font-bold text-white sm:mb-0">
            {initials}
          </div>
          <div>
            <p className="mb-0.5 text-[9.5px] font-medium tracking-[0.05em] text-[#94A3B8] uppercase sm:text-[11.5px]">
              Student
            </p>
            <p className="text-[13px] font-bold text-[#0D1F3C] sm:text-base sm:font-semibold">
              {shortName(studentName)}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center border-l border-[#EEF2F7] px-2.5 py-[11px] text-center sm:px-5 sm:py-4">
          <Target className="mb-1 size-4 text-[#0097A7] sm:hidden" />
          <p className="mb-0.5 text-[9.5px] font-medium tracking-[0.05em] text-[#94A3B8] uppercase">
            Target
          </p>
          <p className="text-[13px] font-bold text-[#0D1F3C]">
            Band{" "}
            <span className="font-mono font-medium text-[#0097A7]">
              {targetBand.toFixed(1)}
            </span>
          </p>
        </div>
        <div className="flex flex-col items-center border-t border-[#EEF2F7] px-2.5 py-[11px] text-center sm:border-t-0 sm:border-l sm:px-5 sm:py-4">
          <Calendar className="mb-1 size-4 text-[#0097A7] sm:hidden" />
          <p className="mb-0.5 text-[9.5px] font-medium tracking-[0.05em] text-[#94A3B8] uppercase">
            Exam date
          </p>
          <p className="text-[13px] font-bold text-[#0D1F3C]">{formatExamDate(examDate)}</p>
        </div>
        <div className="flex flex-col items-center border-t border-l border-[#EEF2F7] px-2.5 py-[11px] text-center sm:border-t-0 sm:px-5 sm:py-4">
          <p className="mb-0.5 text-[9.5px] font-medium tracking-[0.05em] text-[#94A3B8] uppercase">
            Days to test
          </p>
          <p className="font-mono text-[13px] font-bold text-[#0097A7]">{daysToTest}</p>
        </div>
      </div>
    </div>
  );
}

type OverlayState = null | "creating" | "verifying";
type StatusModal =
  | null
  | "cancelled"
  | "verify_failed"
  | "payments_disabled"
  | "checkout_unavailable"
  | "provider_misconfigured"
  | "session_expired"
  | "payment_failed";

export function DiagnosticPlanRevealExperience() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<DiagnosticResultsSnapshot | null>(null);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [planPrice, setPlanPrice] = useState("—");
  const [paymentsEnabled, setPaymentsEnabled] = useState(false);
  const [overlay, setOverlay] = useState<OverlayState>(null);
  const [statusModal, setStatusModal] = useState<StatusModal>(null);
  const [paymentFailureMessage, setPaymentFailureMessage] = useState<string | null>(
    null,
  );
  const [checkoutBusy, setCheckoutBusy] = useState(false);

  const lead = useMemo(() => readDiagnosticLead(), [snapshot]);
  const targetBand = lead?.targetBand ?? 7.0;
  const examDate = lead?.examDate ?? "";

  const pendingHuman = snapshot?.review_status === "pending_human";
  const effectiveWritingBand =
    snapshot?.writingEvaluation?.writing_band ?? snapshot?.writing_band ?? null;

  const skillBands: SkillBands = useMemo(
    () => ({
      listening: snapshot?.listening_band ?? null,
      reading: snapshot?.reading_band ?? null,
      writing: effectiveWritingBand,
      speaking: pendingHuman ? null : (snapshot?.speaking_band ?? null),
    }),
    [snapshot, effectiveWritingBand, pendingHuman],
  );

  const currentBand = useMemo(() => {
    if (!snapshot) return 0;
    if (snapshot.aggregate_band != null && snapshot.aggregate_band > 0) {
      return snapshot.aggregate_band;
    }
    const partial = aggregateBand(
      snapshot.listening_band,
      snapshot.reading_band,
      effectiveWritingBand,
      pendingHuman ? null : snapshot.speaking_band,
    );
    return partial ?? 0;
  }, [snapshot, effectiveWritingBand, pendingHuman]);

  const gap = overallBandGap(currentBand, targetBand);

  const planPreview = useMemo(() => {
    if (!examDate) return null;
    return buildPlanPreview({ bands: skillBands, target: targetBand, examDate });
  }, [skillBands, targetBand, examDate]);

  useEffect(() => {
    const cached = readDiagnosticResults();
    const currentLead = readDiagnosticLead();
    if (cached) setSnapshot(cached);

    (async () => {
      try {
        const [{ plans, payments_enabled: enabled }, sub, session] =
          await Promise.all([
            getPlans(),
            getSubscription().catch(() => ({ is_active: false })),
            ensureSession().catch(() => null),
          ]);

        const program = plans.find((p) => p.slug === FULL_SKILL_PROGRAM_SLUG);
        if (program) setPlanPrice(formatPlanPriceInr(program.amount));
        setPaymentsEnabled(enabled);
        setHasSubscription(Boolean(sub.is_active));

        if (session) {
          const user = await getMe().catch(() => null);
          const full = isFullAccountUser(user?.role);
          setIsLoggedIn(full);
          if (full && cached && currentLead) {
            await syncDiagnosticLeadAfterAuth(cached, currentLead);
          }
        }
      } finally {
        setLoading(false);
      }
    })();
    // Mount-only bootstrap — do not depend on `lead`/`snapshot` or setSnapshot
    // retriggers this effect and exceeds max update depth.
  }, []);

  const handleCheckout = useCallback(async () => {
    if (checkoutBusy || hasSubscription) return;
    setCheckoutBusy(true);
    setOverlay("creating");

    try {
      const session = await ensureSession();
      const user = session ? await getMe().catch(() => null) : null;
      if (!session || !isFullAccountUser(user?.role)) {
        setOverlay(null);
        setCheckoutBusy(false);
        router.push(loginPathWithNext(diagnosticPaths.planReveal));
        return;
      }

      if (snapshot && lead) {
        await syncDiagnosticLeadAfterAuth(snapshot, lead);
      }

      const order = await createOrder(FULL_SKILL_PROGRAM_SLUG);
      const opened = await openRazorpayCheckout({
        order,
        onSuccess: async (response) => {
          setOverlay("verifying");
          try {
            paymentTraceLog("CHECKOUT_SUCCESS", {
              order: response.razorpay_order_id,
              payment: response.razorpay_payment_id,
            });
            const result = await verifyPayment(response);
            if (result.subscription.is_active) {
              router.push("/checkout/success");
              return;
            }
            setOverlay(null);
            setPaymentFailureMessage(
              "Payment was received but the subscription was not activated.",
            );
            setStatusModal("verify_failed");
          } catch (e) {
            setOverlay(null);
            if (e instanceof ApiError && e.status === 401) {
              router.push(loginPathWithNext("/checkout/success"));
            } else {
              setPaymentFailureMessage(
                e instanceof ApiError ? e.message : "Could not verify payment.",
              );
              setStatusModal("verify_failed");
            }
          } finally {
            setCheckoutBusy(false);
          }
        },
        onDismiss: () => {
          setOverlay(null);
          setCheckoutBusy(false);
          setStatusModal("cancelled");
        },
        onFailed: (message) => {
          setOverlay(null);
          setCheckoutBusy(false);
          setPaymentFailureMessage(message);
          setStatusModal("payment_failed");
        },
      });

      if (!opened) {
        setOverlay(null);
        setCheckoutBusy(false);
        setStatusModal("checkout_unavailable");
      }
    } catch (e) {
      setOverlay(null);
      setCheckoutBusy(false);
      if (e instanceof ApiError && e.status === 401) {
        router.push(loginPathWithNext(diagnosticPaths.planReveal, true));
      } else if (e instanceof ApiError && e.status === 503) {
        setStatusModal("payments_disabled");
      } else {
        setStatusModal("verify_failed");
      }
    }
  }, [checkoutBusy, hasSubscription, lead, router, snapshot]);

  const studentName = lead?.fullName ?? "Student";
  const initials = initialsFromName(studentName);

  return (
    <DiagnosticChrome variant="report">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        {loading ? (
          <PlanRevealSkeleton />
        ) : !snapshot || !lead || !planPreview ? (
          <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-border-soft bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-[#5A6B82]">
              Complete the free diagnostic first to see your personalised study plan.
            </p>
            <Link
              href={diagnosticPaths.landing}
              className="inline-flex min-h-[var(--spacing-touch)] cursor-pointer items-center justify-center rounded-full bg-cyan px-6 text-sm font-semibold text-white hover:bg-brand-sky-hover"
            >
              Start diagnostic
            </Link>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <h1 className="font-display text-[26px] leading-[1.12] font-bold tracking-[-0.025em] text-[#0D1F3C] sm:text-[34px] sm:leading-tight">
              Your personalised study plan is ready.
            </h1>

            {!isLoggedIn ? (
              <div className="rounded-xl border border-[#B6E9F0] bg-[#E6F7FA] px-4 py-3 text-sm text-[#0E6E78]">
                Sign in to save your diagnostic scores and unlock checkout. Your
                preview below is built from your test results.
              </div>
            ) : null}

            <DiagnosticPlanSummaryBar
              studentName={studentName}
              initials={initials}
              targetBand={targetBand}
              examDate={examDate}
              daysToTest={planPreview.daysRemaining}
            />

            <DiagnosticBandGapCard
              bands={skillBands}
              currentBand={currentBand}
              targetBand={targetBand}
              gap={gap}
            />

            <DiagnosticSkillTags difficulty={planPreview.difficulty} />

            <DiagnosticPlanPreviewSection preview={planPreview} />

            <div className="flex items-center gap-2 rounded-xl border border-[#B6E9F0] bg-[#E6F7FA] px-3.5 py-2.5 sm:px-5 sm:py-3">
              <Sparkles className="size-4 shrink-0 text-[#0097A7] sm:size-[18px]" />
              <p className="text-[13px] leading-snug font-medium text-[#0E6E78] sm:text-[15px]">
                Based on your diagnostic, we recommend the{" "}
                <strong className="font-bold text-[#0D1F3C]">
                  Full Skill Program
                </strong>{" "}
                with focus on{" "}
                <strong className="font-bold text-[#0D1F3C]">
                  {planPreview.focusLabel}
                </strong>
                .
              </p>
            </div>

            <DiagnosticStudyPlanLocked
              weeks={DIAGNOSTIC_STUDY_PLAN_WEEKS}
              unlocked={hasSubscription}
            />

            <DiagnosticPlanBundleCard
              bundle={FULL_SKILL_PROGRAM}
              price={planPrice}
              onCheckout={handleCheckout}
              checkoutDisabled={hasSubscription || !paymentsEnabled}
              checkoutLoading={checkoutBusy}
            />

            {hasSubscription ? (
              <div className="text-center">
                <Link
                  href="/dashboard"
                  className="text-sm font-semibold text-[#0097A7] hover:underline"
                >
                  Go to your dashboard →
                </Link>
              </div>
            ) : null}

            <DiagnosticTrustBadges variant="plan" />
          </div>
        )}
      </div>

      {overlay ? <ProcessingOverlay variant={overlay} /> : null}
      {statusModal ? (
        <PaymentStatusModal
          variant={statusModal}
          detail={
            statusModal === "payment_failed" || statusModal === "verify_failed"
              ? paymentFailureMessage
              : null
          }
          onRetry={() => {
            setPaymentFailureMessage(null);
            setStatusModal(null);
          }}
          onClose={() => {
            setPaymentFailureMessage(null);
            setStatusModal(null);
          }}
        />
      ) : null}
    </DiagnosticChrome>
  );
}
