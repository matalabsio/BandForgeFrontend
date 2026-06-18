"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminMockEditForm } from "@/components/admin/admin-mock-edit-form";
import {
  adminApi,
  type AdminMockDetail,
  type SectionStatus,
} from "@/lib/admin-api";
import {
  adminBtnPrimary,
  adminBtnSecondary,
  adminCard,
  adminHeading,
  adminLink,
  adminMeta,
} from "@/components/admin/admin-ui";
import { cn } from "@/lib/utils";

type Props = { mockId: string };

export function AdminMockDetailClient({ mockId }: Props) {
  const [mock, setMock] = useState<AdminMockDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setMock(await adminApi.getMock(mockId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load mock");
    }
  }, [mockId]);

  useEffect(() => {
    void load();
  }, [load]);

  const sectionMap = useMemo(() => {
    const map = new Map<string, Map<number, SectionStatus>>();
    for (const mod of mock?.section_status ?? []) {
      map.set(
        mod.module,
        new Map(mod.sections.map((s) => [s.part, s])),
      );
    }
    return map;
  }, [mock?.section_status]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!mock) return <p className="text-gray-600">Loading…</p>;

  const listeningParts = mock.configured_listening_parts ?? 4;
  const readingPassages = mock.configured_reading_passages ?? 3;
  const blockers = mock.publish_blockers ?? [];

  return (
    <div className="space-y-6">
      <Link href="/admin/mocks" className={cn("inline-block text-sm", adminLink)}>
        ← Back to mocks
      </Link>

      <AdminMockEditForm mock={mock} onSaved={() => void load()} />

      {mock.status !== "published" && blockers.length > 0 ? (
        <div
          className="rounded-2xl border border-warning/30 bg-warning/8 p-4"
          role="status"
        >
          <p className="text-sm font-semibold text-black">Not ready to publish</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-700">
            {blockers.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {mock.status !== "published" && blockers.length === 0 ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          All configured sections are ready — you can publish this mock from the Mocks list.
        </div>
      ) : null}

      <div className={adminCard}>
        <p className={adminMeta}>
          Status: <span className="font-semibold capitalize text-black">{mock.status}</span> ·{" "}
          {mock.total_questions} questions
          {mock.catalog_number ? ` · Test ${mock.catalog_number} slot` : ""}
        </p>

        <div className="mt-4">
          <h2 className={cn(adminHeading, "text-sm")}>Listening sections</h2>
          <p className="mt-1 text-sm text-gray-700">
            Upload MP3 + JSON per section. Each section needs questions and an R2 audio key.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {Array.from({ length: listeningParts }, (_, i) => i + 1).map((part) => (
              <SectionLink
                key={`l-${part}`}
                href={`/admin/mocks/${mockId}/ingest?module=listening&part=${part}`}
                label={`Listening — Section ${part}`}
                status={sectionMap.get("listening")?.get(part)}
                module="listening"
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className={cn(adminHeading, "text-sm")}>Reading passages</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {Array.from({ length: readingPassages }, (_, i) => i + 1).map((part) => (
              <SectionLink
                key={`r-${part}`}
                href={`/admin/mocks/${mockId}/ingest?module=reading&part=${part}`}
                label={`Reading — Passage ${part}`}
                status={sectionMap.get("reading")?.get(part)}
                module="reading"
              />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {mock.modules.map((m) => (
            <div key={m.module} className="rounded-lg border border-border bg-cyan-soft/30 p-3">
              <h3 className="text-sm font-semibold capitalize text-black">{m.module}</h3>
              <p className="text-sm text-gray-700">
                {m.question_count} questions · {m.duration_minutes} min · parts{" "}
                {m.parts.join(", ") || "—"}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Link href={`/admin/mocks/${mockId}/ingest`} className={adminBtnPrimary}>
            Ingest content
          </Link>
          <Link href={`/admin/mocks/${mockId}/questions`} className={adminBtnSecondary}>
            Edit questions
          </Link>
        </div>
      </div>
    </div>
  );
}

function SectionLink({
  href,
  label,
  status,
  module,
}: {
  href: string;
  label: string;
  status?: SectionStatus;
  module: "listening" | "reading";
}) {
  const ready =
    status &&
    status.question_count > 0 &&
    (module === "reading" || status.has_audio);
  const partial = status && status.question_count > 0 && !ready;

  return (
    <Link
      href={href}
      className={cn(
        "flex cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors duration-200",
        ready
          ? "border-emerald-200 bg-emerald-50 text-black hover:bg-emerald-100"
          : partial
            ? "border-amber-200 bg-amber-50 text-black hover:bg-amber-100"
            : "border-border bg-white text-ink hover:bg-surface",
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
          ready && "bg-emerald-100 text-emerald-700",
          partial && "bg-amber-100 text-amber-700",
          !ready && !partial && "bg-cyan-soft text-slate",
        )}
      >
        {!status || status.question_count === 0
          ? "Empty"
          : ready
            ? `${status.question_count} Q`
            : module === "listening"
              ? "No audio"
              : `${status.question_count} Q`}
      </span>
    </Link>
  );
}
