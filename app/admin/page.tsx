import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { StatCard } from "@/components/ui/stat-card";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <AdminShell title="System overview">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active candidates" value="1,248" />
        <StatCard label="Mocks this week" value="342" />
        <StatCard label="Evaluations pending" value="18" />
        <StatCard label="System status" value="Healthy" />
      </div>
      <p className="mt-6 text-body text-ink/65">
        Admin panels use the same token system with a data-dense layout. Connect
        to bandforge-api for live candidate and question management.
      </p>
    </AdminShell>
  );
}
