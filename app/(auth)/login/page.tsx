"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { useAuthSession } from "@/components/auth/auth-session-provider";
import { authBootstrapPath, logout } from "@/lib/auth";
import {
  isNetlifyDeployPreviewHost,
  PRODUCTION_OAUTH_ORIGIN,
} from "@/lib/auth-site";
import { isPhoneOtpEnabled } from "@/lib/flags";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/session";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

function hasAuthCookies(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((c) => {
    const name = c.trim().split("=")[0];
    return name === ACCESS_COOKIE || name === REFRESH_COOKIE;
  });
}

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const sessionExpired = searchParams.get("session") === "expired";
  const oauthError = searchParams.get("error");
  const formError =
    oauthError ??
    (sessionExpired
      ? "Your session expired. Please sign in again."
      : null);
  const cleared = useRef(false);

  useEffect(() => {
    if (!sessionExpired || cleared.current) return;
    cleared.current = true;
    void logout();
  }, [sessionExpired]);
  const { isAuthenticated, loading } = useAuthSession();
  const onDeployPreview =
    typeof window !== "undefined" &&
    isNetlifyDeployPreviewHost(window.location.hostname);

  useEffect(() => {
    // Avoid loop: getMe can succeed via localStorage Bearer while httpOnly cookies
    // are missing, so bootstrap refresh fails and sends user back here.
    if (!loading && isAuthenticated && hasAuthCookies()) {
      const dest = next.startsWith("/") ? next : "/dashboard";
      window.location.replace(authBootstrapPath(dest));
    }
  }, [loading, isAuthenticated, next]);

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
      {onDeployPreview ? (
        <p
          className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-meta text-ink/80"
          role="status"
        >
          This is a Netlify preview URL. Google sign-in completes on{" "}
          <a
            href={`${PRODUCTION_OAUTH_ORIGIN}/login?next=${encodeURIComponent(next)}`}
            className="font-semibold text-teal underline"
          >
            {PRODUCTION_OAUTH_ORIGIN.replace(/^https:\/\//, "")}
          </a>
          . After signing in, use the production site for your dashboard.
        </p>
      ) : null}
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
