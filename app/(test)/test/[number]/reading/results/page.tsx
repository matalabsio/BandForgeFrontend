import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getServerUser, resolveAuthRedirectPath } from "@/lib/auth";
import { shortModuleResultsPath } from "@/lib/module-results-path";
import { ModuleScoreResultsClient } from "@/modules/results/components/module-score-results-client";

export const metadata = { title: "Reading result" };

type PageProps = { params: Promise<{ number: string }> };

export default async function ReadingResultsPage({ params }: PageProps) {
  const { number: numberRaw } = await params;
  const testNumber = Number.parseInt(numberRaw, 10);
  if (!Number.isFinite(testNumber) || testNumber < 1) {
    notFound();
  }

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const user = await getServerUser(cookieHeader);
  if (!user) {
    redirect(
      resolveAuthRedirectPath(
        shortModuleResultsPath(testNumber, "reading"),
        cookieHeader,
      ),
    );
  }

  return (
    <ModuleScoreResultsClient
      testNumber={testNumber}
      module="reading"
      targetBand={user.target_band ?? null}
    />
  );
}
