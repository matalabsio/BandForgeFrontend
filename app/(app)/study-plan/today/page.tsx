import { BfSectionEyebrow, BfSectionHeading } from "@/components/bandforge/ui";
import { StudyPlanTodayClient } from "@/components/bandforge/study-plan/study-plan-today-client";
import {
  getCachedCookieHeader,
  getCachedServerSession,
} from "@/lib/server-cache";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Today's Plan · BandForge",
};

/** Auth + entitlement run in study-plan/layout. Profile loads client-side. */
export default async function StudyPlanTodayPage() {
  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerSession(cookieHeader);
  const studentName =
    user?.full_name ?? user?.email ?? "BandForge Student";

  return (
    <div className="space-y-6">
      <header>
        <BfSectionEyebrow>Your schedule</BfSectionEyebrow>
        <BfSectionHeading className="mt-2">Today&apos;s plan</BfSectionHeading>
        <p className="mt-2 text-sm text-muted">
          Same tasks as your dashboard — skills in suggested order for today.
        </p>
      </header>
      <StudyPlanTodayClient
        userId={user?.id ?? ""}
        studentName={studentName}
      />
    </div>
  );
}
