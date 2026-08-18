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
import { PRICING_FAQ } from "@/components/pricing/pricing-faq";
import { ProcessingOverlay } from "@/components/pricing/processing-overlay";
import { PaymentStatusModal } from "@/components/pricing/payment-status-modal";
import { sprintPlansToFallbackPlans } from "@/lib/seo/marketing-pricing";

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

export function PricingClient() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [overlay, setOverlay] = useState<OverlayState>(null);
  const [statusModal, setStatusModal] = useState<StatusModal>(null);
  const [paymentFailureMessage, setPaymentFailureMessage] = useState<string | null>(
    null,
  );

  const [paymentsEnabled, setPaymentsEnabled] = useState(true);
  const [checkoutTestMode, setCheckoutTestMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobileCheckout, setIsMobileCheckout] = useState(false);
  const checkoutInFlightRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    setIsMobileCheckout(/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [{ plans: list, payments_enabled: enabled, checkout_test_mode: testMode }, sub] =
          await Promise.all([
          getPlans(),
          getSubscription().catch(() => null),
        ]);
        if (!active) return;
        setPlans(list);
        setPaymentsEnabled(enabled);
        setCheckoutTestMode(testMode);
        setSubscription(sub);
      } catch {
        if (active) setLoadError("We couldn't load plans. Please refresh and try again.");
      } finally {
        if (active) setLoadingPlans(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const fallbackPlans = sprintPlansToFallbackPlans();
  const displayPlans = plans.length > 0 ? plans : fallbackPlans;
  const hasPlans = !loadingPlans && displayPlans.length > 0;
  const usingFallbackPlans = !loadingPlans && plans.length === 0 && !loadError;
  const checkoutAvailable = paymentsEnabled && !usingFallbackPlans;

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
    if (checkoutInFlightRef.current || busySlug) return;
    checkoutInFlightRef.current = true;
    setBusySlug(slug);
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
    <div id="plans" className="bf-container mx-auto w-full max-w-[1120px] scroll-mt-24 px-5 pb-14 sm:px-6 sm:pb-16 lg:px-10 lg:pb-20">
      {subscription?.is_active ? (
        <div className="mx-auto mt-8 flex max-w-3xl flex-col items-start justify-between gap-3 rounded-[1.125rem] border border-cyan/20 bg-[#e0f7fa]/50 px-5 py-4 sm:flex-row sm:items-center">
          <div className="text-sm text-ink">
            You&apos;re on the{" "}
            <span className="font-semibold text-navy">
              {subscription.plan_name ?? "active"}
            </span>{" "}
            plan.
          </div>
          <button
            type="button"
            onClick={() => router.push("/profile/billing")}
            className="cursor-pointer rounded-full border border-border-soft bg-white px-4 py-2 text-xs font-semibold text-navy transition-colors duration-200 hover:bg-white hover:border-cyan/40"
          >
            Manage plan
          </button>
        </div>
      ) : null}

      {hasPlans && !checkoutAvailable ? (
        <div
          className="mx-auto mt-8 max-w-3xl rounded-[1.125rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950"
          role="status"
        >
          <p className="font-semibold">Checkout is not available right now</p>
          <p className="mt-1 text-[13px] leading-relaxed text-amber-900/90">
            The API returned <code className="text-xs">payments_enabled: false</code>.
            On production this means{" "}
            <span className="font-medium">Railway → Variables</span> need{" "}
            <code className="text-xs">RAZORPAY_ENABLED=true</code> plus matching{" "}
            <span className="font-medium">Test mode</span>{" "}
            <code className="text-xs">RAZORPAY_KEY_ID</code> /{" "}
            <code className="text-xs">RAZORPAY_KEY_SECRET</code>, then redeploy.
            For local dev, set the same in <code className="text-xs">backend/.env</code>{" "}
            and restart uvicorn. Plans are shown below for reference.
          </p>
        </div>
      ) : null}

      {mounted && hasPlans && checkoutAvailable && checkoutTestMode ? (
        <div
          className="mx-auto mt-8 max-w-3xl rounded-[1.125rem] border border-cyan/25 bg-white px-5 py-4 text-sm text-navy shadow-sm"
          role="note"
        >
          <p className="font-semibold">Test checkout (Razorpay sandbox)</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-[13px] leading-relaxed text-muted">
            <li>
              {isMobileCheckout
                ? "UPI: choose Pay with UPI → pick your UPI app (PhonePe, GPay, etc.)"
                : "UPI: choose Pay with UPI → scan the QR with PhonePe, GPay, or Paytm"}
            </li>
            <li>
              Cards: use <strong>Add new card</strong> with Mastercard{" "}
              <span className="font-mono text-navy">5267 3181 8797 5449</span>{" "}
              (any future expiry + any CVV). Visa{" "}
              <span className="font-mono text-navy">4111 1111 1111 1111</span>{" "}
              often fails as &quot;international&quot; when that method is off
            </li>
            <li>Not supported: international test cards (5555...) or real foreign cards</li>
            <li>
              <strong>Uncheck</strong> &quot;Save this card&quot; before Pay — avoid saved/autofill cards
            </li>
            <li>
              If you see <strong>&quot;Securely saving your card&quot;</strong>, click{" "}
              <strong>Skip OTP</strong> — that OTP is a real SMS, not a test code
            </li>
            <li>Payment OTP (after Pay): any 4-10 digits</li>
            <li>
              <strong>Netbanking → any bank → Success</strong> is the fastest reliable test path
            </li>
          </ul>
        </div>
      ) : null}

      <div className="mt-10 flex flex-col items-center gap-2 sm:mt-12">
        <p className="inline-flex items-center gap-1.5 font-mono text-[0.6875rem] text-muted-light">
          <LockIcon /> Secure payments powered by Razorpay
        </p>
        {usingFallbackPlans ? (
          <p className="max-w-xl text-center text-xs text-muted-light">
            Live checkout plans could not be loaded — showing reference pricing below.
          </p>
        ) : null}
      </div>

      <div className="mt-6 sm:mt-8">
        {loadingPlans ? (
          <div className="mx-auto grid max-w-md gap-5">
            <div className="h-[26rem] animate-pulse rounded-[1.25rem] border border-border-soft bg-surface" />
          </div>
        ) : loadError && plans.length === 0 ? (
          <p className="text-center text-sm text-danger">{loadError}</p>
        ) : !hasPlans ? (
          <p className="text-center text-sm text-muted">
            {paymentsEnabled
              ? "Payments coming soon."
              : "Payments are temporarily unavailable. Please try again later."}
          </p>
        ) : (
          <div className="mx-auto grid max-w-md items-stretch gap-5">
            {displayPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrent={subscription?.plan_slug === plan.slug}
                disabled={Boolean(busySlug) || !checkoutAvailable}
                loading={busySlug === plan.slug}
                onBuy={handleBuy}
                checkoutUnavailable={!checkoutAvailable}
              />
            ))}
          </div>
        )}
      </div>

      <p className="mt-5 text-center text-xs text-muted-light">
        You will complete payment in Razorpay&apos;s secure window.
      </p>

      <div className="mx-auto mt-14 max-w-3xl rounded-[1.25rem] border border-border-soft bg-surface-alt/80 px-5 py-6 sm:px-7 sm:py-7">
        <h2 className="font-display text-lg font-bold text-navy sm:text-xl">
          About sprints and the Completion Guarantee
        </h2>
        <p className="mt-2.5 text-sm leading-relaxed text-muted sm:text-[0.9375rem]">
          Every sprint includes 12 evaluated tasks over 90 days, AI plus Band 9 human
          review within 48 hours, and a mock test on completion. Finish all 12 tasks
          with no score improvement and your sprint is extended free.
        </p>
        <Link
          href="/faq"
          prefetch
          className="mt-4 inline-flex cursor-pointer text-sm font-semibold text-cyan transition-colors duration-200 hover:text-brand-sky-hover"
        >
          Read all FAQs →
        </Link>
      </div>

      <div className="mx-auto mt-10 max-w-3xl rounded-[1.25rem] border border-border-soft bg-white px-5 py-5 sm:px-6">
        <p className="text-sm leading-relaxed text-muted">
          Payments are processed by Razorpay. BandForge only shares your{" "}
          <span className="font-semibold text-navy">
            name, phone, email, and transaction amount
          </span>{" "}
          with Razorpay. Your mock scores, diagnostic results, and study progress stay
          private in BandForge.
        </p>
      </div>

      <section className="mx-auto mt-14 max-w-3xl" aria-labelledby="pricing-faq-heading">
        <h2
          id="pricing-faq-heading"
          className="font-display text-center text-xl font-bold text-navy sm:text-2xl"
        >
          Frequently asked questions
        </h2>
        <div className="mt-6 divide-y divide-border-soft rounded-[1.25rem] border border-border-soft bg-white px-4 sm:px-5">
          {PRICING_FAQ.map((item) => (
            <details
              key={item.q}
              className="group py-1 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 text-left text-sm font-semibold text-navy transition-colors duration-200 hover:text-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/30">
                <span>{item.q}</span>
                <span
                  className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border-soft text-muted transition-transform duration-200 group-open:rotate-45 group-open:border-cyan/40 group-open:text-cyan"
                  aria-hidden
                >
                  +
                </span>
              </summary>
              <p className="pb-4 text-[0.8125rem] leading-relaxed text-muted sm:text-sm">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      <div className="mx-auto mt-14 max-w-2xl rounded-[1.25rem] bg-navy px-6 py-9 text-center sm:px-10 sm:py-11">
        <h2 className="font-display text-xl font-bold text-white sm:text-2xl">
          Not sure where to start?
        </h2>
        <p className="mx-auto mt-2.5 max-w-[36ch] text-sm leading-relaxed text-white/70">
          Take the free diagnostic first. Then unlock the Full Skill Program for all four
          sections.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/diagnostic"
            prefetch
            className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-full bg-cyan px-6 text-sm font-semibold text-white no-underline transition-colors duration-200 hover:bg-brand-sky-hover sm:w-auto"
          >
            Take free diagnostic
          </Link>
          <a
            href="#plans"
            className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-full border border-white/25 px-6 text-sm font-semibold text-white no-underline transition-colors duration-200 hover:border-white/50 hover:bg-white/5 sm:w-auto"
          >
            Compare plans
          </a>
        </div>
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
    </div>
  );
}

const LockIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="13"
    height="13"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
