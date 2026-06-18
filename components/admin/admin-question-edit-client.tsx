"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  adminBtnPrimary,
  adminCard,
  adminHeading,
  adminInput,
  adminLink,
  adminMeta,
} from "@/components/admin/admin-ui";
import { adminApi } from "@/lib/admin-api";

type Props = { mockId: string; questionId: string };

export function AdminQuestionEditClient({ mockId, questionId }: Props) {
  const [question, setQuestion] = useState<Record<string, unknown> | null>(null);
  const [prompt, setPrompt] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [explanation, setExplanation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const q = await adminApi.getQuestion(questionId);
      setQuestion(q);
      setPrompt(String(q.prompt ?? ""));
      setCorrectAnswer(String(q.correct_answer ?? ""));
      setExplanation(String(q.explanation ?? ""));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load question");
    }
  }, [questionId]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await adminApi.patchQuestion(questionId, {
        prompt,
        correct_answer: correctAnswer,
        explanation: explanation || undefined,
      });
      await load();
      alert("Saved — version recorded.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  if (!question && !error) return <p className="text-gray-600">Loading…</p>;
  if (error && !question) return <p className="text-red-600">{error}</p>;

  const versions = (question?.versions as unknown[]) ?? [];

  return (
    <div className="space-y-6">
      <Link
        href={`/admin/mocks/${mockId}/questions`}
        className={adminLink}
      >
        ← Back to question tree
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <label className="block text-sm font-medium text-black">
            Prompt
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className={adminInput}
            />
          </label>
          <label className="mt-3 block text-sm font-medium text-black">
            Correct answer
            <input
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              className={adminInput}
            />
          </label>
          <label className="mt-3 block text-sm font-medium text-black">
            Explanation
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={3}
              className={adminInput}
            />
          </label>
          <button
            type="button"
            disabled={busy}
            onClick={() => void save()}
            className={`${adminBtnPrimary} mt-4`}
          >
            Save changes
          </button>
          {error ? <p className="text-red-600">{error}</p> : null}
        </div>

        <aside className={adminCard}>
          <h2 className={adminHeading}>Version history</h2>
          <ul className={`mt-3 space-y-2 ${adminMeta}`}>
            {versions.length === 0 ? (
              <li>No versions yet</li>
            ) : (
              (versions as Record<string, unknown>[]).map((v) => (
                <li key={String(v.id)}>
                  v{String(v.version)} · {String(v.created_at).slice(0, 10)}
                </li>
              ))
            )}
          </ul>
        </aside>
      </div>
    </div>
  );
}
