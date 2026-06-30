"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  type Plan,
  type Subscription,
  createOrder,
  getPlans,
  getSubscription,
  openRazorpayCheckout,
  verifyPayment,
} from "@/lib/payments";
import { PlanCard } from "@/components/pricing/plan-card";
import { ProcessingOverlay } from "@/components/pricing/processing-overlay";
import { PaymentStatusModal } from "@/components/pricing/payment-status-modal";

const FAQ: { q: string; a: string }[] = [
  {
    q: "Is my payment secure?",
    a: "Yes. Razorpay processes the payment. BandForge does not store card or UPI details.",
  },
  {
    q: "When is my plan activated?",
    a: "Immediately after your payment is verified.",
  },
  {
    q: "What if payment fails?",
    a: "No plan is activated. You can try again from this page.",
  },
  {
    q: "Where can I see receipts?",
    a: "In your dashboard under Plan & billing.",
  },
];

type OverlayState = null | "creating" | "verifying";
type StatusModal = null | "cancelled" | "verify_failed";

export function PricingClient() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [overlay, setOverlay] = useState<OverlayState>(null);
  const [statusModal, setStatusModal] = useState<StatusModal>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [{ plans: list }, sub] = await Promise.all([
          getPlans(),
          getSubscription().catch(() => null),
        ]);
        if (!active) return;
        setPlans(list);
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

  const paymentsDisabled = !loadingPlans && plans.length === 0 && !loadError;

  async function handleBuy(slug: string) {
    if (busySlug) return;
    setBusySlug(slug);
    setOverlay("creating");
    try {
      const order = await createOrder(slug);
      const opened = await openRazorpayCheckout({
        order,
        onSuccess: async (response) => {
          setOverlay("verifying");
          try {
            const result = await verifyPayment(response);
            if (result.subscription.is_active) {
              router.push("/checkout/success");
              return;
            }
            setOverlay(null);
            setStatusModal("verify_failed");
          } catch {
            setOverlay(null);
            setStatusModal("verify_failed");
          } finally {
            setBusySlug(null);
          }
        },
        onDismiss: () => {
          setOverlay(null);
          setBusySlug(null);
          setStatusModal("cancelled");
        },
      });
      if (!opened) {
        setOverlay(null);
        setBusySlug(null);
        setStatusModal("verify_failed");
      }
    } catch {
      setOverlay(null);
      setBusySlug(null);
      setStatusModal("verify_failed");
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
        ) : paymentsDisabled ? (
          <p className="text-center text-sm text-muted">Payments coming soon.</p>
        ) : (
          <div className="grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrent={subscription?.plan_slug === plan.slug}
                disabled={Boolean(busySlug)}
                loading={busySlug === plan.slug}
                onBuy={handleBuy}
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
          {FAQ.map((item) => (
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
          onRetry={() => setStatusModal(null)}
          onClose={() => setStatusModal(null)}
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
