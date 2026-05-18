import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Questions",
};

export default function AdminQuestionsPage() {
  return (
    <AdminShell title="Question management">
      <Card>
        <p className="text-body text-ink/65">
          CRUD for Reading/Listening items, Writing prompts, and Speaking cue
          cards. Tag by difficulty and skill.
        </p>
      </Card>
    </AdminShell>
  );
}
