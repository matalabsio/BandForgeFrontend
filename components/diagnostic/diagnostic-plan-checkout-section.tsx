"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DiagnosticBandGapCard } from "@/components/diagnostic/ui/diagnostic-band-gap-card";
import { DiagnosticMultiSkuOffer } from "@/components/diagnostic/ui/diagnostic-multi-sku-offer";
import { DiagnosticPlanBundleCard } from "@/components/diagnostic/ui/diagnostic-plan-bundle-card";
import { DiagnosticPersonalizedBlurLock } from "@/components/diagnostic/ui/diagnostic-personalized-blur-lock";
import { DiagnosticPlanTeaserContent } from "@/components/diagnostic/ui/diagnostic-plan-teaser-content";
import { DiagnosticTrustBadges } from "@/components/diagnostic/ui/diagnostic-trust-badges";
import { ProcessingOverlay } from "@/components/pricing/processing-overlay";
import { PaymentStatusModal } from "@/components/pricing/payment-status-modal";
import { CouponCodeField } from "@/components/pricing/coupon-code-field";
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
import {
  buildMultiSkuOfferView,
  type ActivePlanAmount,
} from "@/lib/diagnostic-sku-offer";
import { recommendSkuFromDiagnostic } from "@/lib/diagnostic-sku-recommend";
import { isDiagnosticMultiSkuRecommendEnabled } from "@/lib/flags";
import { buildPlanPreview } from "@/lib/plan-preview";
import { ApiError } from "@/lib/api";
import { ensureSession, ensureSessionForCheckout, getMe, loginPathWithNext } from "@/lib/auth";
import {
  destinationWhenPaidOnResultsNow,
  navigateAfterCheckoutVerify,
  navigateAfterCouponRedeem,
  shouldSkipPaidBootstrapRedirectNow,
} from "@/lib/checkout-navigate-client";
import {
  assertPlanSlugPurchasable,
  CheckoutPlanNotPurchasableError,
  destinationForEntitledPlanSlug,
  logDiagnosticSkuCheckoutClick,
  logDiagnosticSkuPurchased,
  logDiagnosticSkuRecommended,
  resolveDiagnosticCheckoutSlug,
  userAlreadyEntitledToPlanSlug,
  type DiagnosticCheckoutSlug,
} from "@/lib/diagnostic-checkout";
import { decideDiagnosticCheckoutAuthGate } from "@/lib/diagnostic-checkout-auth";
import {
  DIAGNOSTIC_CHECKOUT_RETURN_PATH,
  abandonCheckoutResume,
  clearCheckoutAttemptLive,
  clearCheckoutResumeClaimed,
  clearCheckoutResumeAutoOpenSuppress,
  clearPendingCheckoutResume,
  clearStaleCheckoutAutoOpenSuppress,
  consumeCheckoutResumeSoftFailModal,
  consumePendingCheckoutResume,
  decideCheckoutResumeStart,
  ensureDiagnosticCheckoutQueryIfPending,
  isCheckoutAttemptLive,
  isCheckoutResumeAutoOpenSuppressed,
  isCheckoutResumeClaimed,
  markCheckoutAttemptLive,
  markCheckoutResumeClaimed,
  prepareCheckoutResumeRetry,
  releaseCheckoutOpeningLock,
  releaseStaleCheckoutOpeningLockIfIdle,
  setPendingCheckoutResume,
  shouldResumeDiagnosticCheckout,
  stashCheckoutResumeSoftFailModal,
  stripCheckoutQueryFromResultsUrl,
  tryAcquireCheckoutOpeningLock,
  type CheckoutResumeSoftFailModal,
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
  redeemCoupon,
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
   * until Razorpay opens or the attempt soft-settles (dismiss / fail with retry).
   */
  resumeGate?: boolean;
  onResumeSettled?: () => void;
};

