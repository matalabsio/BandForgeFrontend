"use client";

const COPY = {
  creating: {
    title: "Preparing secure checkout",
    subtitle: "Opening Razorpay… Uncheck Save card on the card form.",
  },
  verifying: {
    title: "Verifying your payment",
    subtitle: "Confirming with Razorpay. Do not close this page.",
  },
} as const;

export function ProcessingOverlay({ variant }: { variant: "creating" | "verifying" }) {
  const copy = COPY[variant];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 px-4 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white px-7 py-8 text-center shadow-elevated">
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-[3px] border-border-soft border-t-cyan" />
        <h2 className="font-display mt-5 text-lg font-bold text-navy">{copy.title}</h2>
        <p className="mt-1 text-[13px] text-muted">{copy.subtitle}</p>
      </div>
    </div>
  );
}
