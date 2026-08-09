"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { BfEmptyState } from "@/components/bandforge/ui/bf-empty-state";
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
  navigateAfterCheckoutVerify,
  shouldSkipPaidBootstrapRedirectNow,
} from "@/lib/checkout-navigate-client";
import { hasFullSkillProgram } from "@/lib/entitlement";
import {
  createOrder,
  getPlans,
  getSubscription,
  openRazorpayCheckout,
  paymentTraceLog,
  pendingVerifyPayloadFromReceipt,
  readCheckoutReceiptContext,
  razorpayPaymentFailureDetail,
  saveCheckoutReceiptContext,
  verifyPayment,
} from "@/lib/payments";

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
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [snapshot] = useState<DiagnosticResultsSnapshot | null>(() =>
    readDiagnosticResults(),
  );
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [planPrice, setPlanPrice] = useState("—");
  const [overlay, setOverlay] = useState<OverlayState>(null);
  const [statusModal, setStatusModal] = useState<StatusModal>(null);
  const [paymentFailureMessage, setPaymentFailureMessage] = useState<string | null>(
    null,
  );
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const checkoutInFlightRef = useRef(false);

  const lead = readDiagnosticLead();
  const targetBand = lead?.targetBand ?? 7.0;
  const examDate = lead?.examDate ?? "";

  const effectiveWritingBand =
    snapshot?.writingEvaluation?.writing_band ?? snapshot?.writing_band ?? null;

  const skillBands: SkillBands = useMemo(
    () => ({
      listening: snapshot?.listening_band ?? null,
      reading: snapshot?.reading_band ?? null,
      writing: effectiveWritingBand,
      speaking: snapshot?.speaking_band ?? null,
    }),
    [snapshot, effectiveWritingBand],
  );

  const planPreview = useMemo(() => {
    if (!examDate) return null;
    return buildPlanPreview({ bands: skillBands, target: targetBand, examDate });
  }, [skillBands, targetBand, examDate]);

  useEffect(() => {
    const currentLead = readDiagnosticLead();

    (async () => {
      try {
        const [plansRes, sub, session] = await Promise.all([
          getPlans().catch(() => null),
          getSubscription().catch(() => null),
          ensureSession().catch(() => null),
        ]);

        if (plansRes) {
          const program = plansRes.plans.find(
            (p) => p.slug === FULL_SKILL_PROGRAM_SLUG,
          );
          if (program) setPlanPrice(formatPlanPriceInr(program.amount));
        }
        const subscribed = hasFullSkillProgram(sub);
        setHasSubscription(subscribed);
        if (
          subscribed &&
          !shouldSkipPaidBootstrapRedirectNow({
            checkoutInFlight: checkoutInFlightRef.current,
          })
        ) {
          router.replace("/dashboard");
          return;
        }

        if (session) {
          const user = await getMe().catch(() => null);
          const full = isFullAccountUser(user?.role);
          setIsLoggedIn(full);
          if (full && snapshot && currentLead) {
            await syncDiagnosticLeadAfterAuth(snapshot, currentLead);
          }
        }
      } finally {
        setLoading(false);
        setCheckingAccess(false);
      }
    })();
    // Bootstrap is stable because the diagnostic snapshot is captured once on mount.
  }, [router, snapshot]);

  const handleCheckout = useCallback(async () => {
    if (checkoutInFlightRef.current || checkoutBusy || hasSubscription) return;
    checkoutInFlightRef.current = true;
    setCheckoutBusy(true);
    setOverlay("creating");

    const clearBusy = () => {
      checkoutInFlightRef.current = false;
      setCheckoutBusy(false);
    };

    try {
      const session = await ensureSession();
      const user = session ? await getMe().catch(() => null) : null;
      if (!session || !isFullAccountUser(user?.role)) {
        setOverlay(null);
        clearBusy();
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
          saveCheckoutReceiptContext({
            order_id: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            plan_name: order.plan_name,
            amount: order.amount,
            currency: order.currency,
          });
          setOverlay("verifying");
          try {
            paymentTraceLog("CHECKOUT_SUCCESS", {
              order: response.razorpay_order_id,
              payment: response.razorpay_payment_id,
            });
            await verifyPayment(response);
            navigateAfterCheckoutVerify({ router, verifyOk: true });
          } catch (e) {
            setOverlay(null);
            if (e instanceof ApiError && e.status === 401) {
              router.push(loginPathWithNext("/checkout/success"));
            } else if (
              navigateAfterCheckoutVerify({
                router,
                verifyOk: false,
                hasReceipt: true,
              })
            ) {
              return;
            } else {
              setPaymentFailureMessage(
                e instanceof ApiError ? e.message : "Could not verify payment.",
              );
              setStatusModal("verify_failed");
            }
          } finally {
            clearBusy();
          }
        },
        onDismiss: () => {
          setOverlay(null);
          clearBusy();
          setStatusModal("cancelled");
        },
        onFailed: (message) => {
          setOverlay(null);
          clearBusy();
          setPaymentFailureMessage(razorpayPaymentFailureDetail(message));
          setStatusModal("payment_failed");
        },
      });

      if (opened) {
        setOverlay(null);
      } else {
        setOverlay(null);
        clearBusy();
        setStatusModal("checkout_unavailable");
      }
    } catch (e) {
      setOverlay(null);
      clearBusy();
      if (e instanceof ApiError && e.status === 401) {
        router.push(loginPathWithNext(diagnosticPaths.planReveal, true));
      } else if (e instanceof ApiError && e.status === 503) {
        setStatusModal("payments_disabled");
      } else {
        setStatusModal("verify_failed");
      }
    }
  }, [checkoutBusy, hasSubscription, lead, router, snapshot]);

  const handleVerifyRetry = useCallback(async () => {
    const pending = readCheckoutReceiptContext();
    const payload = pending ? pendingVerifyPayloadFromReceipt(pending) : null;
    if (!payload) {
      setPaymentFailureMessage(null);
      setStatusModal(null);
      return;
    }
    setPaymentFailureMessage(null);
    setStatusModal(null);
    checkoutInFlightRef.current = true;
    setCheckoutBusy(true);
    setOverlay("verifying");
    try {
      await verifyPayment(payload);
      navigateAfterCheckoutVerify({ router, verifyOk: true });
    } catch (e) {
      setOverlay(null);
      if (e instanceof ApiError && e.status === 401) {
        router.push(loginPathWithNext("/checkout/success"));
      } else if (
        navigateAfterCheckoutVerify({
          router,
          verifyOk: false,
          hasReceipt: true,
        })
      ) {
        return;
      } else {
        setPaymentFailureMessage(
          e instanceof ApiError ? e.message : "Could not verify payment.",
        );
        setStatusModal("verify_failed");
      }
    } finally {
      checkoutInFlightRef.current = false;
      setCheckoutBusy(false);
    }
  }, [router]);

  const studentName = lead?.fullName ?? "Student";
  const initials = initialsFromName(studentName);

  return (
    <DiagnosticChrome variant="report">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        {loading || checkingAccess ? (
          <PlanRevealSkeleton />
        ) : !snapshot || !lead || !planPreview ? (
          <BfEmptyState
            variant="no-tests"
            className="mx-auto max-w-lg"
            secondaryLabel="Back to dashboard"
            secondaryHref="/dashboard"
          />
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

            <DiagnosticBandGapCard bands={skillBands} targetBand={targetBand} />

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
              checkoutDisabled={hasSubscription}
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
            if (statusModal === "verify_failed") {
              void handleVerifyRetry();
              return;
            }
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
