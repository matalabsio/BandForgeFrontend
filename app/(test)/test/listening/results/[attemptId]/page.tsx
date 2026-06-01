import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BandForgeLogoLink } from "@/components/bandforge/bandforge-logo-link";
import { authBootstrapPath, getServerUser } from "@/lib/auth";
import { getApiUrl } from "@/lib/api";
import { SignOutButton } from "@/components/bandforge/auth/sign-out-button";
import { ListeningResultsView } from "@/modules/listening/components/listening-results-view";
import { listeningResultsPath } from "@/lib/listening-test";
import type { ListeningScoreReport } from "@/modules/listening/types";

export const metadata = { title: "Listening result" };

type PageProps = { params: Promise<{ attemptId: string }> };

async function getReport(
  attemptId: string,
  cookieHeader: string,
): Promise<{ report: ListeningScoreReport | null; status: number }> {
  const base = getApiUrl();
  try {
    const res = await fetch(
      `${base}/api/listening/attempts/${encodeURIComponent(attemptId)}/score-report`,
      {
        headers: { cookie: cookieHeader },
        cache: "no-store",
      },
    );
    if (!res.ok) {
      return { report: null, status: res.status };
    }
    const json = (await res.json()) as ListeningScoreReport;
    return { report: json, status: res.status };
  } catch {
    return { report: null, status: 0 };
  }
}

export default async function ListeningTestResultsPage({ params }: PageProps) {
  const { attemptId } = await params;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const user = await getServerUser(cookieHeader);
  if (!user) {
    redirect(authBootstrapPath(listeningResultsPath(attemptId)));
  }
  const { report, status } = await getReport(attemptId, cookieHeader);

  return (
    <div className="min-h-dvh bg-surface text-ink">
      <header className="border-b border-border bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <BandForgeLogoLink size="md" />
          <div className="flex items-center gap-3">
            <Link
              href="/scores"
              className="text-meta font-semibold text-teal hover:text-teal-light"
            >
              Performance
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <ListeningResultsView
          attemptId={attemptId}
          report={report}
          status={status}
        />
      </main>
    </div>
  );
}
