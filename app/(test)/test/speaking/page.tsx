import { redirect } from "next/navigation";
import { shortModuleExamPath } from "@/lib/mock-catalog";

/** Legacy route → canonical Test 1 speaking practice. */
export default function SpeakingTestRedirectPage() {
  redirect(shortModuleExamPath(1, "speaking"));
}
