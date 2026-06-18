"use client";

import { useCallback, useEffect, useState } from "react";
import { adminBtnPrimary, adminCard, adminHeading } from "@/components/admin/admin-ui";
import { adminApi } from "@/lib/admin-api";

type Props = { userId: string };

export function AdminUserDetailClient({ userId }: Props) {
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [attempts, setAttempts] = useState<unknown[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [u, a] = await Promise.all([
        adminApi.getUser(userId),
        adminApi.getUserAttempts(userId),
      ]);
      setUser(u);
      setAttempts(a);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load user");
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const deactivate = async () => {
    if (!confirm("Deactivate this user? They will not be able to sign in.")) return;
    setBusy(true);
    try {
      await adminApi.patchUser(userId, { is_active: false });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to deactivate");
    } finally {
      setBusy(false);
    }
  };

  const reactivate = async () => {
    setBusy(true);
    try {
      await adminApi.patchUser(userId, { is_active: true });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reactivate");
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!user) {
    return <p className="text-gray-600">Loading…</p>;
  }

  const isActive = Boolean(user.is_active);

  return (
    <div className="space-y-6">
      <div className={`${adminCard} space-y-2 text-sm text-black`}>
        <p>
          <strong>Name:</strong> {String(user.full_name ?? "—")}
        </p>
        <p>
          <strong>Email:</strong> {String(user.email ?? "—")}
        </p>
        <p>
          <strong>Role:</strong> {String(user.role)}
        </p>
        <p>
          <strong>Status:</strong> {isActive ? "Active" : "Inactive"}
        </p>
        <p>
          <strong>Mock attempts:</strong> {String(user.mock_attempt_count)}
        </p>
        <p>
          <strong>Completed mocks:</strong> {String(user.completed_mock_count)}
        </p>
      </div>

      <div className="flex gap-2">
        {isActive ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void deactivate()}
            className="cursor-pointer rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-body font-semibold text-red-700"
          >
            Deactivate user
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => void reactivate()}
            className={adminBtnPrimary}
          >
            Reactivate user
          </button>
        )}
      </div>

      <section>
        <h2 className={adminHeading}>Attempts</h2>
        <ul className="mt-3 space-y-2">
          {(attempts as Record<string, unknown>[]).map((a) => (
            <li
              key={String(a.id)}
              className="rounded-lg border border-border bg-white px-4 py-3 text-sm text-ink"
            >
              <span className="font-medium">{String(a.kind)}</span>
              {a.mock_title ? ` · ${String(a.mock_title)}` : null}
              {a.module ? ` · ${String(a.module)}` : null}
              {` · ${String(a.status)}`}
              {a.band != null ? ` · Band ${String(a.band)}` : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
