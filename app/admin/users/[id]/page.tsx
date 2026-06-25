import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminUserDetailClient } from "@/components/admin/admin-user-detail-client";
import { adminLink } from "@/components/admin/admin-ui";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: "User detail · Admin · BandForge",
  robots: { index: false, follow: false },
};

export default async function AdminUserDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <AdminShell hidePageHeader>
      <Link href="/admin/users" className={`mb-4 inline-block text-sm ${adminLink}`}>
        ← Back to users
      </Link>
      <AdminUserDetailClient userId={id} />
    </AdminShell>
  );
}
