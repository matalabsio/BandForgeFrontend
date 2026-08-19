"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OtpInputRow } from "@/components/bandforge/auth/otp-input-row";
import { AuthShell } from "@/components/auth/auth-shell";
import { sendEmailOtp, verifyEmailOtp } from "@/lib/auth";
import { clientPostAuthDestination } from "@/components/bandforge/bf-marketing-auth-links";
import { emailOtpSendSchema, type EmailOtpSendInput } from "@/lib/validators";
import { ApiError } from "@/lib/api";

const EMAIL_OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyEmailOtpClient() {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailOtpSendInput>({
    resolver: zodResolver(emailOtpSendSchema),
  });

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const sendCode = async (address: string) => {
    setFormError(null);
    setLoading(true);
    try {
      const res = await sendEmailOtp(address);
      setEmail(address);
      setHint(res.message);
      setOtp("");
      setStep("otp");
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : "Could not send code.");
    } finally {
      setLoading(false);
    }
  };

  const onSend = handleSubmit(async (data) => {
    await sendCode(data.email.trim().toLowerCase());
  });

  const onResend = async () => {
    if (!email || resendCooldown > 0 || loading) return;
    await sendCode(email);
  };

  const onVerify = async () => {
    setFormError(null);
    if (otp.length !== EMAIL_OTP_LENGTH) {
      setFormError("Enter the 6-digit code.");
      return;
    }
    setLoading(true);
    try {
      await verifyEmailOtp({ email, code: otp });
      window.location.replace(clientPostAuthDestination("/dashboard"));
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={step === "email" ? "Sign in with email" : "Enter code"}
      subtitle={
        step === "email"
          ? "We will email you a one-time sign-in code."
          : `Code sent to ${email}`
      }
    >
      {step === "email" ? (
        <form onSubmit={(e) => void onSend(e)} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-meta font-semibold text-navy">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="mt-1.5 min-h-[var(--spacing-touch)] w-full rounded-xl border border-border bg-white px-3 text-body shadow-[var(--shadow-soft)] outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
              {...register("email")}
            />
            {errors.email ? (
              <p className="mt-1 text-meta text-danger">{errors.email.message}</p>
            ) : null}
          </div>
          {formError ? (
            <p className="text-meta text-danger" role="alert">
              {formError}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-teal py-3 font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send code"}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          {hint ? (
            <p className="rounded-lg border border-teal/25 bg-teal/5 px-3 py-2 text-meta text-ink/70">
              {hint}
            </p>
          ) : null}
          <OtpInputRow
            value={otp}
            onChange={setOtp}
            disabled={loading}
            length={EMAIL_OTP_LENGTH}
            idPrefix="email-otp"
          />
          {formError ? (
            <p className="text-center text-meta text-danger" role="alert">
              {formError}
            </p>
          ) : null}
          <button
            type="button"
            disabled={loading || otp.length !== EMAIL_OTP_LENGTH}
            onClick={() => void onVerify()}
            className="w-full rounded-xl bg-navy py-3 font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Verifying…" : "Verify & continue"}
          </button>
          <p className="text-center text-meta text-ink/55">
            {resendCooldown > 0 ? (
              <>Resend available in {resendCooldown}s</>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={() => void onResend()}
                className="cursor-pointer font-semibold text-teal disabled:opacity-50"
              >
                Resend code
              </button>
            )}
          </p>
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setStep("email");
              setOtp("");
              setFormError(null);
              setHint(null);
            }}
            className="w-full text-center text-meta font-semibold text-ink/55"
          >
            Use a different email
          </button>
        </div>
      )}
      <p className="mt-4 text-center text-meta text-ink/55">
        <Link href="/login" className="font-semibold text-teal">
          Sign in with Google
        </Link>
      </p>
    </AuthShell>
  );
}
