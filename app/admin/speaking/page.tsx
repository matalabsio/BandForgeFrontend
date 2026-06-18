import type { Metadata } from "next";
import { AdminSpeakingClient } from "@/components/admin/admin-speaking-client";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: "Speaking · Admin · BandForge",
  robots: { index: false, follow: false },
};

export default function AdminSpeakingPage() {
  return (
    <AdminShell title="Speaking review queue">
      <AdminSpeakingClient />
    </AdminShell>
  );
}
