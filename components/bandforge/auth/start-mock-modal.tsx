"use client";

import { useCallback, useEffect, useState } from "react";
import { IconClose } from "@/components/icons";
import { OtpInputRow } from "@/components/bandforge/auth/otp-input-row";
import {
  isValidIndiaMobile10,
  normalizeIndiaMobile,
} from "@/lib/india-mobile";
import { useStartMockAuth } from "@/components/bandforge/auth/start-mock-auth-context";
import { sendOtp as sendPhoneOtp, verifyOtp as verifyPhoneOtp } from "@/lib/auth";
import { ApiError } from "@/lib/api";

type Step = "phone" | "otp";

export function StartMockModal() {
  const { isOpen, closeStartMockModal } = useStartMockAuth();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpFocusToken, setOtpFocusToken] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoHint, setDemoHint] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStep("phone");
    setPhone("");
    setOtp("");
    setError(null);
    setDemoHint(null);
    setLoading(false);
    setOtpFocusToken((t) => t + 1);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    closeStartMockModal();
  }, [reset, closeStartMockModal]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const digits = normalizeIndiaMobile(phone);

  const requestOtp = useCallback(async () => {
    setError(null);
    if (!isValidIndiaMobile10(digits)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    setLoading(true);
    try {
      const data = await sendPhoneOtp(digits);
      setDemoHint(data.message.includes("Demo") ? data.message : null);
      setOtp("");
      setOtpFocusToken((t) => t + 1);
      setStep("otp");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }, [digits]);

  const verifyOtpSubmit = useCallback(async () => {
    setError(null);
    if (otp.length !== 6) {
      setError("Enter the 6-digit code.");
      return;
    }
    setLoading(true);
    try {
      await verifyPhoneOtp({ phone: digits, code: otp });
      window.location.href = "/dashboard";
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }, [digits, otp]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bf-auth-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-pointer bg-navy/60 backdrop-blur-sm transition-opacity"
        aria-label="Close"
        onClick={handleClose}
      />

      <div className="relative z-[101] w-full max-w-md animate-[bf-modal-up_0.35s_cubic-bezier(0.22,1,0.36,1)_both] rounded-t-3xl border border-white/15 bg-white/95 p-6 shadow-[0_-8px_40px_-12px_rgb(13_31_60_/0.25)] sm:rounded-3xl sm:shadow-[var(--shadow-elevated)] motion-reduce:animate-none">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink/15 sm:hidden" />

        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-meta font-semibold uppercase tracking-wider text-teal">
              AI-first products for learning
            </p>
            <h2
              id="bf-auth-title"
              className="mt-1 font-display text-xl font-bold tracking-tight text-navy sm:text-2xl"
            >
              {step === "phone" ? "Start your free mock" : "Enter OTP"}
            </h2>
          </div>
          <button
            type="button"
            className="touch-target flex shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border text-ink/50 transition-colors duration-200 hover:bg-surface hover:text-navy"
            onClick={handleClose}
          >
            <span className="sr-only">Close</span>
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <ul className="mt-4 space-y-1.5 text-meta leading-snug text-ink/55">
          <li>No spam. Start your first IELTS mock in seconds.</li>
          <li>Used by students targeting Band 7+.</li>
          <li>Your progress and evaluations are securely saved.</li>
        </ul>

        {step === "phone" ? (
          <div className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="bf-phone"
                className="text-meta font-semibold text-navy"
              >
                Mobile number
              </label>
              <div className="mt-1.5 flex rounded-xl border border-border bg-white shadow-[var(--shadow-soft)] focus-within:border-teal focus-within:ring-2 focus-within:ring-teal/20">
                <span className="flex items-center border-r border-border px-3 text-body font-semibold text-ink/50">
                  +91
                </span>
                <input
                  id="bf-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="98765 43210"
                  maxLength={14}
                  className="min-h-[var(--spacing-touch)] flex-1 rounded-r-xl bg-transparent px-3 text-body text-ink outline-none placeholder:text-ink/35"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            {error ? (
              <p className="text-meta font-medium text-danger" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="button"
              disabled={loading}
              onClick={() => void requestOtp()}
              className="flex min-h-[var(--spacing-touch)] w-full cursor-pointer items-center justify-center rounded-xl bg-teal px-4 text-body font-semibold text-white shadow-[0_0_24px_-6px_rgba(0,188,212,0.45)] transition-colors duration-200 hover:bg-teal-light disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send code"}
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <p className="text-body text-ink/70">
              Code sent to{" "}
              <span className="font-semibold text-navy">+91 {digits}</span>
              <button
                type="button"
                className="ml-2 cursor-pointer text-meta font-semibold text-teal hover:text-teal-light"
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                  setError(null);
                }}
              >
                Edit
              </button>
            </p>
            {demoHint ? (
              <p className="rounded-lg border border-teal/25 bg-teal/5 px-3 py-2 text-meta text-ink/70">
                {demoHint}
              </p>
            ) : null}
            <OtpInputRow
              value={otp}
              onChange={setOtp}
              disabled={loading}
              focusToken={otpFocusToken}
            />
            {error ? (
              <p
                className="text-center text-meta font-medium text-danger"
                role="alert"
              >
                {error}
              </p>
            ) : null}
            <button
              type="button"
              disabled={loading || otp.length !== 6}
              onClick={() => void verifyOtpSubmit()}
              className="flex min-h-[var(--spacing-touch)] w-full cursor-pointer items-center justify-center rounded-xl bg-navy px-4 text-body font-semibold text-white transition-colors duration-200 hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Verifying…" : "Verify & continue"}
            </button>
            <p className="text-center text-meta text-ink/45">
              Enter all 6 digits, then verify — optimised for SMS autofill on
              Android.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
