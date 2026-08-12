import { GenericAppContentSkeleton } from "@/components/bandforge/dashboard/app-route-skeletons";

/** Content-only fallback — layout already wraps routes in DashboardShell. */
export default function BandforgeAppLoading() {
  return <GenericAppContentSkeleton />;
}
