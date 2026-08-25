"use client";

import { CheckoutPosGraphic } from "@/components/pricing/checkout-pos-graphic";
import { useDelayedVisible } from "@/lib/use-delayed-visible";
import { cn } from "@/lib/utils";

const COPY = {
  creating: {
    title: "Preparing secure checkout",
    subtitle: "Setting up Razorpay — this only takes a moment.",
  },
  verifying: {
    title: "Verifying your payment",
    subtitle: "Confirming with Razorpay. Please keep this tab open.",
  },
} as const;

type Props = {
  variant: "creating" | "verifying";
  amountPaise?: number;
  showDelayMs?: number;
  className?: string;
};

/**
 * Full-screen checkout progress — backdrop immediately; POS loader after delay.
 * Cleared once the Razorpay modal is open so it does not stack under the payment sheet.
 */
export function ProcessingOverlay({
  variant,
  amountPaise,
  showDelayMs = 2500,
  className,
}: Props) {
  const copy = COPY[variant];
  const showGraphic = useDelayedVisible(true, showDelayMs);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-[#F7F8FA] px-4",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex w-full max-w-[320px] flex-col items-center text-center">
        {showGraphic ? (
          <>
            <CheckoutPosGraphic
              mode="loader"
              amountPaise={amountPaise}
              className="mx-auto"
            />

            <h2 className="font-display mt-6 text-lg font-bold tracking-[-0.02em] text-[#0B1B33] sm:text-xl">
              {copy.title}
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-[#64748B] sm:text-[14px]">
              {copy.subtitle}
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}
