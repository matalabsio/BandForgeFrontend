"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminKpiCard } from "@/components/admin/admin-kpi-card";
import {
  adminBtnPrimary,
  adminAvatar,
  adminCard,
  adminFilterPill,
  adminFilterPillActive,
  adminHeading,
  adminLink,
  adminMeta,
  adminMutedLabel,
  adminStatusBadgeStyles,
  adminSubtext,
  adminTable,
  adminTableHead,
} from "@/components/admin/admin-ui";
import {
  adminApi,
  type AdminUserDiagnosticItem,
  type AdminUserMockSessionItem,
  type AdminUserOverview,
} from "@/lib/admin-api";
import { isLiveCatalogNumber } from "@/lib/mock-catalog-api";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  ClipboardList,
  Target,
  TrendingUp,
  User,
} from "lucide-react";

type Props = { userId: string };

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function bandLabel(band: number | null | undefined): string {
  if (band == null) return "—";
  return band.toFixed(1);
}

function ModuleBandChip({ label, band }: { label: string; band: number | null }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-cyan-soft px-2 py-0.5 text-[11px] font-semibold text-teal">
      <span className="uppercase text-slate">{label}</span>
      <span>{bandLabel(band)}</span>
    </span>
  );
}

function liveMockSessions(sessions: AdminUserMockSessionItem[]) {
  return sessions.filter(
    (s) => s.catalog_number != null && isLiveCatalogNumber(s.catalog_number),
  );
}

