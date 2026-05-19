import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";

type PageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function CheckEmailPage({ searchParams }: PageProps) {
  const { email } = await searchParams;

  return (
    <AuthShell
      title="Check your email"
      subtitle="We sent a verification link. Open it to activate your account, then sign in."
    >
      {email ? (
        <p className="text-body text-ink/70">
          Sent to{" "}
          <span className="font-semibold text-navy">{email}</span>. Check spam
          if you do not see it within a few minutes.
        </p>
      ) : (
        <p className="text-body text-ink/70">
          Open the link in your inbox to verify your email, then sign in below.
        </p>
      )}
      <p className="mt-6 text-center text-meta">
        <Link href="/login" className="font-semibold text-teal">
          Continue to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
