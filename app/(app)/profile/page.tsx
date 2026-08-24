import { redirect } from "next/navigation";
import { NotificationPreferencesPanel } from "@/components/bandforge/profile/notification-preferences-panel";
import { ProfileForm } from "@/components/bandforge/profile/profile-form";
import { ProfileSettingsHub } from "@/components/bandforge/profile/profile-settings-hub";
import { authGuardRedirectPath } from "@/lib/auth";
import { hasFullSkillProgram } from "@/lib/entitlement";
import { fetchLearningProfile } from "@/lib/learning-server";
import { fetchSubscriptionResult } from "@/lib/payments-server";
import {
  getCachedCookieHeader,
  getCachedServerUser,
} from "@/lib/server-cache";

export const metadata = { title: "Profile · BandForge" };

function formatExamDateLabel(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const end = new Date(`${iso.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(end.getTime())) return null;
  const today = new Date();
  const start = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  return Math.max(
    0,
    Math.round((end.getTime() - start.getTime()) / 86_400_000),
  );
}

function sumCompletedHubs(
  hubProgress: Record<string, { completed_count?: number }> | undefined,
): number {
  if (!hubProgress) return 0;
  return Object.values(hubProgress).reduce(
    (sum, row) => sum + (Number(row?.completed_count) || 0),
    0,
  );
}

export default async function ProfilePage() {
  const cookieHeader = await getCachedCookieHeader();
  const [user, subResult, learning] = await Promise.all([
    getCachedServerUser(cookieHeader),
    fetchSubscriptionResult(cookieHeader),
    fetchLearningProfile(cookieHeader),
  ]);
  if (!user) {
    redirect(authGuardRedirectPath("/profile", cookieHeader));
  }

  const displayName = user.full_name?.trim() || user.email || "Student";
  const initial = displayName.charAt(0).toUpperCase();
  const sub = subResult.subscription;
  const examDate =
    user.exam_date?.slice(0, 10) ||
    learning?.exam_date?.slice(0, 10) ||
    learning?.study_plan?.exam_date?.slice(0, 10) ||
    null;

  const planDaysFromExpiry = sub?.expires_at
    ? daysUntil(sub.expires_at.slice(0, 10))
    : null;
  const planDaysFromExam =
    learning?.days_remaining != null
      ? Number(learning.days_remaining)
      : daysUntil(examDate);

  const stats = {
    planName: sub?.is_active
      ? (sub.plan_name?.trim() || sub.plan_slug || "Active plan")
      : "Free",
    planDaysRemaining: planDaysFromExpiry ?? planDaysFromExam,
    targetBand: user.target_band ?? learning?.target_band ?? null,
    testsCompleted: sumCompletedHubs(learning?.hub_progress),
    expectedBand: learning?.current_band ?? null,
    examDateLabel: formatExamDateLabel(examDate),
  };

  return (
    <ProfileSettingsHub
      displayName={displayName}
      email={user.email}
      avatarInitial={initial}
      stats={stats}
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-border-soft bg-white p-6 shadow-sm sm:p-8">
          <header className="mb-6">
            <p className="font-mono text-[0.6875rem] tracking-wide text-cyan uppercase">
              Account details
            </p>
            <h2 className="font-display mt-1 text-lg font-bold text-navy">
              Edit profile
            </h2>
          </header>
          <ProfileForm
            user={user}
            initialExamDate={examDate}
            regeneratePlanOnExamChange={hasFullSkillProgram(sub)}
          />
        </div>
        <NotificationPreferencesPanel />
      </div>
    </ProfileSettingsHub>
  );
}
