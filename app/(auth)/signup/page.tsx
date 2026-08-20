"use client";

import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { isEmailOtpEnabled, isPhoneOtpEnabled } from "@/lib/flags";

const SIGNUP_NEXT = "/diagnostic";

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Start your IELTS preparation."
    >
      <GoogleSignInButton next={SIGNUP_NEXT} />

      {isPhoneOtpEnabled() ? (
        <p className="mt-6 text-center text-sm text-[#081B33]/55">
          <Link
            href={`/verify-phone?next=${encodeURIComponent(SIGNUP_NEXT)}`}
            className="cursor-pointer font-semibold text-[#00A9C0] transition-colors duration-200 hover:text-[#00B8D1]"
          >
            Sign up with phone
          </Link>
        </p>
      ) : null}

      {isEmailOtpEnabled() ? (
        <p className="mt-6 text-center text-sm text-[#081B33]/55">
          <Link
            href={`/verify-email-otp?next=${encodeURIComponent(SIGNUP_NEXT)}`}
            className="cursor-pointer font-semibold text-[#00A9C0] transition-colors duration-200 hover:text-[#00B8D1]"
          >
            Sign up with email OTP
          </Link>
        </p>
      ) : null}

      <p className="mt-6 text-center text-sm text-[#081B33]/45">
        Secure authentication with Google
      </p>

      <p className="mt-10 text-center text-sm text-[#081B33]/45">
        Already have an account?{" "}
        <Link
          href="/login"
          className="cursor-pointer font-semibold text-[#00A9C0] transition-colors duration-200 hover:text-[#00B8D1]"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
