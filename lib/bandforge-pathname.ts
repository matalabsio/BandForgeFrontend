import { headers } from "next/headers";

export {
  bandforgeHideShellHeader,
  bandforgeQuietCheckoutChrome,
  bandforgeQuietListeningExerciseChrome,
  bandforgeQuietReadingExerciseChrome,
  bandforgeQuietSpeakingExerciseChrome,
  bandforgeQuietWritingExerciseChrome,
} from "@/lib/bandforge-chrome-paths";

/** Pathname set by middleware for BandForge app layout redirects. */
export async function getBandforgePathname(): Promise<string> {
  const h = await headers();
  const pathname = h.get("x-pathname");
  if (pathname?.startsWith("/")) return pathname;
  return "/dashboard";
}
