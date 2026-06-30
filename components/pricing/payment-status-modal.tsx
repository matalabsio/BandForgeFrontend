"use client";

import { useRouter } from "next/navigation";

const COPY = {
  cancelled: {
    title: "Payment not completed",
    body: "Your subscription was not activated. You can try again when ready.",
    primary: "Try again",
    secondary: "Back to plans",
  },
  verify_failed: {
    title: "We couldn't verify your payment",
    body: "If money was deducted, contact support with your payment reference.",
    primary: "Try again",
    secondary: "Contact support",
  },
} as const;

type Props = {
  variant: "cancelled" | "verify_failed";
  onRetry: () => void;
  onClose: () => void;
};

export function PaymentStatusModal({ variant, onRetry, onClose }: Props) {
  const router = useRouter();
  const copy = COPY[variant];

  function handleSecondary() {
    if (variant === "verify_failed") {
      router.push("/contact");
      return;
    }
    onClose();
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
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{copy.body}</p>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={onRetry}
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
