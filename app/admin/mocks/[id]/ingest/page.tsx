import type { Metadata } from "next";
import Link from "next/link";
import { AdminMockIngestClient } from "@/components/admin/admin-mock-ingest-client";
import { AdminShell } from "@/components/admin/admin-shell";
import { adminLink } from "@/components/admin/admin-ui";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: "Ingest · Admin · BandForge",
  robots: { index: false, follow: false },
};

export default async function AdminMockIngestPage({ params }: Props) {
  const { id } = await params;
  return (
    <AdminShell title="Ingest content">
      <Link href="/admin/mocks" className={`mb-4 inline-block text-sm ${adminLink}`}>
        ← Back to mocks
      </Link>
      <AdminMockIngestClient mockId={id} />
    </AdminShell>
  );
}
