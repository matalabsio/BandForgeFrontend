"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  adminBtnPrimary,
  adminBtnSecondary,
  adminInput,
  adminLink,
  adminMeta,
  adminTable,
  adminTableHead,
} from "@/components/admin/admin-ui";
import { adminApi, type AdminUserListItem } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 25;

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

export function AdminUsersClient() {
  const [items, setItems] = useState<AdminUserListItem[]>([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const load = useCallback(async (search?: string, pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.listUsers({
        q: search || undefined,
        page: pageNum,
        page_size: PAGE_SIZE,
      });
      setItems(res.items);
      setTotal(res.total);
      setPage(res.page);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(q, page);
  }, [load, page]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    void load(q, 1);
  };

  return (
    <div className="space-y-4">
      <form className="flex gap-2" onSubmit={onSearch}>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search email or name"
          className={`${adminInput} mt-0 flex-1`}
        />
        <button type="submit" className={adminBtnPrimary}>
          Search
        </button>
      </form>

      {error ? (
        <p className="text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-gray-600">Loading users…</p>
      ) : items.length === 0 ? (
        <p className="text-gray-600">No users found.</p>
      ) : (
        <div className={adminTable}>
          <table className="w-full min-w-[900px] text-left text-sm text-black">
            <thead className={adminTableHead}>
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Mocks</th>
                <th className="px-4 py-3">Completed</th>
                <th className="px-4 py-3">Best band</th>
                <th className="px-4 py-3">Last active</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/users/${user.id}`} className={adminLink}>
                      {user.full_name ?? "—"}
                    </Link>
                    <p className={cn(adminMeta, "mt-0.5 capitalize")}>{user.role}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{user.email ?? "—"}</td>
                  <td className="px-4 py-3 tabular-nums text-gray-700">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{user.mock_attempt_count}</td>
                  <td className="px-4 py-3 tabular-nums">{user.completed_mock_count}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {user.best_band != null ? user.best_band.toFixed(1) : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {formatRelative(user.last_activity_at)}
                  </td>
                  <td className="px-4 py-3">
                    {user.is_active ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-800">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase text-red-700">
                        Inactive
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && total > PAGE_SIZE ? (
        <div className="flex items-center justify-between gap-3">
          <p className={adminMeta}>
            Page {page} of {totalPages} · {total} users
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={adminBtnSecondary}
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className={adminBtnSecondary}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
