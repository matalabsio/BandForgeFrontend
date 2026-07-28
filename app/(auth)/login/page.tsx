"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { useAuthSession } from "@/components/auth/auth-session-provider";
import { authBootstrapPath, logout } from "@/lib/auth";
import {
  isNetlifyDeployPreviewHost,
  productionLoginUrl,
  PRODUCTION_OAUTH_ORIGIN,
} from "@/lib/auth-site";
import {
  clearAuthStorage,
  hasSessionHintCookie,
} from "@/lib/session";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { safePostLoginPath } from "@/lib/post-login-destination";
import { isPhoneOtpEnabled } from "@/lib/flags";

function hasAuthCookies(): boolean {
  return hasSessionHintCookie();
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const stayOnPreview = searchParams.get("stay") === "1";
  const sessionExpired = searchParams.get("session") === "expired";
  const oauthError = searchParams.get("error");
  const formError =
    oauthError ??
    (sessionExpired
      ? "Your session expired. Please sign in again."
      : null);
  const cleared = useRef(false);
  const redirectedToProd = useRef(false);
  const escalatedToBootstrap = useRef(false);

  // Defer window/cookie reads until after mount so SSR and hydration match.
  const [mounted, setMounted] = useState(false);
  const [onDeployPreview, setOnDeployPreview] = useState(false);

  useEffect(() => {
    setOnDeployPreview(isNetlifyDeployPreviewHost(window.location.hostname));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !onDeployPreview || hasAuthCookies()) return;
    clearAuthStorage();
  }, [mounted, onDeployPreview]);

  useEffect(() => {
    if (!mounted || !onDeployPreview || stayOnPreview || redirectedToProd.current)
      return;
    redirectedToProd.current = true;
    window.location.replace(productionLoginUrl(next));
  }, [mounted, onDeployPreview, stayOnPreview, next]);

  useEffect(() => {
    if (!sessionExpired || cleared.current) return;
    cleared.current = true;
    void logout();
  }, [sessionExpired]);

  const { isAuthenticated, loading } = useAuthSession();

  useEffect(() => {
    if (!mounted || loading || onDeployPreview) return;

    const continueUrl = `/auth/continue?next=${encodeURIComponent(
      safePostLoginPath(next),
    )}`;

    if (hasAuthCookies() && !isAuthenticated && !escalatedToBootstrap.current) {
      escalatedToBootstrap.current = true;
      router.replace(authBootstrapPath(continueUrl));
      return;
    }

    if (isAuthenticated && hasAuthCookies()) {
      window.location.replace(continueUrl);
    }
  }, [mounted, loading, isAuthenticated, next, onDeployPreview, router]);

  if (mounted && onDeployPreview && !stayOnPreview) {
    return (
      <AuthShell
        title="Redirecting to sign in"
        subtitle="Deploy previews use production authentication so your Google session stays secure."
      >
        <p className="text-center text-base text-[#081B33]/60">
          Redirecting to{" "}
          <span className="font-semibold text-[#00A9C0]">
            {PRODUCTION_OAUTH_ORIGIN.replace(/^https:\/\//, "")}
          </span>
          …
        </p>
        <p className="mt-4 text-center text-sm text-[#081B33]/45">
          <a
            href={productionLoginUrl(next)}
            className="cursor-pointer font-semibold text-[#00A9C0] underline-offset-2 hover:underline"
          >
            Continue now
          </a>
          {" · "}
          <a
            href={`/login?stay=1&next=${encodeURIComponent(next)}`}
            className="cursor-pointer text-[#081B33]/50 underline-offset-2 hover:underline"
          >
            Stay on preview (UI only)
          </a>
        </p>
      </AuthShell>
    );
  }

  if (mounted && !loading && isAuthenticated && hasAuthCookies()) {
    return (
      <AuthShell
        title="Welcome to BandForge"
        subtitle="You are already signed in. Taking you to your dashboard."
      >
        <p className="text-center text-base text-[#081B33]/60">
          Redirecting to your dashboard…
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Welcome to BandForge"
      subtitle="Continue your IELTS preparation."
    >
      {mounted && onDeployPreview && stayOnPreview ? (
        <p
          className="mb-8 text-center text-sm leading-relaxed text-[#081B33]/60"
          role="status"
        >
          Preview URLs cannot keep a Google session (cookies are on{" "}
          <a
            href={productionLoginUrl(next)}
            className="cursor-pointer font-semibold text-[#00A9C0] underline-offset-2 hover:underline"
          >
            bandforge-web.vercel.app
          </a>
          ). Sign in there, then open the dashboard on production.
        </p>
      ) : null}

      {formError ? (
        <p
          className="mb-8 text-center text-sm font-medium text-[#081B33]/70"
          role="alert"
        >
          {formError}
        </p>
      ) : null}

      <GoogleSignInButton next={next} />

      {isPhoneOtpEnabled() ? (
        <p className="mt-6 text-center text-sm text-[#081B33]/55">
          <Link
            href="/verify-phone"
            className="cursor-pointer font-semibold text-[#00A9C0] transition-colors duration-200 hover:text-[#00B8D1]"
          >
            Sign in with phone
          </Link>
        </p>
      ) : null}

      <p className="mt-6 text-center text-sm text-[#081B33]/45">
        Secure authentication with Google
      </p>

      <p className="mt-10 text-center text-sm text-[#081B33]/45">
        New to BandForge?{" "}
        <Link
          href="/signup"
          className="cursor-pointer font-semibold text-[#00A9C0] transition-colors duration-200 hover:text-[#00B8D1]"
        >
          Create your account
        </Link>
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthShell
          title="Welcome to BandForge"
          subtitle="Continue your IELTS preparation."
        >
          <p className="text-center text-base text-[#081B33]/60">Loading…</p>
        </AuthShell>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
