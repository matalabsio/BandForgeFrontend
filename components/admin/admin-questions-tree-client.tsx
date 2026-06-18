"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { adminHeading, adminLink, adminSubtext } from "@/components/admin/admin-ui";
import { adminApi } from "@/lib/admin-api";

type Props = { mockId: string };

type TreeModule = {
  module: string;
  parts: {
    part: number;
    question_count: number;
    questions: {
      id: string;
      question_number: number;
      question_type: string;
      prompt: string;
    }[];
  }[];
};

export function AdminQuestionsTreeClient({ mockId }: Props) {
  const [modules, setModules] = useState<TreeModule[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await adminApi.questionTree(mockId);
      setModules((res.modules ?? []) as TreeModule[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load questions");
    }
  }, [mockId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!modules.length) return <p className="text-gray-600">Loading…</p>;

  return (
    <div className="space-y-6">
      {modules.map((mod) => (
        <section key={mod.module}>
          <h2 className={`${adminHeading} capitalize`}>{mod.module}</h2>
          {mod.parts.map((p) => (
            <div key={p.part} className="mt-3">
              <h3 className={adminSubtext}>
                Part / Passage {p.part} ({p.question_count} questions)
              </h3>
              <ul className="mt-2 space-y-1">
                {p.questions.map((q) => (
                  <li key={q.id}>
                    <Link
                      href={`/admin/mocks/${mockId}/questions/${q.id}`}
                      className={adminLink}
                    >
                      Q{q.question_number} · {q.question_type} ·{" "}
                      {q.prompt.slice(0, 60)}
                      {q.prompt.length > 60 ? "…" : ""}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
