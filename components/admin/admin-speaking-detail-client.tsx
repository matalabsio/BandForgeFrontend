"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  adminBtnPrimary,
  adminCard,
  adminHeading,
  adminInput,
  adminLink,
  adminSubtext,
} from "@/components/admin/admin-ui";
import { adminApi } from "@/lib/admin-api";

type Props = { reviewId: string };

export function AdminSpeakingDetailClient({ reviewId }: Props) {
  const [review, setReview] = useState<Record<string, unknown> | null>(null);
  const [band, setBand] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await adminApi.getSpeaking(reviewId);
      setReview(r);
      setBand(String(r.human_band ?? ""));
      setNotes(String(r.reviewer_notes ?? ""));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load review");
    }
  }, [reviewId]);

  useEffect(() => {
    void load();
  }, [load]);

  const approve = async () => {
    if (!band) {
      setError("Band is required");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await adminApi.approveSpeaking(reviewId, {
        human_band: Number(band),
        reviewer_notes: notes || undefined,
      });
      await load();
      alert("Review approved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Approve failed");
    } finally {
      setBusy(false);
    }
  };

  if (!review && !error) return <p className="text-gray-600">Loading…</p>;
  if (error && !review) return <p className="text-red-600">{error}</p>;

  const aiScores = (review?.ai_scores as Record<string, number>) ?? {};
  const audioUrl = String(review?.audio_play_url ?? review?.audio_url ?? "");

  return (
    <div className="space-y-6">
      <Link href="/admin/speaking" className={adminLink}>
        ← Back to queue
      </Link>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className={adminCard}>
          <h2 className={adminHeading}>Submission</h2>
          <p className="mt-3 text-sm text-black">
            <span className="font-semibold">Student:</span>{" "}
            {String(review?.student_name ?? review?.student_email ?? "—")}
          </p>
          <p className="text-sm capitalize text-black">
            <span className="font-semibold">Status:</span> {String(review?.status)}
          </p>
          {audioUrl ? (
            <audio controls src={audioUrl} className="w-full" />
          ) : (
            <p className="text-sm text-gray-600">No audio URL</p>
          )}
          {review?.transcript ? (
            <div>
              <h3 className="text-sm font-semibold text-black">Transcript</h3>
              <p className="mt-1 text-sm text-gray-700">{String(review.transcript)}</p>
            </div>
          ) : null}
        </section>

        <section className={adminCard}>
          <h2 className={adminHeading}>AI scores</h2>
          {Object.keys(aiScores).length === 0 ? (
            <p className="mt-3 text-sm text-gray-600">No AI scores</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {Object.entries(aiScores).map(([k, v]) => (
                <li key={k} className="flex justify-between text-sm text-black">
                  <span className="capitalize">{k}</span>
                  <span className="font-semibold">{v}</span>
                </li>
              ))}
            </ul>
          )}

          <h2 className={`${adminHeading} pt-4`}>Human review</h2>
          <label className="mt-3 block text-sm font-medium text-black">
            Band
            <input
              type="number"
              step="0.5"
              min={0}
              max={9}
              value={band}
              onChange={(e) => setBand(e.target.value)}
              className={adminInput}
            />
          </label>
          <label className="mt-3 block text-sm font-medium text-black">
            Notes
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className={adminInput}
            />
          </label>
          {review?.status === "pending" ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void approve()}
              className={`${adminBtnPrimary} mt-4`}
            >
              Approve & complete
            </button>
          ) : (
            <p className={adminSubtext}>Already reviewed</p>
          )}
          {error ? <p className="text-red-600">{error}</p> : null}
        </section>
      </div>
    </div>
  );
}
