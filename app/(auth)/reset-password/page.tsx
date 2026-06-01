"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthInput } from "@/components/auth/auth-form-fields";
import { resetPassword } from "@/lib/auth";
import { resetPasswordSchema } from "@/lib/validators";
import { ApiError } from "@/lib/api";
import { z } from "zod";

type ResetInput = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  const onSubmit = handleSubmit(async (data) => {
    setFormError(null);
    try {
      await resetPassword({ token: data.token, password: data.password });
      push("/login");
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : "Could not reset password.");
    }
  });

  if (!token) {
    return (
      <AuthShell title="Reset password">
        <p className="text-body text-danger">Invalid or missing reset link.</p>
        <p className="mt-4 text-center text-meta">
          <Link href="/forgot-password" className="font-semibold text-teal">
            Request a new link
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Set a new password">
      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
        <input type="hidden" {...register("token")} />
        <AuthInput
          id="password"
          label="New password"
          type="password"
          autoComplete="new-password"
          error={errors.password}
          {...register("password")}
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
          {isSubmitting ? "Saving…" : "Update password"}
        </button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthShell title="Set a new password">
          <p className="text-body text-ink/70">Loading…</p>
        </AuthShell>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
