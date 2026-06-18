import { DashboardExperience } from "@/components/bandforge/dashboard/dashboard-experience";
import type { MockCatalogSlot } from "@/lib/mock-catalog-api";
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
  catalogSlots?: MockCatalogSlot[];
  summary: DashboardSummary;
  profileTargetBand?: number | null;
  initialMockProgressById?: Partial<Record<string, MockAttemptProgress | null>>;
};

export function DashboardData({
  firstName,
  displayName,
  email = null,
  avatarUrl = null,
  mockTests,
  catalogSlots,
  summary,
  profileTargetBand = null,
  initialMockProgressById = {},
}: Props) {
  return (
    <DashboardExperience
      firstName={firstName}
      displayName={displayName}
      email={email}
      avatarUrl={avatarUrl}
      mockTests={mockTests}
      catalogSlots={catalogSlots}
      summary={summary}
      profileTargetBand={profileTargetBand}
      initialMockProgressById={initialMockProgressById}
    />
  );
}
