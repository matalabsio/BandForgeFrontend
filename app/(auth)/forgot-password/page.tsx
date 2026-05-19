"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthInput } from "@/components/auth/auth-form-fields";
import { forgotPassword } from "@/lib/auth";
import { forgotPasswordSchema } from "@/lib/validators";
import { ApiError } from "@/lib/api";
import { z } from "zod";

type ForgotInput = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = handleSubmit(async (data) => {
    setFormError(null);
    try {
      await forgotPassword(data.email);
      setDone(true);
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : "Request failed.");
    }
  });

  return (
    <AuthShell
      title="Forgot password"
      subtitle="We will email you a reset link if the account exists."
    >
      {done ? (
        <p className="text-body text-ink/70">
          If that email is registered, check your inbox for a reset link.
        </p>
      ) : (
        <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
          <AuthInput
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email}
            {...register("email")}
          />
          {formError ? (
            <p className="text-meta text-danger" role="alert">
              {formError}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-teal py-3 font-semibold text-white disabled:opacity-60"
          >
            {isSubmitting ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
      <p className="mt-4 text-center text-meta">
        <Link href="/login" className="font-semibold text-teal">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
