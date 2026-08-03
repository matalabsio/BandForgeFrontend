import { DashboardContentSkeleton } from "@/components/bandforge/dashboard/dashboard-shell-skeleton";

/** Content-only — layout already wraps routes in DashboardShell (logo/header). */
export default function BandforgeAppLoading() {
  return <DashboardContentSkeleton />;
}
