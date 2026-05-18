import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "Candidates",
};

export default function AdminCandidatesPage() {
  return (
    <AdminShell title="Candidate management">
      <EmptyState
        title="No candidates loaded"
        description="Connect Supabase via bandforge-api to list and manage candidates."
      />
    </AdminShell>
  );
}
