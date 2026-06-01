import { redirect } from "next/navigation";
import { M01_MOCK_TEST_ID, mockHubPath } from "@/lib/mock-catalog";

/** Legacy route → canonical M01 mock hub. */
export default function ListeningTestRedirectPage() {
  redirect(mockHubPath(M01_MOCK_TEST_ID));
}
