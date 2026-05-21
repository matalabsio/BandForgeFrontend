"use client";

import { useCallback, useEffect, useState } from "react";
import { IconClose } from "@/components/icons";
import { useStartMockAuth } from "@/components/bandforge/auth/start-mock-auth-context";
import { collectLead } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import {
  formatIndiaDisplay,
  isValidIndiaMobile10,
  normalizeIndiaMobile,
} from "@/lib/india-mobile";
import {
  GoogleSignInButton,
} from "@/components/auth/google-sign-in-button";

export function StartEmailModal() {
  const { isOpen, closeStartMockModal } = useStartMockAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [savedPhone, setSavedPhone] = useState<string | null>(null);
  const [phoneMessage, setPhoneMessage] = useState<string | null>(null);
  const [phoneLoading, setPhoneLoading] = useState(false);

  const handleClose = useCallback(() => {
    setFormError(null);
    setPhone("");
    setSavedPhone(null);
    setPhoneMessage(null);
    closeStartMockModal();
  }, [closeStartMockModal]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const onSavePhone = useCallback(async () => {
    setFormError(null);
    setPhoneMessage(null);
    const digits = normalizeIndiaMobile(phone);
    if (!isValidIndiaMobile10(digits)) {
      setFormError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    setPhoneLoading(true);
    try {
      const res = await collectLead({ phone: digits, channel: "phone" });
      setSavedPhone(digits);
      setPhoneMessage(res.message);
    } catch (e) {
      setFormError(
        e instanceof ApiError ? e.message : "Could not save your number.",
      );
    } finally {
      setPhoneLoading(false);
    }
  }, [phone]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-pointer bg-navy/60 backdrop-blur-sm"
        aria-label="Close"
        onClick={handleClose}
      />

      <div className="relative z-[101] w-full max-w-md animate-[bf-modal-up_0.35s_cubic-bezier(0.22,1,0.36,1)_both] rounded-t-3xl border border-white/15 bg-white/95 p-6 shadow-[var(--shadow-elevated)] sm:rounded-3xl motion-reduce:animate-none">
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
              Start your free mock
            </h2>
          </div>
          <button
            type="button"
            className="touch-target flex shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border text-ink/50 hover:bg-surface"
            onClick={handleClose}
          >
            <span className="sr-only">Close</span>
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-4 text-meta leading-snug text-ink/55">
          Continue with Google for now. Password and phone OTP auth are temporarily disabled.
        </p>

        <div className="mt-5">
          <GoogleSignInButton next="/dashboard" />
        </div>

        <div className="mt-5 space-y-3">
          <label htmlFor="bf-phone" className="text-meta font-semibold text-navy">
            Mobile number (optional — saved for updates only)
          </label>
          <div className="flex overflow-hidden rounded-xl border border-border bg-white focus-within:border-teal focus-within:ring-2 focus-within:ring-teal/20">
            <span className="flex items-center border-r border-border bg-surface px-3 text-meta font-semibold text-ink/60">
              +91
            </span>
            <input
              id="bf-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="98765 43210"
              maxLength={14}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="min-h-[var(--spacing-touch)] flex-1 bg-transparent px-3 text-body text-ink outline-none"
            />
          </div>
          {formError ? (
            <p className="text-meta font-medium text-danger" role="alert">
              {formError}
            </p>
          ) : null}
          {savedPhone ? (
            <p className="text-meta text-teal">
              Saved {formatIndiaDisplay(savedPhone)}
            </p>
          ) : null}
          {phoneMessage ? (
            <p className="text-meta text-ink/60">{phoneMessage}</p>
          ) : null}
          <button
            type="button"
            disabled={phoneLoading}
            onClick={() => void onSavePhone()}
            className="flex min-h-[var(--spacing-touch)] w-full cursor-pointer items-center justify-center rounded-xl border border-border bg-surface px-4 text-body font-semibold text-navy hover:bg-white disabled:opacity-60"
          >
            {phoneLoading ? "Saving…" : "Save mobile number"}
          </button>
        </div>
      </div>
    </div>
  );
}