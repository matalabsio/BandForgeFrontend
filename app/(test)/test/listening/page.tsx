import { redirect } from "next/navigation";
import { shortModuleExamPath } from "@/lib/mock-catalog";

/** Legacy route → canonical Test 1 listening practice. */
export default function ListeningTestRedirectPage() {
  redirect(shortModuleExamPath(1, "listening"));
}
