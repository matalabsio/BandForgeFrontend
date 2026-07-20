"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ApiError } from "@/lib/api";
import { ensureSession, loginPathWithNext } from "@/lib/auth";
import {
  type Plan,
  type Subscription,
  createOrder,
  getPlans,
  getSubscription,
  openRazorpayCheckout,
  paymentTraceLog,
  verifyPayment,
} from "@/lib/payments";
import { PlanCard } from "@/components/pricing/plan-card";
import { PRICING_FAQ } from "@/components/pricing/pricing-faq";
import { ProcessingOverlay } from "@/components/pricing/processing-overlay";
import { PaymentStatusModal } from "@/components/pricing/payment-status-modal";

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

/** Map Razorpay payment.failed descriptions to actionable checkout hints. */
function paymentFailureDetail(message: string): string | null {
  const m = message.trim();
  if (!m) return null;
  if (
    /international_transaction_not_allowed|international card/i.test(m)
  ) {
    return (
      "This merchant accepts Indian cards only. In test mode use domestic card " +
      "4111 1111 1111 1111 (or 5267 3181 8797 5449). Do not use international " +
      "test cards (5555...) or a real foreign card. Choose Add new card and turn off browser autofill."
    );
  }
  return m;
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

  const hasPlans = !loadingPlans && plans.length > 0 && !loadError;
  const checkoutAvailable = paymentsEnabled;

  function redirectSessionExpired() {
    router.push(loginPathWithNext("/pricing", true));
  }

  function redirectVerifyAuthFailed() {
    router.push(loginPathWithNext("/checkout/success", true));
  }

  async function handleBuy(slug: string) {
    if (busySlug) return;
    setBusySlug(slug);
    setOverlay("creating");
    try {
      const session = await ensureSession();
      if (!session) {
        setOverlay(null);
        setBusySlug(null);
        setStatusModal("session_expired");
        return;
      }

      const order = await createOrder(slug);
      const opened = await openRazorpayCheckout({
        order,
        onSuccess: async (response) => {
          setOverlay("verifying");
          const orderId = response.razorpay_order_id;
          const paymentId = response.razorpay_payment_id;
          try {
            paymentTraceLog("CHECKOUT_SUCCESS", {
              order: orderId,
              payment: paymentId,
            });
            // Do not call ensureSession() here — on failure it can logout and
            // clear cookies, abandoning a paid order. BFF proxy refreshes on 401.
            paymentTraceLog("SESSION_REFRESH_SKIPPED_POST_CHECKOUT", {
              order: orderId,
              payment: paymentId,
              reason: "fulfillment_first",
            });
            paymentTraceLog("VERIFY_REQUEST", {
              order: orderId,
              payment: paymentId,
              signature_present: Boolean(response.razorpay_signature),
            });
            const result = await verifyPayment(response);
            if (result.subscription.is_active) {
              router.push("/checkout/success");
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
            setBusySlug(null);
          }
        },
        onDismiss: () => {
          setOverlay(null);
          setBusySlug(null);
          setPaymentFailureMessage(null);
          setStatusModal("cancelled");
        },
        onFailed: (message) => {
          setOverlay(null);
          setBusySlug(null);
          setPaymentFailureMessage(paymentFailureDetail(message));
          setStatusModal("payment_failed");
        },
      });
      if (!opened) {
        setOverlay(null);
        setBusySlug(null);
        setStatusModal("checkout_unavailable");
      }
    } catch (e) {
      setOverlay(null);
      setBusySlug(null);
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

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-10 sm:py-14">
      {/* header */}
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan">
          Plans &amp; pricing
        </p>
        <h1 className="font-display mt-2 text-3xl font-extrabold text-navy sm:text-4xl">
          Choose your BandForge plan
        </h1>
        <p className="mt-3 text-sm text-muted">
          Unlock full IELTS mocks, score insights, and examiner-reviewed Writing &amp;
          Speaking.
        </p>
        <p className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-light">
          <LockIcon /> Secure payments powered by Razorpay
        </p>
      </div>

      {/* already subscribed banner */}
      {subscription?.is_active ? (
        <div className="mx-auto mt-8 flex max-w-3xl flex-col items-start justify-between gap-3 rounded-2xl border border-border-soft bg-surface px-5 py-4 sm:flex-row sm:items-center">
          <div className="text-sm text-ink">
            You're on the{" "}
            <span className="font-semibold text-navy">
              {subscription.plan_name ?? "active"}
            </span>{" "}
            plan.
          </div>
          <button
            type="button"
            onClick={() => router.push("/profile/billing")}
            className="cursor-pointer rounded-lg border border-border-soft bg-white px-3 py-1.5 text-xs font-semibold text-navy transition-colors duration-200 hover:bg-surface-alt"
          >
            Manage plan
          </button>
        </div>
      ) : null}

      {/* checkout unavailable banner */}
      {hasPlans && !checkoutAvailable ? (
        <div
          className="mx-auto mt-8 max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950"
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
          className="mx-auto mt-8 max-w-3xl rounded-2xl border border-cyan/30 bg-cyan-soft/40 px-5 py-4 text-sm text-navy"
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
              Cards: use <strong>Add new card</strong> with domestic test numbers only —{" "}
              <span className="font-mono text-navy">4111 1111 1111 1111</span> or{" "}
              <span className="font-mono text-navy">5267 3181 8797 5449</span>
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
            <li>Netbanking → Success is the fastest test path</li>
          </ul>
        </div>
      ) : null}

      {/* plans grid */}
      <div className="mt-10">
        {loadingPlans ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-[420px] animate-pulse rounded-[18px] border border-border-soft bg-surface"
              />
            ))}
          </div>
        ) : loadError ? (
          <p className="text-center text-sm text-danger">{loadError}</p>
        ) : !hasPlans ? (
          <p className="text-center text-sm text-muted">
            {paymentsEnabled
              ? "Payments coming soon."
              : "Payments are temporarily unavailable. Please try again later."}
          </p>
        ) : (
          <div className="grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
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

      <p className="mt-6 text-center text-xs text-muted-light">
        You will complete payment in Razorpay's secure window.
      </p>

      {/* trust & privacy */}
      <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-border-soft bg-surface-alt px-6 py-5">
        <p className="text-[13px] leading-relaxed text-muted">
          Payments are processed by Razorpay. BandForge only shares your{" "}
          <span className="font-semibold text-navy">name, phone, email, and transaction amount</span>{" "}
          with Razorpay. Your mock scores, diagnostic results, and study progress stay
          private in BandForge.
        </p>
      </div>

      {/* FAQ */}
      <div className="mx-auto mt-12 max-w-3xl">
        <h2 className="font-display text-lg font-bold text-navy">
          Frequently asked questions
        </h2>
        <dl className="mt-4 divide-y divide-border-soft">
          {PRICING_FAQ.map((item) => (
            <div key={item.q} className="py-4">
              <dt className="text-sm font-semibold text-navy">{item.q}</dt>
              <dd className="mt-1 text-[13px] text-muted">{item.a}</dd>
            </div>
          ))}
        </dl>
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
