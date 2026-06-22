"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  adminBtnSecondary,
  adminCard,
  adminHeading,
  adminMeta,
  adminSubtext,
} from "@/components/admin/admin-ui";
import { adminApi, type AdminMockListItem } from "@/lib/admin-api";
import { isLiveCatalogNumber } from "@/lib/mock-catalog-api";
import { cn } from "@/lib/utils";

function isAdminLiveMock(mock: AdminMockListItem): boolean {
  return (
    mock.status === "published" &&
    mock.catalog_number != null &&
    isLiveCatalogNumber(mock.catalog_number)
  );
}

export function AdminMocksClient() {
  const [mocks, setMocks] = useState<AdminMockListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

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

  const liveMocks = useMemo(
    () =>
      mocks
        .filter(isAdminLiveMock)
        .sort((a, b) => (a.catalog_number ?? 0) - (b.catalog_number ?? 0)),
    [mocks],
  );

  const archiveMock = async (id: string) => {
    setBusyId(id);
    setError(null);
    try {
      await adminApi.patchMockStatus(id, "archived");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Archive failed");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <p className="text-gray-600">Loading mocks…</p>;

  return (
    <div className="space-y-6">
      {error ? <p className="text-red-600">{error}</p> : null}

      {liveMocks.length > 0 ? (
        <section>
          <h2 className={cn(adminHeading, "mb-3")}>Live mock tests</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {liveMocks.map((mock) => (
              <PublishedMockCard
                key={mock.id}
                mock={mock}
                busyId={busyId}
                onArchive={archiveMock}
              />
            ))}
          </div>
        </section>
      ) : (
        <div className={adminCard}>
          <p className={adminSubtext}>No live mock tests yet.</p>
        </div>
      )}

      <div className={adminCard}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className={adminHeading}>More mock tests</h2>
            <p className={cn(adminSubtext, "mt-1 max-w-xl")}>
              Test 3 and beyond are coming soon. Only Tests 1 and 2 are live right now.
            </p>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">
            Coming soon
          </span>
        </div>
      </div>
    </div>
  );
}

function PublishedMockCard({
  mock,
  busyId,
  onArchive,
}: {
  mock: AdminMockListItem;
  busyId: string | null;
  onArchive: (id: string) => void;
}) {
  return (
    <article className={cn(adminCard, "flex flex-col gap-3")}>
      <div className="flex items-start justify-between gap-2">
        <div>
          {mock.catalog_number ? (
            <p className={cn(adminMeta, "font-bold text-teal")}>Test {mock.catalog_number}</p>
          ) : null}
          <h3 className="text-lg font-bold text-black">{mock.title}</h3>
        </div>
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-800">
          Live
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
      <div className="border-t border-border pt-3">
        <button
          type="button"
          disabled={busyId === mock.id}
          onClick={() => void onArchive(mock.id)}
          className="cursor-pointer rounded border border-border px-2 py-1 text-[11px] font-bold"
        >
          Archive
        </button>
      </div>
    </article>
  );
}
