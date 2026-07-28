import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { isPhoneOtpEnabled } from "@/lib/flags";
import VerifyPhoneClient from "./verify-phone-client";

export default function VerifyPhonePage() {
  if (!isPhoneOtpEnabled()) {
    return (
      <AuthShell
        title="Phone sign-in unavailable"
        subtitle="Use Google to create an account and sign in. Phone OTP will return when MSG91 is configured."
      >
        <p className="text-body text-ink/70">
          <Link href="/login" className="font-semibold text-teal">
            Continue with Google
          </Link>
        </p>
      </AuthShell>
    );
  }
  return <VerifyPhoneClient />;
}
