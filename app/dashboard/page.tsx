import Link from "next/link";
import { SignOutButton } from "@/components/bandforge/auth/sign-out-button";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth";
import { formatIndiaDisplay, normalizeIndiaMobile } from "@/lib/india-mobile";

type MockTest = {
  id: string;
  title: string;
  description: string | null;
};

export const metadata = {
  title: "Dashboard",
};

async function getDashboardMockTests(cookieHeader: string): Promise<MockTest[]> {
  const base =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    "http://localhost:8000";
  try {
    const res = await fetch(`${base}/api/tests/mock-tests`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = (await res.json()) as MockTest[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

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
  const mockTests = await getDashboardMockTests(cookieHeader);
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

        <section className="mt-8 rounded-2xl border border-border bg-white p-6 shadow-[var(--shadow-soft)]">
          <h2 className="text-h4 text-navy">Mock tests</h2>
          <p className="mt-2 text-body text-ink/65">
            IELTS mocks seeded from content drafts (including your `ielts.md`) will appear here.
          </p>
          {mockTests.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-border bg-surface px-4 py-3 text-body text-ink/60">
              No mock tests published yet. Seed one mock test in Supabase to display it here.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {mockTests.map((test) => (
                <article
                  key={test.id}
                  className="rounded-xl border border-border bg-surface px-4 py-4"
                >
                  <h3 className="text-body font-semibold text-navy">{test.title}</h3>
                  <p className="mt-1 text-meta text-ink/65">
                    {test.description ?? "IELTS mock test"}
                  </p>
                  <p className="mt-2 text-[11px] text-ink/45">{test.id}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={`/mock/${test.id}/reading`}
                      className="inline-flex rounded-lg bg-teal px-4 py-2 text-meta font-semibold text-white hover:bg-teal-light"
                    >
                      Open reading test UI (dev)
                    </Link>
                    <Link
                      href={`/mock/${test.id}/listening`}
                      className="inline-flex rounded-lg border border-teal bg-white px-4 py-2 text-meta font-semibold text-teal hover:bg-teal/5"
                    >
                      Open listening test UI (dev)
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
