"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminCreateMockForm } from "@/components/admin/admin-create-mock-form";
import {
  adminBtnPrimary,
  adminBtnSecondary,
  adminCard,
  adminHeading,
  adminLink,
  adminMeta,
} from "@/components/admin/admin-ui";
import { adminApi, type AdminMockListItem } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-800",
  draft: "bg-amber-100 text-amber-800",
  archived: "bg-slate-100 text-slate-600",
};

export function AdminMocksClient() {
  const [mocks, setMocks] = useState<AdminMockListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setMocks(await adminApi.listMocks());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load mocks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const fullMocks = useMemo(
    () => mocks.filter((m) => m.catalog_number != null),
    [mocks],
  );
  const otherMocks = useMemo(
    () => mocks.filter((m) => m.catalog_number == null),
    [mocks],
  );

  const setStatus = async (id: string, status: string) => {
    setBusyId(id);
    setError(null);
    try {
      await adminApi.patchMockStatus(id, status);
      await load();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Status update failed";
      setError(
        status === "published"
          ? `Publish failed: ${message}`
          : message,
      );
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <p className="text-gray-600">Loading mocks…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      {showCreate ? (
        <AdminCreateMockForm
          onCreated={() => {
            setShowCreate(false);
            void load();
          }}
          onCancel={() => setShowCreate(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className={adminBtnPrimary}
        >
          + New mock test
        </button>
      )}

      <MockGrid
        title="Full mock tests"
        mocks={fullMocks}
        busyId={busyId}
        onSetStatus={setStatus}
      />

      {otherMocks.length > 0 ? (
        <MockGrid
          title="Legacy / partial content"
          mocks={otherMocks}
          busyId={busyId}
          onSetStatus={setStatus}
          muted
        />
      ) : null}
    </div>
  );
}

function MockGrid({
  title,
  mocks,
  busyId,
  onSetStatus,
  muted = false,
}: {
  title: string;
  mocks: AdminMockListItem[];
  busyId: string | null;
  onSetStatus: (id: string, status: string) => void;
  muted?: boolean;
}) {
  if (!mocks.length) return null;

  return (
    <section>
      <h2 className={cn(adminHeading, "mb-3")}>{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mocks.map((mock) => (
          <article
            key={mock.id}
            className={cn(adminCard, "flex flex-col gap-3", muted && "opacity-80")}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                {mock.catalog_number ? (
                  <p className={cn(adminMeta, "font-bold text-teal")}>
                    Test {mock.catalog_number}
                  </p>
                ) : null}
                <h3 className="text-lg font-bold text-black">{mock.title}</h3>
              </div>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                  STATUS_STYLES[mock.status] ?? STATUS_STYLES.draft,
                )}
              >
                {mock.status}
              </span>
            </div>
            <p className={adminMeta}>{mock.total_questions} questions</p>
            <div className={cn("flex flex-wrap gap-2", adminMeta)}>
              {mock.modules.map((m) => (
                <span key={m.module}>
                  {m.module}: {m.question_count} Q
                </span>
              ))}
            </div>
            <div className="mt-auto flex flex-wrap gap-2 pt-2">
              <Link
                href={`/admin/mocks/${mock.id}`}
                className={cn(adminBtnSecondary, "px-3 py-1.5 text-xs")}
              >
                Details
              </Link>
              <Link
                href={`/admin/mocks/${mock.id}/ingest`}
                className={cn(adminBtnSecondary, "px-3 py-1.5 text-xs")}
              >
                Ingest
              </Link>
              <Link
                href={`/admin/mocks/${mock.id}/questions`}
                className={cn(adminBtnSecondary, "px-3 py-1.5 text-xs")}
              >
                Questions
              </Link>
            </div>
            <div className="flex flex-wrap gap-1 border-t border-border pt-3">
              {mock.status !== "published" ? (
                <button
                  type="button"
                  disabled={busyId === mock.id}
                  onClick={() => void onSetStatus(mock.id, "published")}
                  className="cursor-pointer rounded bg-teal px-2 py-1 text-[11px] font-bold text-white hover:bg-cyan"
                >
                  Publish
                </button>
              ) : null}
              {mock.status !== "archived" ? (
                <button
                  type="button"
                  disabled={busyId === mock.id}
                  onClick={() => void onSetStatus(mock.id, "archived")}
                  className="cursor-pointer rounded border border-border px-2 py-1 text-[11px] font-bold"
                >
                  Archive
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
