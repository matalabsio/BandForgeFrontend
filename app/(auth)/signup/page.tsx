"use client";

import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import {
  GoogleSignInButton,
} from "@/components/auth/google-sign-in-button";

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Google sign-up is active for now. Email/password and OTP onboarding are temporarily disabled."
    >
      <GoogleSignInButton next="/dashboard" />
      <p className="mt-4 text-body text-ink/70">
        Continue with Google and we will create your account automatically.
      </p>
      <p className="mt-4 text-center text-meta text-ink/55">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-teal">
          Continue with Google
        </Link>
      </p>
    </AuthShell>
  );
}
