import { DashboardExperience } from "@/components/bandforge/dashboard/dashboard-experience";
import { fetchDashboardPayload } from "@/lib/dashboard-server";

type Props = {
  cookieHeader: string;
  firstName: string;
};

export async function DashboardData({ cookieHeader, firstName }: Props) {
  const { mockTests, summary } = await fetchDashboardPayload(cookieHeader);

  return (
    <DashboardExperience
      firstName={firstName}
      mockTests={mockTests}
      summary={summary}
    />
  );
}
