"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  adminBtnPrimary,
  adminInput,
  adminLink,
  adminTable,
  adminTableHead,
} from "@/components/admin/admin-ui";
import { adminApi, type AdminUserListItem } from "@/lib/admin-api";

export function AdminUsersClient() {
  const [items, setItems] = useState<AdminUserListItem[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.listUsers({ q: search || undefined });
      setItems(res.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-4">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void load(q);
        }}
      >
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search email or name"
          className={`${adminInput} mt-0 flex-1`}
        />
        <button
          type="submit"
          className={adminBtnPrimary}
        >
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
      ) : (
        <div className={adminTable}>
          <table className="w-full min-w-[640px] text-left text-sm text-black">
            <thead className={adminTableHead}>
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Mocks</th>
              </tr>
            </thead>
            <tbody>
              {items.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/users/${user.id}`} className={adminLink}>
                      {user.full_name ?? "—"}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{user.email ?? "—"}</td>
                  <td className="px-4 py-3">{user.role}</td>
                  <td className="px-4 py-3">
                    {user.is_active ? (
                      <span className="text-emerald-700">Active</span>
                    ) : (
                      <span className="text-red-600">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{user.mock_attempt_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
