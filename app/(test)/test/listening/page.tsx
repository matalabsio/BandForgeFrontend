import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ListeningExamShell } from "@/components/listening/listening-exam-shell";
import { authBootstrapPath, getServerUser } from "@/lib/auth";
import { ListeningPage } from "@/modules/listening/components/listening-page";
import { LISTENING_TEST_ID, listeningTestPath } from "@/lib/listening-test";

export const metadata = {
  title: "IELTS Listening Test",
  robots: { index: false, follow: false },
};

export default async function ListeningTestPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const user = await getServerUser(cookieHeader);
  if (!user) {
    redirect(authBootstrapPath(listeningTestPath()));
  }

  return (
    <ListeningExamShell>
      <Suspense
        fallback={
          <div className="flex min-h-[40vh] items-center justify-center">
            <p className="text-[13px] text-[#71717a]">Loading test…</p>
          </div>
        }
      >
        <ListeningPage testId={LISTENING_TEST_ID} variant="exam" />
      </Suspense>
    </ListeningExamShell>
  );
}
