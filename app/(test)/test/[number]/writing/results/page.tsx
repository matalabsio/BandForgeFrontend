import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { authBootstrapPath, getServerUser } from "@/lib/auth";
import { shortModuleResultsPath } from "@/lib/module-results-path";
import { WritingResultsClient } from "@/modules/results/components/writing-results-client";

export const metadata = { title: "Writing Feedback · BandForge" };

type PageProps = { params: Promise<{ number: string }> };

export default async function WritingResultsPage({ params }: PageProps) {
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
    redirect(authBootstrapPath(shortModuleResultsPath(testNumber, "writing")));
  }

  return <WritingResultsClient testNumber={testNumber} />;
}
