"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";

import { ApiError } from "@/lib/api";
import { getMe } from "@/lib/auth";
import { DASHBOARD_AFTER_CHECKOUT_PATH } from "@/lib/checkout-navigate";
import {
  hasDualBundlePlan,
  hasFullSkillProgram,
  hasSpeakingSkillPlan,
  hasWritingSkillPlan,
  postCheckoutDestination,
  subscriptionUnlocksAfterCheckout,
} from "@/lib/entitlement";
import {
  type PaymentHistoryItem,
  type Subscription,
  getPaymentHistory,
  getSubscription,
  pendingVerifyPayloadFromReceipt,
  readCheckoutReceiptContext,
  verifyPayment,
} from "@/lib/payments";
import { ProcessingOverlay } from "@/components/pricing/processing-overlay";

const ACTIVATION_POLL_ATTEMPTS = 10;
const ACTIVATION_POLL_MS = 2000;
/** After unlock, auto-leave success unless the user clicks Continue first. */
const AUTO_CONTINUE_MS = 3000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount: number, currency: string): string {
  const major = amount / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    minimumFractionDigits: 0,
  }).format(major);
}

function buildReceiptText(
  sub: Subscription,
  payment: PaymentHistoryItem | null,
  userName: string,
  userEmail: string,
): string {
  const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const lines = [
    "════════════════════════════════════════",
    "           BANDFORGE — PAYMENT RECEIPT",
    "════════════════════════════════════════",
    "",
    `Date:            ${now}`,
    `Student:         ${userName}`,
    `Email:           ${userEmail}`,
    "",
    "────────────────────────────────────────",
    "  Plan Details",
    "────────────────────────────────────────",
    `Plan:            ${sub.plan_name ?? "Full Skill Program"}`,
    `Status:          ${sub.is_active ? "Active" : "Inactive"}`,
    `Valid from:      ${formatDate(sub.starts_at)}`,
    `Valid until:     ${formatDate(sub.expires_at)}`,
    "",
  ];

  if (payment) {
    lines.push(
      "────────────────────────────────────────",
      "  Payment Details",
      "────────────────────────────────────────",
      `Amount:          ${formatAmount(payment.amount, payment.currency)}`,
      `Payment ID:      ${payment.razorpay_payment_id ?? "—"}`,
      `Payment status:  ${payment.status}`,
      `Paid on:         ${formatDate(payment.created_at)}`,
      "",
    );
  }

  lines.push(
    "════════════════════════════════════════",
    "  Thank you for choosing BandForge!",
    "  Support: support@matalabs.io",
    "════════════════════════════════════════",
  );

  return lines.join("\n");
}

