"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { useAuthSession } from "@/components/auth/auth-session-provider";
import { isPhoneOtpEnabled } from "@/lib/flags";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const oauthError = searchParams.get("error");
  const formError = oauthError;
  const { isAuthenticated, loading } = useAuthSession();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace(next.startsWith("/") ? next : "/dashboard");
    }
  }, [loading, isAuthenticated, next, router]);

  if (!loading && isAuthenticated) {
    return (
      <AuthShell title="Sign in">
        <p className="text-body text-ink/70">Redirecting to your dashboard…</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Sign in"
      subtitle="Google sign-in is active right now. Password and OTP login are temporarily disabled."
    >
      <GoogleSignInButton next={next} />
      {formError ? (
        <p className="mt-4 text-meta font-medium text-danger" role="alert">
          {formError}
        </p>
      ) : (
        <p className="mt-4 text-body text-ink/70">
          Continue with Google to access your dashboard.
        </p>
      )}
      <p className="mt-4 text-center text-meta text-ink/55">
        <Link href="/signup" className="font-semibold text-teal">
          Need an account? Continue with Google
        </Link>
      </p>
      <p className="mt-2 text-center text-meta text-ink/55">
        {isPhoneOtpEnabled() ? "Phone OTP coming soon." : "Phone OTP is currently disabled."}
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
