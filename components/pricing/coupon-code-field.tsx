"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

type Props = {
  disabled?: boolean;
  busy?: boolean;
  error?: string | null;
  onRedeem: (code: string) => void | Promise<void>;
  className?: string;
};

/**
 * Optional 100% coupon entry for checkout surfaces.
 * Does not log or echo full codes into analytics.
 */
export function CouponCodeField({
  disabled = false,
  busy = false,
  error = null,
  onRedeem,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");

  if (!open) {
    return (
      <div className={cn("text-center", className)}>
        <button
          type="button"
          disabled={disabled || busy}
          onClick={() => setOpen(true)}
          className="cursor-pointer text-sm font-semibold text-[#0097A7] underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          Have a code?
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-[#E4E7EC] bg-[#F8FBFC] px-4 py-3 sm:px-5",
        className,
      )}
    >
      <label
        htmlFor="bf-coupon-code"
        className="block text-xs font-semibold tracking-wide text-[#5A6B82] uppercase"
      >
        Coupon code
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          id="bf-coupon-code"
          type="text"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          value={code}
          disabled={disabled || busy}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const trimmed = code.trim();
              if (trimmed && !disabled && !busy) void onRedeem(trimmed);
            }
          }}
          placeholder="BF-XXXXXXXXXX"
          className="min-w-0 flex-1 rounded-lg border border-[#D0D5DD] bg-white px-3 py-2.5 font-mono text-sm tracking-wide text-[#0B1B33] outline-none focus:border-[#00BCD4] focus:ring-2 focus:ring-[#00BCD4]/25 disabled:opacity-60"
        />
        <button
          type="button"
          disabled={disabled || busy || !code.trim()}
          onClick={() => {
            const trimmed = code.trim();
            if (trimmed) void onRedeem(trimmed);
          }}
          className="cursor-pointer rounded-lg bg-[#0B1B33] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Applying…" : "Apply"}
        </button>
      </div>
      {error ? (
        <p className="mt-2 text-sm text-amber-800" role="alert">
          {error}
        </p>
      ) : (
        <p className="mt-2 text-[12px] text-[#5A6B82]">
          100% codes unlock your selected plan without payment.
        </p>
      )}
    </div>
  );
}
