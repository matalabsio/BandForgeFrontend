import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/bandforge/auth/sign-out-button";
import { getServerUser } from "@/lib/auth";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const user = await getServerUser(cookieHeader);
  if (!user) redirect("/login?next=/settings");
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
        <h1 className="font-display text-h1 text-navy">Settings</h1>
        <ul className="mt-6 space-y-3 text-body text-ink/70">
          <li>Email: {user.email ?? "—"}</li>
          <li>Phone: {user.phone ?? "—"}</li>
          <li>Email verified: {user.email_verified ? "Yes" : "No"}</li>
          <li>Phone verified: {user.phone_verified ? "Yes" : "No"}</li>
        </ul>
      </main>
    </div>
  );
}
