import type { Metadata } from "next";
import Link from "next/link";
import { AdminQuestionsTreeClient } from "@/components/admin/admin-questions-tree-client";
import { AdminShell } from "@/components/admin/admin-shell";
import { adminLink } from "@/components/admin/admin-ui";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: "Questions · Admin · BandForge",
  robots: { index: false, follow: false },
};

export default async function AdminQuestionsTreePage({ params }: Props) {
  const { id } = await params;
  return (
    <AdminShell title="Question tree">
      <Link href="/admin/mocks" className={`mb-4 inline-block text-sm ${adminLink}`}>
        ← Back to mocks
      </Link>
      <AdminQuestionsTreeClient mockId={id} />
    </AdminShell>
  );
}
