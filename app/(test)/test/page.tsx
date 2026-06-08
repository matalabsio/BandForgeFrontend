import { redirect } from "next/navigation";
import { mockTestNumberPath } from "@/lib/mock-catalog";

export default function MockTestsIndexPage() {
  redirect(mockTestNumberPath(1));
}
