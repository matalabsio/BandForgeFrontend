import Link from "next/link";
import { SignOutButton } from "@/components/bandforge/auth/sign-out-button";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth";
import { formatIndiaDisplay, normalizeIndiaMobile } from "@/lib/india-mobile";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const user = await getServerUser(cookieHeader);
  if (!user) {
    redirect("/login?next=/dashboard");
  }
  if (user.email && !user.email_verified) {
    redirect(
      `/check-email?email=${encodeURIComponent(user.email)}`,
    );
  }

  let display = user.email ?? user.full_name ?? "your account";
  if (user.phone) {
    const digits = normalizeIndiaMobile(user.phone.replace(/^\+?91/, ""));
    if (digits.length === 10) {
      display = formatIndiaDisplay(digits);
    } else {
      display = user.phone;
    }
  }

  return (
    <div className="min-h-dvh bg-surface text-ink">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="font-display text-lg font-bold text-navy">
            Band<span className="text-teal">Forge</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              className="text-meta font-semibold text-teal hover:text-teal-light"
            >
              Settings
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <p className="text-meta font-semibold uppercase tracking-wider text-teal">
          AI-first products for learning
        </p>
        <h1 className="mt-2 font-display text-h1 text-navy">Your dashboard</h1>
        <p className="mt-3 max-w-xl text-body leading-relaxed text-ink/70">
          Signed in as{" "}
          <span className="font-semibold text-navy">{display}</span>. Mocks,
          saved progress, detailed AI reports, and history will live here as the
          product ships.
        </p>

        <div className="mt-8 rounded-2xl border border-border bg-white p-6 shadow-[var(--shadow-soft)]">
          <h2 className="text-h4 text-navy">Next step</h2>
          <p className="mt-2 text-body text-ink/65">
            Start your diagnostic mock — timers, navigation, and scoring will
            match the live BandForge experience.
          </p>
          <button
            type="button"
            disabled
            className="mt-4 inline-flex cursor-not-allowed rounded-lg bg-navy/40 px-5 py-3 text-body font-semibold text-white opacity-80"
          >
            Launch mock (coming soon)
          </button>
        </div>
      </main>
    </div>
  );
}
