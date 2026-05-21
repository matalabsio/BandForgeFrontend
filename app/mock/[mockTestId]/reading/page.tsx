import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authBootstrapPath, getServerUser } from "@/lib/auth";
import { SignOutButton } from "@/components/bandforge/auth/sign-out-button";
import { MockReadingRunner } from "./mock-reading-runner";

export const metadata = { title: "Reading mock (dev)" };

type PageProps = { params: Promise<{ mockTestId: string }> };

export default async function MockReadingPage({ params }: PageProps) {
  const { mockTestId } = await params;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const user = await getServerUser(cookieHeader);
  if (!user) {
    redirect(
      authBootstrapPath(
        `/mock/${encodeURIComponent(mockTestId)}/reading`,
      ),
    );
  }

  return (
    <div className="min-h-dvh bg-surface text-ink">
      <header className="border-b border-border bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <Link href="/" className="font-display text-lg font-bold text-navy">
            Band<span className="text-teal">Forge</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-meta font-semibold text-teal hover:text-teal-light">
              Dashboard
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <p className="text-meta font-semibold uppercase tracking-wider text-teal">
          Dev test UI
        </p>
        <h1 className="mt-2 font-display text-h2 text-navy">Reading mock</h1>
        <p className="mt-2 max-w-2xl text-body text-ink/70">
          Uses the real API via same-origin proxy (<code className="rounded bg-white px-1">/api/tests/…</code>
          ). Sign in with Google first. Mock ID:{" "}
          <code className="rounded bg-white px-1 text-meta">{mockTestId}</code>
        </p>
        <div className="mt-8">
          <MockReadingRunner mockTestId={mockTestId} />
        </div>
      </main>
    </div>
  );
}
