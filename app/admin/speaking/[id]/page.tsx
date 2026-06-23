import type { Metadata } from "next";
import { AdminSpeakingDetailClient } from "@/components/admin/admin-speaking-detail-client";
import { AdminShell } from "@/components/admin/admin-shell";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: "Speaking review · Evaluator · BandForge",
  robots: { index: false, follow: false },
};

export default async function AdminSpeakingDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <AdminShell title="Evaluator review" description="Speaking submission">
      <AdminSpeakingDetailClient reviewId={id} />
    </AdminShell>
  );
}
