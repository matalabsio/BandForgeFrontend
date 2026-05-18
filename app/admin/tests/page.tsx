import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Test uploads",
};

export default function AdminTestsPage() {
  return (
    <AdminShell title="Test uploads">
      <Card>
        <p className="text-body text-ink/65">
          Upload full mock definitions, schedule windows, and module sequencing.
        </p>
      </Card>
    </AdminShell>
  );
}
