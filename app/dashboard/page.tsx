import { Suspense } from "react";
import { redirect } from "next/navigation";
import { DashboardData } from "@/components/bandforge/dashboard/dashboard-data";
import { DashboardContentSkeleton } from "@/components/bandforge/dashboard/dashboard-shell-skeleton";
import { DashboardShell } from "@/components/bandforge/dashboard/dashboard-shell";
import { authBootstrapPath, getServerUser } from "@/lib/auth";
import { getCookieHeader } from "@/lib/cookies-server";
import {
  formatUserDisplayName,
  getUserFirstName,
} from "@/lib/user-display";

export const metadata = {
  title: "Dashboard · BandForge",
};

export default async function DashboardPage() {
  const cookieHeader = await getCookieHeader();
  const user = await getServerUser(cookieHeader);

  if (!user) {
    redirect(authBootstrapPath("/dashboard"));
  }

  const display = formatUserDisplayName(user);
  const firstName = getUserFirstName(user);

  return (
    <DashboardShell
      displayName={display}
      avatarUrl={user.avatar_display_url}
    >
      <Suspense fallback={<DashboardContentSkeleton />}>
        <DashboardData cookieHeader={cookieHeader} firstName={firstName} />
      </Suspense>
    </DashboardShell>
  );
}
