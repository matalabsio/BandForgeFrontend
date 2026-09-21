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

type PageProps = {
  searchParams: Promise<{ hub?: string }>;
};

/** Auth + entitlement run in study-plan/layout. Profile loads client-side. */
export default async function StudyPlanTodayPage({ searchParams }: PageProps) {
  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerSession(cookieHeader);
  const studentName =
    user?.full_name ?? user?.email ?? "BandForge Student";
  const sp = await searchParams;
  const hubNotice =
    sp.hub === "gone"
      ? "That practice link is no longer available. Pick another task from today’s plan."
      : sp.hub === "locked"
        ? "That practice step is locked on your current plan."
        : null;

  return (
    <div className="space-y-6">
      <header>
        <BfSectionEyebrow>Your schedule</BfSectionEyebrow>
        <BfSectionHeading className="mt-2">Today&apos;s plan</BfSectionHeading>
        <p className="mt-2 text-sm text-muted">
          Same tasks as your dashboard — skills in suggested order for today.
        </p>
      </header>
      {hubNotice ? (
        <p
          role="status"
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
        >
          {hubNotice}
        </p>
      ) : null}
      <StudyPlanTodayClient
        userId={user?.id ?? ""}
        studentName={studentName}
      />
    </div>
  );
}
