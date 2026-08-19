"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OtpInputRow } from "@/components/bandforge/auth/otp-input-row";
import { AuthShell } from "@/components/auth/auth-shell";
import { sendOtp, verifyOtp } from "@/lib/auth";
import { normalizeIndiaMobile } from "@/lib/india-mobile";
import { phoneSchema, type PhoneInput } from "@/lib/validators";
import { ApiError } from "@/lib/api";
import { safePostLoginPath } from "@/lib/post-login-destination";

const RESEND_COOLDOWN_SECONDS = 60;

const AUTH_LINK =
  "cursor-pointer font-semibold text-[#00A9C0] transition-colors duration-200 hover:text-[#00B8D1]";

function VerifyPhoneForm() {
  const searchParams = useSearchParams();
  const nextPath = safePostLoginPath(searchParams.get("next") ?? "/dashboard");

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState("");
  const [digits, setDigits] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PhoneInput>({
    resolver: zodResolver(phoneSchema),
  });

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const sendCode = async (phoneDigits: string) => {
    setFormError(null);
    setLoading(true);
    try {
      const res = await sendOtp(phoneDigits);
      setDigits(phoneDigits);
      setHint(res.message);
      setOtp("");
      setStep("otp");
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : "Could not send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const onSend = handleSubmit(async (data) => {
    await sendCode(normalizeIndiaMobile(data.phone));
  });

  const onResend = async () => {
    if (!digits || resendCooldown > 0 || loading) return;
    await sendCode(digits);
  };

  const onVerify = async () => {
    setFormError(null);
    if (otp.length !== 4) {
      setFormError("Enter the 4-digit code.");
      return;
    }
    setLoading(true);
    try {
      await verifyOtp({ phone: digits, code: otp });
      window.location.replace(
        `/auth/continue?next=${encodeURIComponent(nextPath)}`,
      );
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={step === "phone" ? "Sign in with phone" : "Enter OTP"}
      subtitle="Indian mobile numbers only (+91)."
    >
      {step === "phone" ? (
        <form onSubmit={(e) => void onSend(e)} className="space-y-4">
          <div>
            <label
              htmlFor="phone"
              className="text-sm font-semibold text-[#081B33]"
            >
              Mobile number
            </label>
            <div className="mt-1.5 flex rounded-xl border border-border bg-white shadow-[var(--shadow-soft)] focus-within:border-[#00A9C0] focus-within:ring-2 focus-within:ring-[#00A9C0]/20">
              <span className="flex items-center border-r border-border px-3 text-base font-semibold text-[#081B33]/50">
                +91
              </span>
              <input
                id="phone"
                type="tel"
                className="min-h-[var(--spacing-touch)] flex-1 rounded-r-xl bg-transparent px-3 text-base outline-none"
                {...register("phone")}
              />
            </div>
            {errors.phone ? (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            ) : null}
          </div>
          {formError ? (
            <p className="text-sm text-red-600" role="alert">
              {formError}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#00A9C0] py-3 font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send code"}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          {hint ? (
            <p className="rounded-lg border border-[#00A9C0]/25 bg-[#00A9C0]/5 px-3 py-2 text-sm text-[#081B33]/70">
              {hint}
            </p>
          ) : null}
          <OtpInputRow value={otp} onChange={setOtp} disabled={loading} />
          {formError ? (
            <p className="text-center text-sm text-red-600" role="alert">
              {formError}
            </p>
          ) : null}
          <button
            type="button"
            disabled={loading || otp.length !== 4}
            onClick={() => void onVerify()}
            className="w-full rounded-xl bg-[#081B33] py-3 font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Verifying…" : "Verify & continue"}
          </button>
          <p className="text-center text-sm text-[#081B33]/55">
            {resendCooldown > 0 ? (
              <>Resend available in {resendCooldown}s</>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={() => void onResend()}
                className={`${AUTH_LINK} disabled:opacity-50`}
              >
                Resend code
              </button>
            )}
          </p>
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setStep("phone");
              setOtp("");
              setFormError(null);
              setHint(null);
            }}
            className="w-full text-center text-sm font-semibold text-[#081B33]/55"
          >
            Use a different number
          </button>
        </div>
      )}
      <p className="mt-4 text-center text-sm text-[#081B33]/55">
        <Link href="/login" className={AUTH_LINK}>
          Sign in with Google
        </Link>
      </p>
    </AuthShell>
  );
}

export default function VerifyPhoneClient() {
  return (
    <Suspense
      fallback={
        <AuthShell title="Sign in with phone" subtitle="Loading…">
          <p className="text-center text-base text-[#081B33]/60">Loading…</p>
        </AuthShell>
      }
    >
      <VerifyPhoneForm />
    </Suspense>
  );
}
