"use client";

import { useRouter } from "next/navigation";

const COPY = {
  cancelled: {
    title: "Payment not completed",
    body: "Your subscription was not activated. You can continue to payment when ready.",
    primary: "Continue to payment",
    secondary: "Back to plans",
  },
  verify_failed: {
    title: "We couldn't verify your payment",
    body: "If money was deducted, contact support with your payment reference.",
    primary: "Try again",
    secondary: "Contact support",
  },
  payments_disabled: {
    title: "Payments unavailable",
    body: "Checkout is temporarily disabled. Please try again later or contact support.",
    primary: "Close",
    secondary: "Contact support",
  },
  checkout_unavailable: {
    title: "Checkout could not open",
    body: "We couldn't load the Razorpay payment window. Check your connection and try again.",
    primary: "Continue to payment",
    secondary: "Back to plans",
  },
  provider_misconfigured: {
    title: "Payments temporarily unavailable",
    body: "Our payment provider is misconfigured. Please contact support or try again later.",
    primary: "Contact support",
    secondary: "Back to plans",
  },
  session_expired: {
    title: "Session expired",
    body: "Please sign in again to continue checkout. If you already paid, contact support with your payment reference.",
    primary: "Sign in",
    secondary: "Contact support",
  },
  payment_failed: {
    title: "Payment failed",
    body: "Your card or UPI payment was declined. No charge was made. You can try again.",
    primary: "Continue to payment",
    secondary: "Back to plans",
  },
} as const;

type Props = {
  variant: keyof typeof COPY;
  detail?: string | null;
  onRetry: () => void;
  onClose: () => void;
};

export function PaymentStatusModal({ variant, detail, onRetry, onClose }: Props) {
  const router = useRouter();
  const copy = COPY[variant];
  const body = detail?.trim() || copy.body;

  function handleSecondary() {
    if (
      variant === "verify_failed" ||
      variant === "payments_disabled" ||
      variant === "provider_misconfigured" ||
      variant === "session_expired"
    ) {
      router.push("/contact");
      return;
    }
    onClose();
  }

  function handlePrimary() {
    if (variant === "payments_disabled") {
      onClose();
      return;
    }
    if (variant === "provider_misconfigured") {
      router.push("/contact");
      return;
    }
    if (variant === "session_expired") {
      router.push("/login?next=%2Fpricing&session=expired");
      return;
    }
    onRetry();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 px-4 backdrop-blur-sm"
      role="alertdialog"
      aria-labelledby="payment-status-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white px-7 py-7 shadow-elevated">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FEF3C7] text-warning">
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
        </div>
        <h2
          id="payment-status-title"
          className="font-display mt-4 text-lg font-bold text-navy"
        >
          {copy.title}
        </h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{body}</p>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={handlePrimary}
            className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center rounded-xl bg-navy px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-navy-deep"
          >
            {copy.primary}
          </button>
          <button
            type="button"
            onClick={handleSecondary}
            className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center rounded-xl border border-border-soft bg-white px-4 text-sm font-semibold text-navy transition-colors duration-200 hover:bg-surface-alt"
          >
            {copy.secondary}
          </button>
        </div>
      </div>
    </div>
  );
}