function downloadReceipt(content: string, paymentId: string | null) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `BandForge_Receipt_${paymentId ?? new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function CheckoutSuccessClient() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payment, setPayment] = useState<PaymentHistoryItem | null>(null);
  const [userName, setUserName] = useState("Student");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activationRetry, setActivationRetry] = useState(0);
  const [receiptDownloaded, setReceiptDownloaded] = useState(false);
  const downloadedRef = useRef(false);
  const reverifyAttemptedRef = useRef(false);
  const autoContinueTimerRef = useRef<number | undefined>(undefined);
  const navigatedRef = useRef(false);

  const doDownloadReceipt = useCallback(
    (
      sub: Subscription,
      pay: PaymentHistoryItem | null,
      name: string,
      email: string,
    ) => {
      if (downloadedRef.current) return;
      downloadedRef.current = true;
      setReceiptDownloaded(true);
      const text = buildReceiptText(sub, pay, name, email);
      downloadReceipt(text, pay?.razorpay_payment_id ?? null);
    },
    [],
  );

  const clearAutoContinueTimer = useCallback(() => {
    if (autoContinueTimerRef.current !== undefined) {
      window.clearTimeout(autoContinueTimerRef.current);
      autoContinueTimerRef.current = undefined;
    }
  }, []);

  const goToPostCheckout = useCallback(
    (sub: Subscription | null | undefined) => {
      if (navigatedRef.current) return;
      if (!subscriptionUnlocksAfterCheckout(sub)) return;
      navigatedRef.current = true;
      clearAutoContinueTimer();
      const receipt = readCheckoutReceiptContext();
      router.replace(
        postCheckoutDestination(sub, {
          receiptPlanSlug: receipt?.plan_slug ?? null,
        }),
      );
    },
    [clearAutoContinueTimer, router],
  );

  useEffect(() => {
    let active = true;
    let receiptTimer: number | undefined;
    navigatedRef.current = false;
    clearAutoContinueTimer();

    (async () => {
      try {
        const receiptCtx = readCheckoutReceiptContext();
        const [subInitial, history, me] = await Promise.all([
          getSubscription(),
          getPaymentHistory().catch(() => ({ payments: [] })),
          getMe().catch(() => null),
        ]);

        if (!active) return;

        let sub = subInitial;

        // After login redirect mid-verify: re-verify once from pending payload.
        if (
          !subscriptionUnlocksAfterCheckout(sub) &&
          receiptCtx &&
          !reverifyAttemptedRef.current
        ) {
          const payload = pendingVerifyPayloadFromReceipt(receiptCtx);
          if (payload) {
            reverifyAttemptedRef.current = true;
            try {
              const result = await verifyPayment(payload);
              sub = result.subscription;
            } catch (e) {
              if (!active) return;
              // Keep going into poll if receipt exists; only hard-fail without it.
              if (!receiptCtx.signature) {
                setLoadError(
                  e instanceof ApiError
                    ? e.message
                    : "Could not verify your payment. Try again from pricing or contact support.",
                );
                setLoading(false);
                return;
              }
            }
          }
        }

        // Webhook / DB lag: poll subscription briefly before showing stuck state.
        if (!subscriptionUnlocksAfterCheckout(sub) && receiptCtx) {
          for (let i = 0; i < ACTIVATION_POLL_ATTEMPTS; i++) {
            await sleep(ACTIVATION_POLL_MS);
            if (!active) return;
            try {
              sub = await getSubscription();
              if (subscriptionUnlocksAfterCheckout(sub)) break;
            } catch {
              /* keep polling */
            }
          }
        }

        if (!active) return;

        const name = me?.full_name ?? "Student";
        const email = me?.email ?? "";
        setUserName(name);
        setUserEmail(email);

        setSubscription(sub);

        const latestPaid =
          history.payments.find(
            (p) => p.status === "paid" || p.status === "captured",
          ) ??
          (receiptCtx
            ? ({
                id: receiptCtx.order_id,
                plan_name: receiptCtx.plan_name ?? sub.plan_name,
                amount: receiptCtx.amount ?? 0,
                currency: receiptCtx.currency ?? "INR",
                status: "paid",
                created_at: new Date().toISOString(),
                razorpay_payment_id: receiptCtx.payment_id,
              } satisfies PaymentHistoryItem)
            : null);

        if (latestPaid) setPayment(latestPaid);

        if (!subscriptionUnlocksAfterCheckout(sub)) {
          if (!receiptCtx?.signature) {
            router.replace("/pricing");
            return;
          }
          setLoadError(
            "Payment received. Unlocking your plan…",
          );
          setLoading(false);
          return;
        }

        receiptTimer = window.setTimeout(() => {
          if (active) doDownloadReceipt(sub, latestPaid, name, email);
        }, 800);

        // Auto-continue after a short success dwell; CTA can leave earlier.
        autoContinueTimerRef.current = window.setTimeout(() => {
          if (active) goToPostCheckout(sub);
        }, AUTO_CONTINUE_MS);
      } catch {
        if (active) router.replace("/pricing");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
      if (receiptTimer !== undefined) window.clearTimeout(receiptTimer);
      clearAutoContinueTimer();
    };
  }, [
    router,
    doDownloadReceipt,
    activationRetry,
    clearAutoContinueTimer,
    goToPostCheckout,
  ]);

  if (loading) {
    return (
      <ProcessingOverlay
        variant="verifying"
        amountPaise={readCheckoutReceiptContext()?.amount}
      />
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col items-center px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-extrabold text-navy">
          Activating your plan
        </h1>
        <p className="mt-3 text-sm text-muted">{loadError}</p>
        <button
          type="button"
          onClick={() => {
            setLoadError(null);
            setLoading(true);
            reverifyAttemptedRef.current = false;
            setActivationRetry((n) => n + 1);
          }}
          className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-navy px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-navy-deep"
        >
          Retry activation
        </button>
        <button
          type="button"
          onClick={() => router.replace(DASHBOARD_AFTER_CHECKOUT_PATH)}
          className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl border border-border-soft bg-white px-4 text-sm font-semibold text-navy transition-colors duration-200 hover:bg-surface-alt"
        >
          Go to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center px-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#DCFCE7] text-success">
        <svg
          viewBox="0 0 24 24"
          width="32"
          height="32"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>

      <h1 className="font-display mt-6 text-2xl font-extrabold text-navy">
        Payment successful
      </h1>
      <p className="mt-2 text-sm text-muted">Your BandForge plan is now active.</p>

      <div className="mt-8 w-full rounded-2xl border border-border-soft bg-white p-6 text-left shadow-soft">
        <Row label="Plan" value={loading ? "—" : (subscription?.plan_name ?? "—")} />
        <Row label="Status" value={subscription?.is_active ? "Active" : "—"} pill />
        <Row label="Valid until" value={formatDate(subscription?.expires_at ?? null)} />
        {payment ? (
          <>
            <Row
              label="Amount"
              value={formatAmount(payment.amount, payment.currency)}
            />
            <Row
              label="Payment ID"
              value={payment.razorpay_payment_id ?? "—"}
              mono
            />
          </>
        ) : null}
      </div>

      {/* Receipt download + manual re-download */}
      <div className="mt-5 flex items-center gap-3">
        {receiptDownloaded ? (
          <span className="text-[13px] text-success font-medium">
            Receipt downloaded
          </span>
        ) : null}
        <button
          type="button"
          onClick={() => {
            if (subscription) {
              downloadedRef.current = false;
              doDownloadReceipt(subscription, payment, userName, userEmail);
            }
          }}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border-soft bg-white px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:bg-surface-alt disabled:opacity-50"
        >
          <Download className="size-3.5" />
          Download receipt
        </button>
      </div>

      <button
        type="button"
        onClick={() => goToPostCheckout(subscription)}
        disabled={!subscriptionUnlocksAfterCheckout(subscription)}
        className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-navy px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-navy-deep disabled:opacity-50"
      >
        {hasFullSkillProgram(subscription)
          ? "Go to dashboard"
          : hasWritingSkillPlan(subscription) || hasDualBundlePlan(subscription)
            ? "Continue to Writing practice"
            : hasSpeakingSkillPlan(subscription)
              ? "Continue to Speaking practice"
              : "Continue"}
      </button>

      <p className="mt-3 text-[13px] text-muted">
        Continuing in a few seconds…
      </p>
      <p className="mt-1 font-mono text-[11px] text-muted-light">
        Receipt auto-downloaded. You can re-download from payment history anytime.
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  pill,
  mono,
}: {
  label: string;
  value: string;
  pill?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border-soft py-2.5 last:border-0">
      <span className="text-[13px] text-muted">{label}</span>
      {pill ? (
        <span className="inline-flex items-center rounded-full bg-[#DCFCE7] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.03em] text-success">
          {value}
        </span>
      ) : (
        <span
          className={`text-[13px] font-semibold text-navy ${mono ? "font-mono text-[11px]" : ""}`}
        >
          {value}
        </span>
      )}
    </div>
  );
}
