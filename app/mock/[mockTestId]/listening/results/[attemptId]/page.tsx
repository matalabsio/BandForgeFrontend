import { redirect } from "next/navigation";
import { listeningResultsPath } from "@/lib/listening-test";

type PageProps = { params: Promise<{ attemptId: string }> };

export default async function MockListeningResultsPage({ params }: PageProps) {
  const { attemptId } = await params;
  redirect(listeningResultsPath(attemptId));
}
