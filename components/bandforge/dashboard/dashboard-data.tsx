import { DashboardExperience } from "@/components/bandforge/dashboard/dashboard-experience";
import type { MockAttemptProgress } from "@/modules/mock/services/mock-api";
import type {
  DashboardSummary,
  MockTestSummary,
} from "@/components/bandforge/dashboard/types";

type Props = {
  firstName: string;
  displayName: string;
  email?: string | null;
  avatarUrl?: string | null;
  mockTests: MockTestSummary[];
  summary: DashboardSummary;
  profileTargetBand?: number | null;
  initialMockProgress?: MockAttemptProgress | null;
};

export function DashboardData({
  firstName,
  displayName,
  email = null,
  avatarUrl = null,
  mockTests,
  summary,
  profileTargetBand = null,
  initialMockProgress = null,
}: Props) {
  return (
    <DashboardExperience
      firstName={firstName}
      displayName={displayName}
      email={email}
      avatarUrl={avatarUrl}
      mockTests={mockTests}
      summary={summary}
      profileTargetBand={profileTargetBand}
      initialMockProgress={initialMockProgress}
    />
  );
}
