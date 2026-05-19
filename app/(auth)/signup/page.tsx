"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthInput } from "@/components/auth/auth-form-fields";
import { register as registerUser } from "@/lib/auth";
import { registerSchema, type RegisterInput } from "@/lib/validators";
import { ApiError } from "@/lib/api";
import {
  AuthDivider,
  GoogleSignInButton,
} from "@/components/auth/google-sign-in-button";

export default function SignupPage() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = handleSubmit(async (data) => {
    setFormError(null);
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        full_name: data.full_name,
      });
      router.push(`/check-email?email=${encodeURIComponent(data.email)}`);
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : "Could not create account.");
    }
  });

  return (
    <AuthShell
      title="Create your account"
      subtitle="Continue with Google or sign up with email (verification link sent)."
    >
      <GoogleSignInButton next="/dashboard" />
      <AuthDivider />
      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
        <AuthInput
          id="full_name"
          label="Full name (optional)"
          autoComplete="name"
          error={errors.full_name}
          {...register("full_name")}
        />
        <AuthInput
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email}
          {...register("email")}
        />
        <AuthInput
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          error={errors.password}
          {...register("password")}
        />
        {formError ? (
          <p className="text-meta font-medium text-danger" role="alert">
            {formError}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex min-h-[var(--spacing-touch)] w-full cursor-pointer items-center justify-center rounded-xl bg-teal px-4 text-body font-semibold text-white hover:bg-teal-light disabled:opacity-60"
        >
          {isSubmitting ? "Creating…" : "Create account"}
        </button>
      </form>
      <p className="mt-4 text-center text-meta text-ink/55">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-teal">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
