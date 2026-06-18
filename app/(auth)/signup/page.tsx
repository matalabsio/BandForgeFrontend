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
      subtitle="Google sign-up is active. After sign-up you can complete a quick onboarding."
    >
      <GoogleSignInButton next="/onboarding" />
      <p className="mt-4 text-body text-muted">
        Continue with Google and we will create your account automatically.
      </p>
      <p className="mt-4 text-center text-meta text-muted-light">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-cyan">
          Sign in
        </Link>
      </p>
      <p className="mt-2 text-center text-meta text-muted-light">
        <Link href="/onboarding" className="font-semibold text-cyan">
          Preview onboarding
        </Link>
      </p>
    </AuthShell>
  );
}
