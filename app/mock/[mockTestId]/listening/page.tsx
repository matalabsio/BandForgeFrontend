import { redirect } from "next/navigation";
import { listeningTestPath } from "@/lib/listening-test";

/** All listening exams use the single production route until admin manages multiple tests. */
export default function MockListeningPage() {
  redirect(listeningTestPath());
}
