import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/bandforge/dashboard/dashboard-shell";
import { ProfileForm } from "@/components/bandforge/profile/profile-form";
import { authBootstrapPath, getServerUser } from "@/lib/auth";
import { getCookieHeader } from "@/lib/cookies-server";
import { formatUserDisplayName } from "@/lib/user-display";

export const metadata = { title: "Profile · BandForge" };

export default async function ProfilePage() {
  const cookieHeader = await getCookieHeader();
  const user = await getServerUser(cookieHeader);
  if (!user) redirect(authBootstrapPath("/profile"));

  const display = formatUserDisplayName(user);

  return (
    <DashboardShell
      displayName={display}
      avatarUrl={user.avatar_display_url}
    >
      <div className="bf-dash-enter mx-auto max-w-2xl space-y-6 rounded-[24px] border border-white/70 bg-white/70 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
        <header>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#06B6D4]">
            Account
          </p>
          <h1 className="font-display text-2xl font-bold text-[#0F172A]">
            Your profile
          </h1>
          <p className="mt-2 text-[14px] text-[#0F172A]/55">
            Update your name, photo, phone, and target band. Email is managed
            through Google sign-in.
          </p>
        </header>
        <ProfileForm user={user} />
      </div>
    </DashboardShell>
  );
}
