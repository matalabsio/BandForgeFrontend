import { redirect } from "next/navigation";
import { shortModuleExamPath } from "@/lib/mock-catalog";

/** Legacy route → canonical Test 1 reading practice. */
export default function ReadingTestRedirectPage() {
  redirect(shortModuleExamPath(1, "reading"));
}
