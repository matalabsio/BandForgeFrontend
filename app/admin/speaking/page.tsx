import type { Metadata } from "next";
import { AdminSpeakingClient } from "@/components/admin/admin-speaking-client";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: "Evaluator portal · Admin · BandForge",
  robots: { index: false, follow: false },
};

export default function AdminSpeakingPage() {
  return (
    <AdminShell
      title="Evaluator portal"
      description="Human speaking review queue"
    >
      <AdminSpeakingClient />
    </AdminShell>
  );
}
