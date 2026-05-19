"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthInput } from "@/components/auth/auth-form-fields";
import { login } from "@/lib/auth";
import { loginSchema, type LoginInput } from "@/lib/validators";
import { ApiError } from "@/lib/api";
import { isPhoneOtpEnabled } from "@/lib/flags";
import {
  AuthDivider,
  GoogleSignInButton,
} from "@/components/auth/google-sign-in-button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const oauthError = searchParams.get("error");
  const [formError, setFormError] = useState<string | null>(
    oauthError,
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = handleSubmit(async (data) => {
    setFormError(null);
    try {
      await login(data);
      router.push(next);
      router.refresh();
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : "Sign in failed.");
    }
  });

  return (
    <AuthShell
      title="Sign in"
      subtitle="Sign in with the email and password you used to register."
    >
      <GoogleSignInButton next={next} />
      <AuthDivider />
      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
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
          autoComplete="current-password"
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
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-4 text-center text-meta text-ink/55">
        <Link href="/forgot-password" className="font-semibold text-teal">
          Forgot password?
        </Link>
      </p>
      <p className="mt-2 text-center text-meta text-ink/55">
        {isPhoneOtpEnabled() ? (
          <>
            <Link href="/verify-phone" className="font-semibold text-teal">
              Sign in with phone OTP
            </Link>
            {" · "}
          </>
        ) : null}
        <Link href="/signup" className="font-semibold text-teal">
          Create account
        </Link>
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthShell title="Sign in">
          <p className="text-body text-ink/70">Loading…</p>
        </AuthShell>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
