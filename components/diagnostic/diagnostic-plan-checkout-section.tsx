"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DiagnosticBandGapCard } from "@/components/diagnostic/ui/diagnostic-band-gap-card";
import { DiagnosticPlanBundleCard } from "@/components/diagnostic/ui/diagnostic-plan-bundle-card";
import { DiagnosticPersonalizedBlurLock } from "@/components/diagnostic/ui/diagnostic-personalized-blur-lock";
import { DiagnosticPlanTeaserContent } from "@/components/diagnostic/ui/diagnostic-plan-teaser-content";
import { DiagnosticTrustBadges } from "@/components/diagnostic/ui/diagnostic-trust-badges";
import { ProcessingOverlay } from "@/components/pricing/processing-overlay";
import { PaymentStatusModal } from "@/components/pricing/payment-status-modal";
import { diagnosticPaths } from "@/lib/diagnostic-catalog";
import { bfPrimaryCtaNavClass } from "@/components/bandforge/bf-primary-cta-styles";
import { cn } from "@/lib/utils";
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
import type { SkillBands } from "@/lib/diagnostic-performance";
import type { DiagnosticResultsSnapshot } from "@/lib/diagnostic-session";
import { buildPlanPreview } from "@/lib/plan-preview";
import { ApiError } from "@/lib/api";
import { ensureSession, getMe, loginPathWithNext } from "@/lib/auth";
import {
  DIAGNOSTIC_CHECKOUT_RETURN_PATH,
  clearPendingCheckoutResume,
  releaseCheckoutOpeningLock,
  setPendingCheckoutResume,
  shouldResumeDiagnosticCheckout,
  tryAcquireCheckoutOpeningLock,
} from "@/lib/checkout-resume";
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

type Props = {
  snapshot: DiagnosticResultsSnapshot;
  /** Skill-by-skill section — always visible above the plan teaser. */
  skillsSection?: ReactNode;
  /**
   * Post-login checkout resume: hide results chrome and keep a solid loader
   * until Razorpay opens or the attempt settles (cancel / fail).
   */
  resumeGate?: boolean;
  onResumeSettled?: () => void;
};

/** Survives React Strict Mode remount so post-login Razorpay opens once. */
let diagnosticCheckoutResumeClaimed = false;

/**
 * Gap → skills → blurred plan → offer → trust + in-page Razorpay checkout.
 * Mounted on `/diagnostic/results` as one seamless SPA.
 */
