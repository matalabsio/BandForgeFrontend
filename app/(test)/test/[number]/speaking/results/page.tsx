import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { authBootstrapPath, getServerUser } from "@/lib/auth";
import { shortModuleResultsPath } from "@/lib/module-results-path";
import { SpeakingResultsClient } from "@/modules/results/components/speaking-results-client";

export const metadata = { title: "Speaking Feedback · BandForge" };

type PageProps = {
  params: Promise<{ number: string }>;
  searchParams: Promise<{ attempt?: string }>;
};

export default async function SpeakingResultsPage({ params, searchParams }: PageProps) {
  const { number: numberRaw } = await params;
  const sp = await searchParams;
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
    redirect(authBootstrapPath(shortModuleResultsPath(testNumber, "speaking")));
  }

  return (
    <SpeakingResultsClient
      testNumber={testNumber}
      attemptFromQuery={sp.attempt}
    />
  );
}