export function AdminUserDetailClient({ userId }: Props) {
  const [overview, setOverview] = useState<AdminUserOverview | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedDiagId, setExpandedDiagId] = useState<string | null>(null);
  const [submissionTab, setSubmissionTab] = useState<"mock" | "writing" | "speaking">("mock");

  const load = useCallback(async () => {
    setError(null);
    try {
      setOverview(await adminApi.getUserOverview(userId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load user");
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const mockSessions = useMemo(
    () => (overview ? liveMockSessions(overview.mock_sessions) : []),
    [overview],
  );

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

  if (error && !overview) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!overview) {
    return <p className="text-gray-600">Loading user…</p>;
  }

  const { profile, stats } = overview;
  const writingRows = overview.recent_modules.filter((m) => m.module === "writing");

  return (
    <div className="space-y-6">
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <section className={cn(adminCard, "space-y-4")}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className={cn(adminAvatar, "size-14 text-lg")}>
                  {(profile.full_name?.slice(0, 2) || profile.email?.slice(0, 2) || "ST").toUpperCase()}
                </span>
                <div>
                  <p className={adminMutedLabel}>Student profile</p>
                  <h2 className={cn(adminHeading, "text-2xl")}>
                    {profile.full_name ?? profile.email ?? "Unnamed user"}
                  </h2>
                  <p className={cn(adminSubtext, "mt-1")}>{profile.email ?? "No email"}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-bold uppercase",
                    profile.is_active
                      ? adminStatusBadgeStyles.completed
                      : adminStatusBadgeStyles.inactive,
                  )}
                >
                  {profile.is_active ? "Active" : "Inactive"}
                </span>
                {profile.email_verified ? (
                  <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold uppercase text-sky-800">
                    Verified
                  </span>
                ) : null}
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-700">
                  {profile.role}
                </span>
              </div>
            </div>

            <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className={adminMeta}>Phone</dt>
                <dd className="font-medium text-black">{profile.phone ?? "—"}</dd>
              </div>
              <div>
                <dt className={adminMeta}>Joined</dt>
                <dd className="font-medium text-black">{formatDateTime(profile.created_at)}</dd>
              </div>
              <div>
                <dt className={adminMeta}>Mock attempts</dt>
                <dd className="font-medium text-black">{profile.mock_attempt_count}</dd>
              </div>
              <div>
                <dt className={adminMeta}>Completed mocks</dt>
                <dd className="font-medium text-black">{profile.completed_mock_count}</dd>
              </div>
            </dl>
          </section>

          <section className={adminCard}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className={cn(adminHeading, "text-lg")}>Submissions</h3>
              <div className="flex gap-2">
                {[
                  { id: "mock", label: "Mock attempts" },
                  { id: "writing", label: "Writing" },
                  { id: "speaking", label: "Speaking" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSubmissionTab(tab.id as typeof submissionTab)}
                    className={cn(
                      adminFilterPill,
                      submissionTab === tab.id && adminFilterPillActive,
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            {submissionTab === "mock" ? (
              mockSessions.length === 0 ? (
                <p className={adminSubtext}>No live mock sessions yet.</p>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {mockSessions.map((session) => (
                    <article key={session.mock_attempt_id} className="rounded-xl border border-[#EAEEF3] bg-white p-4">
                      <p className={cn(adminMeta, "font-bold text-teal")}>
                        {session.catalog_number ? `Test ${session.catalog_number}` : "Mock test"}
                      </p>
                      <p className="font-semibold text-black">{session.mock_title ?? "Untitled"}</p>
                      <p className={cn(adminMeta, "mt-2")}>Started {formatDateTime(session.started_at)}</p>
                    </article>
                  ))}
                </div>
              )
            ) : submissionTab === "writing" ? (
              writingRows.length === 0 ? (
                <p className={adminSubtext}>No writing submissions yet.</p>
              ) : (
                <ul className="space-y-2">
                  {writingRows.map((row) => (
                    <li key={row.id} className="rounded-xl border border-[#EAEEF3] p-3 text-sm">
                      {row.mock_title} · Band {bandLabel(row.band)}
                    </li>
                  ))}
                </ul>
              )
            ) : overview.speaking_reviews.length === 0 ? (
              <p className={adminSubtext}>No speaking submissions.</p>
            ) : (
              <ul className="space-y-2">
                {overview.speaking_reviews.map((row) => (
                  <li key={row.id} className="rounded-xl border border-[#EAEEF3] p-3 text-sm">
                    <Link href={`/admin/speaking/${row.id}`} className={adminLink}>
                      {row.mock_title ?? "Speaking submission"} · {row.status}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section className={adminCard}>
            <h3 className={cn(adminHeading, "mb-3 text-lg")}>Progress summary</h3>
            <div className="grid grid-cols-2 gap-3">
          <AdminKpiCard
            label="Module attempts"
            value={stats.total_attempts}
            Icon={ClipboardList}
            accent="teal"
          />
          <AdminKpiCard
            label="Completed"
            value={stats.completed_attempts}
            Icon={BookOpen}
            accent="teal"
          />
          <AdminKpiCard
            label="In progress"
            value={stats.in_progress_attempts}
            Icon={Target}
            accent="violet"
          />
          <AdminKpiCard
            label="Avg band"
            value={stats.average_band ?? "—"}
            Icon={TrendingUp}
            accent="emerald"
          />
          <AdminKpiCard
            label="Best band"
            value={stats.best_band ?? "—"}
            Icon={TrendingUp}
            accent="emerald"
          />
          <AdminKpiCard
            label="Streak"
            value={stats.current_streak}
            hint={`Best ${stats.longest_streak}d`}
            Icon={User}
            accent="teal"
          />
            </div>
            <p className={cn(adminMeta, "mt-3")}>Last active: {formatDateTime(stats.last_activity_at)}</p>
          </section>

          <section className={cn(adminCard, "space-y-2")}>
            <h3 className={cn(adminHeading, "text-lg")}>Quick actions</h3>
            {profile.phone ? (
              <a
                href={`https://wa.me/${profile.phone.replace(/\D/g, "")}`}
                className={adminLink}
                target="_blank"
                rel="noreferrer"
              >
                Send WhatsApp message
              </a>
            ) : (
              <p className={adminSubtext}>No phone number available.</p>
            )}
            <div className="pt-2">
              {profile.is_active ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void deactivate()}
                  className="cursor-pointer rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700"
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
          </section>
        </aside>
      </div>

      <section>
        <h3 className={cn(adminHeading, "mb-3")}>Mock test history</h3>
        {mockSessions.length === 0 ? (
          <p className={adminSubtext}>No live mock sessions yet.</p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {mockSessions.map((session) => (
              <article key={session.mock_attempt_id} className={adminCard}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={cn(adminMeta, "font-bold text-teal")}>
                      {session.catalog_number
                        ? `Test ${session.catalog_number}`
                        : "Mock test"}
                    </p>
                    <p className="font-semibold text-black">
                      {session.mock_title ?? "Untitled"}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase">
                    {session.status}
                  </span>
                </div>
                <p className={cn(adminMeta, "mt-2")}>
                  Started {formatDateTime(session.started_at)}
                  {session.completed_at
                    ? ` · Completed ${formatDateTime(session.completed_at)}`
                    : null}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <ModuleBandChip label="L" band={session.listening_band} />
                  <ModuleBandChip label="R" band={session.reading_band} />
                  <ModuleBandChip label="W" band={session.writing_band} />
                  <ModuleBandChip label="S" band={session.speaking_band} />
                  {session.aggregate_band != null ? (
                    <span className="ml-1 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                      Overall {bandLabel(session.aggregate_band)}
                    </span>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {overview.in_progress.length > 0 ? (
        <section>
          <h3 className={cn(adminHeading, "mb-3")}>In progress</h3>
          <ul className="space-y-2">
            {overview.in_progress.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm"
              >
                <span className="font-semibold capitalize">{item.module}</span>
                {" · "}
                {item.catalog_number
                  ? `Test ${item.catalog_number}`
                  : item.mock_title}
                {" · started "}
                {formatDateTime(item.started_at)}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h3 className={cn(adminHeading, "mb-3")}>Recent module attempts</h3>
        {overview.recent_modules.length === 0 ? (
          <p className={adminSubtext}>No completed module attempts yet.</p>
        ) : (
          <div className={adminTable}>
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className={adminTableHead}>
                <tr>
                  <th className="px-4 py-3">Module</th>
                  <th className="px-4 py-3">Mock</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Band</th>
                  <th className="px-4 py-3">Completed</th>
                </tr>
              </thead>
              <tbody>
                {overview.recent_modules.map((row) => (
                  <tr key={row.id} className="border-t border-border">
                    <td className="px-4 py-3 capitalize">{row.module}</td>
                    <td className="px-4 py-3">
                      {row.catalog_number
                        ? `Test ${row.catalog_number}`
                        : row.mock_title}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {row.raw_score != null && row.total_count != null
                        ? `${row.raw_score}/${row.total_count}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 tabular-nums font-semibold">
                      {bandLabel(row.band)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatDateTime(row.completed_at ?? row.started_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h3 className={cn(adminHeading, "mb-3")}>Diagnostic results</h3>
        {overview.diagnostics.length === 0 ? (
          <p className={adminSubtext}>
            No diagnostic results synced yet. Results appear when the student completes
            the diagnostic while logged in.
          </p>
        ) : (
          <div className="space-y-3">
            {overview.diagnostics.map((diag) => (
              <DiagnosticCard
                key={diag.id}
                diag={diag}
                expanded={expandedDiagId === diag.id}
                onToggle={() =>
                  setExpandedDiagId((id) => (id === diag.id ? null : diag.id))
                }
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className={cn(adminHeading, "mb-3")}>Speaking reviews</h3>
        {overview.speaking_reviews.length === 0 ? (
          <p className={adminSubtext}>No speaking submissions.</p>
        ) : (
          <div className={adminTable}>
            <table className="w-full text-left text-sm">
              <thead className={adminTableHead}>
                <tr>
                  <th className="px-4 py-3">Mock</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Band</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {overview.speaking_reviews.map((row) => (
                  <tr key={row.id} className="border-t border-border">
                    <td className="px-4 py-3">{row.mock_title ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatDateTime(row.created_at)}
                    </td>
                    <td className="px-4 py-3 capitalize">{row.status}</td>
                    <td className="px-4 py-3 tabular-nums">
                      {bandLabel(row.human_band)}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/speaking/${row.id}`} className={adminLink}>
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function DiagnosticCard({
  diag,
  expanded,
  onToggle,
}: {
  diag: AdminUserDiagnosticItem;
  expanded: boolean;
  onToggle: () => void;
}) {
  const review = diag.review as
    | {
        listening?: { wrong?: unknown[]; bySkill?: Record<string, { correct: number; total: number }> };
        reading?: { wrong?: unknown[]; bySkill?: Record<string, { correct: number; total: number }> };
      }
    | null;

  return (
    <article className={adminCard}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={adminMeta}>Diagnostic · {formatDateTime(diag.completed_at)}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <ModuleBandChip label="L" band={diag.listening_band} />
            <ModuleBandChip label="R" band={diag.reading_band} />
            <ModuleBandChip label="W" band={diag.writing_band} />
            <ModuleBandChip label="S" band={diag.speaking_band} />
            {diag.aggregate_band != null ? (
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                Overall {bandLabel(diag.aggregate_band)}
              </span>
            ) : null}
          </div>
        </div>
        {review ? (
          <button type="button" onClick={onToggle} className={adminLink}>
            {expanded ? "Hide review" : "Show review"}
          </button>
        ) : null}
      </div>

      {expanded && review ? (
        <div className="mt-4 grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
          {(["listening", "reading"] as const).map((mod) => {
            const modReview = review[mod];
            if (!modReview) return null;
            const wrongCount = modReview.wrong?.length ?? 0;
            const skills = modReview.bySkill ?? {};
            return (
              <div key={mod} className="rounded-xl bg-surface p-3 text-sm">
                <p className="font-semibold capitalize text-black">{mod}</p>
                <p className={cn(adminMeta, "mt-1")}>{wrongCount} incorrect answers</p>
                <ul className="mt-2 space-y-1">
                  {Object.entries(skills).map(([skill, row]) => (
                    <li key={skill} className="flex justify-between gap-2">
                      <span className="text-gray-700">{skill}</span>
                      <span className="tabular-nums font-medium">
                        {row.correct}/{row.total}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      ) : null}
    </article>
  );
}
