"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { ApiError } from "@/lib/api";
import { ensureSession, loginPathWithNext } from "@/lib/auth";
import { navigateAfterCheckoutVerify } from "@/lib/checkout-navigate-client";
import {
  type Plan,
  type Subscription,
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
import { PlanCard } from "@/components/pricing/plan-card";
import { PlanDetailModal } from "@/components/pricing/plan-detail-modal";
import { PRICING_FAQ } from "@/components/pricing/pricing-faq";
import { ProcessingOverlay } from "@/components/pricing/processing-overlay";
import { PaymentStatusModal } from "@/components/pricing/payment-status-modal";
import {
  buildPricingDisplayPlans,
  type PricingDisplayPlan,
} from "@/lib/pricing-catalog";

type OverlayState = null | "creating" | "verifying";
type StatusModal =
  | null
  | "cancelled"
  | "verify_failed"
  | "payments_disabled"
  | "checkout_unavailable"
  | "provider_misconfigured"
  | "session_expired"
  | "payment_failed"
  | "verify_failed";

function verifyFailureDetail(error: unknown): string | null {
  if (error instanceof ApiError) {
    if (error.status === 400 && /signature/i.test(error.message)) {
      return "Payment signature could not be verified. If Razorpay showed success, wait a moment and try again, or contact support with your payment ID.";
    }
    if (error.status >= 500 || error.status === 0) {
      return "Could not reach the payment server. Restart the frontend dev server (npm run dev) and try again.";
    }
    return error.message;
  }
  return "Could not verify payment. Restart the dev server if you recently cleared .next cache.";
}

function isRazorpayAuthMisconfig(error: ApiError): boolean {
  return (
    error.status === 503 &&
    /authentication failed|razorpay api authentication/i.test(error.message)
  );
}

type PricingClientProps = {
  /** SSR-prefetched plans — cards render on first paint without client fetch. */
  initialPlans?: Plan[];
  initialPaymentsEnabled?: boolean;
  plansKnown?: boolean;
  initialSubscription?: Subscription | null;
};

export function PricingClient({
  initialPlans,
  initialPaymentsEnabled = true,
  plansKnown = false,
  initialSubscription = null,
}: PricingClientProps = {}) {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>(initialPlans ?? []);
  const [subscription, setSubscription] = useState<Subscription | null>(
    initialSubscription,
  );
  const [loadingPlans, setLoadingPlans] = useState(!plansKnown);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [overlay, setOverlay] = useState<OverlayState>(null);
  const [overlayAmountPaise, setOverlayAmountPaise] = useState<
    number | undefined
  >();
  const [statusModal, setStatusModal] = useState<StatusModal>(null);
  const [paymentFailureMessage, setPaymentFailureMessage] = useState<string | null>(
    null,
  );
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const [paymentsEnabled, setPaymentsEnabled] = useState(initialPaymentsEnabled);
  const checkoutInFlightRef = useRef(false);

  useEffect(() => {
    let active = true;

    async function refreshPlans() {
      try {
        const { plans: list, payments_enabled: enabled } = await getPlans();
        if (!active) return;
        setPlans(list);
        setPaymentsEnabled(enabled);
        setLoadError(null);
      } catch {
        if (active) setLoadError("Couldn't load plans. Refresh to try again.");
      } finally {
        if (active) setLoadingPlans(false);
      }
    }

    async function refreshSubscription() {
      try {
        const sub = await getSubscription();
        if (active) setSubscription(sub);
      } catch {
        /* anonymous or expired session — keep SSR/default null */
      }
    }

    if (!plansKnown) {
      void refreshPlans();
    }

    // Subscription is user-specific — refresh in background without blocking cards.
    void refreshSubscription();

    return () => {
      active = false;
    };
  }, [plansKnown]);

  const displayPlans = buildPricingDisplayPlans(plans);
  const hasPlans = displayPlans.length > 0;
  const apiReachable = !loadingPlans && loadError === null;
  const checkoutAvailable = paymentsEnabled && (plansKnown || apiReachable);
  useEffect(() => {
    if (loadingPlans || displayPlans.length === 0) return;

    const syncFromHash = () => {
      const match = window.location.hash.match(/^#plan-([a-z0-9_]+)$/);
      const slug = match?.[1] ?? null;
      if (slug && displayPlans.some((plan) => plan.slug === slug)) {
        setSelectedSlug(slug);
        return;
      }
      if (!slug) setSelectedSlug(null);
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [loadingPlans, displayPlans]);

  function openPlan(slug: string) {
    setSelectedSlug(slug);
    window.history.replaceState(null, "", `#plan-${slug}`);
  }

  function closePlan() {
    setSelectedSlug(null);
    if (window.location.hash.startsWith("#plan-")) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }

  const selectedPlan: PricingDisplayPlan | null =
    selectedSlug != null
      ? (displayPlans.find((plan) => plan.slug === selectedSlug) ?? null)
      : null;

  function redirectSessionExpired() {
    router.push(loginPathWithNext("/pricing", true));
  }

  function redirectVerifyAuthFailed() {
    router.push(loginPathWithNext("/checkout/success", true));
  }

  function clearCheckoutBusy() {
    checkoutInFlightRef.current = false;
    setBusySlug(null);
  }

  async function runVerifyFromPayload(response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    const orderId = response.razorpay_order_id;
    const paymentId = response.razorpay_payment_id;
    setOverlay("verifying");
    try {
      paymentTraceLog("VERIFY_REQUEST", {
        order: orderId,
        payment: paymentId,
        signature_present: Boolean(response.razorpay_signature),
      });
      const result = await verifyPayment(response);
      if (result.subscription.is_active) {
        navigateAfterCheckoutVerify({ router, verifyOk: true });
        return;
      }
      setOverlay(null);
      setPaymentFailureMessage(
        "Payment was received but the subscription was not activated. Contact support with your payment reference.",
      );
      setStatusModal("verify_failed");
    } catch (e) {
      setOverlay(null);
      if (e instanceof ApiError && e.status === 401) {
        paymentTraceLog("VERIFY_AUTH_FAILED", {
          order: orderId,
          payment: paymentId,
        });
        setPaymentFailureMessage(
          `Payment may have succeeded. Sign in again to activate your plan. Order: ${orderId}`,
        );
        setStatusModal("verify_failed");
        redirectVerifyAuthFailed();
      } else {
        setPaymentFailureMessage(verifyFailureDetail(e));
        setStatusModal("verify_failed");
      }
    } finally {
      clearCheckoutBusy();
    }
  }

  async function handleBuy(slug: string) {
    const target = displayPlans.find((plan) => plan.slug === slug);
    if (!target?.isActive || !checkoutAvailable) return;
    if (checkoutInFlightRef.current || busySlug) return;
    checkoutInFlightRef.current = true;
    setBusySlug(slug);
    setOverlayAmountPaise(target.amount);
    setOverlay("creating");
    try {
      const session = await ensureSession();
      if (!session) {
        setOverlay(null);
        clearCheckoutBusy();
        setStatusModal("session_expired");
        return;
      }

      const order = await createOrder(slug);
      const opened = await openRazorpayCheckout({
        order,
        onSuccess: async (response) => {
          saveCheckoutReceiptContext({
            order_id: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            plan_name: order.plan_name,
            plan_slug: slug,
            amount: order.amount,
            currency: order.currency,
          });
          paymentTraceLog("CHECKOUT_SUCCESS", {
            order: response.razorpay_order_id,
            payment: response.razorpay_payment_id,
          });
          paymentTraceLog("SESSION_REFRESH_SKIPPED_POST_CHECKOUT", {
            order: response.razorpay_order_id,
            payment: response.razorpay_payment_id,
            reason: "fulfillment_first",
          });
          await runVerifyFromPayload(response);
        },
        onDismiss: () => {
          setOverlay(null);
          clearCheckoutBusy();
          setPaymentFailureMessage(null);
          setStatusModal("cancelled");
        },
        onFailed: (message) => {
          setOverlay(null);
          clearCheckoutBusy();
          setPaymentFailureMessage(razorpayPaymentFailureDetail(message));
          setStatusModal("payment_failed");
        },
      });
      if (opened) {
        setOverlay(null);
      } else {
        setOverlay(null);
        clearCheckoutBusy();
        setStatusModal("checkout_unavailable");
      }
    } catch (e) {
      setOverlay(null);
      clearCheckoutBusy();
      if (e instanceof ApiError && e.status === 401) {
        redirectSessionExpired();
      } else if (e instanceof ApiError && e.status === 503) {
        setStatusModal(
          isRazorpayAuthMisconfig(e) ? "provider_misconfigured" : "payments_disabled",
        );
      } else {
        setStatusModal("verify_failed");
      }
    }
  }

  async function handleVerifyRetry() {
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
    await runVerifyFromPayload(payload);
  }

  return (
    <div
      id="plans"
      className="bf-container mx-auto w-full max-w-[1180px] scroll-mt-20 px-5 pb-16 sm:px-6 lg:px-10 lg:pb-20"
    >
      {subscription?.is_active ? (
        <div className="mt-8 flex flex-col items-start justify-between gap-3 rounded-lg border border-border-soft px-4 py-3 sm:flex-row sm:items-center">
          <p className="text-sm text-muted">
            Active:{" "}
            <span className="font-medium text-navy">
              {subscription.plan_name ?? "plan"}
            </span>
          </p>
          <button
            type="button"
            onClick={() => router.push("/profile/billing")}
            className="cursor-pointer text-xs font-semibold text-cyan transition-colors hover:text-brand-sky-hover"
          >
            Billing →
          </button>
        </div>
      ) : null}

      {hasPlans && !checkoutAvailable ? (
        <p className="mt-8 text-center text-sm text-amber-800" role="status">
          {loadError ?? "Checkout unavailable right now."}
        </p>
      ) : null}

      <div className="mt-10 sm:mt-12">
        <div className="mb-6 text-center sm:mb-8 sm:text-left">
          <h2 className="font-display text-base font-bold text-navy sm:text-lg">
            Choose a plan
          </h2>
          <p className="mt-1 text-sm text-muted">
            Hover checkout to preview price · or open details for the full
            breakdown.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 items-stretch gap-5 sm:grid-cols-2 sm:gap-6 lg:gap-7">
          {displayPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isSelected={selectedSlug === plan.slug}
              isCurrent={subscription?.plan_slug === plan.slug}
              loading={busySlug === plan.slug}
              checkoutUnavailable={!checkoutAvailable}
              onSelect={openPlan}
              onCheckout={handleBuy}
            />
          ))}
        </div>
        {loadError ? (
          <p className="mt-4 text-center text-sm text-amber-800" role="status">
            {loadError}
          </p>
        ) : null}
      </div>

      <PlanDetailModal
        plan={selectedPlan}
        isCurrent={subscription?.plan_slug === selectedPlan?.slug}
        loading={busySlug === selectedPlan?.slug}
        checkoutUnavailable={!checkoutAvailable}
        onClose={closePlan}
        onCheckout={handleBuy}
      />

      <section className="mx-auto mt-16 max-w-lg" aria-labelledby="pricing-faq-heading">
        <h2 id="pricing-faq-heading" className="text-sm font-semibold text-navy">
          FAQ
        </h2>
        <div className="mt-4 divide-y divide-border-soft border-y border-border-soft">
          {PRICING_FAQ.map((item) => (
            <details
              key={item.q}
              className="group py-1 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3.5 text-left text-sm text-navy transition-colors hover:text-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/30">
                <span>{item.q}</span>
                <span
                  className="text-muted transition-transform duration-150 group-open:rotate-45"
                  aria-hidden
                >
                  +
                </span>
              </summary>
              <p className="pb-3.5 text-[0.8125rem] leading-relaxed text-muted">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      <p className="mx-auto mt-12 max-w-md text-center text-xs leading-relaxed text-muted-light">
        Razorpay checkout · scores stay private ·{" "}
        <Link href="/faq" prefetch className="text-cyan no-underline hover:underline">
          More help
        </Link>
      </p>

      {overlay ? (
        <ProcessingOverlay variant={overlay} amountPaise={overlayAmountPaise} />
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
            setPaymentFailureMessage(null);
            setStatusModal(null);
          }}
          onClose={() => {
            setPaymentFailureMessage(null);
            setStatusModal(null);
          }}
        />
      ) : null}
    </div>
  );
}
