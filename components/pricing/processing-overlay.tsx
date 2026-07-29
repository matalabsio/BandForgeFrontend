"use client";

import { DiagnosticProcessingLoader } from "@/components/diagnostic/ui/diagnostic-processing-loader";
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
  className?: string;
};

/**
 * Full-screen checkout progress — BandForge bars loader (same as diagnostic).
 * Cleared once the Razorpay modal is open so it does not stack under the payment sheet.
 */
export function ProcessingOverlay({ variant, className }: Props) {
  const copy = COPY[variant];

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-[#F7F8FA]/92 px-4 backdrop-blur-[2px]",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex w-full max-w-[320px] flex-col items-center text-center">
        <DiagnosticProcessingLoader size="lg" labelKey={variant} />

        <h2 className="font-display mt-6 text-lg font-bold tracking-[-0.02em] text-[#0B1B33] sm:text-xl">
          {copy.title}
        </h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-[#64748B] sm:text-[14px]">
          {copy.subtitle}
        </p>
      </div>
    </div>
  );
}
