"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OtpInputRow } from "@/components/bandforge/auth/otp-input-row";
import { AuthShell } from "@/components/auth/auth-shell";
import { sendOtp, verifyOtp } from "@/lib/auth";
import { clientPostAuthDestination } from "@/components/bandforge/bf-marketing-auth-links";
import { normalizeIndiaMobile } from "@/lib/india-mobile";
import { phoneSchema, type PhoneInput } from "@/lib/validators";
import { ApiError } from "@/lib/api";

export default function VerifyPhoneClient() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState("");
  const [digits, setDigits] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PhoneInput>({
    resolver: zodResolver(phoneSchema),
  });

  const onSend = handleSubmit(async (data) => {
    setFormError(null);
    setLoading(true);
    const d = normalizeIndiaMobile(data.phone);
    try {
      const res = await sendOtp(d);
      setDigits(d);
      setHint(res.message);
      setOtp("");
      setStep("otp");
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : "Could not send OTP.");
    } finally {
      setLoading(false);
    }
  });

  const onVerify = async () => {
    setFormError(null);
    if (otp.length !== 6) {
      setFormError("Enter the 6-digit code.");
      return;
    }
    setLoading(true);
    try {
      await verifyOtp({ phone: digits, code: otp });
      window.location.replace(clientPostAuthDestination("/dashboard"));
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
            <label htmlFor="phone" className="text-meta font-semibold text-navy">
              Mobile number
            </label>
            <div className="mt-1.5 flex rounded-xl border border-border bg-white shadow-[var(--shadow-soft)] focus-within:border-teal focus-within:ring-2 focus-within:ring-teal/20">
              <span className="flex items-center border-r border-border px-3 text-body font-semibold text-ink/50">
                +91
              </span>
              <input
                id="phone"
                type="tel"
                className="min-h-[var(--spacing-touch)] flex-1 rounded-r-xl bg-transparent px-3 text-body outline-none"
                {...register("phone")}
              />
            </div>
            {errors.phone ? (
              <p className="mt-1 text-meta text-danger">{errors.phone.message}</p>
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
          <OtpInputRow value={otp} onChange={setOtp} disabled={loading} />
          {formError ? (
            <p className="text-center text-meta text-danger" role="alert">
              {formError}
            </p>
          ) : null}
          <button
            type="button"
            disabled={loading || otp.length !== 6}
            onClick={() => void onVerify()}
            className="w-full rounded-xl bg-navy py-3 font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Verifying…" : "Verify & continue"}
          </button>
        </div>
      )}
      <p className="mt-4 text-center text-meta text-ink/55">
        <Link href="/login" className="font-semibold text-teal">
          Sign in with email
        </Link>
      </p>
    </AuthShell>
  );
}