export function DiagnosticPlanCheckoutSection({
  snapshot,
  skillsSection,
  resumeGate = false,
  onResumeSettled,
}: Props) {
  const router = useRouter();
  const [bootstrapping, setBootstrapping] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [planPrice, setPlanPrice] = useState("—");
  const [paymentsEnabled, setPaymentsEnabled] = useState(false);
  // Start null/false so SSR matches hydration; resume effect sets these after mount.
  const [overlay, setOverlay] = useState<OverlayState>(null);
  const [statusModal, setStatusModal] = useState<StatusModal>(null);
  const [paymentFailureMessage, setPaymentFailureMessage] = useState<string | null>(
    null,
  );
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const checkoutInFlightRef = useRef(false);
  const autoCheckoutStartedRef = useRef(false);

  const redirectToLoginForCheckout = useCallback(
    (sessionExpired = false) => {
      setPendingCheckoutResume({
        planSlug: FULL_SKILL_PROGRAM_SLUG,
        returnTo: DIAGNOSTIC_CHECKOUT_RETURN_PATH,
      });
      router.push(
        loginPathWithNext(DIAGNOSTIC_CHECKOUT_RETURN_PATH, sessionExpired),
      );
    },
    [router],
  );

  const forceLockThenRefresh = useCallback(() => {
    setHasSubscription(false);
    void (async () => {
      try {
        const sub = await getSubscription();
        setHasSubscription(hasFullSkillProgram(sub));
      } catch {
        setHasSubscription(false);
      }
    })();
  }, []);

  const lead = readDiagnosticLead();
  const targetBand = lead?.targetBand ?? 7.0;
  const examDate = lead?.examDate ?? "";

  const effectiveWritingBand =
    snapshot.writingEvaluation?.writing_band ?? snapshot.writing_band ?? null;

  const skillBands: SkillBands = useMemo(
    () => ({
      listening: snapshot.listening_band ?? null,
      reading: snapshot.reading_band ?? null,
      writing: effectiveWritingBand,
      speaking: snapshot.speaking_band ?? null,
    }),
    [snapshot, effectiveWritingBand],
  );

  const planPreview = useMemo(() => {
    if (!examDate) return null;
    return buildPlanPreview({ bands: skillBands, target: targetBand, examDate });
  }, [skillBands, targetBand, examDate]);

  useEffect(() => {
    const currentLead = readDiagnosticLead();
    let cancelled = false;

    (async () => {
      try {
        const [{ plans, payments_enabled: enabled }, sub, session] =
          await Promise.all([
            getPlans(),
            getSubscription().catch(() => null),
            ensureSession().catch(() => null),
          ]);
        if (cancelled) return;

        const program = plans.find((p) => p.slug === FULL_SKILL_PROGRAM_SLUG);
        if (program) setPlanPrice(formatPlanPriceInr(program.amount));
        setPaymentsEnabled(enabled);
        setHasSubscription(hasFullSkillProgram(sub));

        if (session) {
          const user = await getMe().catch(() => null);
          if (cancelled) return;
          const full = isFullAccountUser(user?.role);
          setIsLoggedIn(full);
          if (full && currentLead && !diagnosticCheckoutResumeClaimed) {
            void syncDiagnosticLeadAfterAuth(snapshot, currentLead);
          }
        }
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [snapshot]);

  const handleCheckout = useCallback(async () => {
    if (checkoutInFlightRef.current || checkoutBusy || hasSubscription) return;
    checkoutInFlightRef.current = true;
    setCheckoutBusy(true);
    setOverlay("creating");

    const clearBusy = () => {
      checkoutInFlightRef.current = false;
      setCheckoutBusy(false);
      releaseCheckoutOpeningLock();
    };

    try {
      const session = await ensureSession();
      const user = session ? await getMe().catch(() => null) : null;
      if (!session || !isFullAccountUser(user?.role)) {
        setOverlay(null);
        clearBusy();
        redirectToLoginForCheckout();
        return;
      }

      const currentLead = readDiagnosticLead();
      if (currentLead) {
        void syncDiagnosticLeadAfterAuth(snapshot, currentLead);
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
            const result = await verifyPayment(response);
            if (hasFullSkillProgram(result.subscription)) {
              router.replace("/checkout/success");
              return;
            }
            setOverlay(null);
            setHasSubscription(false);
            setPaymentFailureMessage(
              "Payment was received but the subscription was not activated.",
            );
            setStatusModal("verify_failed");
          } catch (e) {
            setOverlay(null);
            setHasSubscription(false);
            if (e instanceof ApiError && e.status === 401) {
              router.push(loginPathWithNext("/checkout/success"));
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
          forceLockThenRefresh();
          setStatusModal("cancelled");
        },
        onFailed: (message) => {
          setOverlay(null);
          clearBusy();
          forceLockThenRefresh();
          setPaymentFailureMessage(razorpayPaymentFailureDetail(message));
          setStatusModal("payment_failed");
        },
      });

      if (opened) {
        // Razorpay modal owns the UI — drop our loader so it does not stack underneath.
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
        redirectToLoginForCheckout(true);
      } else if (e instanceof ApiError && e.status === 503) {
        setStatusModal("payments_disabled");
      } else {
        setStatusModal("verify_failed");
      }
    }
  }, [
    checkoutBusy,
    forceLockThenRefresh,
    hasSubscription,
    redirectToLoginForCheckout,
    router,
    snapshot,
  ]);

  const settleResumeGate = useCallback(() => {
    onResumeSettled?.();
    try {
      window.history.replaceState(null, "", diagnosticPaths.results);
    } catch {
      /* ignore */
    }
  }, [onResumeSettled]);

  useEffect(() => {
    if (diagnosticCheckoutResumeClaimed || autoCheckoutStartedRef.current) {
      return;
    }
    if (!shouldResumeDiagnosticCheckout()) return;
    if (!tryAcquireCheckoutOpeningLock()) return;

    diagnosticCheckoutResumeClaimed = true;
    autoCheckoutStartedRef.current = true;
    clearPendingCheckoutResume();

    setOverlay("creating");
    setCheckoutBusy(true);
    checkoutInFlightRef.current = true;

    void (async () => {
      const clearBusy = () => {
        checkoutInFlightRef.current = false;
        setCheckoutBusy(false);
        releaseCheckoutOpeningLock();
      };

      try {
        const session = await ensureSession();
        const user = session ? await getMe().catch(() => null) : null;

        if (!session || !isFullAccountUser(user?.role)) {
          setOverlay(null);
          clearBusy();
          settleResumeGate();
          redirectToLoginForCheckout();
          return;
        }

        setIsLoggedIn(true);

        const currentLead = readDiagnosticLead();
        if (currentLead) {
          void syncDiagnosticLeadAfterAuth(snapshot, currentLead);
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
              const result = await verifyPayment(response);
              if (hasFullSkillProgram(result.subscription)) {
                router.replace("/checkout/success");
                return;
              }
              setOverlay(null);
              setHasSubscription(false);
              setPaymentFailureMessage(
                "Payment was received but the subscription was not activated.",
              );
              setStatusModal("verify_failed");
              settleResumeGate();
            } catch (e) {
              setOverlay(null);
              setHasSubscription(false);
              if (e instanceof ApiError && e.status === 401) {
                router.push(loginPathWithNext("/checkout/success"));
              } else {
                setPaymentFailureMessage(
                  e instanceof ApiError ? e.message : "Could not verify payment.",
                );
                setStatusModal("verify_failed");
                settleResumeGate();
              }
            } finally {
              clearBusy();
            }
          },
          onDismiss: () => {
            setOverlay(null);
            clearBusy();
            forceLockThenRefresh();
            if (resumeGate) {
              settleResumeGate();
            } else {
              setStatusModal("cancelled");
            }
          },
          onFailed: (message) => {
            setOverlay(null);
            clearBusy();
            forceLockThenRefresh();
            setPaymentFailureMessage(razorpayPaymentFailureDetail(message));
            setStatusModal("payment_failed");
            // Keep resumeGate until retry succeeds or the user closes the modal.
          },
        });

        if (opened) {
          // Keep solid backdrop behind Razorpay — do not reveal results yet.
          setOverlay(null);
        } else {
          setOverlay(null);
          clearBusy();
          if (resumeGate) {
            settleResumeGate();
          } else {
            setStatusModal("checkout_unavailable");
          }
        }
      } catch (e) {
        setOverlay(null);
        clearBusy();
        if (e instanceof ApiError && e.status === 401) {
          settleResumeGate();
          redirectToLoginForCheckout(true);
        } else if (e instanceof ApiError && e.status === 503) {
          if (resumeGate) {
            settleResumeGate();
          } else {
            setStatusModal("payments_disabled");
          }
        } else if (resumeGate) {
          settleResumeGate();
        } else {
          setStatusModal("verify_failed");
        }
      }
    })();
  }, [
    forceLockThenRefresh,
    redirectToLoginForCheckout,
    resumeGate,
    router,
    settleResumeGate,
    snapshot,
  ]);

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
      const result = await verifyPayment(payload);
      if (hasFullSkillProgram(result.subscription)) {
        router.replace("/checkout/success");
        return;
      }
      setOverlay(null);
      setHasSubscription(false);
      setPaymentFailureMessage(
        "Payment was received but the subscription was not activated.",
      );
      setStatusModal("verify_failed");
    } catch (e) {
      setOverlay(null);
      setHasSubscription(false);
      if (e instanceof ApiError && e.status === 401) {
        router.push(loginPathWithNext("/checkout/success"));
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

  const checkoutChrome = (
    <>
      {overlay ? (
        <ProcessingOverlay variant={overlay} />
      ) : resumeGate && checkoutBusy ? (
        // Solid backdrop while Razorpay modal is open — never flash results.
        <div
          className="fixed inset-0 z-[100] bg-[#F7F8FA]"
          aria-hidden
        />
      ) : null}
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
            if (statusModal === "cancelled" || statusModal === "payment_failed") {
              setPaymentFailureMessage(null);
              setStatusModal(null);
              void handleCheckout();
              return;
            }
            setPaymentFailureMessage(null);
            setStatusModal(null);
          }}
          onClose={() => {
            setPaymentFailureMessage(null);
            setStatusModal(null);
            if (resumeGate) {
              settleResumeGate();
            }
          }}
        />
      ) : null}
    </>
  );

  if (resumeGate) {
    return checkoutChrome;
  }

  if (!lead || !examDate || !planPreview) {
    return (
      <>
        <div className="space-y-8 sm:space-y-10">
          {skillsSection}
          <div className="rounded-2xl border border-border-soft bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-[#5A6B82]">
              Complete the free diagnostic lead details to unlock your personalised
              plan preview.
            </p>
            <Link
              href={diagnosticPaths.landing}
              className={cn(bfPrimaryCtaNavClass, "mx-auto mt-4")}
            >
              Back to diagnostic
            </Link>
          </div>
        </div>
        {checkoutChrome}
      </>
    );
  }

  if (bootstrapping) {
    return (
      <>
        <div className="space-y-8 sm:space-y-10">
          <div className="h-28 animate-pulse rounded-2xl bg-navy/8" />
          {skillsSection}
          <div className="h-48 animate-pulse rounded-2xl bg-navy/8" />
          <div className="h-56 animate-pulse rounded-2xl bg-navy/8" />
        </div>
        {checkoutChrome}
      </>
    );
  }

  const daysToExam = planPreview.daysRemaining;

  return (
    <>
      <div className="min-w-0 space-y-8 overflow-x-clip sm:space-y-10">
        <DiagnosticBandGapCard
          bands={skillBands}
          targetBand={targetBand}
          variant="navy"
          daysToExam={daysToExam}
        />

        {skillsSection}

        <section className="overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white p-5 sm:rounded-[16px] sm:p-8">
          <h2 className="font-display text-[20px] leading-tight font-bold tracking-[-0.02em] text-[#0B1B33] sm:text-[22px]">
            Your personalised plan to reach Band {targetBand.toFixed(1)}
          </h2>
          <p className="mt-1.5 mb-5 text-[13px] leading-relaxed text-[#4B5568] sm:mb-6 sm:text-[15px]">
            Built from your diagnostic — week-by-week, skill-by-skill.
          </p>

          <DiagnosticPersonalizedBlurLock
            unlocked={hasSubscription}
            onUnlock={() => void handleCheckout()}
            unlockBusy={checkoutBusy}
            unlockDisabled={hasSubscription || !paymentsEnabled}
            title="Purchase your plan to unlock it"
            subtitle="Difficulty tags, day split, and week-by-week path stay private until checkout."
            ctaLabel="Start my plan →"
          >
            {hasSubscription ? (
              <DiagnosticPlanTeaserContent weeks={DIAGNOSTIC_STUDY_PLAN_WEEKS} />
            ) : (
              <DiagnosticPlanTeaserContent placeholder />
            )}
          </DiagnosticPersonalizedBlurLock>
        </section>

        <section
          id="plan-unlock"
          className="scroll-mt-4 space-y-4 sm:scroll-mt-6 sm:space-y-5"
        >
          {!isLoggedIn ? (
            <div className="rounded-xl border border-[#B6E9F0] bg-[#E6F7FA] px-4 py-3 text-sm text-[#0E6E78]">
              <Link
                href={loginPathWithNext(DIAGNOSTIC_CHECKOUT_RETURN_PATH)}
                onClick={() =>
                  setPendingCheckoutResume({
                    planSlug: FULL_SKILL_PROGRAM_SLUG,
                    returnTo: DIAGNOSTIC_CHECKOUT_RETURN_PATH,
                  })
                }
                className="cursor-pointer font-semibold text-[#0097A7] underline-offset-2 hover:underline"
              >
                Sign in
              </Link>{" "}
              to save your diagnostic scores and unlock checkout.
            </div>
          ) : null}

          <DiagnosticPlanBundleCard
            bundle={FULL_SKILL_PROGRAM}
            price={planPrice}
            onCheckout={() => void handleCheckout()}
            checkoutDisabled={hasSubscription || !paymentsEnabled}
            checkoutLoading={checkoutBusy}
          />

          {hasSubscription ? (
            <div className="text-center">
              <Link
                href="/dashboard"
                className="cursor-pointer text-sm font-semibold text-[#0097A7] hover:underline"
              >
                Go to your dashboard →
              </Link>
            </div>
          ) : null}

          <DiagnosticTrustBadges variant="plan" />
        </section>
      </div>
      {checkoutChrome}
    </>
  );
}
