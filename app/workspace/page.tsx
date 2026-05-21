import { redirect } from "next/navigation";
import Link from "next/link";
import { DashboardShell } from "@/components/bandforge/dashboard/dashboard-shell";
import { authBootstrapPath, getServerUser } from "@/lib/auth";
import { getCookieHeader } from "@/lib/cookies-server";
import { formatUserDisplayName } from "@/lib/user-display";

export const metadata = { title: "Workspace · BandForge" };

export default async function WorkspacePage() {
  const cookieHeader = await getCookieHeader();
  const user = await getServerUser(cookieHeader);
  if (!user) redirect(authBootstrapPath("/workspace"));

  const display = formatUserDisplayName(user);

  return (
    <DashboardShell
      displayName={display}
      avatarUrl={user.avatar_display_url}
    >
      <div className="bf-dash-enter max-w-2xl space-y-4 rounded-[24px] border border-white/70 bg-white/70 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#06B6D4]">
          Workspace
        </p>
        <h1 className="font-display text-2xl font-bold text-[#0F172A]">
          Practice hub
        </h1>
        <p className="text-[15px] leading-relaxed text-[#0F172A]/65">
          Signed in as {user.email ?? user.phone ?? user.id}. Full workspace
          flows ship soon — use the dashboard to start mocks today.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex rounded-2xl bg-[#06B6D4] px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:brightness-105"
        >
          Back to dashboard
        </Link>
      </div>
    </DashboardShell>
  );
}
