import { redirect } from "next/navigation";
import { mockHubPath, M01_MOCK_TEST_ID } from "@/lib/mock-catalog";

/** Legacy route → canonical M01 mock hub. */
export default function ReadingTestRedirectPage() {
  redirect(mockHubPath(M01_MOCK_TEST_ID));
}
