"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { adminLink, adminTable, adminTableHead } from "@/components/admin/admin-ui";
import { adminApi, type SpeakingReviewListItem } from "@/lib/admin-api";

export function AdminSpeakingClient() {
  const [items, setItems] = useState<SpeakingReviewListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.listSpeaking();
      setItems(res.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load queue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <p className="text-gray-600">Loading speaking queue…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className={adminTable}>
      <table className="w-full text-left text-sm text-black">
        <thead className={adminTableHead}>
          <tr>
            <th className="px-4 py-3">Student</th>
            <th className="px-4 py-3">Submitted</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Band</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-600">
                No speaking reviews
              </td>
            </tr>
          ) : (
            items.map((row) => (
              <tr key={row.id} className="border-t border-border">
                <td className="px-4 py-3">{row.student_name ?? row.student_email}</td>
                <td className="px-4 py-3 text-xs text-gray-600">
                  {row.created_at ? new Date(row.created_at).toLocaleString() : "—"}
                </td>
                <td className="px-4 py-3 capitalize">{row.status}</td>
                <td className="px-4 py-3">{row.human_band ?? "—"}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/speaking/${row.id}`}
                    className={adminLink}
                  >
                    Review
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
