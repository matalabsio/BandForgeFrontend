import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/bandforge/auth/sign-out-button";
import { getServerUser } from "@/lib/auth";

export const metadata = { title: "Workspace" };

export default async function WorkspacePage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const user = await getServerUser(cookieHeader);
  if (!user) redirect("/login?next=/workspace");
  if (user.email && !user.email_verified) {
    redirect(`/check-email?email=${encodeURIComponent(user.email)}`);
  }

  return (
    <div className="min-h-dvh bg-surface text-ink">
      <header className="border-b border-border bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="font-display text-lg font-bold text-navy">
            Band<span className="text-teal">Forge</span>
          </Link>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-h1 text-navy">Workspace</h1>
        <p className="mt-2 text-body text-ink/70">
          Signed in as {user.email ?? user.phone ?? user.id}. Practice flows will
          ship here.
        </p>
      </main>
    </div>
  );
}
