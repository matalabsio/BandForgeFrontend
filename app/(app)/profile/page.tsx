import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/bandforge/profile/profile-form";
import { ProfileSettingsHub } from "@/components/bandforge/profile/profile-settings-hub";
import { authGuardRedirectPath } from "@/lib/auth";
import {
  getCachedCookieHeader,
  getCachedServerUser,
} from "@/lib/server-cache";

export const metadata = { title: "Profile · BandForge" };

export default async function ProfilePage() {
  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerUser(cookieHeader);
  if (!user) {
    redirect(authGuardRedirectPath("/profile"));
  }

  const displayName = user.full_name?.trim() || user.email || "Student";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <ProfileSettingsHub
      displayName={displayName}
      email={user.email}
      avatarInitial={initial}
    >
      <div className="rounded-2xl border border-border-soft bg-white p-6 shadow-sm sm:p-8">
        <header className="mb-6">
          <p className="font-mono text-[0.6875rem] tracking-wide text-cyan uppercase">
            Account details
          </p>
          <h2 className="font-display mt-1 text-lg font-bold text-navy">
            Edit profile
          </h2>
        </header>
        <ProfileForm user={user} />
      </div>
    </ProfileSettingsHub>
  );
}
