import Link from "next/link";
import type { ReactNode } from "react";
import { SignOutButton } from "@/components/bandforge/auth/sign-out-button";

type Props = {
  children: ReactNode;
  eyebrow?: string;
  title: string;
  description?: string;
  notice?: ReactNode;
};

export function ListeningTestShell({
  children,
  eyebrow = "IELTS Listening",
  title,
  description,
  notice,
}: Props) {
  const r2Origin = process.env.NEXT_PUBLIC_R2_ENDPOINT_URL ?? null;

  return (
    <div className="min-h-dvh bg-surface text-ink">
      {r2Origin ? (
        <>
          <link rel="preconnect" href={r2Origin} crossOrigin="anonymous" />
          <link rel="dns-prefetch" href={r2Origin} />
        </>
      ) : null}
      <header className="border-b border-border bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <Link href="/" className="font-display text-lg font-bold text-navy">
            Band<span className="text-teal">Forge</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-meta font-semibold text-teal hover:text-teal-light"
            >
              Dashboard
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <p className="text-meta font-semibold uppercase tracking-wider text-teal">
          {eyebrow}
        </p>
        <h1 className="mt-2 font-display text-h2 text-navy">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-body text-ink/70">{description}</p>
        ) : null}
        {notice}
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}