function isRazorpayAuthMisconfig(error: ApiError): boolean {
  return (
    error.status === 503 &&
    /authentication failed|razorpay api authentication|api key has expired/i.test(
      error.message,
    )
  );
}

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
  const [planPrice, setPlanPrice] = useState("—");
  const [activePlans, setActivePlans] = useState<ActivePlanAmount[]>([]);
  const multiSkuEnabled = isDiagnosticMultiSkuRecommendEnabled();
  // Start null/false so SSR matches hydration; resume effect sets these after mount.
  const [overlay, setOverlay] = useState<OverlayState>(null);
  const [overlayAmountPaise, setOverlayAmountPaise] = useState<
    number | undefined
  >();
  const [statusModal, setStatusModal] = useState<StatusModal>(null);
  const [paymentFailureMessage, setPaymentFailureMessage] = useState<string | null>(
    null,
  );
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const checkoutInFlightRef = useRef(false);
  const autoCheckoutStartedRef = useRef(false);
  const razorpayOpenRef = useRef(false);
  const activePlansRef = useRef<ActivePlanAmount[]>([]);
  const selectedCheckoutSlugRef = useRef<DiagnosticCheckoutSlug>(
    FULL_SKILL_PROGRAM_SLUG,
  );
  const recommendedLoggedRef = useRef(false);
  const executeCheckoutRef = useRef<
    (opts: {
      requestedSlug?: string | null;
      pendingResumeSlug?: string | null;
      wasPrimary?: boolean;
      resumeMode?: boolean;
    }) => Promise<void>
  >(async () => undefined);
  const onResumeSettledRef = useRef(onResumeSettled);
  onResumeSettledRef.current = onResumeSettled;

  useEffect(() => {
    activePlansRef.current = activePlans;
  }, [activePlans]);

  /** Session-expiry fallback only — never the normal mid-auth checkout path. */
  const redirectToLoginForCheckout = useCallback(
    (planSlug?: string) => {
      const slug = resolveDiagnosticCheckoutSlug({
        requestedSlug: planSlug ?? selectedCheckoutSlugRef.current,
        multiSkuEnabled,
      });
      selectedCheckoutSlugRef.current = slug;
      setPendingCheckoutResume({
        planSlug: slug,
        returnTo: DIAGNOSTIC_CHECKOUT_RETURN_PATH,
      });
      router.push(
        loginPathWithNext(DIAGNOSTIC_CHECKOUT_RETURN_PATH, true),
      );
    },
    [multiSkuEnabled, router],
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

  const skuRecommendation = useMemo(
    () =>
      recommendSkuFromDiagnostic({
        bands: skillBands,
        targetBand,
      }),
    [skillBands, targetBand],
  );

  const multiSkuOffer = useMemo(() => {
    if (!multiSkuEnabled) return null;
    return buildMultiSkuOfferView({
      recommendation: skuRecommendation,
      bands: skillBands,
      activePlans,
    });
  }, [multiSkuEnabled, skuRecommendation, skillBands, activePlans]);

  const attemptId = snapshot.mock_attempt_id;

  useEffect(() => {
    const currentLead = readDiagnosticLead();
    let cancelled = false;

    (async () => {
      try {
        const [plansRes, sub, session] = await Promise.all([
          getPlans().catch(() => null),
          getSubscription().catch(() => null),
          ensureSession().catch(() => null),
        ]);
        if (cancelled) return;

        if (plansRes) {
          setActivePlans(
            plansRes.plans.map((p) => ({ slug: p.slug, amount: p.amount })),
          );
          const program = plansRes.plans.find(
            (p) => p.slug === FULL_SKILL_PROGRAM_SLUG,
          );
          if (program) setPlanPrice(formatPlanPriceInr(program.amount));
        }
        const paid = hasFullSkillProgram(sub);
        setHasSubscription(paid);
        if (
          paid &&
          !shouldSkipPaidBootstrapRedirectNow({
            checkoutInFlight: checkoutInFlightRef.current,
          })
        ) {
          router.replace(destinationWhenPaidOnResultsNow());
          return;
        }

        if (session) {
          const user = await getMe().catch(() => null);
          if (cancelled) return;
          const full = isFullAccountUser(user?.role);
          // Continue already kicked off lead sync on the checkout fast path.
          if (full && currentLead && !resumeGate && !isCheckoutResumeClaimed()) {
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
    // Stabilize on attempt id — full snapshot identity changes after reconcile
    // and must not re-fire plans/sub/lead sync.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- snapshot via attemptId
  }, [resumeGate, router, attemptId]);

  /**
   * Drop the fullscreen resume gate. Soft fails keep ?checkout=1, restore
   * pending, and stash a modal so the remounted results view can show
   * Continue to payment. Hard leave strips the query.
   */
  const finishResumeGate = useCallback(
    (opts?: {
      stripQuery?: boolean;
      restorePendingSlug?: string | null;
      modal?: CheckoutResumeSoftFailModal;
      failureMessage?: string | null;
      /** Default true when showing a post-Razorpay card; false for pre-open settle. */
      suppressAutoOpen?: boolean;
    }) => {
      const slug =
        opts?.restorePendingSlug ?? selectedCheckoutSlugRef.current;
      if (opts?.stripQuery) {
        abandonCheckoutResume();
        stripCheckoutQueryFromResultsUrl();
        autoCheckoutStartedRef.current = false;
        onResumeSettled?.();
        return;
      }
      prepareCheckoutResumeRetry(slug || FULL_SKILL_PROGRAM_SLUG, {
        suppressAutoOpen: opts?.suppressAutoOpen !== false,
      });
      autoCheckoutStartedRef.current = false;
      if (opts?.modal) {
        stashCheckoutResumeSoftFailModal({
          modal: opts.modal,
          detail: opts.failureMessage ?? null,
        });
      }
      onResumeSettled?.();
    },
    [onResumeSettled],
  );

  /** Explicit "Back to results" from modal — leave checkout intent. */
  const leaveCheckoutToResults = useCallback(() => {
    abandonCheckoutResume();
    stripCheckoutQueryFromResultsUrl();
    autoCheckoutStartedRef.current = false;
    setPaymentFailureMessage(null);
    setStatusModal(null);
    onResumeSettled?.();
  }, [onResumeSettled]);

  // After soft-fail remount: surface Continue to payment on the results UI.
  useEffect(() => {
    if (resumeGate || bootstrapping) return;
    const soft = consumeCheckoutResumeSoftFailModal();
    if (!soft) return;
    setPaymentFailureMessage(soft.detail ?? null);
    setStatusModal(soft.modal);
  }, [bootstrapping, resumeGate]);

  useEffect(() => {
    if (!multiSkuEnabled || !multiSkuOffer || recommendedLoggedRef.current) return;
    recommendedLoggedRef.current = true;
    logDiagnosticSkuRecommended({
      primary: skuRecommendation.primary,
      weakSkills: skuRecommendation.weakSkills,
      targetBand,
      bands: skillBands,
    });
  }, [multiSkuEnabled, multiSkuOffer, skuRecommendation, skillBands, targetBand]);

  const executeCheckout = useCallback(
    async (opts: {
      requestedSlug?: string | null;
      pendingResumeSlug?: string | null;
      wasPrimary?: boolean;
      resumeMode?: boolean;
    }) => {
      // Instance + module live flags: remount must not start a second attempt
      // while create-order / Razorpay / verify still run on the prior instance.
      if (checkoutInFlightRef.current || isCheckoutAttemptLive()) {
        return;
      }
      if (hasSubscription) {
        if (opts.resumeMode) {
          finishResumeGate({ stripQuery: true });
        }
        return;
      }

      const checkoutSlug = resolveDiagnosticCheckoutSlug({
        requestedSlug: opts.requestedSlug,
        pendingResumeSlug: opts.pendingResumeSlug,
        multiSkuEnabled,
      });
      selectedCheckoutSlugRef.current = checkoutSlug;

      try {
        assertPlanSlugPurchasable(checkoutSlug, activePlansRef.current);
      } catch (e) {
        if (e instanceof CheckoutPlanNotPurchasableError) {
          setPaymentFailureMessage(e.message);
          if (opts.resumeMode) {
            finishResumeGate({
              restorePendingSlug: checkoutSlug,
              modal: "verify_failed",
              failureMessage: e.message,
            });
          } else {
            setStatusModal("verify_failed");
          }
          return;
        }
        throw e;
      }

      if (multiSkuEnabled) {
        logDiagnosticSkuCheckoutClick({
          slug: checkoutSlug,
          wasPrimary: opts.wasPrimary ?? false,
        });
      }

      checkoutInFlightRef.current = true;
      markCheckoutAttemptLive();
      setCheckoutBusy(true);
      const planAmount = activePlansRef.current.find(
        (p) => p.slug === checkoutSlug,
      )?.amount;
      setOverlayAmountPaise(planAmount);
      setOverlay("creating");

      const clearBusy = () => {
        checkoutInFlightRef.current = false;
        clearCheckoutAttemptLive();
        setCheckoutBusy(false);
        releaseCheckoutOpeningLock();
      };

      /** Soft-settle with card only after Razorpay was shown (or order created + open failed). */
      const softFailAfterRazorpay = (
        modal: CheckoutResumeSoftFailModal,
        failureMessage?: string | null,
      ) => {
        if (opts.resumeMode) {
          finishResumeGate({
            restorePendingSlug: checkoutSlug,
            modal,
            failureMessage: failureMessage ?? null,
          });
        } else {
          if (failureMessage) setPaymentFailureMessage(failureMessage);
          setStatusModal(modal);
        }
      };

      try {
        const session = await ensureSessionForCheckout();
        const user = session ? await getMe().catch(() => null) : null;
        const authGate = decideDiagnosticCheckoutAuthGate({
          hasSession: Boolean(session),
          role: user?.role,
        });
        if (authGate.kind === "session_expired") {
          setOverlay(null);
          clearBusy();
          // Suppress auto-open until login owns the flow; do not settle the
          // resume gate here or a remount will re-open checkout before navigate.
          prepareCheckoutResumeRetry(checkoutSlug, { suppressAutoOpen: true });
          redirectToLoginForCheckout(checkoutSlug);
          return;
        }

        const currentLead = readDiagnosticLead();
        if (currentLead) {
          // Await exam_date on profile before payment so FSP plan gen sees it.
          await syncDiagnosticLeadAfterAuth(snapshot, currentLead);
        }

        const existingSub = await getSubscription().catch(() => null);
        if (userAlreadyEntitledToPlanSlug(existingSub, checkoutSlug)) {
          setOverlay(null);
          clearBusy();
          clearPendingCheckoutResume();
          if (opts.resumeMode) {
            finishResumeGate({ stripQuery: true });
          }
          router.replace(destinationForEntitledPlanSlug(checkoutSlug));
          return;
        }

        const order = await createOrder(checkoutSlug);
        const opened = await openRazorpayCheckout({
          order,
          onSuccess: async (response) => {
            saveCheckoutReceiptContext({
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              plan_name: order.plan_name,
              plan_slug: checkoutSlug,
              amount: order.amount,
              currency: order.currency,
            });
            setOverlay("verifying");
            try {
              paymentTraceLog("CHECKOUT_SUCCESS", {
                order: response.razorpay_order_id,
                payment: response.razorpay_payment_id,
                plan_slug: checkoutSlug,
              });
              await verifyPayment(response);
              logDiagnosticSkuPurchased(checkoutSlug);
              razorpayOpenRef.current = false;
              // navigateAfterCheckoutVerify abandons resume + replaces success.
              navigateAfterCheckoutVerify({ router, verifyOk: true });
            } catch (e) {
              razorpayOpenRef.current = false;
              setOverlay(null);
              setHasSubscription(false);
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
                const msg =
                  e instanceof ApiError ? e.message : "Could not verify payment.";
                softFailAfterRazorpay("verify_failed", msg);
              }
            } finally {
              clearBusy();
            }
          },
          onDismiss: () => {
            razorpayOpenRef.current = false;
            setOverlay(null);
            clearBusy();
            forceLockThenRefresh();
            softFailAfterRazorpay("cancelled");
          },
          onFailed: (message) => {
            razorpayOpenRef.current = false;
            setOverlay(null);
            clearBusy();
            forceLockThenRefresh();
            softFailAfterRazorpay(
              "payment_failed",
              razorpayPaymentFailureDetail(message),
            );
          },
        });

        if (opened) {
          razorpayOpenRef.current = true;
          setOverlay(null);
        } else {
          setOverlay(null);
          clearBusy();
          softFailAfterRazorpay("checkout_unavailable");
        }
      } catch (e) {
        setOverlay(null);
        clearBusy();
        if (e instanceof ApiError && e.status === 401) {
          prepareCheckoutResumeRetry(checkoutSlug, { suppressAutoOpen: true });
          redirectToLoginForCheckout(checkoutSlug);
        } else if (e instanceof ApiError && e.status === 503) {
          const modal = isRazorpayAuthMisconfig(e)
            ? "provider_misconfigured"
            : "payments_disabled";
          if (opts.resumeMode) {
            finishResumeGate({
              restorePendingSlug: checkoutSlug,
              modal,
            });
          } else {
            setStatusModal(modal);
          }
        } else if (e instanceof CheckoutPlanNotPurchasableError) {
          if (opts.resumeMode) {
            finishResumeGate({
              restorePendingSlug: checkoutSlug,
              modal: "verify_failed",
              failureMessage: e.message,
            });
          } else {
            setPaymentFailureMessage(e.message);
            setStatusModal("verify_failed");
          }
        } else if (opts.resumeMode) {
          // Pre-Razorpay unexpected error: dedicated modal, allow auto-open after remount.
          finishResumeGate({
            restorePendingSlug: checkoutSlug,
            modal: "checkout_unavailable",
            failureMessage:
              e instanceof Error ? e.message : "Checkout could not start.",
            suppressAutoOpen: razorpayOpenRef.current,
          });
        } else {
          setStatusModal("verify_failed");
        }
      }
    },
    [
      finishResumeGate,
      forceLockThenRefresh,
      hasSubscription,
      multiSkuEnabled,
      redirectToLoginForCheckout,
      router,
      snapshot,
    ],
  );

  const handleCheckout = useCallback(
    (planSlug?: string, wasPrimary = false) => {
      clearCheckoutResumeAutoOpenSuppress();
      void executeCheckout({ requestedSlug: planSlug, wasPrimary });
    },
    [executeCheckout],
  );

  const handleRedeemCoupon = useCallback(
    async (code: string) => {
      if (checkoutInFlightRef.current || checkoutBusy || hasSubscription) return;
      // Diagnostic coupons always unlock Full Skill Program (personalized plan).
      const checkoutSlug = FULL_SKILL_PROGRAM_SLUG;
      selectedCheckoutSlugRef.current = checkoutSlug;

      checkoutInFlightRef.current = true;
      markCheckoutAttemptLive();
      setCheckoutBusy(true);
      setCouponError(null);
      setOverlay("verifying");
      setOverlayAmountPaise(0);

      const clearBusy = () => {
        checkoutInFlightRef.current = false;
        clearCheckoutAttemptLive();
        setCheckoutBusy(false);
      };

      try {
        const session = await ensureSessionForCheckout();
        if (!session) {
          setOverlay(null);
          clearBusy();
          prepareCheckoutResumeRetry(checkoutSlug, { suppressAutoOpen: true });
          redirectToLoginForCheckout(checkoutSlug);
          return;
        }
        const user = await getMe().catch(() => null);
        const authDecision = decideDiagnosticCheckoutAuthGate({
          hasSession: true,
          isFullAccount: isFullAccountUser(user?.role),
        });
        if (authDecision === "login") {
          setOverlay(null);
          clearBusy();
          prepareCheckoutResumeRetry(checkoutSlug, { suppressAutoOpen: true });
          redirectToLoginForCheckout(checkoutSlug);
          return;
        }

        // Don't block redeem on lead sync / subscription probe — those add seconds.
        const currentLead = readDiagnosticLead();
        if (currentLead) {
          void syncDiagnosticLeadAfterAuth(snapshot, currentLead);
        }

        const result = await redeemCoupon(checkoutSlug, code);
        paymentTraceLog("COUPON_REDEEM_SUCCESS", {
          plan_slug: checkoutSlug,
        });
        logDiagnosticSkuPurchased(checkoutSlug);
        clearPendingCheckoutResume();
        // Immediate hard nav to dashboard — do not wait on success page or soft router.
        navigateAfterCouponRedeem({
          router,
          subscription: result.subscription,
          planSlug: checkoutSlug,
        });
      } catch (e) {
        setOverlay(null);
        if (e instanceof ApiError && e.status === 401) {
          prepareCheckoutResumeRetry(checkoutSlug, { suppressAutoOpen: true });
          redirectToLoginForCheckout(checkoutSlug);
        } else if (e instanceof ApiError && e.status === 400) {
          setCouponError(e.message);
          clearBusy();
        } else if (e instanceof ApiError && e.status === 403) {
          setCouponError(e.message);
          clearBusy();
        } else {
          setCouponError(
            e instanceof ApiError
              ? e.message
              : "Could not apply coupon. Please try again.",
          );
          clearBusy();
        }
      }
      // On success, hard navigation unloads the page — skip clearBusy so overlay stays until leave.
    },
    [
      checkoutBusy,
      hasSubscription,
      redirectToLoginForCheckout,
      router,
      snapshot,
    ],
  );

  executeCheckoutRef.current = executeCheckout;

  useEffect(() => {
    ensureDiagnosticCheckoutQueryIfPending();

    if (bootstrapping) {
      // Keep the fullscreen gate visible; do NOT set checkoutBusy — that used
      // to make executeCheckout no-op after bootstrap and hang forever.
      return;
    }

    const shouldResume = shouldResumeDiagnosticCheckout();
    // While the fullscreen gate is up, drop sticky suppress + idle opening lock
    // from earlier false soft-fails / abandoned attempts.
    if (shouldResume && resumeGate) {
      clearStaleCheckoutAutoOpenSuppress();
      releaseStaleCheckoutOpeningLockIfIdle({
        checkoutInFlight:
          checkoutInFlightRef.current || isCheckoutAttemptLive(),
        razorpayOpen: razorpayOpenRef.current,
      });
    }
    const suppressed = isCheckoutResumeAutoOpenSuppressed();

    if (!shouldResume) {
      if (resumeGate) {
        onResumeSettledRef.current?.();
      }
      return;
    }

    if (suppressed) {
      // Soft-fail remount: keep ?checkout=1 + pending; wait for Continue CTA.
      if (resumeGate) {
        onResumeSettledRef.current?.();
      }
      return;
    }

    // Instance refs reset on remount; module-live survives create-order / Razorpay.
    const processLive =
      checkoutInFlightRef.current ||
      razorpayOpenRef.current ||
      isCheckoutAttemptLive();
    const claimed = isCheckoutResumeClaimed() || autoCheckoutStartedRef.current;

    // Never start a second attempt while any prior attempt is live.
    if (processLive) {
      return;
    }

    // Stale module claim with nothing live → recover so auto-open can run.
    if (claimed) {
      clearCheckoutResumeClaimed();
      autoCheckoutStartedRef.current = false;
    }

    const startCheckout = () => {
      clearCheckoutResumeAutoOpenSuppress();
      markCheckoutResumeClaimed();
      autoCheckoutStartedRef.current = true;
      const pending = consumePendingCheckoutResume();
      void executeCheckoutRef.current({
        pendingResumeSlug: pending?.planSlug,
        resumeMode: true,
      });
    };

    const lockAcquired = tryAcquireCheckoutOpeningLock();
    const decision = decideCheckoutResumeStart({
      bootstrapping: false,
      shouldResume: true,
      claimed: false,
      lockAcquired,
      autoOpenSuppressed: false,
    });

    if (decision === "wait_lock") {
      const t = window.setTimeout(() => {
        releaseCheckoutOpeningLock();
        if (!tryAcquireCheckoutOpeningLock()) {
          prepareCheckoutResumeRetry(selectedCheckoutSlugRef.current, {
            suppressAutoOpen: false,
          });
          autoCheckoutStartedRef.current = false;
          stashCheckoutResumeSoftFailModal({
            modal: "checkout_unavailable",
            detail: null,
          });
          onResumeSettledRef.current?.();
          return;
        }
        startCheckout();
      }, 400);
      return () => window.clearTimeout(t);
    }

    if (decision !== "start") {
      return;
    }

    startCheckout();
  }, [bootstrapping, resumeGate]);

  // Hard safety: never leave "Preparing secure checkout" forever.
  useEffect(() => {
    if (!resumeGate) return;
    const t = window.setTimeout(() => {
      if (
        razorpayOpenRef.current ||
        checkoutInFlightRef.current ||
        isCheckoutAttemptLive()
      ) {
        return;
      }
      prepareCheckoutResumeRetry(selectedCheckoutSlugRef.current, {
        suppressAutoOpen: true,
      });
      autoCheckoutStartedRef.current = false;
      clearCheckoutResumeClaimed();
      releaseCheckoutOpeningLock();
      stashCheckoutResumeSoftFailModal({
        modal: "checkout_unavailable",
        detail: "Checkout took too long to open. Tap Continue to try again.",
      });
      onResumeSettledRef.current?.();
    }, 12_000);
    return () => window.clearTimeout(t);
  }, [resumeGate]);

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
    markCheckoutAttemptLive();
    setCheckoutBusy(true);
    setOverlay("verifying");
    try {
      await verifyPayment(payload);
      navigateAfterCheckoutVerify({ router, verifyOk: true });
    } catch (e) {
      setOverlay(null);
      setHasSubscription(false);
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
      clearCheckoutAttemptLive();
      setCheckoutBusy(false);
    }
  }, [router]);

  const checkoutChrome = (
    <>
      {overlay ? (
        <ProcessingOverlay variant={overlay} amountPaise={overlayAmountPaise} />
      ) : resumeGate && !razorpayOpenRef.current ? (
        // Solid loader while resume is opening checkout — not while Razorpay is open.
        <ProcessingOverlay
          variant="creating"
          amountPaise={
            overlayAmountPaise ??
            activePlans.find(
              (p) => p.slug === selectedCheckoutSlugRef.current,
            )?.amount
          }
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
              const receipt = readCheckoutReceiptContext();
              if (receipt && pendingVerifyPayloadFromReceipt(receipt)) {
                void handleVerifyRetry();
                return;
              }
              setPaymentFailureMessage(null);
              setStatusModal(null);
              void handleCheckout(selectedCheckoutSlugRef.current);
              return;
            }
            if (
              statusModal === "cancelled" ||
              statusModal === "payment_failed" ||
              statusModal === "checkout_unavailable"
            ) {
              setPaymentFailureMessage(null);
              setStatusModal(null);
              void handleCheckout(selectedCheckoutSlugRef.current);
              return;
            }
            setPaymentFailureMessage(null);
            setStatusModal(null);
          }}
          onClose={() => {
            leaveCheckoutToResults();
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
            onUnlock={() => {
              const slug =
                multiSkuEnabled && multiSkuOffer
                  ? multiSkuOffer.primary.isActive
                    ? multiSkuOffer.displayPrimary
                    : FULL_SKILL_PROGRAM_SLUG
                  : FULL_SKILL_PROGRAM_SLUG;
              void handleCheckout(slug, true);
            }}
            unlockBusy={checkoutBusy}
            unlockDisabled={hasSubscription}
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
          {multiSkuEnabled && multiSkuOffer ? (
            <DiagnosticMultiSkuOffer
              offer={multiSkuOffer}
              onCheckout={(slug, wasPrimary) => void handleCheckout(slug, wasPrimary)}
              checkoutDisabled={hasSubscription}
              checkoutLoading={checkoutBusy}
            />
          ) : (
            <DiagnosticPlanBundleCard
              bundle={FULL_SKILL_PROGRAM}
              price={planPrice}
              onCheckout={() => void handleCheckout()}
              checkoutDisabled={hasSubscription}
              checkoutLoading={checkoutBusy}
            />
          )}

          {!hasSubscription ? (
            <CouponCodeField
              disabled={hasSubscription}
              busy={checkoutBusy}
              error={couponError}
              onRedeem={handleRedeemCoupon}
            />
          ) : null}

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
