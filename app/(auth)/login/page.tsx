"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { useAuthSession } from "@/components/auth/auth-session-provider";
import { authBootstrapPath, logout } from "@/lib/auth";
import {
  isNetlifyDeployPreviewHost,
  productionLoginUrl,
  PRODUCTION_OAUTH_ORIGIN,
} from "@/lib/auth-site";
import { isPhoneOtpEnabled } from "@/lib/flags";
import {
  ACCESS_COOKIE,
  clearAuthStorage,
  getRefreshToken,
  REFRESH_COOKIE,
} from "@/lib/session";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

function hasAuthCookies(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((c) => {
    const name = c.trim().split("=")[0];
    return name === ACCESS_COOKIE || name === REFRESH_COOKIE;
  });
}

function LoginTrustRow() {
  const items = [
    "Instant Reading & Listening scores",
    "Real exam timing on mocks",
    "Progress tracked on your dashboard",
  ] as const;

  return (
    <ul className="mt-6 space-y-2.5 border-t border-border/70 pt-5">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-start gap-2.5 text-body text-ink/68"
        >
          <CheckIcon className="mt-0.5 size-4 shrink-0 text-success" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
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

  const onDeployPreview =
    typeof window !== "undefined" &&
    isNetlifyDeployPreviewHost(window.location.hostname);

  useEffect(() => {
    if (!onDeployPreview || hasAuthCookies()) return;
    clearAuthStorage();
  }, [onDeployPreview]);

  useEffect(() => {
    if (!onDeployPreview || stayOnPreview || redirectedToProd.current) return;
    redirectedToProd.current = true;
    window.location.replace(productionLoginUrl(next));
  }, [onDeployPreview, stayOnPreview, next]);

  useEffect(() => {
    if (!sessionExpired || cleared.current) return;
    cleared.current = true;
    void logout();
  }, [sessionExpired]);

  const { isAuthenticated, loading } = useAuthSession();

  useEffect(() => {
    if (loading || onDeployPreview) return;

    const dest = next.startsWith("/") ? next : "/dashboard";

    if (getRefreshToken() && !hasAuthCookies()) {
      if (!escalatedToBootstrap.current) {
        escalatedToBootstrap.current = true;
        router.replace(authBootstrapPath(dest));
      }
      return;
    }

    if (isAuthenticated && hasAuthCookies()) {
      window.location.replace(dest);
    }
  }, [loading, isAuthenticated, next, onDeployPreview, router]);

  if (onDeployPreview && !stayOnPreview) {
    return (
      <AuthShell
        title="Redirecting to sign in"
        subtitle="Deploy previews use production authentication so your Google session stays secure."
      >
        <p className="text-body text-ink/70">
          Redirecting to{" "}
          <span className="font-semibold text-teal">
            {PRODUCTION_OAUTH_ORIGIN.replace(/^https:\/\//, "")}
          </span>
          …
        </p>
        <p className="mt-4 text-meta text-ink/55">
          <a
            href={productionLoginUrl(next)}
            className="cursor-pointer font-semibold text-teal underline-offset-2 hover:underline"
          >
            Continue now
          </a>
          {" · "}
          <a
            href={`/login?stay=1&next=${encodeURIComponent(next)}`}
            className="cursor-pointer text-ink/60 underline-offset-2 hover:underline"
          >
            Stay on preview (UI only)
          </a>
        </p>
      </AuthShell>
    );
  }

  if (!loading && isAuthenticated && hasAuthCookies()) {
    return (
      <AuthShell
        title="Welcome back"
        subtitle="You are already signed in. Taking you to your dashboard."
      >
        <p className="text-body text-ink/70">Redirecting to your dashboard…</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to pick up where you left off — mocks, scores, and AI feedback are waiting on your dashboard."
    >
      {onDeployPreview && stayOnPreview ? (
        <p
          className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-meta leading-relaxed text-ink/80"
          role="status"
        >
          Preview URLs cannot keep a Google session (cookies are on{" "}
          <a
            href={productionLoginUrl(next)}
            className="cursor-pointer font-semibold text-teal underline-offset-2 hover:underline"
          >
            bandforge-web.vercel.app
          </a>
          ). Sign in there, then open the dashboard on production.
        </p>
      ) : null}

      {formError ? (
        <p
          className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-meta font-medium text-danger"
          role="alert"
        >
          {formError}
        </p>
      ) : null}

      <GoogleSignInButton next={next} />

      <LoginTrustRow />

      <p className="mt-6 text-center text-meta text-ink/55">
        New to BandForge?{" "}
        <Link
          href="/signup"
          className="cursor-pointer font-semibold text-teal transition-colors duration-200 hover:text-teal-light"
        >
          Create your account
        </Link>
      </p>

      {!isPhoneOtpEnabled() ? (
        <p className="mt-3 text-center text-meta text-ink/45">
          Email, password, and phone OTP sign-in are coming soon.
        </p>
      ) : (
        <p className="mt-3 text-center text-meta text-ink/45">
          Phone OTP sign-in is coming soon.
        </p>
      )}
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthShell
          title="Welcome back"
          subtitle="Sign in to continue to your BandForge dashboard."
        >
          <p className="text-body text-ink/70">Loading…</p>
        </AuthShell>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
