import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { isEmailOtpEnabled } from "@/lib/flags";
import VerifyEmailOtpClient from "./verify-email-otp-client";

export default function VerifyEmailOtpPage() {
  if (!isEmailOtpEnabled()) {
    return (
      <AuthShell
        title="Email OTP sign-in unavailable"
        subtitle="Use Google to create an account and sign in. Email OTP will return when it is enabled."
      >
        <p className="text-body text-ink/70">
          <Link href="/login" className="font-semibold text-teal">
            Continue with Google
          </Link>
        </p>
      </AuthShell>
    );
  }
  return <VerifyEmailOtpClient />;
}
